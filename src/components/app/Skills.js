import React, { Component } from "react"
import { css, jsx } from "@emotion/core"
/** @jsx jsx */
import { connect } from "react-redux"
import { makePostRequest } from "../../api_calls"
import { panel, Button } from "mvp-webapp"
import { importAll } from "../../utils"
import plus from "../../images/misc/plus.svg"

const badges = importAll(require.context('../../images/badges'))

class _Skills extends Component {
    render() {
        return (
            <div css={style}>
                <div className="title">Skills</div>
                <div className="" style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center'}}>
                    {this.props.skills.map((s) => {
                        console.log(s)
                        // console.log(skills)
                        s = skills.filter((skill)=>{return skill.id == s})
                        console.log(s)
                        s = s[0]
                        console.log(s)
                        return(
                        <div>
                            <img css={css`height: 30px; padding: 10px;`} src={s.badge} alt={`${s.name} badge`} />
                            {/* <div>
                                {s.name}
                            </div> */}
                        </div>
                    )})}
                </div>
                <img src={plus} className="edit" onClick={()=>{this.props.openModal(
                    <SelectSkills />
                )}}/>
            </div>
        )
    }
}

const _SelectSkills = (props) => {
    console.log(props.skills)
    return (
    <>
    <div css={css`${panel} ${selectStyle}`}>
        <div css={css`font-size: 30px; margin-bottom: 20px; font-weight: 900;`}>
            Add skill badges to your profile 
        </div>
        <div className="badges">
            {skills.map((s)=>{return (
                <div css={css`opacity: ${props.skills.includes(s.id) ? 1 : 0.3}`}>
                    <img src={s.badge} alt={`${s.name} badge`} 
                        onClick={()=>{
                            s = s.id
                            var new_skills = props.skills.includes(s) ? props.skills.filter((i)=>{return i !== s}) : [...props.skills, s]
                            props.setSkill({skills: new_skills})
                            makePostRequest('app/user/info', {skills: new_skills})
                        }}
                    />
                    <div>{s.name}</div>
                </div>
            )})}
        </div>
    </div>
    </>
)}

const mapStateToProps = (state) => {return {
    skills: state.user.skills
}}
const mapDispatchToProps = (dispatch) => {return {
    openModal: (content) => {
        dispatch({
            type: "OPEN_MODAL",
            content
        })
    },
    setSkill: (update) => {
        dispatch({
            type: "SET_USER",
            update
        })
    }
}}

export default connect(mapStateToProps, mapDispatchToProps)(_Skills)
const SelectSkills = connect(mapStateToProps, mapDispatchToProps)(_SelectSkills)

const skills = [
    {
        name: 'Neural Networks',
        id: 'nns',
        badge: badges['nns.jpg']
    },
    {
        name: 'Classification',
        id: 'classification',
        badge: badges['classification.jpg']
    },
    {
        name: 'Convolutional Neural Networks',
        id: 'cnns',
        badge: badges['cnns.jpg']
    },
    {
        name: 'Activation functions',
        id: 'activation',
        badge: badges['activation.jpg']
    },
    {
        name: 'Gradient based optimisation',
        id: 'grad-optim',
        badge: badges['grad-optim.jpg']
    },
    {
        name: 'Grid Search',
        id: 'grid-search',
        badge: badges['grid-search.jpg']
    },
    {
        name: 'Multivariate regression',
        id: 'multi-reg',
        badge: badges['multi-reg.jpg']
    },
    {
        name: 'Python',
        id: 'python',
        badge: badges['python.jpg']
    },
    {
        name: 'PyTorch',
        id: 'pytorch',
        badge: badges['pytorch.jpg']
    },
    {
        name: 'Raspberry Pi',
        id: 'raspberry-pi',
        badge: badges['raspberry-pi.jpg']
    },
    {
        name: 'Regression',
        id: 'reg',
        badge: badges['reg.jpg']
    },
    // {
    //     name: '',
        // id: '',
    //     badge: badges['.jpg']
    // },
]

const style = css`
    ${panel}

    .searchbar > input{
        border-radius:50px;
        box-shadow: var(--shadow);
        font-size: 30px;
        text-align: center;
        font-family: var(--font3);
        border: none;
        max-width: 85%;

        margin-right: 10px;
    }

    .searchbar-container {
        background-color: var(--nude);
        max-width: 80vw;
        margin: auto;
        border-radius: var(--border-radius);
        position: relative;
        transition: height 0.8s;
    }

    .searchbar {
        padding: 20px;
        height: 50px;
        display: flex;
        justify-content: center;
    }

    .searchbar > button {
        padding: 1px;
        height: 50px !important;
        width: 60px !important;
        border-radius: 50px;
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
        padding: 10px;
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

    // .edit {
    //     position: absolute;
    //     top: 10px;
    //     right: 20px;
    //     background-color: var(--color1);
    //     color: var(--color2);
    //     height: 30px;
    //     width: 30px;
    //     border-radius: var(--radius);
    //     vertical-align: middle;
    //     padding-bottom: 10px;
    //     box-sizing: border-box;
    // }
`
const selectStyle = css`
    width: 90vw; 
    max-width: 90vw;

    .badges {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        flex-direction: row;

        > div:hover {
            opacity: 1;
        }

        > div {
            transition-duration: 0.5s;
            cursor: pointer;

            width: 100px;
            height: 100px;
            display: flex;
            padding: 30px;
            flex-direction: column;

            img {
                max-height: 80%;
                // max-width: 100%;
            }

            div {
                font-size: 15px;
            }
        }
    }
`