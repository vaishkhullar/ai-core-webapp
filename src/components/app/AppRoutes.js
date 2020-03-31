import React, { Component } from "react"
import { Route, Redirect } from "react-router-dom"
import Home from "./Home"
import Profile from "./Profile"
import { Navbar, Sidebar } from "mvp-webapp"
import { connect } from "react-redux"
import Companies from "./Companies"
import Training, { TrainingRoutes } from "./Training"
import Opportunities from "./Opportunities"
import AskForDetails from "./AskForDetails"
import { faUser, faBell, faEdit, faChartLine, faJedi } from '@fortawesome/free-solid-svg-icons';
import { Notification } from "./Notifications"
import NotificationPage from "./NotificationsPage"
import Projects from "./Projects"
import Classroom from "../classroom/Classroom"
import LobbyHolder from "../classroom/LobbyHolder"

import { css, jsx } from "@emotion/core"
import RepCounter from "./RepCounter"
/** @jsx jsx */

const AppRoutes = (props) => {
    return (
        <>
            <AskForDetails />
            <Navbar btn='Menu' action={props.openMenu} back={'/app'} root='/app' roots={['/app']}/>
            <Sidebar items={[
                {title: 'Profile', faIcon: faUser, to: '/app/profile'},
                {title: 'Notifications', faIcon: faBell, 
                to: '/app/notifications',
                alert: props.notifications.filter(n=>{return n.seen}).length
                // onClick: ()=>{props.openSlideUp(<NotificationPage />)}
                },
                {
                    onClick: ()=>{window.open("https://docs.google.com/forms/d/e/1FAIpQLSfmWo-SvTaCwcaBpFCzioL9mzaBN79Z0E3d51DNhH_3vj-dEA/viewform?usp=sf_link")},
                    title: "Feedback",
                    faIcon: faEdit
                },
            ]} />
            {/* <RepCounter /> */}
            <div css={css`max-width: 80%; margin: auto;`}> {/*for sidebar responsiveness*/}
                <Route path='/app' exact component={Home}/>
                <Route path="/app/training" component={TrainingRoutes} />
                <Route path="/app/training" exact component={Training} />
                <Route path="/app/profile" component={Profile} />
                <Route path="/app/companies" component={Companies} />
                <Route path="/app/opportunities" component={Opportunities} />
                <Route path="/app/projects" component={Projects} />
                <Route path="/app/notifications" component={NotificationPage} />
                {/* <Route path='/app/classroom' component={LobbyHolder} /> */}
            </div>
        </>
    )
}

const mapStateToProps = (state) => {
    return {
        notifications: state.user.notifications
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        openMenu: () => dispatch({
            type: 'TOGGLE_MENU'
        }),
        openSlideUp: (content) => {
            dispatch({
                type: "OPEN_SLIDEIN",
                content
            })
        },
        setUser: ()=>{
            dispatch({
                type: "SET_USER",
                // update: 
            })
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AppRoutes)