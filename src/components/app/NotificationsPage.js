import React from "react"
import { connect } from "react-redux"
import { css, jsx } from "@emotion/core"
/** @jsx jsx */ 
import { Notification } from "./Notifications"
import { expand_in } from "mvp-webapp"

const style = css`
    animation-name: ${expand_in}
    animation-duration: 1s;
    display: flex;
    flex-direction: column;
    font-family: var(--font1);
    // font-size: 30px;
    font-weight: 900;
    .title {
        font-size: 30px;
    }
`

const _NPage = (props) => {
    return <>
        <div css={style}>
            <div className="title">
                Notifications
            </div>
            {props.notifications.map(n=>{return <Notification {...n} />} )}
            <Notification type="welcome" epoch={1583427505211} links_to="/app/profile"/>
            {/* {props.notifications.map(n=>{return <Notification {...n} />} )} */}
        </div>
    </>
}

const mapStateToProps = (state) => {
    return {
        notifications: state.user.notifications
    }
}

export default connect(mapStateToProps)(_NPage)