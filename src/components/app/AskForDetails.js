import React, { Component } from "react"
import { SetAbout } from "./About"
import { connect } from "react-redux"

class AskForDetails extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    ask_for_details = () => {
        // console.log('about:', this.props.about)
        if (Object.keys(this.props.about).length < 3) { // if user.about is not set
            console.log('about not yet set')
            this.props.openModal(<SetAbout />)
        }
    }

    componentDidMount = () => {
        if (navigator.onLine) { // if online
            var interval = setInterval(this.ask_for_details, 1*30*1000) // ask for details
            this.setState({interval})
        }
    }

    componentWillUnmount = () => {
        clearInterval(this.state.interval)
        this.props.closeModal()
    }

    render() {return<></>} // render nothing
}

const mapStateToProps = (state) => {
    return {
        about: state.user.about
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
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


export default connect(mapStateToProps, mapDispatchToProps)(AskForDetails)

