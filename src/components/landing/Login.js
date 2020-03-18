import { Navbar, Login } from "mvp-webapp"
import React from "react"

export default () => {
    return (
        <>
        <Navbar to="/login" btn="Login"/>
        <Login />
        </>
    )
}