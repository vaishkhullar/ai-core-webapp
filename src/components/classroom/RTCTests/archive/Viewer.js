import AWS from "aws-sdk"
import { SignalingClient, Role } from "amazon-kinesis-video-streams-webrtc"
import { Auth } from "aws-amplify"

const region = `eu-west-1`
const natTraversalDisabled = false
const forceTURN = true
const openDataChannel = true
const useTrickleICE = true

class Viewer {
    constructor(channel, clientId, setStreams) {
        this.channel = channel
        this.clientId = clientId
        this.setStreams = setStreams
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
                Role: Role.VIEWER
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
            clientId: this.clientId,
            role: Role.VIEWER,
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

        this.pc = new RTCPeerConnection(configuration)

        if (openDataChannel) {
            this.dataChannel = this.pc.createDataChannel(`kvsDataChannel`)
            this.pc.ondatachannel = e => {e.channel.onmessage = (msg)=>{console.log(`[${this.clientId}-VIEWER] remote data msg:`, msg)}}
        }

        this.pc.oniceconnectionstatechange = () => {
            if ( this.pc.iceConnectionState == `disconnected`) {
                this.pc.close() // HUH MAYBE SHOULDNT CLOSE
                this.setStreams(null, this.channel)
            }
        }

        this.signalingClient.on(`open`, async () => {
            console.log(`[${this.clientId}-VIEWER] connected to signaling service`)
            await this.pc.setLocalDescription(
                await this.pc.createOffer({offerToReceiveAudio: true, offerToReceiveVideo: true})
            )

            if (useTrickleICE) {
                this.signalingClient.sendSdpOffer(this.pc.localDescription)
            }
        })

        this.signalingClient.on(`sdpAnswer`, async answer => {
            await this.pc.setRemoteDescription(answer)
        })

        this.signalingClient.on(`iceCandidate`, candidate => {
            this.pc.addIceCandidate(candidate)
        })

        this.signalingClient.on(`close`, () => {
            console.log([`[${this.clientId}-VIEWER] disconnected from signaling channel`])
            // MAYBE NEEDS REOPENING
        })

        this.signalingClient.on(`error`, (err) => {
            console.log(`[${this.clientId}-VIEWER] Signaling client error:`, err)
        })

        this.pc.addEventListener(`icecandidate`, (c)=>{
            // console.log(c)
            var candidate = c.candidate
            if (candidate) {
                if (useTrickleICE) {
                    try {
                        this.signalingClient.sendIceCandidate(candidate)
                    }
                    catch (err) {
                        console.log(`[${this.clientId}-VIEWER] Error in sending ice candidate`)
                        console.log(err)
                    }
                }
            }
            else {
                if (!useTrickleICE) {
                    this.signalingClient.sendSdpOffer(this.pc.localDescription)
                }
            }
        })

        this.pc.addEventListener(`track`, event => {
            console.log(`[${this.clientId}-VIEWER] received track`)
            this.remoteStreams = [...this.remoteStreams, event.streams[0]]
            this.setStreams(this.remoteStreams, this.channel) // CHANNEL WAS NOT GIVEN HERE
        })

        this.pc.onnegotiationneeded = async () => {
            console.log(`[${this.clientId}-VIEWER] NEGOTIATION NEEDED`)
            // Create an SDP offer to send to the master
            await this.pc.setLocalDescription(
                await this.pc.createOffer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true,
                }),
            );
        }

        this.signalingClient.open()

    }

    stopViewer = () => {
        console.log(`[${this.clientId}-VIEWER] Stopping viewer connection`);
        if (this.signalingClient) {
            this.signalingClient.close();
            this.signalingClient = null;
        }

        if (this.pc) {
            this.pc.close();
            this.pc = null;
        }
    }

    addStream = (stream) => {
        stream.getTracks().forEach(track => {
            this.pc.addTrack(track, stream)
        })
    }

}

export default Viewer