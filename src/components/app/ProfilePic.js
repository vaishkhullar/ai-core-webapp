import React, {Component} from "react"
import { connect } from "react-redux"
import { css } from "@emotion/core"
import default_dp from "../../images/profile.png"
/** @jsx jsx */ import { jsx } from '@emotion/core'
import uuid from "uuid"
import { Storage } from "aws-amplify"
import { makePostRequest } from "../../api_calls"

const style = css`
    .display-pic {
        box-shadow: var(--shadow);
        overflow: hidden;
        max-height: 100%;
    }

    .dp-input {
        cursor: pointer;
    }

    .dp-input :hover {
        opacity: 0.5;
    }

    background-color: var(--color2);
    border: 10px solid var(--color2);
    border-radius: 50vw;
    height: 50vw;
    width: 50vw;
    max-height: 200px;
    max-width: 200px;
    // width: 200px;
    margin: 30px auto;
    overflow: hidden;

    @media (max-width: 600px) {
        max-height: 100px;
        max-width: 100px;
    }
`

class PP extends Component {

    uploadDP = async (e) => {
        var type
        var url
        var fp
        var file = e.target.files[0]
        type = file.type.split('/')[1]
        fp = `users/${uuid.v4()}.${type}`
        var mimeType 
        if (type == 'png') {
            mimeType = 'image/png'
        }
        else if (type == 'jpg' || type == 'jpeg') {
            mimeType = 'image/jpeg'
        }
        else {
            alert('image type invalid (use .PNG, .JPG or .JPEG images)\nYou used type ' + type)
            return null
        }
        console.log('puttin')
        await Storage.put(fp, file, {contentType: mimeType})
        url =`https://theaicore-data.s3.eu-west-2.amazonaws.com/public/${fp}`
        var update = {display_pic: url}
        this.props.set_dp(update)
        makePostRequest('app/user/info', update)
    }

    render() {
        return (
            <>
                <div css={style}>
                    <label for="dp-input" className="dp-input">
                        <input onChange={this.uploadDP} id="dp-input" type="file" style={{display: 'none'}} />
                        <img src={this.props.dp_url ? this.props.dp_url : default_dp} className="display-pic" alt=""/>
                    </label>
                </div>
            </>
        )
    }   
}

const mapStateToProps = (state) => {
    return {
        dp_url: state.user.display_pic,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        set_dp: (update) => {
            console.log('setting dp')
            dispatch({
                type: "SET_USER",
                update
            })
        }
    }
}

export default PP = connect(mapStateToProps, mapDispatchToProps)(PP)