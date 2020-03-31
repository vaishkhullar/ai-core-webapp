import React, { Component } from "react"
import { css, jsx } from "@emotion/core"
/** @jsx jsx */

const style = css`

    display: flex;
    flex-direction: column;
    margin: 20px 30px;

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

export default (props) => {
    return (
        <div css={style}>
        Lobby
        {['Class', 'Group', 
        // 'Personal'
    ].map(lobby=>{
            return <div className="lobby-btn"
                css={css`${props.lobby == lobby ? 'background-color: black; color: var(--color2);': null}`}
                onClick={()=>{props.setLobby(lobby)}}
            >
                {lobby}
            </div>
        })}
        </div>
    )
}