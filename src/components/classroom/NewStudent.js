import React, { Component } from "react"
import { Auth } from "aws-amplify"
import { VideoOutput } from "./VideoOutput"
import { css, jsx } from "@emotion/core"
/** @jsx jsx */
import { Button, IconButtons, expand_in } from "mvp-webapp"
import sound from "./sounds/time-is-now.mp3"
// import sound from "../../classroom/sounds/me-too.mp3"
import { connect } from "react-redux"
import StreamlineClient from "./StreamlineClient"

// export const makePostRequest = async (path, body, callback, handleErr=(err)=>{console.log(err)}) => {
//     var creds = await Auth.currentSession()
//     var options = {
//         method: 'POST',
//         mode: 'cors',
//         body: JSON.stringify(body),
//         headers: {
//             "Authorization": creds.getIdToken().getJwtToken(),
//             'Content-Type': 'application/json'
//         }
//     }
//     var response = await fetch(`https://3awv0z7tog.execute-api.eu-west-2.amazonaws.com/prod/${path}` , options) 
//     console.log('RAW RESPONSE:', response)
//     response = response.json()
//     return response

// }

const widescreen = false
const webcamOptions = {
        video: {
            width: { ideal : 320 },
            height: { ideal : 240 },
            mediaSource: "screen"
        },
        audio: true,
}
const screenShareOptions = {
    video: {
        width: { ideal : 320 },
        height: { ideal : 240 },
        cursor: "always"
    },
    // audio: true
}

class Student extends Component {
    constructor(props) {
        super(props)
        this.onJoin = new Audio(sound)
        this.state = {
            // master: null,
            // signalingClient: null,
            // peerConnectionByClientId: {},
            // dataChannelByClientId: {},
            localStream: null,
            localScreen: null,
            remoteStreams: {},
            // peerConnectionStatsInterval: null,
            // screen_track_senders: null,
            // webcam_track_senders: null,

            // viewers: {},
            // lobby: 'Group',
            // channelName: null,
            // lobby_state: null,
            // sync_interval: null,
            // screenshareChannelName: null
        }
    }

    componentDidMount = async () => {
        var creds = await Auth.currentAuthenticatedUser()
        var user_id = creds.username
        user_id = user_id == 'b95f3892-8887-4dbc-9479-a1c42b9133d9' ? `id-${this.props.mem}` : user_id
        this.streamlineClient = new StreamlineClient(
            user_id,
            this.setStreams,
            // this.streamlineClient.requestJoinLobby
        )
        this.wait = setInterval(()=>{if (this.streamlineClient.ready) {
            this.streamlineClient.requestJoinLobby()
            this.toggleWebcam()
            clearInterval(this.wait)
        }}, 500)
    }

    setStreams = (newStreams, channel) => {
        // console.log('setting streams ')
        this.onJoin.play()
        this.setState({remoteStreams: {...this.state.remoteStreams, [channel]: newStreams}})
    }

    componentWillUnmount = async () => {
        this.streamlineClient.close()
    }

    sendViewerMessage = (message) => {
    }

    toggleWebcam = async () => {
        console.log('toggling webcam')
        if (this.state.localStream) {
            console.log('stopping webcam share')
            this.setState({localStream: null})
            this.streamlineClient.stopWebcam()
        }
        else {
            console.log('starting webcam share')
            const localStream = await navigator.mediaDevices.getUserMedia(webcamOptions)
            this.setState({localStream})
            this.streamlineClient.startWebcam(localStream)
        }
    }

    toggleScreenshare = async () => {
        console.log('toggling screenshare')
        if (this.state.localScreen) {
            console.log('stopping screenshare')
            this.setState({localScreen: null})
            this.streamlineClient.stopScreenshare()
        }
        else {
            console.log('starting screenshare')
            const localScreen = await navigator.mediaDevices.getDisplayMedia(screenShareOptions)
            this.setState({localScreen})
            this.streamlineClient.startScreenshare()
        }
    }

    render() {
        const style = css`
            height: 80vh;
            color: black;
            font-family: var(--font1);
            background-color: var(--color2);

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
                display: flex;
                justify-content: center;
                overflow: hidden;
                width: 100%;
                height: 150px;
                right: 0;
                background-color: black;
                .my-webcam {
                    ${this.state.localScreen ? 
                        'height: 20%; position: absolute; left: 0;' 
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
                        height: 100%;
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
                flex-direction: column;
                flex-wrap: wrap;
                justify-content: center; 
                box-sizing: border-box;
                video {
                    // width: 33.33%;
                    animation-name: ${expand_in};
                    animation-duration: 1s;
                }
                .other {
                    border: 3px solid black;
                    border-radius: 2px;
                    margin: 5px;
                    // padding: 5px;
                    display: flex;
                    flex-direction: row;
                    position: relative;
                    box-sizing: border-box;
                    background-color: black;
                    max-width: 100%;

                    .title {
                        position: absolute;
                        color: var(--color2);
                        font-weight: 1000;
                    }
                    
                    .streams {
                        display: flex;
                    
                        height: 180px;
                        min-width: 200px;
                        max-width: 100%;

                        .stream {
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            width: 300px;
                            background-color: black;
                            overflow: hidden;
                        }
                        video {
                            // border: 4px solid black;
                            // border-radius: 10px;
                        }
                      
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

            .actions {
                display: flex;
                flex-direction: column;
                button {
                    margin: 10px;
                    margin-bottom: 0;
                }
            }
        `

        return (
            <>
            <div css={style}>
                <div className="right">
                    <div className="me">
                        {this.state.localStream?
                            <div className="my-webcam"><VideoOutput video={this.state.localStream} muted={true}/></div>
                        :null}
                        {this.state.localScreen ?
                            <div className="my-screen"><VideoOutput video={this.state.localScreen} muted={true}/></div>
                        :null}
                    </div>
                    {/* <IconButtons items={[
                        {title: 'Screenshare', faIcon: screenshareIcon, onClick: this.toggleScreenshare},
                        {title: 'Question', faIcon: questionIcon,  onClick: this.toggleWebcam
                        // onClick: ()=>{props.openSlideUp(<NotificationPage />)}
                        },
                    ]} /> */}
                    <div className="actions">
                        Actions
                        <Button text={this.state.localScreen ? 'Stop screenshare' : 'Start screenshare'} onClick={this.toggleScreenshare} />
                        {/* <Button text={this.state.localStream ? 'Turn off webcam' : 'Turn on webcam'} 
                        // onClick={this.toggleWebcam} 
                        /> */}
                        <Button text={'Get help'} onClick={()=>{alert('an instructor will arrive in your group lobby shortly!')}}/>
                    </div>
                    {/* <div onClick={()=>{window.open('https://remotedesktop.google.com/support')}}>Request remote control</div> */}
                </div>
                <div className="others">
                    {Object.keys(this.state.remoteStreams).length == 0 ? 
                        <div>There's nobody in this lobby yet</div> : 
                        <div># remote streams: {this.state.remoteStreams.length}</div>
                    }
                    {/* {Object.keys(this.state.remoteStreams).map(channelName=>{ */}

                    {
                    Object.keys(this.state.remoteStreams).map(channel => {
                        return <div className="other">
                            <div className="title">
                                Channel: {channel}
                            </div>
                            <div className="streams">
                                <div>
                                    {this.state.remoteStreams[channel] ? <VideoOutput video={this.state.remoteStreams[channel][0]} /> : 'no streams'}
                                    {/* {this.state.remoteStreams[channel].map(stream =>{
                                        return <VideoOutput video={stream} />
                                    })} */}
                                </div>
                            </div>
                        </div>
                    })
                    // this.state.lobby_state ?
                    // Object.keys(this.state.lobby_state.members)
                    // .filter(member_id=>{return member_id != this.state.user_id}) // dont show yourself
                    // .map(member_id=>{
                    //     if (
                    //         Object.values(this.state.lobby_state.members[member_id])
                    //         .filter(channel=>{return this.state.remoteStreams[channel]})
                    //         .length == 0
                    //     ) 
                    //     {return null}
                    //     return (
                    //         <div className="other">
                    //             <div className="title">
                    //                 {member_id}
                    //             </div>
                    //             <div className="streams">
                    //                 {/* {this.state.remoteStreams[channelName].length == 0 ? // if we've got some video streams
                    //                 null: */}
                    //                 {
                    //                 Object.values(this.state.lobby_state.members[member_id]).map(member_channel=>{
                    //                     return(
                    //                         this.state.remoteStreams[member_channel] ?
                    //                         <div className="stream">
                    //                             <VideoOutput video={this.state.remoteStreams[member_channel][0]} />
                    //                             {/* {this.state.remoteStreams[channelName].map(stream => {
                    //                                 console.log(stream)
                    //                                 return <VideoOutput video={stream}/>
                    //                             })} */}
                    //                         </div>
                    //                         :
                    //                         null
                    //                     )})
                    //                 }
                    //             </div>
                    //         </div>
                    //     )
                    // })
                    // :
                    // null
                }
                </div>
            </div>
            </>
        )
    }
    
}

export default Student