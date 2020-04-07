import React, { Component } from "react"
import { css, jsx } from "@emotion/core"
/** @jsx jsx */
import { Button } from "mvp-webapp"
import { VideoOutput } from "../VideoOutput"
import Viewer from "./SignalingChannelViewer"
import Master from "./SignalingChannelMaster"

const style = css`
    video: height: 200px;
    background-color: var(--color2);
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 20px;
    padding: 10px;
    color: black;

    .localstreams {
        video {
            height: 100px;
        }
    }

    .remotestreams {
        video {
            height: 100px;
        }

        .remotestream {
            // background-color: black;
            display: flex;
            flex-direction: column;
            border: 3px solid black;
        }
    }

    video {
        background-color: blue;

    }
`

const webcamOptions = {
        video: {
            width: { ideal : 320*2 },
            height: { ideal : 240*2 },
            mediaSource: "screen"
        },
        audio: true,
        audio: false,
}
const screenShareOptions = {
    video: {
        width: { ideal : 320*2*2 },
        height: { ideal : 240*2*2 },
        cursor: "always"
    },
    // audio: true
}

class User extends Component {
    constructor(props) {
        super(props)
        this.channel = `streamline-${this.props.idx}`
        this.id = `id-${this.props.idx}`
        this.state = {
            remoteStreams: {},
            viewers: {},
            webcam: null
        }
    }

    componentDidMount = async () => {
        var webcam = await navigator.mediaDevices.getUserMedia(webcamOptions)
        this.master = new Master(
            webcam,
            null,
            this.channel,
            (msg)=>{console.log('remote data msg:', msg)},
            report => {console.log('stats report:', report)}
        )
    }

    setStreams = (streams , channel) => {
        console.log('got updated streams for channel:', channel, streams)
        this.setState({remoteStreams: {...this.state.remoteStreams, [channel]: streams}})
    }

    toggleWebcam = async () => {
        if (this.state.webcam){
            this.master.toggleWebcam()
            this.setState({webcam: null})
            this.state.webcam.getTracks().forEach(track=>{
                track.stop()
            })
        }
        else {
            var webcam = await navigator.mediaDevices.getUserMedia(webcamOptions)
            this.master.toggleWebcam(webcam)
            this.setState({webcam})
        }
    }

    connectTo = (channel) => {
        console.log('connecting to:', channel)
        this.setState({viewers: {
            ...this.state.viewers,
            [channel]: new Viewer(
                channel,
                (streams)=>{this.setStreams(streams, channel)},
                (msg)=>{console.log('remote data msg:', msg)},
                report => {console.log('stats report:', report)}
            )
        }})
        console.log(this.id, this.viewers)
    }

    render() {
        return (
            <div css={style}>
                <div className="title">
                    {this.props.idx}
                    {this.state.channel}
                </div>
                <div className="localstreams">
                    {this.state.webcam?<VideoOutput video={this.state.webcam} muted={true}/>:null}
                    {this.state.screenshare?<VideoOutput video={this.state.screenshare} muted={true}/>:null}
                </div>
                {this.state.remoteStreams.length}
                {JSON.stringify(this.state.remoteStreams)}
                <div className="remotestreams">
                    {Object.keys(this.state.remoteStreams).map(channel=>{
                        return <div className="remotestream">
                            {channel}
                            {this.state.remoteStreams[channel].map(stream=>{return <VideoOutput video={stream}/>})}
                        </div>
                    })}
                </div>
                <Button text={this.state.webcam ? 'Stop webcam': 'Start webcam'} onClick={this.toggleWebcam} />
                {
                    this.props.connect_to.map(idx=>{
                        return <Button 
                            text={this.state.viewers[`streamline-${idx}`] ?`Disconnect from ${idx}`: `Connect to ${idx}`} 
                            onClick={()=>{this.connectTo(`streamline-${idx}`)}}
                        />
                    })
                }
            </div>
        )
    }
}

const container_style = css`
    display: flex;
    flex-direction: row;
`

const user_idx = [
    1, 
    2,
    // 3, 
    // 4
]

export default class UI extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div css={container_style}>
                {user_idx.map(idx=>{return <User idx={idx} connect_to={user_idx.filter(i=>{return i!=idx})}/>})}                
            </div>
        )
    }
}