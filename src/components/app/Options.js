import { connect } from "react-redux"
import React, { Component } from "react"
import { makePostRequest } from "../../api_calls"
import { css } from "@emotion/core"
/** @jsx jsx */ import { jsx } from '@emotion/core'
import { panel } from "mvp-webapp"

const style = css`
    ${panel}

    .searchbar > input{
        border-radius:50px;
        box-shadow: var(--shadow);
        font-size: 30px;
        text-align: center;
        font-family: var(--font3);
        border: none;
        width: 85%;
        max-width: 85%;
        padding: 5px;

        margin-right: 10px;
    }

    // .searchbar-container {
    //     background-color: var(--nude);
    //     max-width: 100px;
    //     margin: auto;
    //     border-radius: var(--border-radius);
    //     position: relative;
    //     transition: height 0.8s;
    // }

    .searchbar {
        padding: 5px;
        height: 35px;
        display: flex;
        justify-content: center;
        width: 100%;
        margin: auto;
    }

    .searchbar > button {
        padding: 1px;
        height: 100% !important;
        width: 50px !important;
        border-radius: 50px;
        margin: 0;
    }

    .btn {
        transition: all 0.5s;
        box-shadow: var(--shadow-depth) var(--shadow-depth);
        border: solid 3px rgba(1, 1, 1, 1);
        border-radius: 7px;
        // width: 20vw;
        // min-width: 200px;
        // max-width: 500px;
        margin: 5px;
        font-family: var(--title-font);
        padding: 5px;
        cursor: pointer;
        background-color: transparent;
        background-size: 100vw var(--navbar-height);
        overflow: hidden;
        color: black !important;
    }

    .btn:active .btn:hover {
        animation-name: button_press;
        animation-duration: 1s;
    }

    @keyframes button_press {
        50% {
            transform: translateX(5px) translateY(5px);
            box-shadow: 0px 0px black;
        }
        100% {
            box-shadow: 6px 6px black;
        }
    }

    .radio_btn {
        display: none;
    } 

    .add-option {
       min-width: 80px;
    }
`

export default class Skills extends Component {
    constructor(props) {
        super(props)
        console.log('PORPS:', props)
        this.state = {
            allOptions: this.props.allOptions, 
            options: [],
            request_loading: false,
            request: ''
        }
   }

    componentDidUpdate = () => {
        console.log(this.props.options)
        if (this.props.options && this.state.options != this.props.options) {      // if style props passed and state is not equal
            this.setState({options: this.props.options})                          // equate the options
        }
    }

    handleOptionChange = (e) => {
        console.log(this.state.options)
        var options = this.state.options
        if (this.props.options.includes(e.target.id)) {
            console.log('removing style')
            options = options.filter( (item) => {return item != e.target.id} )
        }
        else {
            console.log('addign style')
            options.push(e.target.id)
        }
        this.props.onChange(options)
    }

    handleRequestChange = (e) => {
        this.setState({request: e.target.value},
            () => {console.log(this.state)}    
        )
    }

    submitRequest = () => {
        var request = this.state.request.toLowerCase()
        if (request != '') {
            if (! this.state.allOptions.includes(request)) {
                this.setState({
                    allOptions: [...this.state.allOptions, request],
                })
            }
            this.setState({
                request: ''
                // request_loading: true
            })
            this.handleOptionChange({target: {id: request}})
            makePostRequest('feature-request', {type: 'new tag request', request: request},
                () => {
                    console.log('brand requested')
                }
            )
        }
    }

    render() {
        console.log('SKILLS:', this.props.options)
        var options = this.props.options
        var allOptions = Array.from(new Set([...this.state.allOptions, ...options]))
        return (
            <div css={style}>
                <div className="title">
                    {this.props.title}
                </div>
                <div className="" style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center'}}>
                    {
                        allOptions.map(
                            (item) => {
                            console.log(item)
                                var opacity = options.includes(item) ? '1' : '0.5'
                                return <>
                                    <label for={item} style={{opacity}} value={options.includes(item)}>
                                        <button className="btn text-btn" id={item} onClick={this.handleOptionChange}>
                                            <input className="radio_btn" type="radio" checked={options.includes(item)}/>
                                            {item}
                                        </button>
                                    </label>
                                </>
                            }
                        )
                    }
                </div>
                <div style={{marginTop: '30px'}}>
                    <div><strong>Enter your own tag!</strong></div>
                    <div className="searchbar">
                        <input value={this.state.request} onChange={this.handleRequestChange} className="text-response" placeholder='Enter a missing word...' style={{fontSize: '13px'}} />
                        <button onClick={this.submitRequest} className="add-option btn">
                            {
                                this.state.request_loading ?
                                'loading'
                                // <Loading />
                                :
                                'Enter'
                                // <img src={sendIcon} style={{height: '30px'}} />
                            }
                        </button>
                    </div>
                </div>
                {/* <button className="btn" onClick={this.handleSubmit}>
                    Done
                </button> */}
            </div>
        )
    }
}
