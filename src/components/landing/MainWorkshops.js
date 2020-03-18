import React from "react"
import { css } from "@emotion/core"
import { Button } from "mvp-webapp"
/** @jsx jsx */ import { jsx } from '@emotion/core'

const style = css`
    .title {
        font-size: var(--large)
    }

    .section{
        .title {
            font-size: var(--medium)
        }
        margin-top: 30px
    }
`

export default (props) => {
    console.log('y')
    window.scrollTo({top: 0, left: 0, behavior: 'auto'})
    return (
        <>
        <div css={style}>
            <div className="title">
                Events
            </div>
            <div className="section">
                <div className="title">
                    Workshops
                </div>
                <div>
                    We host free workshops to train people in both the <strong>theory and code</strong> of topics in artificial intelligence.
                    <br/>
                    <br/>
                    Our Deep Learning course is now in session!
                </div>
            </div>
            <div className="section">
                <div className="title">
                    Open hacking meet ups 
                </div>
                <div>
                    Every Wednesday and Sunday, we host relaxed sessions where anyone can come along and meet people, share project ideas, get help with code, or just hang out.
                    <br/>
                    <br/>
                    Follow our Twitter <span css={css`text-decoration: underline; cursor: pointer;`} onClick={()=>{window.open('https://twitter.com/TheAICore')}}>@TheAICore</span> for details about our upcoming open hacking sessions.
                </div>
            </div>
            <div className="section">
                <div className="title">
                    Topical Events 
                </div>
                <div>
                    Along with all the technical stuff we do, we run topical events to keep our community up to date with the latest work and issues in AI.
                    <br/>
                    <br/>
                    We've previously held events on ethics and gender diversity.
                </div>
            </div>
        </div>
        <br/>
        <Button text='Check out our upcoming events and coverage of previous ones!' to='/events'/>
        </>
)}