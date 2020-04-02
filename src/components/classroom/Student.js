import React, { Component } from "react"
import AWS from "aws-sdk"
import { SignalingClient, Role } from "amazon-kinesis-video-streams-webrtc"
import { Auth } from "aws-amplify"
import { VideoOutput } from "./VideoOutput"
import { css, jsx } from "@emotion/core"
/** @jsx jsx */
import { Button, IconButtons, expand_in } from "mvp-webapp"
import { faDesktop as screenshareIcon, faHandPaper as questionIcon} from '@fortawesome/free-solid-svg-icons';
import Viewer from "./SignalingChannelViewer"
import Master from "./SignalingChannelMaster"
import LobbySwitch from "./LobbySwitch"
import sound from "./sounds/time-is-now.mp3"
// import sound from "../../classroom/sounds/me-too.mp3"
import { connect } from "react-redux"

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

export const makeGetRequest = async (path) => {
    const creds = await Auth.currentSession()
    var options = {
        headers: {
            "Authorization": creds.getIdToken().getJwtToken(),
            'Content-Type': 'application/json'
        }
    }
    let response = await fetch(`https://3awv0z7tog.execute-api.eu-west-2.amazonaws.com/prod/${path}`, options)
    console.log(response)
    return response
}

export const makePostRequest = async (path, body, callback, handleErr=(err)=>{console.log(err)}) => {
    var creds = await Auth.currentSession()
    var options = {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(body),
        headers: {
            "Authorization": creds.getIdToken().getJwtToken(),
            'Content-Type': 'application/json'
        }
    }
    var response = await fetch(`https://3awv0z7tog.execute-api.eu-west-2.amazonaws.com/prod/${path}` , options) 
    console.log('RAW RESPONSE:', response)
    response = response.json()
    return response

}

const epochNow = () => {
    return Math.round(new Date().getTime() / 1000)
}

class Student extends Component {
    constructor(props) {
        super(props)
        this.onJoin = new Audio(sound)
        this.state = {
            master: null,
            signalingClient: null,
            peerConnectionByClientId: {},
            dataChannelByClientId: {},
            localStream: null,
            localScreen: null,
            remoteStreams: {},
            peerConnectionStatsInterval: null,
            screen_track_senders: null,
            webcam_track_senders: null,

            viewers: {},
            lobby: 'Group',
            channelName: null,
            lobby_state: null,
            sync_interval: null,
            screenshareChannelName: null
        }
    }

    sync = async ()=>{ // keep everyone in the group in sync by ensuring that we are viewing all those who are viewing us
        if (this.state.lobby_state) {
            console.log('\nsyncing')
            var response = await makePostRequest('lobby', {
                type: 'sync',
                lobby_id: this.state.lobby_state.lobby_id,
                lobby_state: this.state.lobby_state,
                user_id: this.state.user_id == 'b95f3892-8887-4dbc-9479-a1c42b9133d9' ? `user-id-${this.props.mem}` : this.state.user_id,
                // channels: {screen: this.state.channelName},
                // epoch: this.state.last_updated
            })  
            this.setState({lobby_state: response},
                ()=>{
                    // CREATE NEW VIEWERS
                    Object.keys(this.state.lobby_state.members).forEach(member_id=>{  // make sure all members of the lobby are being viewed
                        Object.values(this.state.lobby_state.members[member_id]).forEach( // for each of their channels (webcam and screen)
                            channel=>{
                                if (!Object.keys(this.state.viewers).includes(channel)) { // as long as this isnt me
                                    this.setViewer(channel) // start viewing the channel
                                }
                            }
                        )
                    })
                    // REMOVE STALE VIEWERS
                    var channels_in_synced_lobby_state = Object.values(this.state.lobby_state.members).map(channels=>Object.values(channels)).flat() // channels which should be here
                    Object.keys(this.state.viewers).forEach(channel_id=>{ // check to see if each of the current viewers are in this list
                        console.log(channel_id)
                        if (!channels_in_synced_lobby_state.includes(channel_id)) { // if the channel is not in the list of those which should be being viewed, as indicated by the sync
                            this.state.viewers[channel_id].stopViewer() // stop the channle
                            delete this.state.viewers[channel_id] // and delete it
                            console.log('deleting', channel_id)
                        }
                        // .forEach(channels=>{
                        //     console.log(channels)
                        //     Object.values(channels).map(channel)
                        // })
                    })
                }
            )
            
        }
            // Object.keys(this.state.viewers).forEach(channel=>{ // for each viewer, if we havent got any streams from them, restart the viewer
            //     console.log('\tviewing channel:', channel)
            //     const channelStreams = this.state.remoteStreams[channel]
            //     console.log('\tstreams for this channel:', channelStreams)
            //     if (!channelStreams || channelStreams.length == 0) { // NEEDS IMPROVING TO WORK FOR CASE WHERE THE PROBLEM MAY BE THAT YOU'RE VIEWING 1 SCREEN BUT THEY'RE SEEING 2 // or where they have their screenshare and webcam off i.e. no streams
            //         console.log('\t\tcreating new viewer for channel:', channel)    
            //         this.setViewer(channel) // start viewing their channel
            //     }
            // })
            console.log('\n')
        // }
    }

    setStreams = (newStreams, channel) => {
        // console.log('setting streams ')
        this.onJoin.play()
        this.setState({remoteStreams: {...this.state.remoteStreams, [channel]: newStreams}})
    }
    // setStreams = (remoteStreams) => {
    //     this.setState({remoteStreams})
    // }

    startStreaming = async () => {
        console.log('starting streaming')
        var channelName = await makeGetRequest('channel')
        channelName = await channelName.json()
        // console.log('channelname:', channelName)
        // this.channelName = `streamline-${this.props.mem}`
        // console.log('channelname:', this.channelName)
        this.setState({
            channelName,
            master: new Master(
                this.state.localStream,
                this.state.localScreen,
                channelName,
                this.handleMessage,
                // (e)=>{console.log('[MASTER] remote data message:', e)},
                (e)=>{console.log('[MASTER] stats report:', e)},
            )},
            this.joinLobby
        )
        setInterval(()=>{this.state.master.sendMasterMessage(JSON.stringify({type: 'group', content: Object.keys(this.state.viewers)}))}, 10000)
    } 

    joinLobby = async () => {
        console.log('joining group')
        // make peerconnections with each member of the group
        var lobby = await makeGetRequest('group')
        lobby = await lobby.json()
        lobby = lobby.body
        this.setState({lobby_state: lobby})
        // console.log(lobby)
        // console.log('lobby id:', lobby.lobby_id)
        const members = lobby.members
        for (var channels of Object.values(members).flat()) {
            // console.log(channels)
            Object.values(channels).forEach(channel=>{
                this.joinChannel(channel)
            })
        }
        // tell cloud that you've joined the lobby
        // this.setState({
        //     lobby_state: {
        //         ...this.state.lobby_state,
        //         epoch: epochNow()
        //     }
        // }, ()=>{
            var response = await makePostRequest('lobby', {
                type: 'join',
                lobby_id: lobby.lobby_id,
                user_id: this.state.user_id == 'b95f3892-8887-4dbc-9479-a1c42b9133d9' ? `user-id-${this.props.mem}` : this.state.user_id,
                channels: {webcam: this.state.channelName}
            })
            // console.log(response)
            // console.log('mems', response.members)
            // console.log(response.members['user-id-1'])
            this.setState({lobby_state: response},
                ()=>{this.setState({sync_interval: setInterval(this.sync, 3000)})}
            )
            // this.setState
        //     }
        // )
    }

    joinChannel = async (channel) => {
        if (channel == this.state.channelName) {return} // don't join yourself
        // console.log(`joining ${channel}`)
        if (!Object.keys(this.state.viewers).includes(channel)) {
            this.setViewer(channel)
        }
    }

    setViewer = (channel) => {
        console.log(channel)
        console.log(this.channelName)
        if (channel == this.state.channelName) {return}
        if (this.state.viewers[channel] != null) {  // if a viewer already exists for this channel
            this.state.viewers[channel].stopViewer() // stop the viewer before overwriting it
        }
        // console.log('creating viewer for:', channel)
        this.setState(
            {
                viewers: {
                ...this.state.viewers,
                [channel]: new Viewer(  // create new viewer
                        channel,
                        (newStreams) => {this.setStreams(newStreams, channel)},
                        (e)=>{console.log(`remote data message from viewer ${channel}:`, e)},
                        (e)=>{console.log(`stats report from viewer ${channel}:`, e)},
                    )
                }
            },
        ()=>{
            // console.log('viewers:', this.state.viewers)
        }
        )
    }

    handleMessage = (message) => {
        message = JSON.parse(message.data)
        // console.log('message data:', message)
        if (message.type == 'joined') {
            this.joinChannel(message.content.channel)
        }
    }

    componentDidMount = async () => {
        var creds = await Auth.currentAuthenticatedUser()
        var user_id = creds.username
        console.log(creds)

        let localStream //= await navigator.mediaDevices.getUserMedia(webcamOptions)
        // if (navigator.getUserMedia) {
        //     localStream = await navigator.getUserMedia(webcamOptions, ()=>{}, ()=>{});
        // } else 
        if (navigator.mediaDevices.getUserMedia) {
            localStream = await navigator.mediaDevices.getUserMedia(webcamOptions);
        } 
        // else {
        //     localStream = await navigator.mediaDevices.getUserMedia(webcamOptions);
        // }
        else {
            var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            if (!getUserMedia) {alert('no way to share webcam found')}
        }

        let localScreen //= await navigator.mediaDevices.getDisplayMedia(screenShareOptions)
            // if (navigator.getDisplayMedia) {
            //     localScreen = navigator.getDisplayMedia(screenShareOptions);
            // } else 
        // if (navigator.mediaDevices.getDisplayMedia) {
        //     localScreen = await navigator.mediaDevices.getDisplayMedia(screenShareOptions);
        // } else {
        //     localScreen = await navigator.mediaDevices.getUserMedia({video: {mediaSource: 'screen'}});
        // }
        // console.log(localStream)
        // console.log(localScreen)
        this.setState({
            localStream,
            localScreen,
            user_id
        }, ()=> {
            this.startStreaming()
            // this.joinLobby()
        })
    }

    componentWillUnmount = async () => {
        Object.values(this.state.viewers).flat().forEach(viewer=>viewer.stopViewer())
        clearInterval(this.state.sync_interval)
    }

    sendViewerMessage = (message) => {
    }

    toggleWebcam = async () => {
        console.log('toggling webcam')
        if (this.state.localStream) {
            console.log('stopping webcam share')
            this.setState({localStream: null}, ()=>{this.state.master.toggleWebcam()})
        }
        else {
            console.log('starting webcam share')
            const localStream = await navigator.mediaDevices.getUserMedia(webcamOptions)
            this.setState({localStream}, ()=>{this.state.master.toggleWebcam(this.state.localStream)})
        }
    }

    toggleScreenshare = async () => {
        console.log('toggling screenshare')
        if (this.state.localScreen) {
            console.log('stopping screenshare')
            this.state.screenShareMaster.stopMaster()
            this.setState({localScreen: null})
        }
        else {
            console.log('starting screenshare')
            const localScreen = await navigator.mediaDevices.getDisplayMedia(screenShareOptions)
            var screenshareChannelName = await makeGetRequest('channel')
            screenshareChannelName = await screenshareChannelName.json()
            
            this.setState({
                localScreen,
                screenshareChannelName,
                screenShareMaster: new Master(
                    localScreen,
                    null,
                    screenshareChannelName,
                    this.handleMessage,
                    // (e)=>{console.log('[MASTER] remote data message:', e)},
                    (e)=>{console.log('[MASTER] stats report:', e)},
                )
            })

            var response = await makePostRequest('lobby', {
                type: 'join',
                lobby_id: this.state.lobby_state.lobby_id,
                user_id: this.state.user_id,
                channels: {screen: screenshareChannelName}
            })
            // console.log(response)
            // console.log('mems', response.members)
            // console.log(response.members['user-id-1'])
            this.setState({lobby_state: response},
                // ()=>{this.setState({sync_interval: setInterval(this.sync, 3000)})}
            )
        }
        // this.state.master.toggleScreenshare()
    }

    // toggleScreenshare = async () => {
    //     console.log('toggling screenshare')
        
    //     console.log('sharing screen?', this.state.localScreen)
    //     if (this.state.sharing_screen) {
    //         console.log(this.state.screen_track_senders)
    //         await this.state.screen_track_senders.forEach((sender)=>{this.state.peerConnection.removeTrack(sender)}) // specify the sender of the track (for the screenshare) and remove it from the RTCPeerConnection
    //         this.setState({
    //             sharing_screen: !this.state.sharing_screen,
    //             localScreen: null,
    //             screen_track_senders: null
    //         },
    //         ()=>{console.log(this.state)}
    //         )
    //     }
    //     else {
    //         this.setState({
    //             localScreen: await navigator.mediaDevices.getDisplayMedia(screenShareOptions)
    //         },    
    //             () => {
    //                 var senders = this.state.localScreen.getTracks().map(track => {return this.state.peerConnection.addTrack(track, this.state.localScreen)})
    //                 this.setState({
    //                     screen_track_senders: senders,
    //                     sharing_screen: true
    //                 }, ()=>{console.log(this.state)})
    //             }
    //         )
    //         // const localScreen = await navigator.mediaDevices.getDisplayMedia(screenShareOptions)
    //         // var screen_track_senders = []
    //         // localScreen.getTracks().forEach((track) =>{
    //         //     console.log('track:', track)
    //         //     const sender = this.state.peerConnection.addTrack(track, localScreen)
    //         //     screen_track_senders.push(sender)
    //         // })
    //         // console.log('screen track senders:', screen_track_senders)
    //         // this.setState({
    //         //     sharing_screen: !this.state.sharing_screen,
    //         //     localScreen,
    //         //     screen_track_senders,
    //         // })
    //     }
        

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
    // }

    render() {
        // console.log('remote streams:', this.state.remoteStreams)
        // console.log('current viewers:', this.state.viewers)

        // const vid_height = 200
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
                        {/* <Button text='Toggle screenshare' onClick={this.toggleScreenshare}/> */}
                    </div>
                    <br/>
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
                    <br/>
                    {/* <LobbySwitch lobby={this.state.lobby}/> */}
                    {/* Lobby
                    {['Class', 'Group', 'Personal'].map(lobby=>{
                        return <div className="lobby-btn"
                            css={css`${this.state.lobby == lobby ? 'background-color: black; color: var(--color2);': null}`}
                            onClick={()=>{this.setState({lobby})}}
                        >
                            {lobby}
                        </div>
                    })} */}
                    {/* <div onClick={()=>{window.open('https://remotedesktop.google.com/support')}}>Request remote control</div> */}
                </div>
                <div className="others">
                    <div>My channel: {this.state.channelName}</div>
                    <div>
                        {JSON.stringify(this.state.lobby_state, null, 4)}
                    </div>
                    {
                        Object.values(this.state.viewers).length > 0 ?
                            <>
                            <div>Viewing channels:</div>
                            {Object.keys(this.state.viewers).map(k=>{return <div>{k}</div>})}
                            </>
                            :
                            null
                    }
                    {Object.keys(this.state.remoteStreams).length == 0 ? 
                        <div>There's nobody in this lobby yet</div> : 
                        null
                        // <div>You're viewing</div>
                    }
                    {/* {Object.keys(this.state.remoteStreams).map(channelName=>{ */}

                    {
                    this.state.lobby_state ?
                    Object.keys(this.state.lobby_state.members)
                    .filter(member_id=>{return member_id != this.state.user_id}) // dont show yourself
                    .map(member_id=>{
                        if (
                            Object.values(this.state.lobby_state.members[member_id])
                            .filter(channel=>{return this.state.remoteStreams[channel]})
                            .length == 0
                        ) 
                        {return null}
                        return (
                            <div className="other">
                                <div className="title">
                                    {member_id}
                                </div>
                                <div className="streams">
                                    {/* {this.state.remoteStreams[channelName].length == 0 ? // if we've got some video streams
                                    null: */}
                                    {
                                    Object.values(this.state.lobby_state.members[member_id]).map(member_channel=>{
                                        return(
                                            this.state.remoteStreams[member_channel] ?
                                            <div className="stream">
                                                <VideoOutput video={this.state.remoteStreams[member_channel][0]} />
                                                {/* {this.state.remoteStreams[channelName].map(stream => {
                                                    console.log(stream)
                                                    return <VideoOutput video={stream}/>
                                                })} */}
                                            </div>
                                            :
                                            null
                                        )})
                                    }
                                </div>
                            </div>
                        )
                    })
                    :
                    null
                }
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

const mapStateToProps = (state) => {
    return {
        user_id: state.user.user_id
    }
}

export default connect(mapStateToProps)(Student)