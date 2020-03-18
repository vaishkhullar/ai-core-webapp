import React from "react"
import { css } from "@emotion/core"
import { Button, LandingSection, LandingPage } from "mvp-webapp"
/** @jsx jsx */ import { jsx } from '@emotion/core'
import { connect } from "react-redux"
import hero from "../../images/events/intro to rl/1.jpg"
import { importAll } from "../../utils"

var brands = importAll(require.context('../../images/brands'), false)
brands = Object.values(brands)

const style = css`
    max-height: 70px;
    height: 15vw;
    padding: 20px;
`

export const WorkshopsPreview = (props) => {
    return (
        <div className="large" css={css`textAlign: left; color: blac;`} >
            <div css={css`font-size: var(--large)`}>
                Partnerships
            </div>
            <div css={css`justify-content: center; display: flex; flex-direction: column; align-items: center;`}>
                We are looking to partner with forward thinking companies that can provide great opportunities to the world's top student AI talent.
                <br/>
                <br/>
                <Button text="Tell me more" to='/partnerships'/>
                <div css={css`display: flex; flex-wrap: wrap; justify-content: center;`}>
                    {
                        brands.map((b)=>{return <img css={style} src={b} />})
                    }
                </div>
            </div>
        </div>
    )
}

var Partnerships = (props) => {
    return( 
    <>
    <LandingPage
        nav={{
            links: ['events', 'partnerships', 'about'],        
            actionText: 'Login',
            to: 'Login'
        }}
        fold={{
            hero,
            heading: "Partnerships",
            subtitle: "The best student talent is looking for the best opportunities.",
            actionText: "Get in touch", 
            action: ()=> {window.open('https://meetings.hubspot.com/harryaberg')},
            belowAction: <div css={css`margin-top: 30px`}>
                {/* Or scroll down to see more details and success stories */}
                <div css={css`display: flex; flex-wrap: wrap; justify-content: center;`}>
                    {
                        brands ?
                        brands.map((b)=>{return <img src={b} css={style}/>})
                        :
                        null
                    }
                </div>
            </div>
        }}
        sects={[
            // }/>
        ]}
    />
    
    </>
)}

const mapDispatchToProps = (dispatch) => {
     return {
        openModal: (content) => {
            console.log('content:', content)
            dispatch({
                type: "OPEN_MODAL",
                content: content
            })
        }
     }
}

export default Partnerships 
= connect(null, mapDispatchToProps)(Partnerships)