import React, { Component } from "react"
import { connect } from "react-redux"
import { Form, panel, Button } from "mvp-webapp"
import { makePostRequest } from "../../api_calls"
import { css, jsx } from "@emotion/core"
/** @jsx jsx */
import edit from "../../images/misc/edit.svg"

const style = css`
    display: flex;
    justify-content: space-between;
    width: 80%;
`

class About extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    onSave = (e) => {
    }

    render() {
        var about = this.props.about
        delete about['slide_idx']
        // console.log('ABOUT:', about)
        return (
            <div css={panel}>
                <div className="title">
                    {'About you'}
                </div>
                {
                    Object.keys(about).map((k) => {return (
                        <>
                        <div css={style}>
                            <div><strong>{k.replace(/_/g, ' ')}</strong></div>
                            <div>{about[k]}</div>
                        </div>
                        <br/>
                        </>
                    )})
                }
                <img className="edit" src={edit} onClick={()=>{this.props.openModal(<SetAbout/>)}}/>
            </div>
        )
    }
}

var SetAbout = (props) => {
    var about = props.about
    return (
    // <div css={css`width: 120%`}>
    <Form 
        // redirect='/app/profile'
        stay={true}
        slides={[{
            title: 'About',
            subtitle: props.about ? null : "I'll stop asking once you tell me",
            onSubmit: (about) => {
                makePostRequest('app/user/update-info', {about})
                props.update({about})
                props.closeModal()
            },
            questions: [
                {
                    title: 'Name',
                    type: 'text',
                    id: 'name',
                    default: about.name
                },
                {
                    title: 'Bio',
                    type: 'text',
                    id: 'bio',
                },
                {
                    title: 'Age',
                    type: 'number',
                    id: 'age',
                    default: about.age
                },
                {
                    title: 'Degree',
                    type: 'text',
                    id: 'course',
                    default: about.course
                },
                {
                    title: 'Ethnicity',
                    type: 'text',
                    id: 'ethnicity',
                    default: about.ethnicity
                },
                {
                    title: 'Gender',
                    type: 'dropdown',
                    options: ['Male', 'Female', 'other'],
                    id: 'gender',
                    default: about.gender
                },
                {
                    title: 'Year of study',
                    type: 'dropdown',
                    options: [1, 2, 3, 4, 5, 6, '7+', 'Not studying'],
                    id: 'year_of_study',
                    default: about.year_of_study
                },
            ]
        }]}
    />
    // </div>
)}

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

export var SetAbout = connect(mapStateToProps, mapDispatchToProps)(SetAbout)
export default About = connect(mapStateToProps, mapDispatchToProps)(About)