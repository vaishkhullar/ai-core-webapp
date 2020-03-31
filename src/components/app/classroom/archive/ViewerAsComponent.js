

/**
 * This file demonstrates the process of starting WebRTC streaming using a KVS Signaling Channel.
 */
import React, { Component } from "react"
import AWS from "aws-sdk"
import { SignalingClient, Role } from "amazon-kinesis-video-streams-webrtc"
import { Auth } from "aws-amplify"
import { getRandomClientId, VideoOutput } from "../Classroom"
import { css, jsx } from "@emotion/core"
/** @jsx jsx */
import { Button, IconButtons, expand_in } from "mvp-webapp"
import { faDesktop as screenshareIcon, faHandPaper as questionIcon} from '@fortawesome/free-solid-svg-icons';

export default class Viewer extends Component {
    constructor(props) {
        super(props)
        this.state = {
            signalingClient: null,
            peerConnectionByClientId: {},
            dataChannelByClientId: {},
            localStream: null,
            localScreen: null,
            remoteStreams: [],
            peerConnectionStatsInterval: null,
            sharing_screen: false,
            screen_track_senders: null,
            sharing_webcam: false,
            webcam_track_senders: null
        }        
    }

    componentDidMount = () => {this.startViewer()}

    componentWillUnmount = () => {this.stopViewer()}

    startViewer = async () => {
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
                ChannelName: channelName,
            })
            .promise();
        const channelARN = describeSignalingChannelResponse.ChannelInfo.ChannelARN;
        console.log('[VIEWER] Channel ARN: ', channelARN);

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
        console.log('[VIEWER] Endpoints: ', endpointsByProtocol);

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
        console.log('[VIEWER] ICE servers: ', iceServers);

        // Create Signaling Client
        this.setState({
            signalingClient: new SignalingClient({
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
        })

        const resolution = widescreen ? { width: { ideal: 1280 }, height: { ideal: 720 } } : { width: { ideal: 640/2 }, height: { ideal: 480/2 } };
        const configuration = {
            iceServers,
            iceTransportPolicy: forceTURN ? 'relay' : 'all',
        };
        var peerConnection = new RTCPeerConnection(configuration);
        if (openDataChannel) {
            this.setState({dataChannel: peerConnection.createDataChannel('kvsDataChannel')})
            peerConnection.ondatachannel = event => {
                event.channel.onmessage = this.props.onRemoteDataMessage
            };
        }

        // Poll for connection stats
        this.setState({peerConnectionStatsInterval: setInterval(() => peerConnection.getStats().then((stats)=>{console.log('stats report:', stats)}), 10000)});

        this.state.signalingClient.on('open', async () => {
            console.log('[VIEWER] Connected to signaling service');

            // Get a stream from the webcam, add it to the peer connection, and display it in the local view
            try {
            } catch (e) {
                console.error('[VIEWER] Could not find webcam');
                return;
            }

            const webcamOptions = {
                video: sendVideo ? resolution : false,
                audio: sendAudio,
            }
            const screenShareOptions = {
                video: {
                    cursor: "always"
                },
                audio: false
            }
        
            // WEBCAM
            this.setState({
                localStream: await navigator.mediaDevices.getUserMedia(webcamOptions),
            },
                () => {
                    var senders = this.state.localStream.getTracks().map(track => {return peerConnection.addTrack(track, this.state.localStream)})
                    this.setState({
                        webcam_track_senders: senders,
                        sharing_webcam: true
                    }, ()=>{console.log(this.state)})
                }
            )
            // SCREENSHARE
            this.setState({
                localScreen: await navigator.mediaDevices.getDisplayMedia(screenShareOptions),
            },
                () => {
                    var senders = this.state.localScreen.getTracks().map(track => {return peerConnection.addTrack(track, this.state.localScreen)})
                    this.setState({screen_track_senders: senders, sharing_screen: true}, ()=>{console.log(this.state)})
                }
            )

            // Create an SDP offer to send to the master
            console.log('[VIEWER] Creating SDP offer');
            await peerConnection.setLocalDescription(
                await peerConnection.createOffer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true,
                }),
            );

            // When trickle ICE is enabled, send the offer now and then send ICE candidates as they are generated. Otherwise wait on the ICE candidates.
            if (useTrickleICE) {
                console.log('[VIEWER] Sending SDP offer');
                this.state.signalingClient.sendSdpOffer(peerConnection.localDescription);
            }
            console.log('[VIEWER] Generating ICE candidates');
        });

        this.state.signalingClient.on('sdpAnswer', async answer => {
            // Add the SDP answer to the peer connection
            console.log('[VIEWER] Received SDP answer');
            await peerConnection.setRemoteDescription(answer);
        });

        this.state.signalingClient.on('iceCandidate', candidate => {
            // Add the ICE candidate received from the MASTER to the peer connection
            console.log('[VIEWER] Received ICE candidate');
            peerConnection.addIceCandidate(candidate);
        });

        this.state.signalingClient.on('close', () => {
            console.log('[VIEWER] Disconnected from signaling channel');
        });

        this.state.signalingClient.on('error', error => {
            console.error('[VIEWER] Signaling client error: ', error);
        });

        // Send any ICE candidates to the other peer
        peerConnection.addEventListener('icecandidate', ({ candidate }) => {
            if (candidate) {
                console.log('[VIEWER] Generated ICE candidate');

                // When trickle ICE is enabled, send the ICE candidates as they are generated.
                if (useTrickleICE) {
                    console.log('[VIEWER] Sending ICE candidate');
                    this.state.signalingClient.sendIceCandidate(candidate);
                }
            } else {
                console.log('[VIEWER] All ICE candidates have been generated');

                // When trickle ICE is disabled, send the offer now that all the ICE candidates have ben generated.
                if (!useTrickleICE) {
                    console.log('[VIEWER] Sending SDP offer');
                    this.state.signalingClient.sendSdpOffer(peerConnection.localDescription);
                }
            }
        });

        // As remote tracks are received, add them to the remote view
        peerConnection.addEventListener('track', event => {
            console.log('[VIEWER] Received remote track');
            // if (this.state.remoteStream) {
            //     // return;
            // }

            console.log(this.state.remoteStreams)
            this.setState({remoteStreams: [...this.state.remoteStreams, ...event.streams]});
            // remoteView.srcObject = this.state.remoteStream;
        });

        this.setState({peerConnection})

        peerConnection.onnegotiationneeded = async () => {
            console.log('NEGOTIATION NEEDED, so creating SDP offer')
            // Create an SDP offer to send to the master
            await peerConnection.setLocalDescription(
                await peerConnection.createOffer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true,
                }),
            );
        }

        console.log('[VIEWER] Starting viewer connection');
        this.state.signalingClient.open();
    }

    stopViewer = () => {
        console.log('[VIEWER] Stopping viewer connection');
        if (this.state.signalingClient) {
            this.state.signalingClient.close();
            this.setState({signalingClient: null});
        }

        if (this.state.peerConnection) {
            this.state.peerConnection.close();
            this.setState({peerConnection: null});
        }

        if (this.state.localStream) {
            this.state.localStream.getTracks().forEach(track => track.stop());
            this.setState({localStream: null});
        }

        if (this.state.localScreen) {
            this.state.localScreen.getTracks().forEach(track => track.stop());
            this.setState({localScreen: null})
        }

        if (this.state.remoteStream) {
            this.state.remoteStream.getTracks().forEach(track => track.stop());
            this.setState({remoteStream: null});
        }

        if (this.state.peerConnectionStatsInterval) {
            clearInterval(this.state.peerConnectionStatsInterval);
            this.setState({peerConnectionStatsInterval: null});
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
        if (this.state.dataChannel) {
            try {
                this.state.dataChannel.send(message);
            } catch (e) {
                console.error('[VIEWER] Send DataChannel: ', e.toString());
            }
        }
    }

    toggleWebcam = async () => {
        const resolution = false ? { width: { ideal: 1280 }, height: { ideal: 720 } } : { width: { ideal: 640/2 }, height: { ideal: 480/2 } };
        console.log('toggling webcam')
        const webcamOptions = {
                video: resolution,
                audio: false,
        }
        
        if (this.state.sharing_webcam) {
            console.log('stopping webcam share')
            console.log('current senders:', this.state.webcam_track_senders)
            await this.state.webcam_track_senders.forEach((sender)=>{this.state.peerConnection.removeTrack(sender)}) // specify the sender of the track (for the screenshare) and remove it from the RTCPeerConnection
            this.setState({
                sharing_webcam: !this.state.sharing_webcam,
                localStream: null,
                webcam_track_senders: null
            },
            ()=>{console.log(this.state)}
            )
        }
        else {
            console.log('starting webcam share')
            this.setState({
                localStream: await navigator.mediaDevices.getUserMedia(webcamOptions)
            },    
            () => {
                console.log('got local stream')
                var senders = this.state.localStream.getTracks().map(track => {
                    console.log('adding track:', track)
                    return this.state.peerConnection.addTrack(track, this.state.localStream)
                })
                this.setState({
                    webcam_track_senders: senders,
                    sharing_webcam: true
                }, ()=>{    
                    console.log(this.state)
                    console.log('webcam senders:', this.state.webcam_track_senders)
                })
            }
            )
        }
    }

    toggleScreenshare = async () => {
        console.log('toggling screenshare')
        const screenShareOptions = {
            video: {
                cursor: "always"
            },
            audio: false
        }
        
        console.log('sharing screen?', this.state.sharing_screen)
        if (this.state.sharing_screen) {
            console.log(this.state.screen_track_senders)
            await this.state.screen_track_senders.forEach((sender)=>{this.state.peerConnection.removeTrack(sender)}) // specify the sender of the track (for the screenshare) and remove it from the RTCPeerConnection
            this.setState({
                sharing_screen: !this.state.sharing_screen,
                localScreen: null,
                screen_track_senders: null
            },
            ()=>{console.log(this.state)}
            )
        }
        else {
            this.setState({
                localScreen: await navigator.mediaDevices.getDisplayMedia(screenShareOptions)
            },    
                () => {
                    var senders = this.state.localScreen.getTracks().map(track => {return this.state.peerConnection.addTrack(track, this.state.localScreen)})
                    this.setState({
                        screen_track_senders: senders,
                        sharing_screen: true
                    }, ()=>{console.log(this.state)})
                }
            )
            // const localScreen = await navigator.mediaDevices.getDisplayMedia(screenShareOptions)
            // var screen_track_senders = []
            // localScreen.getTracks().forEach((track) =>{
            //     console.log('track:', track)
            //     const sender = this.state.peerConnection.addTrack(track, localScreen)
            //     screen_track_senders.push(sender)
            // })
            // console.log('screen track senders:', screen_track_senders)
            // this.setState({
            //     sharing_screen: !this.state.sharing_screen,
            //     localScreen,
            //     screen_track_senders,
            // })
        }
        

        // this.setState({
        //     sharing_screen: !this.state.sharing_screen, // toggle sharing screen state
        //     localScreen: this.state.localScreen ? null : await navigator.mediaDevices.getDisplayMedia(screenShareOptions) // switch screen to null if it exists, otherwise ask the use to share the screen
        // },
        //     () => {
        //         console.log('sharing screen?', this.state.sharing_screen)
        //         this.state.sharing_screen ? // if not sharing screen
        //         this.state.localScreen.getTracks().forEach(track => { // get each (1) screenshare Mediatrack
        //             this.setState({screen_sender: this.state.peerConnection.addTrack(track, this.state.localScreen)}) // set the screen sender in the state, which is used to remove the Mediatrack from the RTCpeerConnection
        //         })
        //         :
        //         this.state.peerConnection.removeTrack(this.state.screen_sender) // specify the sender of the track (for the screenshare) and remove it from the RTCPeerConnection
        //     }
        // )
    }

    render() {
        console.log('remote streams:', this.state.remoteStreams)

        // const vid_height = 200
        const style = css`
            height: 80vh;
            color: black;
            font-family: var(--font1);
            background-color: var(--color2);

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
                    width: 33.33%;
                    animation-name: ${expand_in};
                    animation-duration: 1s;
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
            <>
            <div css={style}>
                <div className="right">
                    <div className="me">
                        {this.state.localStream?
                            <div className="my-webcam"><VideoOutput video={this.state.localStream}/></div>
                        :null}
                        {this.state.sharing_screen ?
                            <div className="my-screen"><VideoOutput video={this.state.localScreen}/></div>
                        :null}
                        {/* <Button text='Toggle screenshare' onClick={this.toggleScreenshare}/> */}
                    </div>
                    <br/>
                    <IconButtons items={[
                        {title: 'Screenshare', faIcon: screenshareIcon, onClick: this.toggleScreenshare},
                        {title: 'Question', faIcon: questionIcon,  onClick: this.toggleWebcam
                        // onClick: ()=>{props.openSlideUp(<NotificationPage />)}
                        },
                    ]} />
                    <br/>
                    Lobby
                    {['Class', 'Group'].map(lobby=>{
                        return <div className="lobby-btn"
                            css={css`${this.state.lobby == lobby ? 'background-color: black; color: var(--color2);': null}`}
                            onClick={()=>{this.setState({lobby})}}
                        >
                            {lobby}
                        </div>
                    })}
                    <div onClick={()=>{window.open('https://remotedesktop.google.com/support')}}>Request remote control</div>
                </div>
                <div className="others">
                    {this.state.remoteStreams.length == 0 ? <div>There's nobody in this lobby yet</div> : null}
                    {this.state.remoteStreams.map(remoteStream=>{return <VideoOutput video={remoteStream}/>})}
                    {/* {this.state.remoteStreams.map(remoteStream=>{return <VideoOutput video={remoteStream}/>})}
                    {this.state.remoteStreams.map(remoteStream=>{return <VideoOutput video={remoteStream}/>})}
                    {this.state.remoteStreams.map(remoteStream=>{return <VideoOutput video={remoteStream}/>})}
                    {this.state.remoteStreams.map(remoteStream=>{return <VideoOutput video={remoteStream}/>})}
                    {this.state.remoteStreams.map(remoteStream=>{return <VideoOutput video={remoteStream}/>})} */}
                </div>
            </div>
            </>
        )
    }
    
}
