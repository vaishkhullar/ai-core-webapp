import React from "react"
import './Help.css'
import { Button } from "mvp-webapp"

export default () => {
    return (

        <div class="help-body body">

            <div class="large">
                Need help?
            </div>
            <br />
            <div>
                <a href="/">
                    <Button text='Get started!'/>
                </a>
            </div>

        </div>

    )
}

