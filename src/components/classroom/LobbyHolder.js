import React, { Component } from "react"
import { css, jsx } from "@emotion/core"
import Student from "./NewStudent"
import LobbySwitch from "./LobbySwitch"
import ClassLobby from "./ClassLobby"
/** @jsx jsx */

const style = css`
    height: 80vh;
    color: black;
    font-family: var(--font1);
    background-color: var(--color2);
    position: relative;
    overflow: hidden;
    // display: flex;
    // flex-direction: column;

    .lobby {
        height: 100%;
        transition: transform 1s;
    }

    .switch {
        position: absolute;
        bottom: 0;
        right: 0;
    }
`

const lobbies = [
    <ClassLobby />,
    <Student mem={6} />,
    <ClassLobby />
]

const lobbyMap = {
    'Class': 0,
    'Group': 1,
    'Personal': 2
}

class LobbyHolder extends Component {
    constructor(props){
        super(props)
        this.state = {
            lobby: 0,
            lobbyName: 'Class'
        }
    }

    setLobby = (lobby) => {this.setState({
        lobby: lobbyMap[lobby],
        lobbyName: lobby
    })}

    render() {
        return (
            <div css={style}>
                {lobbies.map((lobby, idx)=>{
                    return <div className="lobby" id={idx} css={css`transform: translateY(${-this.state.lobby * 100}%)`}>
                        {lobby}
                    </div>
                }
                )}
                <div className="switch">
                    <LobbySwitch lobby={this.state.lobbyName} setLobby={this.setLobby}/>
                </div>
            </div>
        )
    }
}

export default LobbyHolder