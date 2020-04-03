import React, { Component } from "react"
import { css, jsx } from "@emotion/core"
/** @jsx jsx */

const style = css`
    color: var(--color2);
`

export default () => {
    return <div css={style}>
        Thanks! We'll be in contact soon
    </div>
}