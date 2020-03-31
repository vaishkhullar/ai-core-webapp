import React, { Component } from "react"
import { css, jsx } from "@emotion/core"
import Student from "./Student"
import LobbySwitch from "./LobbySwitch"
/** @jsx jsx */
import Forum from "./QuestionsAndComments"

const style = css`
    display: flex;
    flex-direction: column;
    align-items: center;

    .flex {
        display: flex;
    }

    .forum {
        width: 100%;
        height: 243px;
    }

    .stream {
        height: 50vh;
        max-height: 80%;
        width: 800px;
        max-width: 99%;
        background-color: black;
    }
`

class ClassLobby extends Component {
    render() {
        return (<div css={style}>
            Class lobby
            {/* <video/> */}
            {/* <iframe 
                src="https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2FTHEAICORE%2Fvideos%2F521052065500584%2F&width=0" 
                // width="0" 
                // height="0" 
                // style="border:none;overflow:hidden" 
                // scrolling="no" 
                // frameborder="0" 
                allowTransparency={true}
                allowFullScreen={true} /> */}
            {/* <div className="flex"> */}
                <iframe className="stream"
                    src="https://player.twitch.tv/?channel=theaicore" 
                    frameborder="0"
                    allowfullscreen="true" 
                    scrolling="no" 
                    // height="378" 
                    // width="620"
                    volume='0'
                />
                <div className="forum">
                    <Forum id='first-online-class' />

                </div>
            {/* </div> */}
            </div>
        )
    }
}

export default ClassLobby