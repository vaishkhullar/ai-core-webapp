import React, { Component } from "react"
import { Route, Redirect } from "react-router-dom"
import { Navbar, Sidebar } from "mvp-webapp"
import { connect } from "react-redux"
import Student from "./Student"
import { css, jsx } from "@emotion/core"
/** @jsx jsx */
import logo from "../../images/logo.png"
import LobbyHolder from "./LobbyHolder"
import Teacher from "./Teacher"

const AppRoutes = (props) => {
    return (
        <>
            {/* <AskForDetails /> */}
            <Navbar show_root_link={false} 
                btn='100 REP'
                action={props.openMenu} 
                back={'/app'}
                root='/app' roots={['/app']} 
                btn_icon={logo}
                show_root_link={false}
            />
            <div css={css`width: 80%; margin: auto;`}> {/*for sidebar responsiveness*/}
                <Route path='/classroom' component={LobbyHolder} />
                {/* <Route path="/classroom/mem1" render={()=>{return <Student mem={1} />}} />
                <Route path="/classroom/mem2" render={()=>{return <Student mem={2} />}} />
                <Route path="/classroom/mem3" render={()=>{return <Student mem={3} />}} />
                <Route path="/classroom/mem4" render={()=>{return <Student mem={4} />}} />
                <Route path="/classroom/mem5" render={()=>{return <Student mem={5} />}} />
                <Route path="/classroom/lobbyswitcher" component={LobbyHolder} />
                <Route path="/classroom/teacher" component={Teacher} /> */}
                {/* render={()=>{return <LobbyHolder lobbies={[<Student mem={6} />, <div>yo</div>]}/>}} /> */}
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