import React from 'react';
import {css, jsx} from '@emotion/core';
/**@jsx jsx */
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import {Button} from 'mvp-webapp';
import { makePostRequest } from '../../api_calls';
import {Section} from "mvp-webapp"

const links = [
    {
        title: "Illegal Bushmeat Hunting in the Okavango Delta, Botswana",
        to: "http://www.fao.org/3/a-bc611e.pdf"
    },
    {
        title: "Evidence of a Growing Elephant Poaching Problem in Botswana",
        to: "https://www.cell.com/current-biology/pdf/S0960-9822(19)30675-X.pdf"
    },
    {
        title: "Rhino Wiki",
        to: "https://en.wikipedia.org/wiki/Rhinoceros"
    }
]
const container_style = css`
    // position: absolute;
    // width : 100%;
    // height: 100%;
    // top : 0;
    // left : 0;
    // position: fixed;
    // background : rgba(100,100,100,0.7);
    // flex-direction: column;
    // flex-shrink : 2;
    // zIndex:10;
    // justify-content: center;
    // align-items: center;
    // transition: display 0.5s;
   
    width: 600px;
    margin: auto;
    background-color: var(--color1);
    padding: 90px 25px;
    border-radius: 5px;
    font-family: var(--font1);
    color: var(--color2);
    max-width: 90vw;
    overflow:hidden;
    
    button{
        margin: auto;
    }
      
    
        // .field-container {
        //     display: flex;
        //     justify-content: center;
        // }

        .subtitle {
            margin: 20px;
        }

        input {
            font-size: 20px;
            font-family: var(--font1);
            margin: 10px auto;
        }

        // @media only screen and (min-width: 350px){
      
        // }
      
    }

`
const bar_style = css`
    display: flex;
    flex-direction: row;
    align-items: center;

    input{
        border-radius: 1000px 0 0 1000px;
        width: 100%;
        background: none;
        color: white;
        border: 2px solid var(--color2);
        border-right: none;
        padding: 6px;
        overflow: hidden;
    }

    button{
        font-weight: 1000;
        padding: 6px 10px 7px 10px;
        color: var(--color2);
        border-radius: 0 25px 25px 0;
        background: none;
        border: 2px solid var(--color2);
        border-left: none;
        font-size: 20px;
        cursor: pointer;
        :focus{
            outline: none;
        }
    }
`;


export default function Rhino(props){
    const [link, setLink] = React.useState("");
    const [title, setTitle] = React.useState("");

    const handleLinkClear = () => {
        setLink("");
    }

    const handleLinkChange = (event) => {
        setLink(event.target.value);
    }

    const handleTitleClear = () => {
        setTitle("");
    }

    const handleTitleChange = (event) => {
        setTitle(event.target.value);
    }

    const handleSubmit = () => {
        if(link !== "" && title !== ""){
            makePostRequest('app/user/contribute', 
            {
                key: 'rhino',
                content: {
                    title,
                    link
                }
            },
            ()=>{
                handleTitleClear()
                handleLinkClear()
            }
            )
        // submit value to database
        }
        else{
            alert("Please fill in both fields");
        }
        
    }

    return(
            <div style={{fontFamily:"var(--font1)"}}>
            <div className="form"  css={container_style}>
                <div style={{fontSize: '30px', marginBottom: '20px', fontWeight: '900'}}>
                    Crowdsource intelligence to combat rhino poaching in Botswana
                </div>
                <div className="subtitle">
                    In partnership with Adarga, we are going to crowdsource a dataset to help military operations to tackle rhino poaching in Botswana and North of the Zambezi river.
                    Phase 1 consists of finding URLs that can point to potentially useful data sources.
                    The next phase will consist of extracting data from these links, categorising it and cleaning it.
                    This next phase will being within the next 2 weeks. 
                    <br/>
                    <br/>
                    All kinds of resources may be useful. 
                    For example you can submit articles, research papers, links to sources of satellite imagery or other telemetry data
                    <br/>
                    <br/>
                    A useful final output of this project would be code for producing different geographical heatmap overlays which then could be combined.
                    For example, we could produce a heatmap of likely rhino watering holes, or heatmaps of difficult terrain for either poachers or rhinos.
                    The eventual combination of these heatmaps will hopefully be able to inform where forces on the ground should deploy their resources. 
                </div>
                <div className="field-container">
                <div css={bar_style}>
                    <input placeholder="Enter a title for your source..." value={title} onChange={handleTitleChange} />
                        <button onClick={handleTitleClear}>
                            <FontAwesomeIcon icon={faTimes}/>
                        </button>
                    </div>

                    <div css={bar_style}>
                        <input placeholder="Enter a link to a source of helpful data to contribute..." value={link} onChange={handleLinkChange} />
                        <button onClick={handleLinkClear}>
                            <FontAwesomeIcon icon={faTimes}/>
                        </button>
                    </div>
                    
                    
                    <Button text="Submit" onClick={handleSubmit}/>
                </div>
            </div>
            Submitted contributions
            {links.map(l => {return(<Section {...l}
            // title={title} 
            // to={link}
             />)})}
            </div>
    );
}