import React from "react"
import {TileGrid } from "mvp-webapp"
import Rhino from "./Rhino"
import { faGlobeAfrica as rhinoIcon } from '@fortawesome/free-solid-svg-icons';
import { Route } from "react-router-dom"

export default () => {
    return (
        <>
        <Route path="/app/contribute/rhino" component={Rhino} />
        <Route path="/app/contribute" exact render={()=>{return(
            <TileGrid tiles={[
                {
                    title: 'Rhino poaching',
                    faIcon: rhinoIcon,
                    to: '/app/contribute/rhino'
                }
            ]} />
        )}} />
        </>
    )
}