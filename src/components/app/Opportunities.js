import React, { Component } from "react"
import { makeGetRequest } from "../../api_calls"
import { importAll } from "../../utils"
/** @jsx jsx */
import { css, jsx } from "@emotion/core"
import { Button, Loading } from "mvp-webapp"

const style = css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-family: var(--font1);

    .opportunity {
        background-color: var(--color2);
        color: var(--color1);
        max-width: 600px;
        width: 90%;
        border-radius: 5px;
        padding: 20px;
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
        > div {
            padding: 10px 0px;
        }
        .heading {
            display: flex;
            padding: 0 0 0 0;
            align-items: center;
            justify-content: space-between;
            .header-info {
                display: flex;
                align-items: center;
                .title {
                    font-size: 20px;
                    font-weight: 900;
                    float: left;
                    padding: 0;
                }
                .logo {
                    margin: 3px;
                    height: 50px;
                    padding: 10px;
                }
            }
            button {
            }
            
        }
        .body {
            text-align: left;
        }
    }
`

const Opportunity = (props) => {
<<<<<<< HEAD
=======
    console.log(props.logo)
    //console.log(Object.keys(logos))
>>>>>>> 2e449cc1987750dc07b966ade91d359626b25b93
    return (
    <div className='opportunity'>
        <div className="heading">
            <div className="header-info">
                <div className="title">
                    {props.roleTitle} at {props.company}
                </div>
                <img className='logo' src={props.logo} />
            </div>
        </div>
        <div className='body'>
            {props.desc}
        </div>
        <Button onClick={()=>{window.analytics.track('opportunity clicked', {opportunity: `${props.roleTitle} at ${props.company}` });window.open(props.link)}} lto={props.link} text='Apply!'/>
    </div>)
}

class Opportunities extends Component {
    constructor(props) {
        super(props)
        this.state = {opportunities: []}//[{roleTitle: 'Data scientist', company: "The AI Core", desc: 'Its nice', logo: 'ai-core'}]}
        // this.state = {opportunities: []}
    }

    componentDidMount = () => {
        this.setState({loading: true})
        makeGetRequest('app/user/opportunities', (opportunities)=>{
            this.setState(
                {
                    opportunities: JSON.parse(opportunities.body), 
                    loading: false
                }, 
                () => {
                    // console.log(this.state.opportunities)
                }
            )
        })
    }

    render() {
        return (
            <>
            <div css={css`font-size: 36px; font-weight: 900; font-family: var(--font1); padding: 20px;`}>
                Opportunities    
            </div>
            {
                this.state.loading
                ?
                <Loading />
                :
                <div css={style}>
                    {this.state.opportunities.map(o => {return <Opportunity {...o} />})}
                </div>

            }
            </>
        )
    }
}

export default Opportunities