import React from "react"
import MainWorkshops from "./MainWorkshops"
import { LandingSection, LandingPage, TabbedMarquee, Marquee } from "mvp-webapp"
import hero from "../../images/events/deep learning 1/1.jpg"
import { css } from "@emotion/core"
/** @jsx jsx */ import { jsx } from '@emotion/core'
import { importAll } from "../../utils"
import notebook from "../../images/misc/notebook-example.png"
import workshop_vid from "../../videos/workshop.mp4"
// import hacking_imgs from "../../videos/hacking.mp4"
import hacking from "../../images/events/hacking/1.jpg"

import shakir from "../../images/events/topical/launch 2017/shakir.jpg"
import nathan from "../../images/events/topical/launch 2017/nathan.jpg"
import irina from "../../images/events/topical/women/irina.jpg"
import silvia from "../../images/events/topical/women/silvia.jpg"
import aldo from "../../images/events/topical/launch 2017/aldo.jpg"
import helene from "../../images/events/topical/women/helene.jpg"
import seth from "../../images/events/topical/launch 2017/seth.jpg"
import antonia from "../../images/events/topical/launch 2017/antonia.jpg"

import deepmind from "../../images/brands/deepmind.jpg"
import imperial from "../../images/unis/imperial.jpg"
import raais from "../../images/brands/raais.png"
import wild from "../../images/misc/wild.jpg"

var workshop_imgs = Object.values(importAll(require.context('../../images/events')))
var hacking_imgs = Object.values(importAll(require.context('../../images/events/hacking')))
var topical_imgs = Object.values(importAll(require.context('../../images/events/topical')))


var brands = importAll(require.context('../../images/brands'), false)
brands = Object.values(brands)
// console.log('BRANDS:', brands)

const style = css`
    max-height: 100px;
    height: 15vw;
    padding: 20px;
`

const showcase_style = css`
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    width: 80vw;
    overflow: hidden;

    .highlight {
        max-height: 300px; 
        border-radius: var(--radius);
    }

    .text {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        text-align: left;
        max-width: 100%;
        
        > div {
            margin: 20px
        };
    }

    .marquee-container {
        max-width: 600px;
    }
`

const Showcase = (props) => {
    return (
        <div css={showcase_style}>
            {
                props.video ?
                <video className="highlight" src={props.video} alt="" autoPlay muted loop/>
                :
                props.photo ?
                <img className="highlight" src={props.photo} alt=""/>
                :
                null    
            }
            <div className="text">
                {
                    props.text.map((t)=>{return(
                        <div>
                            {t}
                        </div>
                    )})
                }
                <div className='marquee-container'>
                    <Marquee items={props.marquee_items} />
                </div>
            </div>
        </div>
    )
}

export default (props) => {
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
            heading: "Events",
            subtitle: "We consistently hold some of the world's largest student AI events, and have worked with incredible organisations",
            actionText: "See all of our upcoming events",
            action: ()=> {window.open('https://www.eventbrite.co.uk/o/the-ai-core-18715367897')},
            belowAction: <div css={css`margin-top: 30px`}>
                Follow our Twitter <span css={css`text-decoration: underline; cursor: pointer;`} onClick={()=>{window.open('https://twitter.com/TheAICore')}}>@TheAICore</span> for details about our upcoming open hacking sessions.
                <br/>
                <br/>
                Or scroll down to see more about what exactly our events are like, and some of our previous speakers
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
        sections={[
            <>
            <div css={css`font-size: var(--large); font-weight: 1000;`}>
                What we do
            </div>
            <TabbedMarquee tabs={[
                {
                    name: 'Workshops',
                    html: <Showcase 
                                video={workshop_vid}
                                text={[
                                    <>We train people to build state of the art stuff.</>, 
                                    <>We cover both the code and theory, and don't teach anything that's not practically useful.</>,
                                    <>All of our free content can be found on our Github, <span className="text-link" onClick={()=>{window.open('https://github.com/ai-core')}}>here</span></>
                                ]}
                                marquee_items={workshop_imgs}
                        />
                },
                {
                    name: 'Open hacking meetups',
                    html: <Showcase 
                                photo={hacking}
                                text={[
                                    <>Twice a week we meet up for relaxed sessions where you can meet people, share project ideas, get code help or just hang out. </>,
                                    <>At these sessions there is no set content, and we all help each other to learn and brainstorm.</>,
                                    <>Follow our Twitter <span css={css`text-decoration: underline; cursor: pointer;`} onClick={()=>{window.open('https://twitter.com/TheAICore')}}>@TheAICore</span> for details about our upcoming open hacking sessions.</>
                                ]}
                                marquee_items={hacking_imgs}
                        />
                },
                {
                    name: 'Topical events',
                    html: <Showcase 
                                // photo={topical}
                                text={[
                                    <>On top of all of the technical content we love to host topical events focused on topical issues or technological advancements in machine learning.</>,
                                    <>Previously these have been in the format of panel discussions, series of talks and collaborative brainstorms.</>,
                                    <>Past events have included "Women in AI" and "Ethics in AI".</>,
                                ]}
                                marquee_items={topical_imgs}
                        />
                }
            ]}/>
            </>
            ,
            <>
            <div css={css`font-size: var(--large); font-weight: 1000; color: var(--color1);`}>
                Previous speakers
            </div>
            <div css={css`color: var(--color1);`}>
                Here are just a few of our previous speakers
            </div>
            <div css={css`display: flex; flex-wrap: wrap;`}>
            {[
                {
                    name: 'Shakir Mohamed',
                    hero: shakir,
                    logo: deepmind,
                    text: <div>Research scientist, Google DeepMind</div>
                },
                {
                    name: 'Nathan Benaich',
                    hero: nathan,
                    logo: raais,
                    text: <div>Founder, London.AI, RAAIS.</div>
                },
                {
                    name: 'Irina Higgins',
                    hero: irina,
                    logo: deepmind,
                    text: <div>Research scientist, Google DeepMind</div>
                },
                {
                    name: 'Aldo Faisal',
                    hero: aldo,
                    logo: imperial,
                    text: <div>Reader in neurotechnology, ICL</div>
                },
                {
                    name: 'Helene Guillaume',
                    hero: helene,
                    logo: wild,
                    text: <div>Founder, Wild</div>
                },
                {
                    name: 'Silvia Chiappa',
                    hero: silvia,
                    logo: deepmind,
                    text: <div>Research scientist, Google DeepMind</div>
                },
                {
                    name: 'Seth Flaxman',
                    hero: seth,
                    logo: imperial,
                    text: <div>Senior Lecturer, ICL</div>
                },
                // {
                //     name: 'Antonia Creswell',
                //     hero: antonia,
                //     logo: deepmind,
                //     text 
                // }
            ].map((s)=>{
                return <FeaturedSpeaker {...s} />
            })}

            </div>
            </>
        ]}
    />
    
    </>
)}

const speaker_style = css`
    height: 300px;
    min-width: 400px;
    position: relative;
    margin-top: 0;
    margin: 2px;
    border-radius: var(--radius);
    overflow: hidden;

    .text {
        padding: 10px;
        float: left;
        text-align: left;
        // display: flex;
    }

    .title {
        font-size: var(--medium);
        font-weight: 1000;
    }

    .logo {
        height: 60px;
        padding: 10px;
        float: right;
    }

    .hero-img {
        height: 100%;
        max-width: 600px;
        // min-width: 100%;
        position: absolute;
        left: 0;
        border-radius: var(--radius);
        background-size: cover;
        background-position: center;
    }

    .hero-filter {
        transition-duration: 0.5s;
        border-radius: var(--radius);
        background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.4));
    }
`

const FeaturedSpeaker = (props) => {return (
    <div css={speaker_style}>
        {
            props.hero?
            <>
            <img className="hero-img" src={props.hero}/>
            <div className="hero-filter"></div>
            </>
            :
            null
        }
        <div className="text">
            <div className="title">
                {props.name}
            </div>
                {props.text}
            </div>
        {props.logo?<img className="logo" src={props.logo} alt=''/>:null}
    </div>
)}