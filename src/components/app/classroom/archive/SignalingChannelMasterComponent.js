import React, { Component } from "react"
import AWS from "aws-sdk"
import { SignalingClient, Role } from "amazon-kinesis-video-streams-webrtc"
import { VideoOutput } from "./Classroom"
import { Auth } from "aws-amplify"
import { css, jsx } from "@emotion/core"
/** @jsx jsx */
import { expand_in } from "mvp-webapp"

export default class Master extends Component {
    constructor(props) {
        super(props)
        this.state = {
            signalingClient: null,
            peerConnectionByClientId: {},
            dataChannelByClientId: {},
            localStream: null,
            remoteStreamsByClientId: {},
            peerConnectionStatsInterval: null,
        };
    }

    componentDidMount = () => {
        this.startMaster()
    }

    componentWillUnmount = () => {
        this.stopMaster()
    }

    startMaster = async () => {
        console.log('starting master')
        const channelName = 'test-channel'
        const region = 'eu-west-2'
        const natTraversalDisabled = false
        const forceTURN = false
        const widescreen = false
        const sendAudio = false
        const sendVideo = true
        const openDataChannel = true
        const useTrickleICE = false

        const creds = await Auth.currentCredentials()
        const accessKeyId = creds.accessKeyId
        const sessionToken = creds.sessionToken
        const secretAccessKey = creds.secretAccessKey

        console.log('creating KVS client')
        // Create KVS client
        const kinesisVideoClient = new AWS.KinesisVideo({
            region: 'eu-west-2',
            accessKeyId,
            secretAccessKey,
            sessionToken,
            // endpoint: .endpoint,
        });

        console.log('getting signaling channel ARN')
        // Get signaling channel ARN
        const describeSignalingChannelResponse = await kinesisVideoClient
            .describeSignalingChannel({
                ChannelName: channelName,
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
        this.setState({
            signalingClient: new SignalingClient({
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
        };

        const resolution = widescreen ? { width: { ideal: 1280 }, height: { ideal: 720 } } : { width: { ideal: 640/2 }, height: { ideal: 480/2 } };
        const constraints = {
            video: sendVideo ? resolution : false,
            audio: sendAudio,
        };

        console.log('setting up webcam stream')
        const localStream = await navigator.mediaDevices.getUserMedia(constraints);
    // localView.srcObject = this.state.localStream;
        this.setState({localStream})
        
        console.log('setting up screenshare stream')
        const screenShareOptions = {
            video: {
                cursor: "always"
            },
            audio: false
        }
        const localScreen = await navigator.mediaDevices.getDisplayMedia(screenShareOptions)
        this.setState({
            localScreen, 
            sharing_screen: true
        })

        console.log('setting signalingClient event handler for "open"')
        this.state.signalingClient.on('open', async () => {
            console.log('[MASTER] Connected to signaling service');
        });

        console.log('setting signalingClient event handler for "sdpOffer"')
        this.state.signalingClient.on('sdpOffer', async (offer, remoteClientId) => {
            console.log('[MASTER] Received SDP offer from client: ' + remoteClientId);
            console.log(this.state)
            // Create a new peer connection using the offer from the given client
            const peerConnection = new RTCPeerConnection(configuration);
            if (openDataChannel) {
                this.setState({dataChannelByClientId: {
                    ...this.state.dataChannelByClientId,
                    [remoteClientId]: peerConnection.createDataChannel('kvsDataChannel')
                }})
                peerConnection.ondatachannel = event => {
                    event.channel.onmessage = this.props.onRemoteDataMessage;
                };
            }

            // Poll for connection stats
            if (!this.state.peerConnectionStatsInterval) {
                console.log('setting callback to get stats from peerConnection')
                this.setState({peerConnectionStatsInterval: setInterval(() => peerConnection.getStats().then(this.props.onStatsReport), 10000)});
            }

            // Send any ICE candidates to the other peer
            console.log('setting peerConnection event handler for "icecandidate" (this ICE candidate can be sent to the remote peer)')
            peerConnection.addEventListener('icecandidate', ({ candidate }) => {
                if (candidate) {
                    console.log('[MASTER] Generated ICE candidate for client: ' + remoteClientId);
                    // When trickle ICE is enabled, send the ICE candidates as they are generated.
                    if (useTrickleICE) {
                        console.log('[MASTER] Sending ICE candidate to client: ' + remoteClientId);
                        this.state.signalingClient.sendIceCandidate(candidate, remoteClientId);
                    }
                } else {
                    console.log('[MASTER] All ICE candidates have been generated for client: ' + remoteClientId);
                    // When trickle ICE is disabled, send the answer now that all the ICE candidates have ben generated.
                    if (!useTrickleICE) {
                        console.log('[MASTER] Sending SDP answer to client: ' + remoteClientId);
                        this.state.signalingClient.sendSdpAnswer(peerConnection.localDescription, remoteClientId);
                    }
                }
            });

            // As remote tracks are received, add them to the remote view
            console.log('setting peerConnection event handler for "track" (adding track)')
            peerConnection.addEventListener('track', event => {
                console.log('[MASTER] Received remote track from client: ' + remoteClientId);
                console.log(event)
                // if (this.state.remoteStreams) {
                    // return;
                // }
                var remoteClient
                if (this.state.remoteStreamsByClientId[remoteClientId]) {
                    remoteClient = [...this.state.remoteStreamsByClientId[remoteClientId], ...event.streams]
                } 
                else {
                    remoteClient = event.streams
                }
                this.setState(
                    {remoteStreamsByClientId: {
                        ...this.state.remoteStreamsByClientId, 
                        [remoteClientId]: remoteClient
                    }},
                    ()=>{console.log(this.state)}    
                )
            });

            this.state.localStream.getTracks().forEach(track => {
                console.log('adding local track:', track)
                peerConnection.addTrack(track, this.state.localStream)
            });
            this.state.localScreen.getTracks().forEach(track =>{
                console.log('adding local track:', track)
                peerConnection.addTrack(track, this.state.localScreen)
            })

            console.log('SDP offer:', offer)
            await peerConnection.setRemoteDescription(offer);

            // Create an SDP answer to send back to the client
            console.log('[MASTER] Creating SDP answer for client: ' + remoteClientId);
            await peerConnection.setLocalDescription(
                await peerConnection.createAnswer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true,
                }),
            );

            // When trickle ICE is enabled, send the answer now and then send ICE candidates as they are generated. Otherwise wait on the ICE candidates.
            if (useTrickleICE) {
                console.log('[MASTER] Sending SDP answer to client: ' + remoteClientId);
                this.state.signalingClient.sendSdpAnswer(peerConnection.localDescription, remoteClientId);
            }

            console.log('setting peerConnection event handler for "oniceconnectionstatechange"')
            peerConnection.oniceconnectionstatechange = ()=>{
                console.log('new connection state:', peerConnection.iceConnectionState)
                if (peerConnection.iceConnectionState == 'disconnected') {
                    console.log(`client ${remoteClientId} disconnected`)
                    peerConnection.close()
                    var remoteStreamsByClientId = this.state.remoteStreamsByClientId
                    delete remoteStreamsByClientId[remoteClientId] // remove client's remote streams 
                    this.setState({remoteStreamsByClientId})
                }
            }
            
            console.log('setting peerConnection event handler for "onnegotiationneeded"')
            peerConnection.onnegotiationneeded = () => {
                alert('NEGOTIATION NEEDED')
            }

            console.log('[MASTER] Generating ICE candidates for client: ' + remoteClientId);
            this.setState({peerConnectionByClientId: {...this.state.peerConnectionByClientId, [remoteClientId]: peerConnection}});
        });

        console.log('setting signalingClient event handler for "iceCandidate"')
        this.state.signalingClient.on('iceCandidate', async (candidate, remoteClientId) => {
            console.log('[MASTER] Received ICE candidate from client: ' + remoteClientId);

            // Add the ICE candidate received from the client to the peer connection
            const peerConnection = this.state.peerConnectionByClientId[remoteClientId];
            peerConnection.addIceCandidate(candidate);
            this.setState({peerConnectionByClientId: {...this.state.peerConnectionByClientId, [remoteClientId]: peerConnection}})
        });

        console.log('setting signalingClient event handler for "close"')
        this.state.signalingClient.on('close', () => {
            console.log('[MASTER] Disconnected from signaling channel');
        });

        console.log('setting signalingClient event handler for "error"')
        this.state.signalingClient.on('error', () => {
            console.error('[MASTER] Signaling client error');
        });

        console.log('[MASTER] Starting peerConnection');
        this.state.signalingClient.open();
        console.log('finished setting up master')
    }

    stopMaster = () => {
        console.log('[MASTER] Stopping peerConnection');
        if (this.state.signalingClient) {
            this.state.signalingClient.close();
            this.setState({signalingClient: null});
        }

        Object.keys(this.state.peerConnectionByClientId).forEach(clientId => {
            this.state.peerConnectionByClientId[clientId].close();
        });
        this.setState({peerConnectionByClientId: []});

        if (this.state.localStream) {
            this.state.localStream.getTracks().forEach(track => track.stop());
            this.setState({localStream: null});
        }

        this.state.remoteStreamsByClientId.forEach(remoteStream => remoteStream.getTracks().forEach(track => track.stop()));
        this.setState({remoteStreamsByClientId: {}});

        if (this.state.peerConnectionStatsInterval) {
            clearInterval(this.state.peerConnectionStatsInterval);
            this.setState({peerConnectionStatsInterval: null});
        }

        if (this.state.localView) {
            this.setState({localView: {srcObject: null}});
        }

        if (this.state.remoteView) {
            this.setState({remoteView: {srcObject: null}});
        }

        if (this.state.dataChannelByClientId) {
            this.setState({dataChannelByClientId: {}});
        }
    }
        
    sendMasterMessage = (message) => {
        Object.keys(this.state.dataChannelByClientId).forEach(clientId => {
            try {
                this.state.dataChannelByClientId[clientId].send(message);
            } catch (e) {
                console.error('[MASTER] Send DataChannel: ', e.toString());
            }
        });
    }

    render() {
        console.log('remote streams by client ID:', this.state.remoteStreamsByClientId)
        const style = css`
            height: 80vh;
            color: black;
            font-family: var(--font1);
            background-color: var(--color2);

            // display: flex;
            // flex-direction: row;

            // video {
            //     height: 200px;
            // }

            // width: 
            position: relative;
            .right {
                width: 225px;
                width: 30%;
                float: right;
                position: absolute;
                right: 0;
            }
            .me {
                position: relative;
                
                width: 100%;
                height: 150px;
                right: 0;
                background-color: black;
                // padding: 10px;
                border-radius: 3px;
                .my-webcam {
                    ${this.state.sharing_screen ? 
                        'height: 20%; position: absolute;' 
                        : 
                        'height: 100%;'
                    };
                    video {
                        height: 100%
                    }
                }
                .my-screen {
                    height: 100%;
                    video {
                        width: 100%;
                    }
                }
                button {
                    margin-top: 20px;
                }
                
            }
            .others {
                color: black;
                font-family: var(--font1);
                min-height: 150px;
                align-items: center;
                width: 600px;
                width: 70%;
                padding: 0 10px;
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                justify-content: center; 
                box-sizing: border-box;
                video {
                    animation-name: ${expand_in};
                    animation-duration: 1s;
                }
                .other {
                    background-color: black;
                    padding: 5px;
                    margin: 5px;
                    // width: 33.33%;
                    width: 100%;
                    position: relative;
                    height: 200px;
                    display: flex;
                    .details-overlay {
                        position: absolute;
                        opacity: 1;
                    }
                    video {
                        // height: 100%;
                        width: 50%;
                    }
                }
            }

            .lobby-btn {
                font-size: 14px;
                border-radius: 8px;
                padding: 3px;
                margin: 3px auto;
                border: 2px solid black;
                width: 60px;
                cursor: pointer;
                :hover {
                    background-color: black;
                    color: var(--color2);
                }
                transition-duration: 0.5s;
                font-weight: 900;
            }
        `
        return (
            <div css={style}>
                <div className="right">
                    <div className="me">
                        {this.state.localStream?
                            <div className="my-webcam"><VideoOutput video={this.state.localStream}/></div>
                        :null}
                        {this.state.sharing_screen ?
                            <div className="my-screen"><VideoOutput video={this.state.localScreen}/></div>
                        :null}
                    </div>
                </div>
                <div className="others">
                    {Object.keys(this.state.remoteStreamsByClientId).map((remoteClientId)=>{
                        // console.log('remoteclient id:', remoteClientId)
                        return (<div className="other">
                            <div className="details-overlay">
                                {remoteClientId}
                            </div>
                            {this.state.remoteStreamsByClientId[remoteClientId].map(
                            remoteStream =>{
                                // console.log(remoteStream)
                                return <VideoOutput video={remoteStream} />
                            })}
                            </div>)
                        }
                    )}
                </div>
            </div>
        )
    }
}
