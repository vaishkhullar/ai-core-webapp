import React, { Component } from "react"
import { css, jsx } from "@emotion/core"
import { Button } from "mvp-webapp"
/** @jsx jsx */
// import { makePostRequest } from "./Student"
import { makePostRequest } from "../../api_calls"

const style = css`
    height: 7.5vh;
    background-color: var(--color2);
    margin: 20px auto;
    padding: 10px;
    box-sizing: border-box;
    width: 80%;
    color: black;
    font-family: var(--font1);
    display: flex;
    justify-content: space-around;
    align-items: center;

    div {
        height: 100%;
        display: flex;
        align-items: center;
        > div {
            margin: 10px;
        }
    }

    img {
        max-height: 100%;
        // margin: 10px;
        box-sizing: border-box; 
    }

    .looking {
        display: flex;
        align-items: center;
    }
`

class SponsorBanner extends Component {
    render() {
        return <div css={style}>
            <div>
                <div>In partnership with </div><img src={this.props.sponsor.logo} />
            </div>
            <div className="looking">
                <div>Looking for a role in AI?</div> <Button text="Get hired!" onClick={async()=>{
                    console.log('uooo')
                    var response = makePostRequest('/app/user/apply', {role_id: 'any at adarga'})
                    // .then(data=>console.log(data))
                    // .cat
                    console.log(response)
                    // alert()
                    window.open('/app/applied')
                }}/>
            </div>
        </div>
    }
}

export default SponsorBanner