import React, { Component } from "react"
import { css, jsx } from "@emotion/core"
import Student from "../app/classroom/Student"
import LobbySwitch from "./LobbySwitch"
/** @jsx jsx */
import { makeGetRequest } from "../app/classroom/Student"
import { Auth } from "aws-amplify"
import Master from "../app/classroom/SignalingChannelMaster"
import Viewer from "../app/classroom/SignalingChannelViewer"
import { VideoOutput } from "../app/classroom/Classroom"
import { Button } from "mvp-webapp"
import { makePostRequest } from "../app/classroom/Student"
import { expand_in } from "mvp-webapp"
import QuestionsAndComments from "./QuestionsAndComments"

const webcamOptions = {
        video: {
            width: { ideal : 320 },
            height: { ideal : 240 },
            mediaSource: "screen"
        },
        audio: true,
}


class Teacher extends Component {
    constructor(props) {
        super(props)
        this.state = {
            channelName: null,
            screenshareChannelName: null,
            user_id: null,
            lobbies: [],
            localStream: null,
            currentLobby: null,
            remoteStreams: {},
            viewers: {}
        }
    }

    sync = async ()=>{ // keep everyone in the group in sync by ensuring that we are viewing all those who are viewing us
        if (this.state.currentLobby) {
            console.log('\nsyncing')
            var response = await makePostRequest('lobby', {
                type: 'sync',
                lobby_id: this.state.currentLobby.lobby_id,
                lobby_state: this.state.lobby_state,
                user_id: `user-id-${this.props.mem}`,
                // channels: {screen: this.state.channelName},
                // epoch: this.state.last_updated
            })  
            console.log('SYNC RESPONSE:', response)
            this.setState({currentLobby: response},
                ()=>{
                    // CREATE NEW VIEWERS
                    Object.keys(this.state.currentLobby.members).forEach(member_id=>{  // make sure all members of the lobby are being viewed
                        Object.values(this.state.currentLobby.members[member_id]).forEach( // for each of their channels (webcam and screen)
                            channel=>{
                                if (!Object.keys(this.state.viewers).includes(channel)) { // as long as this isnt me
                                    this.setViewer(channel) // start viewing the channel
                                }
                            }
                        )
                    })
                    // REMOVE STALE VIEWERS
                    var channels_in_synced_lobby_state = Object.values(this.state.currentLobby.members).map(channels=>Object.values(channels)).flat() // channels which should be here
                    Object.keys(this.state.viewers).forEach(channel_id=>{ // check to see if each of the current viewers are in this list
                        console.log(channel_id)
                        if (!channels_in_synced_lobby_state.includes(channel_id)) { // if the channel is not in the list of those which should be being viewed, as indicated by the sync
                            this.state.viewers[channel_id].stopViewer() // stop the channle
                            delete this.state.viewers[channel_id] // and delete it
                            console.log('deleting', channel_id)
                            // alert()
                        }
                        // .forEach(channels=>{
                        //     console.log(channels)
                        //     Object.values(channels).map(channel)
                        // })
                    })
                }
            )
            
        }
    }

    componentDidMount = async () => {

        var creds = await Auth.currentAuthenticatedUser()
        var user_id = creds.username

        var response = await makeGetRequest('channel')
        var channelName = await response.json()

        this.setState({
            user_id,
            channelName
        }, ()=>{
            this.websocket = new WebSocket('wss://58f6e9lwd7.execute-api.eu-west-2.amazonaws.com/prod')
            this.websocket.onmessage = this.handleMessage

            this.interval = setInterval(()=>{
                if (this.websocket.readyState == 1) {
                    clearInterval(this.interval)
                    this.interval = null
                    this.startStreaming()
                    this.joinTeacherLobby()
                    this.getAllLobbies()
                }
            }, 1000)
        })



        // var response = await makeGetRequest('all-lobbies')
    }

    startStreaming = async () => {
        let localStream
        if (navigator.mediaDevices.getUserMedia) {
            localStream = await navigator.mediaDevices.getUserMedia(webcamOptions);
        } 
        // this.setState({localStream})

        // var channelName = this.getChannel()

        // console.log('channelname:', channelName)
        // this.channelName = `streamline-${this.props.mem}`
        // console.log('channelname:', this.channelName)
        this.setState({
            localStream,
            master: new Master(
                localStream,
                null,
                this.state.channelName,
                (message)=>{console.log('REMOTE MESSAGE FROM MASTER:', message)},
                // (e)=>{console.log('[MASTER] remote data message:', e)},
                (e)=>{console.log('[MASTER] stats report:', e)},
            )},
            // this.requestJoinLobby
        )
        setInterval(()=>{this.state.master.sendMasterMessage(JSON.stringify({type: 'group', content: Object.keys(this.state.viewers)}))}, 10000)
    } 

    getAllLobbies = () => {
        console.log('getting lobbies')
        this.websocket.send(JSON.stringify({
            action: 'list-lobbies'
        }))
    }

    joinTeacherLobby = async ()=>{
        this.websocket.send(JSON.stringify({
            action: 'join-as-teacher',
            user_id: this.state.user_id,
            channels: {
                webcam: this.state.channelName
            }
        }))
    }

    returnToTeachersLobby = () => {
        this.leaveLobby()
        this.joinTeacherLobby()
    }

    // getChannel = async () => {
    //     console.log('starting streaming')
    //     var channelName = await makeGetRequest('channel')
    //     channelName = await channelName.json()
    //     return channelName
    // }


    requestJoinLobby = (lobby_id) => {
        this.websocket.send(JSON.stringify({
            action: 'join-lobby',
            lobby_id,
            user_id: this.state.user_id,
            channels: {
                webcam: this.state.channelName,
                // screen: this.state.screenshareChannelName
            }
        }))
    }

    joinLobby = (lobby) => {
        // spin up all viewers for lobby
        console.log(lobby)
        // alert('joining lobby')
        for (var channels of Object.values(lobby.members).flat()) {
            console.log(channels)
            Object.values(channels).forEach(channel=>{
                this.joinChannel(channel)
            })
        }
        this.setState({
            currentLobby: lobby
        },
            ()=>{
                if (this.state.sync_interval) {
                    clearInterval(this.state.sync_interval)
                }
                this.setState({sync_interval: setInterval(this.sync, 3000)})
            }
        )
    }

    joinChannel = async (channel) => {
        if (channel == this.state.channelName) {return} // don't join yourself
        if (!Object.keys(this.state.viewers).includes(channel)) {
            this.setViewer(channel)
        }
    }

    setViewer = (channel) => {
        console.log(channel)
        console.log(this.state.channelName)
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

    setStreams = (newStreams, channel) => {
        // console.log('setting streams ')
        // this.onJoin.play()
        this.setState({remoteStreams: {...this.state.remoteStreams, [channel]: newStreams}})
    }

    leaveLobby = () => {
        // alert('leaving lobby')
        this.websocket.send(JSON.stringify({
            action: 'leave-lobby',
            user_id: this.state.user_id,
            lobby_id: this.state.currentLobby.lobby_id
        }))
        // this.state.master.stopMaster() // stop streaming from here
        Object.values(this.state.viewers).forEach(viewer=>viewer.stopViewer()) // stop all viewers
    }

    handleMessage = (message) =>{
        var body = JSON.parse(message.data)
        console.log(body)
        switch (body.type) {
            case "list-lobbies":
                this.setState({lobbies: body.content}, ()=>{console.log(this.state.lobbies)})
                return
            case "teacher-lobby":
                this.setState({
                    teacher_lobby: body.content,
                    currentLobby: body.content
                }, ()=>{
                    console.log(this.state.teacher_lobby)
                    this.joinLobby(body.content)
                })
                return
            case "join-lobby":
                let lobby = body.content
                // this.state.master.stopMaster()
                this.leaveLobby()
                this.joinLobby(lobby)
                return

            case "member-left-lobby":
                return
            case "member-joined-lobby":
                return
            default:
                console.error('message type not recognised')
        }
    }

    componentWillUnmount = () => {
        this.leaveLobby()
    }

    render () {

const style = css`
    height: 80vh;
    color: black;
    font-family: var(--font1);
    background-color: var(--color2);
    position: relative;

    .title {
        font-size: 30px;
        font-weight: 1000;
        padding: 20px;
    }

    .lobby {
        font-size: 12px;
        cursor: pointer;
        border: 3px solid black;
        margin: 20px;
    }
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

    .top {
        display: flex;
        iframe {
            width: 50%;
        }
    }
`

        console.log('viewers:', this.state.viewers)
        console.log('remote streams;', this.state.remoteStreams)
        if (!this.state.currentLobby || this.state.currentLobby.lobby_id == 'lobby-1') {
            return (<div css={style}>
                <div className="title" >Teacher's lounge</div>
                <div className="top">
                    <iframe className="instructor-stream"
                        src="https://player.twitch.tv/?channel=theaicore" 
                        frameborder="0"
                        allowfullscreen="true" 
                        scrolling="no" 
                        // height="378" 
                        // width="620"
                        volume='0'
                    />
                    <QuestionsAndComments id='first-online-class' />
                </div>
                <div className="lobbies">
                    {this.state.lobbies.map((lobby, idx)=>{
                        return (
                        // <div className="lobby" onClick={()=>{this.requestJoinLobby(lobby.lobby_id)}}>
                            // {JSON.stringify(lobby)}
                        // </div>
                            <Button text={`Join lobby ${idx}`} onClick={()=>{this.requestJoinLobby(lobby.lobby_id)}}/>
                        )
                    })}
                </div>
                 {/* <div>My channel: {this.state.channelName}</div>
                 <div>
                     {JSON.stringify(this.state.currentLobby, null, 4)}
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
                }  */}
                <div className="others">
                {
                this.state.currentLobby ?
                Object.keys(this.state.currentLobby.members)
                // .filter(member_id=>{return member_id != `${this.state.user_id}`}) // dont show yourself
                .map(member_id=>{
                    if (
                        Object.values(this.state.currentLobby.members[member_id])
                        .filter(channel=>{return this.state.remoteStreams[channel]})
                        .length == 0
                    ) 
                    {return null}
                    console.log('creating panel for :', member_id)
                    return (
                        <>
                        <div className="other">
                            {/* <div className="title">
                                {member_id}
                            </div> */}
                            <div className="streams">
                                {/* {this.state.remoteStreams[channelName].length == 0 ? // if we've got some video streams
                                null: */}
                                {
                                Object.values(this.state.currentLobby.members[member_id]).map(member_channel=>{
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
                        </>
                    )
                })
                :
                null
            }
            </div>
                </div>
            )}
        else {
            //  <div className="others">
            //     <div>My channel: {this.state.channelName}</div>
            //     <div>
            //         {JSON.stringify(this.state.currentLobby, null, 4)}
            //     </div>
            //     {
            //         Object.values(this.state.viewers).length > 0 ?
            //             <>
            //             <div>Viewing channels:</div>
            //             {Object.keys(this.state.viewers).map(k=>{return <div>{k}</div>})}
            //             </>
            //             :
            //             null
            //     }
            //     {Object.keys(this.state.remoteStreams).length == 0 ? 
            //         <div>There's nobody in this lobby yet</div> : 
            //         null
            //         // <div>You're viewing</div>
            //     } 
            return (
            <div css={style}>
                <Button text='return to teachers lobby' onClick={this.returnToTeachersLobby}/>
                <div className="others">
                {
                this.state.currentLobby ?
                Object.keys(this.state.currentLobby.members)
                // .filter(member_id=>{return member_id != `${this.state.user_id}`}) // dont show yourself
                .map(member_id=>{
                    if (
                        Object.values(this.state.currentLobby.members[member_id])
                        .filter(channel=>{return this.state.remoteStreams[channel]})
                        .length == 0
                    ) 
                    {return null}
                    console.log('creating panel for :', member_id)
                    return (
                        <>
                        <div className="other">
                            <div className="title">
                                {member_id}
                            </div>
                            <div className="streams">
                                {/* {this.state.remoteStreams[channelName].length == 0 ? // if we've got some video streams
                                null: */}
                                {
                                Object.values(this.state.currentLobby.members[member_id]).map(member_channel=>{
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
                        </>
                    )
                })
                :
                null
            }
            </div>
            </div>

        // </div>
        )}
    }
}

export default Teacher