
import AWS from "aws-sdk"
import { SignalingClient, Role } from "amazon-kinesis-video-streams-webrtc"
import { Auth } from "aws-amplify"
import { getRandomClientId, VideoOutput } from "./Classroom"

import { makePostRequest } from "../../classroom/Student"

export default class Viewer {
    constructor(channelName, setStreams, onRemoteDataMessage, onStatsReport) {
        this.channelName = channelName
        this.setStreams = setStreams
        this.onRemoteDataMessage = onRemoteDataMessage
        this.onStatsReport = onStatsReport
        this.peerConnectionByClientId = {}
        this.dataChannelByClientId = {}
        this.remoteStreams = []
        this.peerConnectionStatsInterval = null
        // sharing_screen: false,
        // screen_track_senders: null,
        // sharing_webcam: false,
        // webcam_track_senders: null
        this.startViewer()
        
    }

    startViewer = async () => {
        const region = 'eu-west-1'
        const natTraversalDisabled = false
        const forceTURN = true
        const openDataChannel = true
        const useTrickleICE = true

        const creds = await Auth.currentCredentials()
        const accessKeyId = creds.accessKeyId
        const sessionToken = creds.sessionToken
        const secretAccessKey = creds.secretAccessKey

        // Create KVS client
        const kinesisVideoClient = new AWS.KinesisVideo({
            region: region,
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
            sessionToken: sessionToken,
            // endpoint: endpoint,
        });

        // Get signaling channel ARN
        const describeSignalingChannelResponse = await kinesisVideoClient
            .describeSignalingChannel({
                ChannelName: this.channelName,
            })
            .promise();
        const channelARN = describeSignalingChannelResponse.ChannelInfo.ChannelARN;
        // console.log('[VIEWER] Channel ARN: ', channelARN);

        // Get signaling channel endpoints
        const getSignalingChannelEndpointResponse = await kinesisVideoClient
            .getSignalingChannelEndpoint({
                ChannelARN: channelARN,
                SingleMasterChannelEndpointConfiguration: {
                    Protocols: ['WSS', 'HTTPS'],
                    Role: Role.VIEWER,
                },
            })
            .promise();
        const endpointsByProtocol = getSignalingChannelEndpointResponse.ResourceEndpointList.reduce((endpoints, endpoint) => {
            endpoints[endpoint.Protocol] = endpoint.ResourceEndpoint;
            return endpoints;
        }, {});
        // console.log('[VIEWER] Endpoints: ', endpointsByProtocol);

        const kinesisVideoSignalingChannelsClient = new AWS.KinesisVideoSignalingChannels({
            region: region,
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
            sessionToken: sessionToken,
            endpoint: endpointsByProtocol.HTTPS,
        });

        // Get ICE server configuration
        const getIceServerConfigResponse = await kinesisVideoSignalingChannelsClient
            .getIceServerConfig({
                ChannelARN: channelARN,
            })
            .promise();
        const iceServers = [];
        if (!natTraversalDisabled && !forceTURN) {
            iceServers.push({ urls: `stun:stun.kinesisvideo.${region}.amazonaws.com:443` });
        }
        if (!natTraversalDisabled) {
            getIceServerConfigResponse.IceServerList.forEach(iceServer =>
                iceServers.push({
                    urls: iceServer.Uris,
                    username: iceServer.Username,
                    credential: iceServer.Password,
                }),
            );
        }
        // console.log('[VIEWER] ICE servers: ', iceServers);

        // Create Signaling Client
        this.signalingClient = new SignalingClient({
            channelARN,
            channelEndpoint: endpointsByProtocol.WSS,
            clientId: getRandomClientId(),
            // clientId: 'viewerID',
            role: Role.VIEWER,
            region: region,
            credentials: {
                accessKeyId: accessKeyId,
                secretAccessKey: secretAccessKey,
                sessionToken: sessionToken,
            },
        })

        const configuration = {
            iceServers,
            iceTransportPolicy: forceTURN ? 'relay' : 'all',
            // sdpSemantics: 'unified-plan',
            // sdpSemantics: 'plan-b',
        };
        var peerConnection = new RTCPeerConnection(configuration);
        if (openDataChannel) {
            this.dataChannel = peerConnection.createDataChannel('kvsDataChannel')
            peerConnection.ondatachannel = event => {
                event.channel.onmessage = this.onRemoteDataMessage
            };
        }
    
        peerConnection.oniceconnectionstatechange = ()=>{
            console.log('new connection state:', peerConnection.iceConnectionState)
            if (peerConnection.iceConnectionState == 'disconnected') {
                console.log('master being viewed disconnected')
                peerConnection.close()
                this.setStreams([], this.channelName)
            }
        }

        // Poll for connection stats
        // this.peerConnectionStatsInterval = setInterval(() => peerConnection.getStats().then((stats)=>{console.log(`stats report from ${this.channelName}:`, stats)}), 60000)

        this.signalingClient.on('open', async () => {
            // console.log('[VIEWER] Connected to signaling service');

            // Create an SDP offer to send to the master
            // console.log('[VIEWER] Creating SDP offer');
            await peerConnection.setLocalDescription(
                await peerConnection.createOffer({
                    offerToReceiveAudio: true,
                    // offerToReceiveAudio: false,
                    offerToReceiveVideo: true,
                }),
            );

            // When trickle ICE is enabled, send the offer now and then send ICE candidates as they are generated. Otherwise wait on the ICE candidates.
            if (useTrickleICE) {
                // console.log('[VIEWER] Sending SDP offer');
                this.signalingClient.sendSdpOffer(peerConnection.localDescription);
            }
            // console.log('[VIEWER] Generating ICE candidates');
        });

        this.signalingClient.on('sdpAnswer', async answer => {
            // Add the SDP answer to the peer connection
            // console.log('[VIEWER] Received SDP answer');
            // alert('sdp ans')
            await peerConnection.setRemoteDescription(answer);
            // this.sendViewerMessage(JSON.stringify({
            //     from: this.channelName,
            //     type: 'joined',
            //     content: {
            //         channel: this.channelName // channel name which the master you joined should start viewing
            //     }
            // }))

        });

        this.signalingClient.on('iceCandidate', candidate => {
            // Add the ICE candidate received from the MASTER to the peer connection
            // console.log('[VIEWER] Received ICE candidate');
            peerConnection.addIceCandidate(candidate);
        });

        this.signalingClient.on('close', () => {
            console.log('[VIEWER] Disconnected from signaling channel');
        });

        this.signalingClient.on('error', error => {
            console.error('[VIEWER] Signaling client error: ', error);
        });

        // Send any ICE candidates to the other peer
        peerConnection.addEventListener('icecandidate', ({ candidate }) => {
            if (candidate) {
                // console.log('[VIEWER] Generated ICE candidate');

                // When trickle ICE is enabled, send the ICE candidates as they are generated.
                if (useTrickleICE) {
                    // console.log('[VIEWER] Sending ICE candidate');
                    try {
                        this.signalingClient.sendIceCandidate(candidate);
                    }
                    catch (err) {
                        console.error('error in sending ice candidate')
                        console.error(err)
                    }
                }
            } else {
                // console.log('[VIEWER] All ICE candidates have been generated');

                // When trickle ICE is disabled, send the offer now that all the ICE candidates have ben generated.
                if (!useTrickleICE) {
                    // console.log('[VIEWER] Sending SDP offer');
                    this.signalingClient.sendSdpOffer(peerConnection.localDescription);
                }
            }
        });

        // As remote tracks are received, add them to the remote view
        peerConnection.addEventListener('track', event => {
        // peerConnection.ontrack = ({track, streams: [stream]}) => {
            // console.log(track)
            // console.log(stream)
            // console.log(stream.onaddtrack)
            // // alert('yo')
            // stream.onremovetrack = ({track}) => {
            //     console.log(`${track.kind} track was removed.`);
            //     if (!stream.getTracks().length) {
            //         console.log(`stream ${stream.id} emptied (effectively removed).`);
            //     }
            //     alert('track removed')
            // };

            // stream.onaddtrack = (e) => {
            //     console.log(e)
            //     // alert(e)
            // }

            // alert('stpo[')
            this.remoteStreams = [...this.remoteStreams, event.streams[0]]
            console.log(this.remoteStreams)
            this.setStreams(this.remoteStreams)
        })

        this.peerConnection = peerConnection

        peerConnection.onnegotiationneeded = async () => {
            console.log('[VIEWER] NEGOTIATION NEEDED')
            // Create an SDP offer to send to the master
            await peerConnection.setLocalDescription(
                await peerConnection.createOffer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true,
                }),
            );
        }

        // console.log('[VIEWER] Starting viewer connection');
        this.signalingClient.open();
    }

    stopViewer = () => {
        console.log('[VIEWER] Stopping viewer connection');
        if (this.signalingClient) {
            this.signalingClient.close();
            this.signalingClient = null;
        }

        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        if (this.localScreen) {
            this.localScreen.getTracks().forEach(track => track.stop());
            this.localScreen = null
        }

        if (this.remoteStream) {
            this.remoteStream.getTracks().forEach(track => track.stop());
            this.remoteStream = null;
        }

        if (this.peerConnectionStatsInterval) {
            clearInterval(this.peerConnectionStatsInterval);
            this.peerConnectionStatsInterval = null;
        }

        // if (this.state.localView) {
        //     this.setState({localView.srcObject = null;
        // }

        // if (this.state.remoteView) {
        //     this.state.remoteView.srcObject = null;
        // }

        // if (this.state.dataChannel) {
        //     this.state.dataChannel = null;
        // }
    }

    sendViewerMessage = (message) => {
        if (this.dataChannel) {
            try {
                this.dataChannel.send(message);
                alert('sending message:', message)
            } catch (e) {
                console.error('[VIEWER] failed to send message:', message)
                console.error('[VIEWER] error:', e.toString());
            }
        }
    }

    // toggleMedia(stream, type) {
    //     const senders
    //     if stream
    //     if (type == 'webcam') {

    //     }
    // }

    toggleWebcam = async (localStream) => {
        console.log('toggling webcam')
        if (localStream) { // if stream given, then this must be an indication to start sharing the webcam
            console.log('starting webcam share')
            var senders = localStream.getTracks().map(track => {
                console.log('adding track:', track)
                return this.peerConnection.addTrack(track, this.state.localStream)
            })
            this.webcam_track_senders = senders
            this.sharing_webcam = true
            console.log('webcam senders:', this.webcam_track_senders)
        }
        else {
            console.log('stopping webcam share')
            console.log('current senders:', this.webcam_track_senders)
            await this.webcam_track_senders.forEach((sender)=>{this.peerConnection.removeTrack(sender)}) // specify the sender of the track (for the screenshare) and remove it from the RTCPeerConnection
            this.sharing_webcam = !this.sharing_webcam
            this.localStream = null
            this.webcam_track_senders = null
        }
    }

    toggleScreenshare = async (localScreen) => {
        console.log('toggling screenshare')
        console.log('sharing screen?', this.sharing_screen)
        // if (this.sharing_screen) {
        //     console.log(this.screen_track_senders)
        //     await this.screen_track_senders.forEach((sender)=>{this.peerConnection.removeTrack(sender)}) // specify the sender of the track (for the screenshare) and remove it from the RTCPeerConnection
        //     this.sharing_screen = !this.state.sharing_screen
        //     this.localScreen = null
        //     this.screen_track_senders = null
        // }
        // else {
        //     this.localScreen = await navigator.mediaDevices.getDisplayMedia(screenShareOptions)
        //     var senders = this.localScreen.getTracks().map(track => {return this.peerConnection.addTrack(track, this.localScreen)})
        //     this.screen_track_senders = senders
        //     this.sharing_screen = true
        // }
    }    
}
