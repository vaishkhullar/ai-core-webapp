import React from "react"
import { css } from "@emotion/core"
import { Button } from "mvp-webapp"
/** @jsx jsx */ import { jsx } from '@emotion/core'

const style = css`

    h1 {
        font-size: 40px;
        color: #ff822e;
        // font-weight: 1000;
        font-family: var(--font1);

        span {
            font-weight: 1000;
        }
    }

    .title {
        font-size: var(--large)
    }

    .row {
        
    }

    .col {
        display: flex;
        flex-direction: column;

        .title {

        }
    }

    .section{
        .title {
            font-size: var(--medium)
        }
        margin-top: 30px
    }
`
export default () =>{
    return (
        <div css={style}>
            <h1>
                Why the <span>AI Core</span>?
                
            </h1>
            <div className="row">
                <div className="col">
                    <div className="title">
                        
                    </div>
                </div>
            </div>

        </div>
    )
}