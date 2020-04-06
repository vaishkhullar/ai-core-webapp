import React, { Component } from 'react'
import {css} from '@emotion/core'
/** @jsx jsx */ import {jsx} from '@emotion/core'
import available from '../../../images/icons/available.jpg'
import community from '../../../images/icons/community.jpg'
import companies from '../../../images/icons/companies.jpg'
import skills from '../../../images/icons/skills.jpg'

const images = [
    {img:available,
    title:'AI courses, for free, for everyone',
    description:'Education is at our core. Our 4-week courses are recognised by elite British universities and secondary schools and we deliver free courses online so you can learn anywhere in the world. '}
    ,{img:community,
    title:'Community',
    description:'Courses are designed in partnership with top-tier industry and academia so you learn and develop the high-impact skills that stand out in the jobs market. With our partner organisations, we actively support the recruitment of our members into placements. '},
    {img:companies,
    title:'Companies',
    description:'AI Core is host to the largest community of AI talent in the UK and Europe. You will meet like minded people, collaborate, develop skills and support each other building real-world projects. Through advice and ideas the AI Core fosters practical learning and challenges development, creativity and innovation. '},
    {img:skills,
    title:'Get the skills you need',
    description:'Our free tutorials and technical workshops are designed to increase the employability of the next generation of tech talent. We are here to encourage and enable more people from every aspect of society to learn deep tech, closing the skills gap and growing diversity along the way.  Instead of taking x masters get the you skills you need here and get hired in just 4 weeks. You won’t have to pay anything. '},
]
   

const style = css`
display: flex;
width:100%;
height:100%;
flex-wrap: wrap;



    .title{
        font-size: var(--large);
        // word-wrap: break-word;
        font-family: 'Montserrat';
        width: 100%;
        height: 100%;
        // align-items: flex-start;
    }
    .imageContainer{
        display: flex;
        width: 25%;
        height: 25%;
        flex-direction: column;
        align: center;
        padding:20px;
        // flex-wrap: wrap;
        
            .image {
                width: 200px;
                height: 150px;
                padding: 10px;
                margin: auto;
                flex-grow: 0;
                flex-shrink: 0;
                flex-basis: 100%;
                max-width: 85%;
                max-height: 85%;
            }
            .imageTitle {
                width: 100%;
                font-size: var(--medium);
                font-weight:900;
                padding: 3px;
            }
            .description{
                font-size: var(--xsmall);
                display: flex;
            }
        }

    .align

    
`

export class WhyAiCore extends Component {
    render() {
        return (
            <div css={style}>
                <h1 className='title'>Why The AI Core</h1>
                {images.map(ImageMap)}
            </div>
        )
    }
}


function ImageMap(props) {
    return (
        <div className="imageContainer">
            {/* <img src={props}/> */}
            <img className="image" src={props.img}/>
            <div className="imageTitle">{props.title}</div>
            <div className="imageDescription">{props.description}</div>
        </div>
    )
}



export default WhyAiCore
