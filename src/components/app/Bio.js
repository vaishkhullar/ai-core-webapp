import React, { Component } from "react"
import edit from "../../images/misc/edit.svg"
import save from "../../images/misc/save.png"
import { makePostRequest } from "../../api_calls";
/** @jsx jsx */ import { jsx } from '@emotion/core'
import { css } from "@emotion/core"
import { panel } from "mvp-webapp"
import { connect } from "react-redux"

const style = css`
    background: linear-gradient(var(--color2), var(--color2g));
    ${panel}
    max-height: 300px;

    // > .edit {
    //     position: absolute;
    //     height: 25px;
    //     right: 10px;
    //     top: 10px;
    //     cursor: pointer;
    // }

    .title {
        font-size: 24px;
        font-weight: 1000;
        float: left;
    }

    textarea {
        background-color: transparent;
        width: 90%;
        height: 100px;
        border: 2px solid black;
        border-radius: var(--radius);
    }    
`

class Bio extends Component {
    constructor(props) {
        super(props)
        this.state = {
            editing: false,
            bio: ''
        }
    }

    // componentDidUpdate = () => {    // gets bio from api (delayed response) needs to set state
    //     if (this.props.bio && this.state.bio != this.props.bio) {      // if style props passed and state is not equal
    //         this.setState({bio: this.props.bio})                          // equate the bio
    //     }
    // }

    onBioChange = (e) => {
        console.log('OLD BIO:', this.state.bio)
        this.setState({bio: e.target.value},
            ()=>{console.log('NEW BIO:', this.state.bio)})
    }

    onBioSave = () => {
        this.setState({editing: false})
        makePostRequest('app/user/update-info', {bio: this.state.bio},
            () => {console.log('bio saved')}
        )
        this.props.saveBio({bio: this.state.bio})
    }

    render() {
        return (
            <div css={style}>
                <div className="title">
                    Bio
                </div>
                {
                    this.state.editing ?
                    <>
                        <img className="edit" onClick={this.onBioSave} src={save} />
                        <textarea className="text-response" value={this.state.bio} onChange={this.onBioChange}>
                        </textarea>
                    </>
                    :
                    <>
                    <img className="edit" onClick={() => {this.setState({bio: this.props.bio, editing: true})}} src={edit} />
                    <div style={{position: 'relative'}}>
                        {
                            this.props.bio != '' ?
                            this.props.bio
                            :
                            'I love ML so much'
                        }
                    </div>
                    </>
                }
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch) => {return {
    saveBio: (update) => {dispatch({
        type: 'SET_USER',
        update
    })}
}}

export default Bio = connect(null, mapDispatchToProps)(Bio)