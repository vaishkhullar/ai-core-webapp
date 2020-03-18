import React, { Component } from "react"
import { connect } from "react-redux"
import { css, jsx } from "@emotion/core"
import { Link } from "react-router-dom"
/** @jsx jsx */
import { expand_in } from "mvp-webapp"

const style = css`
    margin: 5px auto;
    width: 500px;
    max-width: 90vw;
    // background: linear-gradient(var(--color2), var(--color2g));
    background-color: var(--color2);
    color: var(--color1);
    font-family: var(--font1);
    border-radius: 10px;
    transition-duration: 0.5s;
    padding: 8px;
    // box-shadow: var(--shadow);
    cursor: pointer;
    // border-radius: 10px;
    animation-name: ${expand_in};
    animation-duration: 1s;
    .heading {
        display: flex;
        justify-content: space-between;
        .when {
            float: right;
        }
        margin-bottom: 5px;
    }
`

const dropdownstyle = css`
    position: fixed;
    z-index: 1000;
    left: 0;
    right: 0;
    padding: 20px;
`

class _Notification extends Component {

    getContent = () => {
        switch (this.props.type) {
            case 'comment_reply':
                    return `Someone replied to your comment: "${this.props.content}"`
            case 'welcome':
                return "Welcome to the AI Core. This is the webapp where you can learn code, find opportunities, check out the latest events and make progress with projects! Click this notification to help the community get to know you."
            default:

        }
    }

    getTime = () => {
        console.log('EPOCH:', this.props.epoch)
        var seconds = Math.round((new Date() - new Date(this.props.epoch*1000)) / 1000)
        var minutes = Math.round(seconds / 60)
        var hours = Math.round(minutes / 60)
        var days = Math.round(hours / 24)
        // var days = Math.round((new Date() - new Date(this.props.epoch*1000)) / (24*60*60*1000))
        if (minutes < 2) {return 'Just now'}
        else if (minutes < 60) {return `${minutes} days ago`}
        else if (hours < 24) {return `${hours} hours ago`}
        else {return `${days} days ago`}
        
    }

    render() {

        return (
            <Link to={this.props.links_to} css={style} onClick={this.props.close}>
                <div className="heading">
                    <div></div>
                    <div className="when">
                        {this.getTime()}
                    </div> 
                </div>
                {this.getContent()}
            </Link>
        )
    }
}

const dispathToProps = (dispatch) => {
    return {
        close: () => {
            dispatch({type: 'CLOSE_SLIDEIN'})
        }
    }
}

export const Notification = connect(null, dispathToProps)(_Notification)

class _DropDownNotification extends Component {

    render() {
        console.log('rendering notify')
        console.log('show:', this.props.show)
        if (this.props.show) {
            setTimeout(
                this.props.hide,
                5000
            )
            console.log('timing')
        }
        return (
            <div css={dropdownstyle} style={this.props.show ? {top: '20px'} :{top: '-1000px'}}>
                <Notification {...this.props} />
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        show: state.notify.show,
        content: state.notify.content
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        hide: () => {
            dispatch({
                type: 'HIDE_NOTIFY'
            })
        }
    }
}

export var DropDownNotification = connect(mapStateToProps, mapDispatchToProps)(_DropDownNotification)