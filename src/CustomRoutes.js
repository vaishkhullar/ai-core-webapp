import React, { Component } from "react"
import { Auth } from "aws-amplify"
import queryString from "query-string"
import { Route, Redirect } from "react-router-dom"

// export class ProtectedRoute extends Component {
//     constructor(props) {
//       super(props)
//       this.state = {
//           ready: false,
//           userInfo: null
//       }
//       Auth.currentSession()
//       .then(
//           (data) => {
//               if (data) {
//                   this.setState({
//                       user: data
//                   })
//               }
//           }
//       )
//       .then(
//         () => {
//           this.setState({ready: true})
//         }
//       )
//       .catch(
//         (err) => {console.log(err);this.setState({ready: true})}
//       )
//     }

//     render() {
//     const { component: Component, ...props } = this.props
//     if (this.state.ready) {
//         console.log('user:',this.state.user)
//         return (
//             <Route 
//             {...props} 
//             render = { props => (
//                 this.state.user ?
//                 <Component {...props} /> :
//                 <Redirect to={{pathname: `/login` + window.location.search, state: {from: window.location.pathname}}}/>
//             )} 
//             />
//         )
//     }
//     else {
//         return null
//     }
//     }
// }

export class ProtectedRoute extends Component {
    constructor(props) {
      super(props)
      this.state = {
          ready: false,
          sess: null
          // userInfo: null,
          // user: null
      }
      this.setState({sess: true, ready: true})
      Auth.currentSession()
      .then((sess) => {if (sess) {this.setState({sess})}})
      .then(() => {console.log('GOT SESSION');this.setState({ready: true})})
      .catch((err) => {console.log('ERROR GETTING SESSION:', err);this.setState({ready: true})})
    }

    render() {
    const { component: Component, ...props } = this.props
    if (this.state.ready) {
        console.log('sess:',this.state.sess)
        return (
            <Route 
            {...props} 
            render = { props => (
                this.state.sess ?
                <Component {...props} /> :
                <Redirect to={{pathname: `/login` + window.location.search, state: {from: window.location.pathname}}}/>
            )} 
            />
        )
    }
    else {
        return null
    }
    }
}

// export const ProtectedRoute = (props) => {
//   var sess = await Auth.currentSession()
//   console.log('CURRENT SESSION:', sess)
//   var params = queryString.parse(window.location.search)
//   if (sess) {
//     console.log('sess is true', sess)
//   }

//   return <Route {...props} render={()=> <Component {...props}/>}/>
//   var r = sess ?
//     <Route {...props} 
//     render = { props => (<Component {...props} />)}/>
//     :
//     <Redirect to={{pathname: '/login', 
//     // state: {...params, from: window.location.pathname}
//   }} />
//     // return r
// }

// export class ProtectedRoute extends Component {
//     async render () {
//       var sess = await Auth.currentSession()
      
//       const { component: Component, ...props } = this.props
//       // console.log('ADMIN PROPS:', this.props)
//       console.log('routing to:', Component)
//       console.log('ROUTE LOCATION:', window.location)
//       var params = queryString.parse(window.location.search)
//       // console.log('PARAMS:', params)
//       console.log('ROUTE STATE:', this.state)
//       console.log('USER:', this.state.user)

//       if (sess) {
//           console.log('routing', {...props})
//           return (
//             <Route 
//               {...props} 
//               render = { props => (
//                 this.state.user && this.state.user.accessToken.payload['cognito:groups'] && this.state.user.accessToken.payload['cognito:groups'].includes('admin') ?
//                   <Component {...props} /> :
//                   <Redirect to={{pathname: '/login', state: {...params, from: window.location.pathname}}} />
//               )} 
//             />
//           )
//       }
//       else {
//         console.log('rendering null')
        
//         return null
//       }
//     }
// }