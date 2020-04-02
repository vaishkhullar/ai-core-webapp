import React, { Component } from "react"
import {css, jsx } from "@emotion/core"
/** @jsx jsx */
import { expand_in } from "mvp-webapp"
import { VideoOutput } from "./Classroom"

export default class Instructor extends Component {
    constructor(props) {
        super(props)
        this.state = {
            remoteStreamsByClientId: {},
            // peerConnectionByClientId: {},
            // dataChannelByClientId: {},
            localStream: null,
        }
    }

    componentDidMount = async () => {
        console.log('setting up webcam stream')
        const widescreen = false
        const sendAudio = false
        const sendVideo = true
        const resolution = widescreen ? { width: { ideal: 1280 }, height: { ideal: 720 } } : { width: { ideal: 640/2 }, height: { ideal: 480/2 } };
        const constraints = {
            video: sendVideo ? resolution : false,
            audio: sendAudio,
        };
        const localStream = await navigator.mediaDevices.getUserMedia(constraints);
        this.setState({localStream, sharing_webcam: true})
        
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
    }

    dispatch = (type, content) => {
        switch (type) {
            // case "REP":
        }
    }

    render () {
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
                    // animation-name: ${expand_in};
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