import React, { Component } from "react"
import Navbar from "mvp-webapp"
import uuid from "uuid"
import { connect } from "react-redux"
import default_dp from "../../images/profile.png"
import { makePostRequest } from "../../api_calls"
import { Storage } from "aws-amplify"
import Bio from "./Bio"
import { css, jsx } from "@emotion/core"
/** @jsx jsx */
import ProfilePic from "./ProfilePic"
import Options from "./Options"
import About from "./About"
import Skills from "./Skills"
import ProfileBanner from "./ProfileBanner"

const style = css`
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    justify-content: space-around;
    flexFlow: column wra;
    flex: 1; 
    width: 1000px;
    max-width: 100vw;
    margin: auto;
    align-items: center;

    > div {
        // width: 600px;
        // max-width: 100%;
        // min-width: 400px;
        // width: 500px;
        flex: 1;
        margin: 12.5px
    }
`

class Profile extends Component{
    render() {
    return (
        <div css={style}>
        <ProfileBanner {...this.props.user}/>
        {/* <div css={css`margin: 20px; !important; ackground-color: var(--color2);`}> */}
            {/* <Bio bio={this.props.user.bio}/> */}
        {/* </div> */}
        {/* <About /> */}
        <div css={css`display: flex; flex-wrap: wrap;`}>
        <Options 
            options={this.props.user.interests}
            allOptions={['Computer vision', 'NLP', 'RL', 'Startups', 'Consulting', 'Hardware', 'Design', 'Sales', 'Writing', 'VR', 'AR', 'Robotics', 'Trading', 'Medicine']}
            title='Interested in'
            onChange={(interests) => {
                console.log('updating with:', interests)
                this.props.setUserInfo({interests});
            }}
        />
        <Skills />
        <Options 
            options={this.props.user.goals}
            allOptions={['Learn AI out of interest', 'Get hired', 'Use AI in a project', 'Learn to code', 'Find team for project']}
            title='Current goals'
            onChange={(goals) => {
                console.log('updating with:', goals)
                this.props.setUserInfo({goals});
            }}
        />
</div>
        {/* <Stats user={this.props.user}/>
        <FeatureRequest /> */}
        </div>
        )
    }   
}

const mapStateToProps = (state) => {
    // console.log(state.user)
    return {
        dp_url: state.user.display_pic,
        user: state.user
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setUserInfo: (update) => {
            makePostRequest('app/user/update-info', update,
                () => {
                    console.log('user updated')
                }
            )
            console.log('update:', update)
            dispatch({
                type: "SET_USER",
                update
            })
        }
    }
}

export default Profile = connect(mapStateToProps, mapDispatchToProps)(Profile)