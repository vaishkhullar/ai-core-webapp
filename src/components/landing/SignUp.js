
import { Navbar, Signup } from "mvp-webapp"
import React from "react"

export default () => {
    return (
        <>
        <Navbar to="/login" btn="Login"/>
        <Signup />
        </>
    )
}