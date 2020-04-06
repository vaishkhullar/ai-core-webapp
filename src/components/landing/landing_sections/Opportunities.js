import React, { Component } from "react"
import { css,  jsx } from "@emotion/core"
/** @jsx jsx */

const style = css`


    .roles {
        display: flex;
        flex-direction: row ;
        align-items:center; 
        flex-wrap: wrap;
        justify-content: center;
    }

    .roles > div {
        font-size: 12px;
        background-color: grey;
        background: linear-gradient(#727272, #cecece);
        color:white;
        width: 300px;
        height: 100px;
        border-radius: 15px ;
        padding: 10px;
        box-sizing: border-box;
        box-shadow:0 10px 6px -6px #777;
        margin: 10px;
        transition: transform 0.5s;
        display: flex
    }

    .roles > div > div {
        padding: 10px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .roles > div:hover {
        transform: scale(1.02)
    }

    .img-container {
        height: 100%;
        width: 100px;
        background-color: white;
        border-radius: 10px;
        overflow: hidden;
        padding: 10px;
        box-sizing: border-box;
        display: flex;
        /* flex-direction: column; */
        justify-content: center;
    }

    .img-container > img {
        max-height: 100%;
        max-width: 100%;
    }

`

const Opportunities = () => {
    return(
        <div css={style} > 
            <div class="title">
               Featured opportunities
            </div>
            <div class="roles">
                <div>    
                    <div class="img-container">
                        <img src="https://i.insider.com/539f3ffbecad044276726c01?width=1100&format=jpeg&auto=webp" alt="amazon logo" />
                    </div>
                    <div>
                        <div>
                            Software Development Internship
                        </div>
                        <div>
                            Amazon
                        </div>
                    </div>

                </div>
                <div>
                    Business Intelligence Internship, 
                    <br/> Amazon
                </div>
                <div>
                    Applied Science Internship 
                    <br/> Amazon
                </div>
                <div>
                    AI Internship
                    <br/> Adarga
                </div>
            </div>
        </div>
    )
}

export default Opportunities
