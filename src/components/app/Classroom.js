import React, { Component } from "react"
import { SignalingClient, Role } from 'amazon-kinesis-video-streams-webrtc';
import Questions from "./QuestionsAndComments"
import { css, jsx} from "@emotion/core"
/** @jsx jsx */
import { Button, panel } from "mvp-webapp"
import { makeGetRequest } from "../../api_calls";
import { Auth } from "aws-amplify"
import AWS from "aws-sdk"

const style = css`
    font-family: var(--font1);
    
    .body {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        .questions {
            flex: 1;
            width: 100vw;
            max-width: 900px;
        }
        > div {
            margin: 10px;
        }
        .panel {
            flex: 1;
        }
        .body-panel {
            width: 100vw;
            flex: 1;
            min-width: 300px;
        }
        .video {
            min-width: 300px;
            max-width: 1100px;
            iframe {
                max-height: 500px;
                width: 100%;
                height: 80%;
                height: 450px;
                margin: 0;
            }
            .panel {

                padding: 0;
            }
        }
        .btns {
            flex-direction: row;
            flex-wrap: wrap;
            padding: 0;
            // max-width: 200px;
        }
    }

    .title {
        font-size: 40px;
        font-weight: 1000;  
    }

    .sponsor {
        img {
            height: 60px;
        }
    }
    
    .btns {
        display: flex;
        > * {
            margin: 10px;
        }
    }
`

class Classroom extends Component {
    constructor(props) {
        super(props)
    }

    componentDidMount = async () => {   
        // const data = await Auth.currentSession()
        // console.log('CREDENTIAL DATA;')
        // console.log(data)
        // const keys = new AWS.CognitoIdentityCredentials({
        //     IdentityPoolId: 'eu-west-2:a9b6789c-da76-4a3e-ae38-93373981ff11',
        //     Logins: { // optional tokens, used for authenticated login
        //         accessToken: data.accessToken
        //     }
        // });
        // console.log('KEYS:', keys)
         const data = await Auth.currentCredentials()
        console.log('CREDENTIAL DATA;')
        console.log(data)

        const region = 'eu-west-2'
        const accessKeyId = data.accessKeyId
        const secretAccessKey = data.secretAccessKey
        const channelARN = 'arn:aws:kinesisvideo:eu-west-2:251926666850:channel/test-channel/1584463852821'

        const kinesisVideoClient = new AWS.KinesisVideo({
            region,
            accessKeyId,
            secretAccessKey,
        });
        console.log(kinesisVideoClient)
        // kinesisVideoClient.createStram()
        const getSignalingChannelEndpointResponse = await kinesisVideoClient.getSignalingChannelEndpoint({
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

        const kinesisVideoSignalingChannelsClient = new AWS.KinesisVideoSignalingChannels({
            region,
            accessKeyId,
            secretAccessKey,
            endpoint: endpointsByProtocol.HTTPS,
        });

        const getIceServerConfigResponse = await kinesisVideoSignalingChannelsClient
            .getIceServerConfig({
                ChannelARN: channelARN,
            })
            .promise();
        const iceServers = [
            { urls: `stun:stun.kinesisvideo.${region}.amazonaws.com:443` }
        ];
        getIceServerConfigResponse.IceServerList.forEach(iceServer =>
            iceServers.push({
                urls: iceServer.Uris,
                username: iceServer.Username,
                credential: iceServer.Password,
            }),
        );
        
        const peerConnection = new RTCPeerConnection({ iceServers });
 


        // // makeGetRequest('app/user/stream', (r)=>{console.log('stream response:', r)})
        // this.sc = SignalingClient({
        //     role: 'MASTER',
        //     channelARN: 'arn:aws:kinesisvideo:eu-west-2:251926666850:channel/test-channel/1584463852821',
            
        // })
    }

    render() {
        return (


            // <video src={} />

            <div css={style}>
                {/* <video src={} /> */}
                <div className="title">
                    {this.props.title}
                </div>
                {
                    this.props.sponsor ?
                    <div className="sponsor">
                        <div>
                            Powered by
                        </div>
                        <img src={this.props.sponsor.logo} />
                    </div>
                    :
                    null
                }
                <div className="body">
                    <div css={panel} className="body-panel video">
                        {/* <video controls src={videos[`${this.props.id}.mp4`]}/>  */}
                        {
                            this.props.video ?
                            <iframe src={this.props.video} frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                            :
                            null
                        }
                        <div css={css`${panel}; max-width: 100%;`} className="btns">
                            {
                                this.props.repo ? <Button text='Link to repo' onClick={()=>{window.open(this.props.repo)}}/> : null
                            }
                            {
                                this.props.notebook ? <Button text='Link to code' onClick={()=>{window.open(this.props.notebook)}}/> : null
                            }
                            {
                                this.props.notebook ? <Button text='Link to solutions' onClick={()=>{window.open(this.props.solutions)}}/> : null
                            }
                            {
                                this.props.notebook ? <Button text='Feedback' onClick={()=>{window.open(this.props.feedback)}}/> : null
                            }
                            
                        </div>
                    </div>
                    <div className="body-panel" css={panel}>
                        <Questions id={this.props.id}/>
                    </div>
                </div>
            </div>
        )
    }
}

export default Classroom