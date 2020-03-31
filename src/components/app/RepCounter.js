import React, { Component } from "react"
import { css, jsx } from "@emotion/core"
/** @jsx jsx */
import logo from "../../images/logo.png"
import { connect } from "react-redux"

const style = css`
    background-color: var(--color2);
    background-color: black;
    height: 8vh;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 200px;
    padding: 5px;
    // margin: 5px;
    color: black;
    font-size: 35px;
    font-family: var(--font1);
    font-weight: 1000;
    float: right;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 10;
    box-sizing: border-box;

    .user {
        background-color: black;
        border-radius: 50px;
        --dim: 50px;
        width: var(--dim);
        height: var(--dim);
    }

    .rep {
        display: flex;
        height: 70%;
        width: 150px;
        justify-content: center;
        padding: 5px;
        border-radius: 6px;
        align-items: center;
        position: relative;
        font-size: 28px;
        background-color: var(--color2);
        img {
            height: 90%;
            padding-right: 3px;
        }
        .unit {
            font-size: 15px;
            text-align: bottom;
            // position: absolute;
            bottom: 0;
        }
    }


`

class RepCounter extends Component {
    render() {
        return (
            <div css={style}>
                <div className="user">

                </div>
                <div className="rep">
                    <img src={logo} />
                    {this.props.rep} 
                    <div className="unit">
                        REP
                    </div>

                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        rep: state.user.rep
    }
}

export default connect(mapStateToProps)(RepCounter)