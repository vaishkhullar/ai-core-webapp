import React, { Component } from "react"
import { Marquee } from "mvp-webapp"
import { css } from "@emotion/core"
/** @jsx jsx */ import { jsx } from '@emotion/core'
import { importAll } from "../../utils"
const tweetimgs = importAll(require.context('../../images/tweets'))

const tweets = Object.values(tweetimgs).map((v)=>{return <img css={css`max-width: 600px;`} src={v} />})

const testimonials = [
    "I am so happy to have found you and attended your session. It's been a great experience. Everything was explained clearly, and the tutors and assistants provide lots of help throughout the session which massively helps the learning experience. Would strongly recommend to anybody learning machine learning.",
    "I love these seminars. I walk in not knowing very much about the subject and leave feeling like I have learned a new powerful tool that I will actually be able to apply. The four hours fly past due to how engaging the lecture and code examples are. I go to a lot of these type of seminars and most of them are a huge waste of time - but the AI core seminars feel invaluable. I can't think of a better way to spend my saturdays -- even though I have to miss all of my favorite football matches to do so. Thanks a ton!",
    "The series of machine learning workshops have helped me tremendously with my course work. Everything is explained in plain language and in much more details than in class, so it helps tremendously for someone with no computer science background and not familiar with the technical jargons, like me, to learn machine learning. Thank you very much for offering the series!",
    "It was nice to get chunks of lecture, then some coding time. It helped each part of the lesson sink in and allowed me to get caught up when I didn't fully comprehend something right away. I could have seen myself getting a lost 3/4 the way through the lecture if it delivered all at once. All of the helpers were incredibly helpful and clear in communicating what we were doing. Lastly, the material was really interesting and it was cool to have a tangible product at the end.",
    "Excellent, practical, inclusive atmosphere to get down to the nitty gritty... concepts are essential, but they're useless without actual ability to implement. The workshop was great to help me get into the implementation",
    "Hands-on with good explanation of theory. I liked that we were solving a nontrivial problem too.",
    "You guys were very helpful whenever we had problems",
    "Harry did a great job at explaining everything in limited time. Fantastic workshop!",
    "Very helpful course and people",
    "Nothing to improve really. Sorry that's not a helpful answer, but I honestly thought it was great and am really excited for the next workshop you guys put on. Thanks!",
]
    
const testimonials2 = [
    "Really helpful tutors and clear explanations",
    "The hands on coding was great! It stuff that I can do (with a lot of thought) or get close enough to the solution to get it with help or when the answers are revealed. I feel like I can go reproduce this on my own. I’m also walking away feeling like I learned a lot - and I’ve done a lot of classes in linear regression. Again, I loved the session.",
    "Love how passionate and prepared the instructors are. They seem to really know what they are taking about and were about to reply to all questions with clarity and good willing. :)",
    "well planned and great willingness to help/share knowledge by the organisers",
    "It was very explanatory and the organisers were also very helpful and kind with answering people’s questions",
    "I liked the theory, principles, material available and the motivated speakers. It was great to be able to go over material online through the web-app. As an 'outsider' I fully support and appreciate the idea and the passion of the team behind this project. Keep going!",
    "Awesome job guys, I am learning A LOT with these workshops. The jupyter notebooks formt works really well as we have theory and implementation all in one place.",
    "Both the mathematics and coding parts are very clear",
    "I liked the one-to-one assistance.",
    "Very substantial content",
    "It was very informative, and beginner friendly"
]

const style = css`
    font-size: 20px;
    font-weight: 600;
    color: var(--color2);
`

export default (props) => {
    return (
        <>
        <div css={css`font-size: 50px;`}>
            Testimonials
        </div>
        <div>
            Here's some of the things that our community have said about what we do...
        </div>
        <Marquee type='html' items={
            testimonials.map((t)=>{return <div>{t}</div>})
        }/>
        <Marquee type='html' items={
            tweets.map((t)=>{return <div css={css`max-width: 300px;`}>{t}</div>})
        }/>
        <Marquee type='html' items={
            testimonials2.map((t)=>{return <div>{t}</div>})
        }/>
        </>
    )
}