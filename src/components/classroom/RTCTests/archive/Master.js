import AWS from "aws-sdk"
import { SignalingClient, Role } from "amazon-kinesis-video-streams-webrtc"
import { Auth } from "aws-amplify"

const region = `eu-west-1`
const natTraversalDisabled = false
const forceTURN = true
const openDataChannel = true
const useTrickleICE = true

class Master {
    constructor(channel, clientId) {
        this.channel = channel
        this.clientId = clientId
        this.peerConnectionByClientId = {}
        this.webcamSendersByClientId = {}
        this.start()
    }

    start = async () => {
        const creds = await Auth.currentCredentials()
        const accessKeyId = creds.accessKeyId
        const sessionToken = creds.sessionToken
        const secretAccessKey = creds.secretAccessKey

        const kinesisVideoClient = new AWS.KinesisVideo({region, accessKeyId, secretAccessKey, sessionToken})
        
        const describeSignalingChannelResponse = await kinesisVideoClient
        .describeSignalingChannel({ChannelName: this.channel}).promise()

        const channelARN = describeSignalingChannelResponse.ChannelInfo.ChannelARN

        const getSignalingChannelEndpointResponse = await kinesisVideoClient
        .getSignalingChannelEndpoint({
            ChannelARN: channelARN, 
            SingleMasterChannelEndpointConfiguration: {
                Protocols: [`WSS`, `HTTPS`],
                Role: Role.MASTER
            }
        }).promise()

        const endpointsByProtocol = getSignalingChannelEndpointResponse.ResourceEndpointList.reduce((endpoints, endpoint)=>{
            endpoints[endpoint.Protocol] = endpoint.ResourceEndpoint
            return endpoints
        }, {})

        const kinesisVideoSignalingChannelsClient = new AWS.KinesisVideoSignalingChannels({region, accessKeyId, secretAccessKey, sessionToken, endpoint: endpointsByProtocol.HTTPS})

        const getIceServerConfigResponse = await kinesisVideoSignalingChannelsClient
        .getIceServerConfig({ChannelARN: channelARN}).promise()

        const iceServers = []
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

        this.signalingClient = new SignalingClient({
            channelARN,
            channelEndpoint: endpointsByProtocol.WSS,
            // clientId: this.clientId, // master has no client id (not a client)
            role: Role.MASTER,
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
                sessionToken
            }
        })

        const configuration = {
            iceServers,
            iceTransportPolicy: forceTURN ? `relay` : `all`
        }

        this.signalingClient.on(`sdpOffer`, async (offer, remoteClientId) => {
            console.log(`[${this.clientId}-MASTER] Received SDP offer from client: ` + remoteClientId);

            console.log(`[${this.clientId}-MASTER] Starting peerConnection`);
            const peerConnection = new RTCPeerConnection(configuration);

            this.peerConnectionByClientId = {...this.peerConnectionByClientId, [remoteClientId]: peerConnection};
            if (openDataChannel) {
                this.dataChannelByClientId = {
                    ...this.dataChannelByClientId,
                    [remoteClientId]: peerConnection.createDataChannel(`kvsDataChannel`)
                }
                peerConnection.ondatachannel = event => {
                    event.channel.onmessage = (message) =>{
                        this.onRemoteDataMessage(message);
                    }
                };
            }

            // Poll for connection stats
            if (!this.peerConnectionStatsInterval) {
                this.peerConnectionStatsInterval = setInterval(() => peerConnection.getStats().then(this.onStatsReport), 10000);
            }

            // Send any ICE candidates to the other peer
            peerConnection.addEventListener(`icecandidate`, ({ candidate }) => {
                if (candidate) {
                    console.log(`[${this.clientId}-MASTER] Generated ICE candidate for client: ` + remoteClientId);
                    // When trickle ICE is enabled, send the ICE candidates as they are generated.
                    if (useTrickleICE) {
                        console.log(`[${this.clientId}-MASTER] Sending ICE candidate to client: ` + remoteClientId);
                        this.signalingClient.sendIceCandidate(candidate, remoteClientId);
                    }
                } else {
                    console.log(`[${this.clientId}-MASTER] All ICE candidates have been generated for client: ` + remoteClientId);
                    // When trickle ICE is disabled, send the answer now that all the ICE candidates have ben generated.
                    if (!useTrickleICE) {
                        console.log(`[${this.clientId}-MASTER] Sending SDP answer to client: ` + remoteClientId);
                        this.signalingClient.sendSdpAnswer(peerConnection.localDescription, remoteClientId);
                    }
                }
            });

            // As remote tracks are received, add them to the remote view
            console.log(`setting peerConnection event handler for "track" (adding track)`)
            peerConnection.addEventListener(`track`, async event => {
                console.log(`[${this.clientId}-MASTER] Received remote track from client: ` + remoteClientId);
            });

            console.log(`SDP offer:`, offer)
            await peerConnection.setRemoteDescription(offer);

            await peerConnection.setLocalDescription(
                await peerConnection.createAnswer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true,
                })
            )
 
            if (useTrickleICE) {
                console.log(`[${this.clientId}-MASTER] Sending SDP answer to client: ` + remoteClientId);
                this.signalingClient.sendSdpAnswer(peerConnection.localDescription, remoteClientId);
            }

            peerConnection.oniceconnectionstatechange = ()=>{
                console.log(`[${this.clientId}-MASTER] ice connection state changed to:`, peerConnection.iceConnectionState)
                if (peerConnection.iceConnectionState == `disconnected`) {
                    console.log(`client ${remoteClientId} disconnected`)
                    peerConnection.close() // MAYBE WAIT TO RECONNECT
                }
            }

            peerConnection.onnegotiationneeded = async () => {
                console.log(`[${this.clientId}-MASTER] NEGOTIATION NEEDED`)
            }

            console.log(`[${this.clientId}-MASTER] Generating ICE candidates for client: ` + remoteClientId);
        });

        this.signalingClient.on(`iceCandidate`, async (candidate, remoteClientId) => {
            console.log(`[${this.clientId}-MASTER] Received ICE candidate from client: ` + remoteClientId);
            // Add the ICE candidate received from the client to the peer connection
            const peerConnection = this.peerConnectionByClientId[remoteClientId];
            peerConnection.addIceCandidate(candidate);
            this.peerConnectionByClientId = {...this.peerConnectionByClientId, [remoteClientId]: peerConnection}
        });

        this.signalingClient.on('open', async () => {
            console.log(`[${this.clientId}-MASTER] Connected to signaling channel`)
        })

        this.signalingClient.on(`close`, () => {
            console.log(`[${this.clientId}-MASTER] Disconnected from signaling channel`);
            // RECONNECT?
        });

        console.log(`setting signalingClient event handler for "error"`)
        this.signalingClient.on(`error`, () => {
            console.error(`[${this.clientId}-MASTER] Signaling client error`);
        });

        this.signalingClient.open();
        console.log(`finished setting up master`)
    }

    
            // var senders = []
            // var tracks = []
            // tracks.push(this.localStream.getTracks())
            // tracks.flat().forEach(track => {
            //     console.log(`adding local track:`, track)
            //     senders.push(peerConnection.addTrack(track, this.localStream))
            // });
            // this.webcamSendersByClientId[remoteClientId] = senders


    stopMaster = () => {
        console.log(`[${this.clientId}-MASTER] Stopping viewer connection`);
        if (this.signalingClient) {
            this.signalingClient.close();
            this.signalingClient = null;
        }

        Object.keys(this.peerConnectionByClientId).map(clientId => {
            var pc = this.peerConnectionByClientId[clientId]
            pc.close();
            pc = null;
        })
    }

    toggleWebcam = (stream) => {
        console.log(`toggling webcam`)
        console.log(stream)
        if (stream) { // must be turnign stream on if it`s provided
            console.log(`adding webcam`)
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

    // addStream = (stream) => {
    //     stream.getTracks().forEach(track => {
    //         this.pc.addTrack(track, stream)
    //     })
    // }

    // removeStream = senders => {
    //     senders.forEach(sender=>{

    //     })
    // }

}

export default Master