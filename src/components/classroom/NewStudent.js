import React, { Component } from "react"
import { Auth } from "aws-amplify"
import { VideoOutput } from "./VideoOutput"
import { css, jsx } from "@emotion/core"
/** @jsx jsx */
import { Button, IconButtons, expand_in, Loading } from "mvp-webapp"
import sound from "./sounds/time-is-now.mp3"
import exitsound from "./sounds/me-too.mp3"
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
            width: { ideal : 320*2 },
            height: { ideal : 240*2 },
            mediaSource: "screen"
        },
        audio: true,
}
const screenShareOptions = {
    video: {
        width: { ideal : 320*2*2 },
        height: { ideal : 240*2*2 },
        cursor: "always"
    },
    // audio: true
}

class Student extends Component {
    constructor(props) {
        super(props)
        this.onJoin = new Audio(sound)
        this.onLeave = new Audio(exitsound)
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
        this.setState({user_id})
        this.wait = setInterval(()=>{ // wait for user name
            if (this.props.user_info.name) {
                this.streamlineClient = new StreamlineClient(
                    user_id,
                    this.props.user_info,
                    this.setLobby,
                    this.setStreams,
                )
                clearInterval(this.wait)
                this.wait = setInterval(()=>{
                    if (this.streamlineClient.ready) { // wait for websocket to connect
                        this.streamlineClient.requestJoinLobby()
                        this.toggleWebcam()
                        clearInterval(this.wait)
                    }
                }, 500)
            }
        })
        // document.addEventListener("keydown", this._handleKeyDown);
    }

    componentWillUnmount = () => {
        // document.removeEventListener("keydown", this._handleKeyDown);
    }

    // _handleKeyDown = e =>{
    //     console.log(e.which)
    //     switch (e.which) {
    //         case 83: // press s for screenshare
    //             this.toggleScreenshare()
    //             return
    //     }
    // }

    setLobby = (lobby) => {
        this.setState({lobby})
    }

    setStreams = (newStreams, channel) => {
        // console.log('setting streams ')
        if (newStreams) {
            this.onJoin.play()
            this.setState({remoteStreams: {...this.state.remoteStreams, [channel]: newStreams}})
        }
        else {
            this.onLeave.play()
            var remoteStreams = this.state.remoteStreams
            delete remoteStreams[channel]
            this.setState({remoteStreams})
        }
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
            // this.streamlineClient.stopScreenshare()
            
            const localStream = await navigator.mediaDevices.getUserMedia(webcamOptions)
            this.setState({localStream})
            this.streamlineClient.replaceVideoStream(localStream)
        }
        else {
            console.log('starting screenshare')
            const localScreen = await navigator.mediaDevices.getDisplayMedia(screenShareOptions)
            this.setState({localScreen})
            this.streamlineClient.startScreenshare(localScreen)
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
                flex-direction: row;
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
                    flex-direction: column;
                    justify-content: space-between;
                    position: relative;
                    box-sizing: border-box;
                    background-color: black;
                    width: 400px;
                    min-height: 268px;
                    min-width: 326px;
                    max-width: 40%;
                    animation-name: ${expand_in};
                    animation-duration: 1s;

                    .title {
                        // position: absolute;
                        text-align: start;
                        color: var(--color2);
                        font-weight: 1000;
                    }
                    
                    .streams {
                        display: flex;
                    
                        height: 100%;
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
                            max-height: 100%;
                            max-width: 100%;
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
                padding: 20px;
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
                padding: 20px;
                button {
                    margin: 10px;
                    margin-bottom: 0;
                }
            }

            .placeholder {
                color: black;
            }
        `
        if (this.state.lobby) {
            console.log(Object.keys(this.state.lobby.members).length == 0 )
        }
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
                        onClick={this.toggleWebcam} 
                        /> */}
                        <Button text={'Get help'} onClick={()=>{alert('an instructor will arrive in your group lobby shortly!')}}/>
                    </div>
                    {/* <div onClick={()=>{window.open('https://remotedesktop.google.com/support')}}>Request remote control</div> */}
                </div>
                <div className="others">
                    {/* {Object.keys(this.state.remoteStreams).length == 0 ? 
                        <div>There's nobody in this lobby yet</div> : 
                        <div># remote streams: {Object.values(this.state.remoteStreams).length}</div>
                    } */}
                    {this.state.lobby ?
                    JSON.stringify(this.state.lobby.members):
                    null}
                    {
                        JSON.stringify(this.state.remoteStreams)
                    }
                    {
                    this.state.lobby?
                        Object.keys(this.state.lobby.members).length == 1 ? // if only you in the lobby
                        <div className="placeholder">You're the only one in this lobby</div>
                        :
                        Object.keys(this.state.lobby.members).map(conn_id=>{
                            console.log(conn_id)
                            console.log(this.state.lobby)
                            console.log(this.state.lobby.members[conn_id])
                            console.log(this.state.lobby.members[conn_id].signaling_channel)
                            console.log(this.state.lobby.members[conn_id].screenshare_signaling_channel)
                            var webcam_channel = this.state.lobby.members[conn_id].signaling_channel
                            var screenshare_channel = this.state.lobby.members[conn_id].screenshare_signaling_channel
                            var webcam = this.state.remoteStreams[webcam_channel]
                            var screenshare = this.state.remoteStreams[screenshare_channel]
                            console.log(this.state.user_id)
                            console.log(this.state.lobby.members[conn_id].user_id)
                            if (this.state.user_id == this.state.lobby.members[conn_id].user_id) {return null} // dont render yourself
                            return <div className="other">
                                <div className="title">
                                    {this.state.lobby.members[conn_id].user_info.name}
                                    <br/>
                                    {conn_id}
                                    <br/>
                                    {this.state.lobby.members[conn_id].signaling_channel}
                                </div>
                                <div className="streams">
                                    {webcam?<VideoOutput video={webcam[0]} />:null}
                                    {screenshare?<VideoOutput video={screenshare[0]} />:null}
                                </div>
                            </div>
                        })
                    :
                    <div className="placeholder">
                        Joining lobby
                        <Loading />
                    </div>
                    }
                    {/* {JSON.stringify(this.props.user_info)} */}
                </div>
            </div>
            </>
        )
    }
    
}

const mapStateToProps = state => {
    return {
        user_info: {
            name: state.user.about.name
        }
    }
}

export default connect(mapStateToProps)(Student)