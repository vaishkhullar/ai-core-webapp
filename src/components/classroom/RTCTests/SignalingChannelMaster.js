import AWS from "aws-sdk"
import { SignalingClient, Role } from "amazon-kinesis-video-streams-webrtc"
import { Auth } from "aws-amplify"

export default class Master {
    constructor(localStream, localScreen, channelName, onRemoteDataMessage, onStatsReport) {
        this.localStream = localStream
        this.localScreen = localScreen
        this.channelName = channelName
        this.onRemoteDataMessage = onRemoteDataMessage
        this.onStatsReport = onStatsReport
        // this.remoteStreamsByClientId = {}
        this.peerConnectionByClientId = {}
        this.dataChannelByClientId = {}
        this.webcamSendersByClientId = {}
        this.screenshareSendersByClientId = {}
        this.startMaster()
        // setInterval(()=>{console.log('peerconnectionsbyid:', this.peerConnectionByClientId)}, 3000)
    }

    startMaster = async () => {
        console.log('starting master')
        const region = 'eu-west-1'
        const natTraversalDisabled = false
        const forceTURN = true 
        const openDataChannel = true
        const useTrickleICE = true 

        const creds = await Auth.currentCredentials()
        const accessKeyId = creds.accessKeyId
        const sessionToken = creds.sessionToken
        const secretAccessKey = creds.secretAccessKey

        console.log('creating KVS client')
        // Create KVS client
        const kinesisVideoClient = new AWS.KinesisVideo({
            region,
            accessKeyId,
            secretAccessKey,
            sessionToken,
            // endpoint: .endpoint,
        });

        console.log('getting signaling channel ARN')
        // Get signaling channel ARN
        const describeSignalingChannelResponse = await kinesisVideoClient
            .describeSignalingChannel({
                ChannelName: this.channelName,
            })
            .promise();
        const channelARN = describeSignalingChannelResponse.ChannelInfo.ChannelARN;
        console.log('[MASTER] Channel ARN: ', channelARN);

        console.log('getting signaling channel endpoints')
        // Get signaling channel endpoints
        const getSignalingChannelEndpointResponse = await kinesisVideoClient
            .getSignalingChannelEndpoint({
                ChannelARN: channelARN,
                SingleMasterChannelEndpointConfiguration: {
                    Protocols: ['WSS', 'HTTPS'],
                    Role: Role.MASTER,
                },
            })
            .promise();
        const endpointsByProtocol = getSignalingChannelEndpointResponse.ResourceEndpointList.reduce((endpoints, endpoint) => {
            endpoints[endpoint.Protocol] = endpoint.ResourceEndpoint;
            return endpoints;
        }, {});
        console.log('[MASTER] Endpoints: ', endpointsByProtocol);

        console.log('creating signaling client')
        // Create Signaling Client
        this.signalingClient = new SignalingClient({
            channelARN,
            channelEndpoint: endpointsByProtocol.WSS,
            role: Role.MASTER,
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
                sessionToken,
            },
        })

        console.log('getting ICE server configuration')
        // Get ICE server configuration
        const kinesisVideoSignalingChannelsClient = new AWS.KinesisVideoSignalingChannels({
            region,
            accessKeyId,
            secretAccessKey,
            sessionToken,
            endpoint: endpointsByProtocol.HTTPS,
        });
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
        console.log('[MASTER] ICE servers: ', iceServers);

        const configuration = {
            iceServers,
            iceTransportPolicy: forceTURN ? 'relay' : 'all',
            // sdpSemantics: 'unified-plan'
        };

        console.log('setting signalingClient event handler for "open"')
        this.signalingClient.on('open', async () => {
            console.log('[MASTER] Connected to signaling service');
        });

        console.log('setting signalingClient event handler for "sdpOffer"')
        this.signalingClient.on('sdpOffer', async (offer, remoteClientId) => {
            console.log('[MASTER] Received SDP offer from client: ' + remoteClientId);
            // Create a new peer connection using the offer from the given client
            console.log('[MASTER] Starting peerConnection');
            const peerConnection = new RTCPeerConnection(configuration);

            this.peerConnectionByClientId = {...this.peerConnectionByClientId, [remoteClientId]: peerConnection};
            console.log(this.peerConnectionByClientId)
            if (openDataChannel) {
                this.dataChannelByClientId = {
                    ...this.dataChannelByClientId,
                    [remoteClientId]: peerConnection.createDataChannel('kvsDataChannel')
                }
                peerConnection.ondatachannel = event => {
                    event.channel.onmessage = (message) =>{
                        this.onRemoteDataMessage(message);
                    }
                };
            }

            // Poll for connection stats
            if (!this.peerConnectionStatsInterval) {
                console.log('setting callback to get stats from peerConnection')
                this.peerConnectionStatsInterval = setInterval(() => peerConnection.getStats().then(this.onStatsReport), 10000);
            }

            // Send any ICE candidates to the other peer
            console.log('setting peerConnection event handler for "icecandidate" (this ICE candidate can be sent to the remote peer)')
            peerConnection.addEventListener('icecandidate', ({ candidate }) => {
                if (candidate) {
                    console.log('[MASTER] Generated ICE candidate for client: ' + remoteClientId);
                    // When trickle ICE is enabled, send the ICE candidates as they are generated.
                    if (useTrickleICE) {
                        console.log('[MASTER] Sending ICE candidate to client: ' + remoteClientId);
                        this.signalingClient.sendIceCandidate(candidate, remoteClientId);
                    }
                } else {
                    console.log('[MASTER] All ICE candidates have been generated for client: ' + remoteClientId);
                    // When trickle ICE is disabled, send the answer now that all the ICE candidates have ben generated.
                    if (!useTrickleICE) {
                        console.log('[MASTER] Sending SDP answer to client: ' + remoteClientId);
                        this.signalingClient.sendSdpAnswer(peerConnection.localDescription, remoteClientId);
                    }
                }
            });

            // As remote tracks are received, add them to the remote view
            console.log('setting peerConnection event handler for "track" (adding track)')
            peerConnection.addEventListener('track', async event => {
                console.log('[MASTER] Received remote track from client: ' + remoteClientId);
                // console.log(event)
                // if (this.state.remoteStreams) {
                    // return;
                // }
                // var remoteClient
                // if (this.remoteStreamsByClientId[remoteClientId]) {
                //     remoteClient = [...this.remoteStreamsByClientId[remoteClientId], ...event.streams]
                // }
                // else {
                //     remoteClient = event.streams
                // }
                
                // this.remoteStreamsByClientId = {
                //     ...this.remoteStreamsByClientId, 
                //     [remoteClientId]: remoteClient
                // }
                // console.log('remote streams by client id:', this.remoteStreamsByClientId)
                // this.distributeTracks(event.streams, remoteClientId) // for sharing all viewer's streams with all other viewers
                    // ()=>{console.log('remote streams by client ID:', this.remoteStreamsByClientId)}    
            });

            var senders = []
            var tracks = []
            // this.localStream.getTracks().forEach(track=>{
            //     this.localScreen.addTrack(track)
            // })
            tracks.push(this.localStream.getTracks())
            // tracks.push(this.localScreen.getTracks())
            // this.localScreen.onaddtrack = () => {alert('track added')}
            tracks.flat().forEach(track => {
                
                console.log('adding local track:', track)
                senders.push(peerConnection.addTrack(track, this.localStream))
            });
            this.webcamSendersByClientId[remoteClientId] = senders

            // console.log('setting up webcam stream')
            // var senders = []
            // console.log(this.localStream.getTracks())
            // console.log(this.localScreen.getTracks())
            // alert('yo')
            // this.localStream.getTracks().forEach(track => {
            //     console.log('adding local track:', track)
            //     senders.push(peerConnection.addTrack(track, this.localStream))
            // });
            // this.webcamSendersByClientId[remoteClientId] = senders
            // console.log('setting up screenshare stream')
            // var screenshare_senders = []
            // this.localScreen.getTracks().forEach(track => {
            //     console.log('adding local track:', track)
            //     screenshare_senders.push(peerConnection.addTrack(track, this.localStream))
            // });
            // this.screenshareSendersByClientId[remoteClientId] = screenshare_senders

            // console.log('pc before setting remote desc:', peerConnection)
            console.log('SDP offer:', offer)
            await peerConnection.setRemoteDescription(offer);
            // console.log('pc after setting remote desc:', peerConnection)
            // Create an SDP answer to send back to the client
            // console.log('pc before setting local desc:', peerConnection)
            // console.log('[MASTER] Creating SDP answer for client: ' + remoteClientId);
            // if (!this.localDescription){ // if just added 
            //     console.log('setting description for first time')
            //     this.localDescription = await peerConnection.createAnswer({
            //         offerToReceiveAudio: true,
            //         offerToReceiveVideo: true,
            //     })
            // }
            // console.log('this.localDescription:', this.localDescription)
            // try {
            //     await peerConnection.setLocalDescription(this.localDescription);
            // }
            // catch (err) {console.log('error setting local desctiption:',err)}
            await peerConnection.setLocalDescription(
                await peerConnection.createAnswer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true,
                })
            )
            // console.log('pc after setting local desc:', peerConnection)

            // When trickle ICE is enabled, send the answer now and then send ICE candidates as they are generated. Otherwise wait on the ICE candidates.
            if (useTrickleICE) {
                console.log('[MASTER] Sending SDP answer to client: ' + remoteClientId);
                this.signalingClient.sendSdpAnswer(peerConnection.localDescription, remoteClientId);
            }

            // console.log('setting peerConnection event handler for "oniceconnectionstatechange"')
            peerConnection.oniceconnectionstatechange = ()=>{
                console.log('new connection state:', peerConnection.iceConnectionState)
                if (peerConnection.iceConnectionState == 'disconnected') {
                    console.log(`client ${remoteClientId} disconnected`)
                    // peerConnection.close()
                }
            }
            

            // console.log('setting peerConnection event handler for "onnegotiationneeded"')
            peerConnection.onnegotiationneeded = async () => {
                console.log('NEGOTIATION NEEDED')
                await peerConnection.setLocalDescription(
                    await peerConnection.createOffer({
                        offerToReceiveAudio: true,
                        offerToReceiveVideo: true,
                    }),
                );
            }

            console.log('[MASTER] Generating ICE candidates for client: ' + remoteClientId);
        });

        console.log('setting signalingClient event handler for "iceCandidate"')
        this.signalingClient.on('iceCandidate', async (candidate, remoteClientId) => {
            console.log('[MASTER] Received ICE candidate from client: ' + remoteClientId);

            // Add the ICE candidate received from the client to the peer connection
            const peerConnection = this.peerConnectionByClientId[remoteClientId];
            peerConnection.addIceCandidate(candidate);
            this.peerConnectionByClientId = {...this.peerConnectionByClientId, [remoteClientId]: peerConnection}
        });

        console.log('setting signalingClient event handler for "close"')
        this.signalingClient.on('close', () => {
            console.log('[MASTER] Disconnected from signaling channel');
        });

        console.log('setting signalingClient event handler for "error"')
        this.signalingClient.on('error', () => {
            console.error('[MASTER] Signaling client error');
        });

        this.signalingClient.open();
        console.log('finished setting up master')
    }

    // distributeTracks = (newStream, from_id) => {
    //     // console.log(this.peerConnectionByClientId)
    //     console.log('DISTRIBUTING TRACKS')
    //     console.log('\tfrom:', from_id)
    //     // console.log('all tracks:', newStream.map(s => {return s.getTracks()}).flat())
    //     // newStream = [...newStream, newStream[0].clone()]
    //     // var remoteStreamsByClientId = {}
    //     // Object.keys(this.remoteStreamsByClientId).forEach(cid => {if (cid != from_id) {remoteStreamsByClientId[cid] = this.remoteStreamsByClientId[cid]}})
    //     // newStream = Object.values(this.remoteStreamsByClientId).flat()
    //     // console.log('new stream:', newStream)
    //     Object.keys(this.peerConnectionByClientId).forEach(clientId => {    // for each client
    //         console.log('\t\tdistributing tracks to client id:', clientId)
    //         const pc = this.peerConnectionByClientId[clientId]    // get their peer connection
    //         // setInterval(()=>{
    //         //     console.log('adding interval stream:', newStream); 
    //         //     newStream[0].clone().getTracks().forEach(
    //         //         track => {pc.addTrack(track)})
    //         // }, 3000)
    //         // const dup_streams = newStream.map(s=>{return s.clone()})
    //         // newStream = [...newStream, ...dup_streams]
    //         newStream.forEach(remoteStream => remoteStream.getTracks().forEach(track => {
    //             // if (clientId == from_id) return
    //             try {
    //                 pc.addTrack(track, remoteStream)
    //                 console.log('\t\t\tadding track:', track); 
    //                 console.log('\t\t\ttrack id:', track.id); 
    //             }
    //             catch (err) {
    //                 console.log('\t\t\t' + err)
    //             }
    //         }));     // add the new streams to those peer connections
    //     })
    // }

    // startSharing = async (peerConnection) => {
    //     const sendAudio = false
    //     const sendVideo = true
    //     const widescreen= false
    //     const resolution = widescreen ? { width: { ideal: 1280 }, height: { ideal: 720 } } : { width: { ideal: 640/2 }, height: { ideal: 480/2 } };
    //     const constraints = {
    //         video: sendVideo ? resolution : false,
    //         audio: sendAudio,
    //     };

    //     console.log('setting up webcam stream')
    //     const localStream = await navigator.mediaDevices.getUserMedia(constraints);
    //     localStream.getTracks().forEach(track => {
    //         console.log('adding local track:', track)
    //         peerConnection.addTrack(track, localStream)
    //     });
        
    //     console.log('setting up screenshare stream')
    //     const screenShareOptions = {
    //         video: {
    //             cursor: "always"
    //         },
    //         audio: false
    //     }
    //     const localScreen = await navigator.mediaDevices.getDisplayMedia(screenShareOptions)
    //     localScreen.getTracks().forEach(track =>{
    //         console.log('adding local track:', track)
    //         peerConnection.addTrack(track, localScreen)
    //     })

    // }

    replaceVideoStream = (stream) => {
        // if (!stream) {
        //     Object.values(this.peerConnectionByClientId).forEach(pc=>{
        //         var senders = pc.getSenders()
        //         var sender = senders.find(s=>{return s.track.kind == 'video'})
        //         sender.replaceTrack(null)
        //     })
        //     return
        // }
        let track = stream ? stream.getVideoTracks()[0] : null
        Object.values(this.peerConnectionByClientId).forEach(pc=>{
            var senders = pc.getSenders()
            var sender = senders.find(s=>{return s.track.kind == 'video'})
            sender.replaceTrack(track)
            // console.log(senders)
            // senders.forEach(s=>{console.log(s.track);console.log(s.track)})
        })
        // alert('replaced track')
    }

    toggleWebcam = (stream) => {
        console.log('toggling webcam')
        console.log(stream)
        if (stream) { // must be turnign stream on if it's provided
            console.log('adding webcam')
            Object.keys(this.peerConnectionByClientId).forEach(clientId=>{
                let senders = []
                stream.getTracks().forEach(track=>{
                    senders.push(this.peerConnectionByClientId[clientId].addTrack(track, stream))
                })
                this.webcamSendersByClientId[clientId] = senders
            })
        }
        else {
            Object.keys(this.peerConnectionByClientId).forEach(clientId=>{
                let pc = this.peerConnectionByClientId[clientId]
                this.webcamSendersByClientId[clientId].forEach(
                    sender=>pc.removeTrack(sender)
                )
            })
        }
    }

    sendMasterMessage = (message) => {
        Object.keys(this.dataChannelByClientId).forEach(clientId => {
            try {
                this.dataChannelByClientId[clientId].send(message);
            } catch (e) {
                console.error('[MASTER] Send DataChannel: ', e.toString());
            }
        });
    }

    stopMaster = () => {
        console.log('[MASTER] Stopping peerConnection');
        if (this.signalingClient) {
            this.signalingClient.close();
            this.signalingClient = null;
        }

        Object.keys(this.peerConnectionByClientId).forEach(clientId => {
            this.peerConnectionByClientId[clientId].close();
        });
        this.peerConnectionByClientId = [];

        if (this.localScreen) {
            this.localScreen.getTracks().forEach(track => track.stop());
            this.localScreen = null;
        }
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        // Object.values(this.remoteStreamsByClientId).forEach(remoteStream => remoteStream.getTracks().forEach(track => track.stop()));
        // this.remoteStreamsByClientId = {};

        if (this.peerConnectionStatsInterval) {
            clearInterval(this.peerConnectionStatsInterval);
            this.peerConnectionStatsInterval = null;
        }

        if (this.dataChannelByClientId) {
            this.dataChannelByClientId = {};
        }
    }
}
