import React, { Component } from "react";
import "./App.css";
import Amplify from 'aws-amplify';
import { BrowserRouter as Router, Switch, Route, Match, withRouter } from "react-router-dom"
import LandingIndex from "./components/landing/Index"
import NotFound from "./components/general/NotFound";
import { combineReducers, createStore } from "redux"
import { ProtectedRoute } from "./CustomRoutes"
import { Provider } from "react-redux"
import { Helmet } from 'react-helmet'
import { Modal, SideMenu, SlideInPanel } from "mvp-webapp"
import Login from "./components/landing/Login"
import logo from "./images/logo.png"
import Home from "./components/app/Home"
import Profile from "./components/app/Profile"
import AppRoutes from "./components/app/AppRoutes";
import SignUp from "./components/landing/SignUp"
import favicon from "./images/favicon.ico"
import Workshops from "./components/landing/Workshops"
import { makeGetRequest } from "./api_calls";

import createHistory from "history/createBrowserHistory"
import Partnerships from "./components/landing/Partnerships";
import About from "./components/landing/About";
import OpenHacking from "./components/landing/OpenHacking";
import PrivacyPolicy from "./components/landing/PrivacyPolicy";
import Classroom from "./components/classroom/Classroom"
import Teacher from "./components/classroom/NewTeacher"

export const history = createHistory()
history.listen((location, action) => {
    window.scrollTo(0, 0)
})

//Amplify.Logger.LOG_LEVEL = 'DEBUG';
Amplify.configure({
    Auth: {

        // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
        identityPoolId: 'eu-west-2:a9b6789c-da76-4a3e-ae38-93373981ff11',
        // identityPoolId: 'eu-west-2:855cf335-a3b7-4b7f-b47d-dc9fd044bd9b',
        
        // REQUIRED - Amazon Cognito Region
        region: 'eu-west-2',

        // OPTIONAL - Amazon Cognito Federated Identity Pool Region 
        // Required only if it's different from Amazon Cognito Region
        //identityPoolRegion: 'eu-west-2',
 
        // OPTIONAL - Amazon Cognito User Pool ID
        userPoolId: 'eu-west-2_XRYfK4o2B',

        // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
        userPoolWebClientId: '12rljt0gbcrc780r5tdeoctdvk',

        // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
        mandatorySignIn: true
    },
    Storage: {
        AWSS3: {
            bucket: 'theaicore-data', //REQUIRED -  Amazon S3 bucket
            region: 'eu-west-2', //OPTIONAL -  Amazon service region
        }
    }
});

window.api_root = 'https://yjr86j4o4f.execute-api.eu-west-2.amazonaws.com/prod/'

const slideIn = (state={open: false, content: null}, action) => {
    switch (action.type) {
        case "OPEN_SLIDEIN":
            console.log('opening slideup')
            return {
                open: true,
                content: action.content
            }
        case "CLOSE_SLIDEIN":
            console.log('closing slideup')
            return {
                open: false,
                content: null
            }
        default:
            return state
    }
}

const modal = (state={open: false, content: null}, action) => {
    switch (action.type) {
        case "OPEN_MODAL": 
            console.log('opening modal')
            return {
                open: true,
                content: action.content
            }
        case "CLOSE_MODAL":
            console.log('closing modal')
            return {
                open: false,
                content: null
            }
        default:
            return state
    }
}

const menu = (state = {open: false}, action) => {
    switch (action.type) {
        case "TOGGLE_MENU" :
            console.log('toggling sidenav')
            return {
                ...state,
                open: !state.open
            }
        default:
            return state
    }
}

const notify = (state={show: false}, action) => {
    switch (action.type) {
        case "NOTIFY":
            console.log('notifying')
            return {
                show: true,
                content: action.content
            }
        case "HIDE_NOTIFY":
            return {
                show: false,
                content: null
            }
        default:
            return state
    }
}

const app = (state={}, action) => {
    return {
        name: 'AI CORE',
        logo,
        address: 'Kensington, London',
        contact: '07765892392'
    }
}

const user = (state={}, action) => {
    // console.log('action:', action)
    switch (action.type) {
        case "SET_USER":
            // console.log('update:', action.update)
            var s = {
                ...state,
                ...action.update
            }
            // console.log('got email?', Object.keys(state).includes('email'))
            if (!Object.keys(state).includes('email')) { // if email not yet in update. I.E. we only just pulled down the user data (they just logged in)
                // console.log('just got email')
                window.analytics.identify(s['user-id'], // identify them
                    {
                        email: s.email,
                        Avatar: s.display_pic,
                        avatar: s.display_pic,
                    }
                )
            }
            // console.log('new user:', s)
            return s
        // case "RATE_COMPANY":
        //     var company_ratings = {
        //         [action.company]: action.rating,
        //         ...state.company_ratings
        //     }
        //     // console.log('new ratings:', company_ratings)
        //     var c = {...state, company_ratings}
        //     // console.log('new state:', c)
        //     return c
            
        default:
            return {
                display_pic: null,
                skills: [],
                interests: [],
                company_ratings: {},
                about: {},
                goals: [],
                notifications: [],
                rep: 0,
                ...state
            }
    }
}

const reducer = combineReducers({
    modal,
    slideIn,
    menu,
    notify,
    app,
    user
})

export const store = createStore(reducer)

// GET INITIAL DATA
makeGetRequest('app/user/info', (update)=>{store.dispatch({type: "SET_USER", update}); })
makeGetRequest('app/user/notifications', (notifications)=>{store.dispatch({type: "SET_USER", update: {notifications}})})

class _Routes extends Component {
    componentDidUpdate = (prevProps) => {
        if (this.props.location !== prevProps.location) {
            this.onRouteChanged();
        }
    }

    onRouteChanged = () => {
        // console.log("ROUTE CHANGED TO", this.props.location.pathname);
        window.analytics.page(this.props.location.pathname)
    }

    render() {
        return <Switch>
            <ProtectedRoute path="/app" component={AppRoutes}/>
            <Route path="/login" component={Login} />
            <Route path="/signup" component={SignUp} />
            <Route path="/events" component={Workshops} />
            <Route path="/partnerships" component={Partnerships} />
            <Route path="/about" component={About} />
            {/* <Route path="/openhacking" component={OpenHacking} /> */}
            <Route path="/privacy-policy" component={PrivacyPolicy} />
            <ProtectedRoute path="/classroom" component={Classroom} />
            <ProtectedRoute path="/teacher" render={()=>{return <Teacher idx={1}/>}} />
            <ProtectedRoute path="/teacher" render={()=>{return <div style={{color: 'red'}}>yo</div>}} />
            <ProtectedRoute path="/teacher2" render={()=>{return <Teacher idx={2}/>}} />
            <ProtectedRoute path="/teacher3" render={()=>{return <Teacher idx={3}/>}} />
            <Route path="/" component={LandingIndex} />
            <Route component={NotFound} path=""/> 
        </Switch>
    }
}

const Routes = withRouter(_Routes)

class App extends Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() {
        console.log('rendering app')
        return (
            <Provider store={store}>
                <Router >                   
                    <div className="App">
                        <Helmet>
                            <title>{store.getState().app.name}</title>
                              <meta name="ABC" content="ABC" />
                            <link rel="icon" href={favicon} sizes="16x16" />
                            <script src="https://kit.fontawesome.com/2de6851308.js" crossorigin="anonymous"></script>
                        </Helmet>
                        <Routes />
                        <Modal />
                        <SlideInPanel />
                        <SideMenu />
                    </div>
                </Router>
            </Provider>
        )
    }
}

export default App;