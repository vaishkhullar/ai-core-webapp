// <!-- <!DOCTYPE html>
// <html lang="en">
// <head>
//     <title>KVS WebRTC Test Page</title>
//     <meta charset="utf-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
//     <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
//     <link rel="stylesheet" href="loader.css">
//     <link rel="stylesheet" href="./app.css">
//     <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"></script>
//     <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
//     <script src="https://sdk.amazonaws.com/js/aws-sdk-2.585.0.min.js"></script>
//     <script src="https://unpkg.com/@ungap/url-search-params"></script>
//     <link rel="icon" type="image/png" href="favicon.ico">
// </head>
// <body> -->
// import "./app.css"
import React, { Component } from "react"
import { Auth } from "aws-amplify"
import { css, jsx } from "@emotion/core"
/** @jsx jsx */
import Master from "../../classroom/SignalingChannelMaster"
// import Viewer from "./viewer"

const style = css`
    padding: 20px;
    background-color: var(--color2);
`

export const getRandomClientId = () => {
    return Math.random()
        .toString(36)
        .substring(2)
        .toUpperCase();
}

const epochNow = () => {
    return Math.round(new Date().getTime() / 1000)
}



// class Classroom extends Component {
//     // constructor(props) {
//     //     super(props)
//     //     this.state = {
//     //         region: 'eu-west-2', 
//     //         channelName: 'test-channel',
//     //         clientId: 'random_id',
//     //         sendVideo: getRandomClientId(),
//     //         sendAudio: true,
//     //         openDataChannel: true,
//     //         widescreen: true,
//     //         fullscreen: true,
//     //         useTrickleICE: true,
//     //         natTraversalDisabled: true,
//     //         forceTURN: true,
//     //         accessKeyId: null,
//     //         endpoint: null,
//     //         secretAccessKey: null,
//     //         sessionToken: null,
//     //         ready: false,
//     //         localStream: null
//     //     }
//     // }

//     componentDidMount = async () => {
//         // const data = await Auth.currentCredentials()
//         // const accessKeyId = data.accessKeyId
//         // const secretAccessKey = data.secretAccessKey
//         // const sessionToken = data.sessionToken
//         // const channelARN = 'arn:aws:kinesisvideo:eu-west-2:251926666850:channel/test-channel/1584463852821'

//         // navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

//         // const localStream = await navigator.mediaDevices.getUserMedia({
//         //     // video: { width: { ideal: 1280 }, height: { ideal: 720 } },
//         //     video: { width: { ideal: 640}, height: { ideal: 360 } },
//         //     // audio: true,
//         // });
//         // this.setState({
//         //     localStream,
//         // })

//         // this.setState({accessKeyId, secretAccessKey, sessionToken, ready: true, localStream})
//     }

//     render() {
//         return (
//             <div css={style}>
//                 {/* {this.state.localStream ?<VideoOutput video={this.state.localStream} controls />:null} */}
//                 <Master 
//                     onStatsReport={(report)=>{console.log('stats report:', report)}}
//                     onRemoteDataMessage={(msg)=>{console.log('remote data message:', msg)}} />
//                 {/* <Viewer /> */}
//             </div>
//         )
//         // (
//         // <>
//         // <div class="container mt-3">
//         //     <h1>KVS WebRTC Test Page</h1>
//         //     <p>This is the KVS Signaling Channel WebRTC test page. Use this page to connect to a signaling channel as either the MASTER or as a VIEWER.</p>

//         //     <div class="row loader"></div>
//         //     <div id="main" class="d-none">
//         //         {/* <form id="form">
//         //             <h4>KVS Endpoint</h4>
//         //             <div class="form-group">
//         //                 <label>Region</label>
//         //                 <input type="text" class="form-control" id="region" value="us-west-2">
//         //             </div>
//         //             <div class="form-group">
//         //                 <label>Endpoint <small>(optional)</small></label>
//         //                 <input type="text" class="form-control" id="endpoint" placeholder="Endpoint">
//         //             </div>
//         //             <h4>AWS Credentials</h4>
//         //             <div class="form-group">
//         //                 <label>Access Key ID</label>
//         //                 <input type="text" class="form-control" id="accessKeyId" placeholder="Access key id">
//         //             </div>
//         //             <div class="form-group">
//         //                 <label>Secret Access Key</label>
//         //                 <input type="password" class="form-control" id="secretAccessKey" placeholder="Secret access key">
//         //             </div>
//         //             <div class="form-group">
//         //                 <label>Session Token <small>(optional)</small></label>
//         //                 <input type="password" class="form-control" id="sessionToken" placeholder="Session token">
//         //             </div>
//         //             <h4>Signaling Channel</h4>
//         //             <div class="form-group">
//         //                 <label>Channel Name</label>
//         //                 <input type="text" class="form-control" id="channelName" placeholder="Channel">
//         //             </div>
//         //             <div class="form-group">
//         //                 <label>Client Id <small>(optional)</small></label>
//         //                 <input type="text" class="form-control" id="clientId" placeholder="Client id">
//         //             </div>
//         //             <h4>Tracks</h4>
//         //             <p><small>Control which media types are transmitted to the remote client.</small></p>
//         //             <div class="form-group">
//         //                 <div class="form-check form-check-inline">
//         //                     <input class="form-check-input" type="checkbox" id="sendVideo" value="video" checked>
//         //                     <label class="form-check-label">Send Video</label>
//         //                 </div>
//         //                 <div class="form-check form-check-inline">
//         //                     <input class="form-check-input" type="checkbox" id="sendAudio" value="audio">
//         //                     <label class="form-check-label">Send Audio</label>
//         //                 </div>
//         //                 <div class="form-check form-check-inline">
//         //                     <input class="form-check-input" type="checkbox" id="openDataChannel" value="datachannel">
//         //                     <label class="form-check-label">Open DataChannel</label>
//         //                 </div>
//         //             </div>
//         //             <h4>Video Resolution</h4>
//         //             <p><small>Set the desired video resolution and aspect ratio.</small></p>
//         //             <div class="form-group">
//         //                 <div class="form-check form-check">
//         //                     <input class="form-check-input" type="radio" name="resolution" id="widescreen" value="option1" checked>
//         //                     <label class="form-check-label" for="widescreen">1280x720 <small>(16:9 widescreen)</small></label>
//         //                 </div>
//         //                 <div class="form-check form-check">
//         //                     <input class="form-check-input" type="radio" name="resolution" id="fullscreen" value="option2">
//         //                     <label class="form-check-label" for="fullscreen">640x480 <small>(4:3 fullscreen)</small></label>
//         //                 </div>
//         //             </div>
//         //             <h4>NAT Traversal</h4>
//         //             <p><small>Control settings for ICE candidate generation.</small></p>
//         //             <div class="form-group">
//         //                 <div class="form-check form-check">
//         //                     <input class="form-check-input" type="radio" name="natTraversal" id="natTraversalEnabled" value="option2" checked>
//         //                     <label class="form-check-label" for="natTraversalEnabled">STUN/TURN</label>
//         //                 </div>
//         //                 <div class="form-check form-check">
//         //                     <input class="form-check-input" type="radio" name="natTraversal" id="forceTURN" value="option3">
//         //                     <label class="form-check-label" for="forceTURN">TURN Only <small>(force cloud relay)</small></label>
//         //                 </div>
//         //                 <div class="form-check form-check">
//         //                     <input class="form-check-input" type="radio" name="natTraversal" id="natTraversalDisabled" value="option1">
//         //                     <label class="form-check-label" for="natTraversalDisabled">Disabled</label>
//         //                 </div>
//         //             </div>
//         //             <div class="form-group">
//         //                 <div class="form-check form-check-inline">
//         //                     <input class="form-check-input" type="checkbox" id="useTrickleICE" value="useTrickleICE" checked>
//         //                     <label class="form-check-label">Use trickle ICE <small>(not supported by Alexa devices)</small></label>
//         //                 </div>
//         //             </div>
//         //             <div>
//         //                 <button id="master-button" type="button" class="btn btn-primary">Start Master</button>
//         //                 <button id="viewer-button" type="button" class="btn btn-primary">Start Viewer</button>
//         //                 <button id="create-channel-button" type="button" class="btn btn-primary">Create Channel</button>
//         //             </div>
//         //         </form>
//         //      */}
//         //         <div id="master" class="d-none">
//         //             <h2>Master</h2>
//         //             <div class="row">
//         //                 <div class="col">
//         //                     <h5>Master Section</h5>
//         //                     <div class="video-container"><video class="local-view" autoplay playsinline controls muted /></div>
//         //                 </div>
//         //                 <div class="col">
//         //                     <h5>Viewer Return Channel</h5>
//         //                     <div class="video-container"><video class="remote-view" autoplay playsinline controls /></div>
//         //                 </div>
//         //             </div>
//         //             <div class="row datachannel">
//         //                 <div class="col">
//         //                     <div class="form-group">
//         //                     <textarea type="text" class="form-control local-message" placeholder="DataChannel Message"> </textarea>
//         //                     </div>
//         //                 </div>
//         //                 <div class="col">
//         //                     <div class="card bg-light mb-3">
//         //                         <pre class="remote-message card-body text-monospace preserve-whitespace"></pre>
//         //                     </div>
//         //                 </div>
//         //             </div>
//         //             <div>
//         //                 <span class="send-message datachannel">
//         //                 <button type="button" class="btn btn-primary">Send DataChannel Message</button>
//         //                 </span>
//         //                 <button id="stop-master-button" type="button" class="btn btn-primary">Stop Master</button>
//         //             </div>
//         //         </div>

//         //         <div id="viewer" class="d-none">
//         //             <h2>Viewer</h2>
//         //             <div class="row">
//         //                 <div class="col">
//         //                     <h5>Return Channel</h5>
//         //                     <div class="video-container"><video class="local-view" autoplay playsinline controls muted /></div>
//         //                 </div>
//         //                 <div class="col">
//         //                     <h5>From Master</h5>
//         //                     <div class="video-container"><video class="remote-view" autoplay playsinline controls /></div>
//         //                 </div>
//         //             </div>
//         //             <div class="row datachannel">
//         //                 <div class="col">
//         //                     <div class="form-group">
//         //                     <textarea type="text" class="form-control local-message" placeholder="DataChannel Message"> </textarea>
//         //                     </div>
//         //                 </div>
//         //                 <div class="col">
//         //                     <div class="card bg-light mb-3">
//         //                         <pre class="remote-message card-body text-monospace preserve-whitespace"></pre>
//         //                     </div>
//         //                 </div>
//         //             </div>
//         //             <div>
//         //                 <span class="send-message datachannel" class="d-none">
//         //                 <button type="button" class="btn btn-primary">Send DataChannel Message</button>
//         //                 </span>
//         //                 <button id="stop-viewer-button" type="button" class="btn btn-primary">Stop Viewer</button>
//         //             </div>
//         //         </div>

//         //         <h3 id="logs-header">Logs</h3>
//         //         <div class="card bg-light mb-3">
//         //             <pre id="logs" class="card-body text-monospace preserve-whitespace"></pre>
//         //         </div>

//         //     </div>
//         // </div>

//         // <div id="test"></div>
//         // </>)
//         }
// // // {/* 
// // //         <script src="../kvs-webrtc.js"></script>
// // //         <script src="./master.js"></script>
// // //         <script src="./viewer.js"></script>
// // //         <script src="./createSignalingChannel.js"></script>
// // //         <script src="./app.js"></script>

// // //         </body>
// // //         </html> */}
// // //         )
// //     }

// }

// export default Classroom