import React, { Component } from "react"
import { css, jsx } from "@emotion/core"
/** @jsx jsx */
import cover from "../../images/misc/cover.png"
import ProfilePic from "./ProfilePic"
import { connect } from "react-redux"
import { SetAbout } from "./About"

const style = css`
    // width: 100%;
    font-family: var(--font1);
    text-align: left;
    .cover {
        max-width: 100%;
        position: relative;
    }
    .profile-pic {
        // position: absolute;
        top: 100px;
        left: 50px;
    }

    .title {
        font-weight: 900;

    }

    .edit {
        cursor: pointer;
    }
`

class ProfileBanner extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return <div css={style}>
            <div className='cover'>
                <img className='cover' src={cover} />
            </div>
            <div css={css`display: flex; height: 50px; justify-content: space-between; padding: 3px 10px;`}>
                <div css={css`position: relative;`}>
                    <div css={css`position: absolute; bottom: 0;`}>
                        <ProfilePic />
                    </div>
                </div>
                <div className='edit title' onClick={()=>{this.props.openModal(<SetAbout />)}}>
                    Edit profile
                </div>
            </div>
            <div className="title">
                {this.props.about.name}, {this.props.about.age}
            </div>
            <div>
                Year {this.props.about.year_of_study} {this.props.about.course} 
            </div>
            <div>
                {this.props.bio}
            </div>
        </div>
    }
}

const mapStateToProps = (state) => {
    return {
        about: state.user.about
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        update: (update) => {
            dispatch({
                type: 'SET_USER',
                update
            })
        },
        openModal: (content) => {
            dispatch({
                type: 'OPEN_MODAL',
                content
            })
        },
        closeModal: ()=>{
            dispatch({
                type:'CLOSE_MODAL'
            })
        }
    }
}

export default ProfileBanner = connect(mapStateToProps, mapDispatchToProps)(ProfileBanner)