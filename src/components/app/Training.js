import React, { Component } from "react"
import { Section, Button, panel, TabbedMarquee, expand_in } from "mvp-webapp"
import { Route, Link } from "react-router-dom"
import { css, jsx } from "@emotion/core"
/** @jsx jsx */
import { importAll } from "../../utils"
import Questions from "./QuestionsAndComments"
import nn from "../../images/misc/nn.jpeg"
import lunar from "../../images/misc/lunarlander.png"
import nlp from "../../images/misc/nlp.jpg"

import adarga_logo from "../../images/brands/adarga_logo_whiteout.png"
import amazon_logo from "../../images/brands/Amazon-logo-RGB-REV.png"


const videos = importAll(require.context('../../videos'))
var video

const content = [
    // {
    //     title: 'Python',
    //     id: 'python',
    //     notebook: 'https://github.com/AI-Core/Python/blob/master/Intro%20to%20Python%20solutions.ipynb'
    // },
    {
        title: 'Intro to machine learning',
        id: 'basic',
        notebook: 'https://github.com/AI-Core/Strong-ML-Foundations/blob/master/Intro%20to%20Machine%20Learning.ipynb',
        solutions: 'https://github.com/AI-Core/Strong-ML-Foundations/blob/master/Intro%20to%20Machine%20Learning%20solutions.ipynb',
        video: "https://www.youtube.com/embed/Me36NowZh9U",
        feedback: 'https://docs.google.com/forms/d/e/1FAIpQLScIetwtoSOluCTp7kPVyLDe29acAaDTWGgb6QBRGErmR1LD3Q/viewform?usp=sf_link'
    },
    {
        title: 'Gradient based optimisation',
        id: 'grad-optim',
        notebook: 'https://github.com/AI-Core/Strong-ML-Foundations/blob/master/Gradient%20based%20optimisation.ipynb',
        solutions: 'https://github.com/AI-Core/Strong-ML-Foundations/blob/master/Gradient%20based%20optimisation.ipynb',
        feedback: 'https://docs.google.com/forms/d/e/1FAIpQLScIetwtoSOluCTp7kPVyLDe29acAaDTWGgb6QBRGErmR1LD3Q/viewform?usp=sf_link',
        video: "https://www.youtube.com/embed/oliBBpyni8c"
    },
    {
        title: 'Multivariate regression and feature normalisation',
        id: 'feature-norm',
        notebook: 'https://github.com/AI-Core/Strong-ML-Foundations/blob/master/Multivariate%20regression%20and%20feature%20normalisation%20solutions.ipynb',
        solutions: 'https://github.com/AI-Core/Strong-ML-Foundations/blob/master/Multivariate%20regression%20and%20feature%20normalisation%20solutions.ipynb',
        feedback: 'https://docs.google.com/forms/d/e/1FAIpQLScIetwtoSOluCTp7kPVyLDe29acAaDTWGgb6QBRGErmR1LD3Q/viewform?usp=sf_link',
        video: "https://www.youtube.com/embed/amGAcD7gfhk"
    },
    {
        title: 'Bias, variance and generalisation',
        id: 'bias-var',
        notebook: 'https://github.com/AI-Core/Strong-ML-Foundations/blob/master/Bias%2C%20variance%20and%20generalisation.ipynb',
        solutions: 'https://github.com/AI-Core/Strong-ML-Foundations/blob/master/Bias%2C%20variance%20and%20generalisation.ipynb',
        feedback: 'https://docs.google.com/forms/d/e/1FAIpQLScIetwtoSOluCTp7kPVyLDe29acAaDTWGgb6QBRGErmR1LD3Q/viewform?usp=sf_link',
        video: "https://www.youtube.com/embed/llrlGOoK9X0"
    },
    // {
    //     title: 'Maximum Likelihood Estimation',
    //     id: 'mle',
    //     notebook: '',
    //     solutions: '',
    //     feedback: '',
    //     video
    // },
    {
        title: 'Intro to PyTorch',
        id: 'pytorch',
        notebook: 'https://github.com/AI-Core/Neural-Networks/blob/master/Intro%20to%20PyTorch.ipynb',
        solutions: 'https://github.com/AI-Core/Neural-Networks/blob/master/Intro%20to%20PyTorch%20solutions.ipynb',
        feedback: 'https://docs.google.com/forms/d/e/1FAIpQLScIetwtoSOluCTp7kPVyLDe29acAaDTWGgb6QBRGErmR1LD3Q/viewform?usp=sf_link',
        video: "https://www.youtube.com/embed/YwvXXB6xMhU"
    },
    {
        title: 'Hyperparameters and validation sets',
        id: 'hyperparams-and-val-sets',
        notebook: 'https://github.com/AI-Core/Neural-Networks/blob/master/Hyperparameters%20and%20validation%20sets.ipynb',
        solutions: 'https://github.com/AI-Core/Neural-Networks/blob/master/Hyperparameters%20and%20validation%20sets.ipynb',
        feedback: 'https://docs.google.com/forms/d/e/1FAIpQLScIetwtoSOluCTp7kPVyLDe29acAaDTWGgb6QBRGErmR1LD3Q/viewform?usp=sf_link',
        video: "https://www.youtube.com/embed/Jf8I6WeowdQ"
    },
    {
        title: 'Intro to regularisation',
        id: 'regularisation',
        notebook: 'https://github.com/AI-Core/Strong-ML-Foundations/blob/master/Regularisation.ipynb',
        solutions: 'https://github.com/AI-Core/Strong-ML-Foundations/blob/master/Regularisation.ipynb',
        feedback: 'https://docs.google.com/forms/d/e/1FAIpQLScIetwtoSOluCTp7kPVyLDe29acAaDTWGgb6QBRGErmR1LD3Q/viewform?usp=sf_link',
        video
    },
    {
        title: 'Classification',
        id: 'classification',
        notebook: 'https://github.com/AI-Core/Strong-ML-Foundations/blob/master/Classification.ipynb',
        solutions: 'https://github.com/AI-Core/Strong-ML-Foundations/blob/master/Classification-Solutions.ipynb',
        video
    },
    {
        title: 'Neural Networks',
        id: 'neural-networks',
        notebook: 'https://github.com/AI-Core/Neural-Networks/blob/master/Neural%20Networks.ipynb',
        solutions: 'https://github.com/AI-Core/Neural-Networks/blob/master/Neural%20Networks%20solutions.ipynb',
        feedback: '',
        video: "https://www.youtube.com/embed/d8Knmt3bXAs",
        challenge: "https://www.kaggle.com/c/the-ai-core-mnist/"
    },
    // {
    //     title: 'Regularisation for deep learning',
    //     caption: 'Dropout, batch normalisation',
    //     id: 'deep-regularisation',
    //     notebook: '',
    //     solutions: '',
    //     feedback: '',
    //     video
    // },
    {
        title: 'Convolutional Neural Networks',
        caption: 'An intro to CNNs for image classification',
        id: 'cnns',
        notebook: 'https://github.com/AI-Core/Convolutional-Neural-Networks/blob/master/Convolutional%20Neural%20Networks.ipynb',
        solutions: 'https://github.com/AI-Core/Convolutional-Neural-Networks/blob/master/Convolutional%20Neural%20Networks%20Solutions.ipynb',
        feedback: 'https://docs.google.com/forms/d/e/1FAIpQLSfQ1LevMPaubXyWDLc1EEnxT5jtHf6ue00ioVL4fxbDRYYrvg/viewform?usp=sf_link',
        video: "https://www.youtube.com/embed/QL61mOKbIME"
    },
    {
        title: 'Making your own datasets',
        caption: 'Learn to build your own datasets so you can solve your own problems',
        id: 'datasets',
        notebook: 'https://github.com/AI-Core/Convolutional-Neural-Networks/blob/master/Custom%20Datasets.ipynb',
        solutions: 'https://github.com/AI-Core/Convolutional-Neural-Networks/blob/master/Custom%20Datasets%20Solutions.ipynb',
        video: "https://www.youtube.com/embed/b4R9WvfHs4M"
    },
    {
        title: 'Object detection with CNNs',
        caption: 'Predict bounding boxes for single instances in an image',
        id: 'detection',
        notebook: 'https://github.com/AI-Core/Convolutional-Neural-Networks/blob/master/CNN%20Detection.ipynb',
        solutions: 'https://github.com/AI-Core/Convolutional-Neural-Networks/blob/master/CNN%20Detection%20Solutions.ipynb',
        video
    },
    {
        title: 'Recurrent Neural Networks',
        caption: 'An intro to RNNs for language modelling',
        id: 'rnns',
        notebook: 'https://github.com/AI-Core/Recurrent-Neural-Networks/blob/master/Recurrent%20Neural%20Networks.ipynb',
        solutions: 'https://github.com/AI-Core/Recurrent-Neural-Networks/blob/master/Recurrent%20Neural%20Networks%20Solution.ipynb',
        feedback: 'https://docs.google.com/forms/d/e/1FAIpQLScwGl3Y5EAtjKhtGfXaqoiHNsYGY8ASKVKjqCdE9aOxd6WARg/viewform?usp=sf_link',
        video
    },
    {
        title: 'Intro to RL',
        caption: '',
        id: 'intro-to-rl',
        notebook: 'https://github.com/AI-Core/Reinforcement-Learning/blob/master/Intro%20to%20RL.ipynb',
        solutions: 'https://github.com/AI-Core/Reinforcement-Learning/blob/master/Intro%20to%20RL%20solutions.ipynb',
        feedback: 'https://docs.google.com/forms/d/e/1FAIpQLSf3SbH10ZiTsLAwhfhMPma9Dh9BVrwAiVKjJXJgu955seyeyg/viewform?usp=sf_link',
        video
    },
    {
        title: 'DQN and Rainbow',
        caption: '',
        id: 'dqn-rainbow',
        notebook: 'https://github.com/AI-Core/Reinforcement-Learning/blob/master/Q%20Learning.ipynb',
        solutions: 'https://github.com/AI-Core/Reinforcement-Learning/blob/master/Q%20Learning%20solution.ipynb',
        feedback: 'https://docs.google.com/forms/d/e/1FAIpQLSdxp-_CRmM6vcvRNHC3jx6Ym95vYQtXTIG5i58C85J2_xRA8w/viewform?usp=sf_link',
        video
    },
    {
        title: 'Policy gradients',
        caption: '',
        id: 'policy-gradients',
        notebook: '',
        solutions: '',
        feedback: 'https://docs.google.com/forms/d/16EggpVUk5WfpM90kAYh5bX2dqOZ_Ix_Xk66S9nqyVEU/edit',
        video
    },
    {
        title: 'Upside Down RL',
        caption: '',
        id: 'udrl',
        notebook: 'https://github.com/AI-Core/Reinforcement-Learning/blob/master/Upside%20Down%20RL.ipynb',
        solutions: '',
        feedback: 'https://docs.google.com/forms/d/e/1FAIpQLSfztTNlW9Fs56wdG4a9uYGjh49qo9b4JTV-dELnrHf7yKchVA/viewform?usp=sf_link',
        video
    },
    {
        title: 'Intro to NLP',
        caption: '',
        description: 'In this workshop, after a brief coverage of the history of NLP, we’ll focus on the practical steps required for an NLP pipeline. We will introduce what distributed representations are, and the steps required to go from raw text to something which you can feed into a model. While there are many word-vector models, we will discuss and implement Word2Vec. We’ll additionally demonstrate how to streamline this process by using libraries for quicker and more accurate pre-processing',
        id: 'intro-to-nlp',
        repo: 'https://github.com/AI-Core/NLP/tree/master/1_WordRepresentations',
        notebook: 'https://github.com/AI-Core/NLP/blob/master/1_WordRepresentations/Word%20Representations.ipynb',
        solutions: '',
        feedback: '',
        video
    },
    {
        title: "LSTM's, language modelling and evaluation",
        caption: '',
        id: 'language-modelling-and-evaluation',
        repo: 'https://github.com/AI-Core/NLP/tree/master/2_Seq2Seq',
        notebook: '',
        solutions: '',
        feedback: '',
        video
    },
    {
        title: 'Attention and seq-to-seq',
        caption: '',
        id: 'attention',
        notebook: '',
        solutions: '',
        feedback: '',
        video
    },
    {
        title: 'Transformers and BERT',
        caption: '',
        id: 'transformers',
        notebook: '',
        solutions: '',
        feedback: '',
        video
    },
]

export const TrainingRoutes = () => {return (
    <>
    {content.map((c)=>{
        // var sponsor = Object(courses).keys().reduce((acc, curr)=>{
        //     if 
        //     return
        // }
        // var sponsor = Object(courses).keys().map(course=>{courses.sponsor})
        var sponsor
        // console.log([...Object(courses).keys()])
        for (var course of courses) {
            var workshops = course.sessions.flat()
            console.log('workshops:', workshops)
            console.log('title:', c.id)
            if (workshops.includes(c.id)) {
                console.log(workshops.includes(c.id))
                console.log(course.sponsor)
                console.log(course)
                sponsor=course.sponsor}
        }
        return(
            <Route path={`/app/training/${c.id}`} render={() => {return <Lesson {...c} sponsor={sponsor}  />}} />
    )})}
    {courses.map((c)=>{return <Route path={`/app/training/${c.link}`} render={()=>{return <Course {...c} />}}/>})}
    </>
)}

const trainingStyle = css`
    .view-type {
        display: flex;
        justify-content: space-between;
    }
`

const Training = (props) => {
    return (
        <TabbedMarquee
            autoChange={false}
            tabs={[
                {name: "View courses",  html: <CourseList />},
                {name: "View all sessions", html: content.map((s, idx)=>{return (<Section {...s} to={`training/${s.id}`} idx={idx} />)})},
            ]}
        />
    )
}

export default Training

const CourseList = (props) => {
    return <div css={courseListStyle}>
        {courses.map((c, idx)=>{return <CourseThumbnail {...c}/>})}
    </div>
}

const courseListStyle = css`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    .course {
        width: 300px;
        max-width: 100%;
        height: 150px;
        padding: 20px;
        margin: 5px;
        border: 3px solid var(--color2);
        border-radius: 9px;
        text-align: left;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: 0.5s;
        color: var(--color2);
        animation-name: ;
        animation-duration: 1s;

        .sponsor {
            // margin: 5px;
            font-weight: 900;
            display: flex;
            justify-content: center;
            align-items: center;
            img {
                opacity: 1.0 !important;
                height: 30px;
                margin: 7px;
                min-width: auto;
                position: relative;
            }
        }

        :hover {
            transform: scale(1.03)
        }

        img {
            position: absolute;
            min-width: 100%;
            top: 0px;
            left: 0px;
            height: 100%;
            z-index: -10;
            opacity: 0.4;
        }

        .title {
            font-size: var(--medium);
            font-weight: 900;
        }    
    }
`

const adarga = {
    name: 'Adarga',
    description: 'NLP big data analytics',
    logo: adarga_logo 
}

const amazon = {
    name: 'Amazon',
    description: '',
    logo: amazon_logo
}

const courses = [
    {name: 'Deep Learning', thumb: nn, subtitle: 'Start your journey into deep learning here', link: 'deeplearning',
        sessions: [['basic', 'grad-optim', 'feature-norm', 'bias-var', 'pytorch', 'hyperparams-and-val-sets', 'regularisation'], ['classification', 'neural-networks'], ['cnns', 'datasets', 'detection'], ['rnns']]
    },
    {name: 'Deep Reinforcement Learning', thumb: lunar, subtitle: 'Go beyond fitting models, and build intelligent agents', link: 'deeprl',
        sessions: [['intro-to-rl'], ['dqn-rainbow'], ['policy-gradients'], ['udrl']],
        sponsor: amazon
    },
    {name: 'Natural Language Processing', thumb: nlp, subtitle: 'Build algorithms to process speech, translate language and interpret text', link: 'nlp',
        sessions: [['intro-to-nlp'], ['language-modelling-and-evaluation'], ['attention'], ['transformers']],
        sponsor: adarga
    },
]

const CourseThumbnail = (props) => {
    return (
        <Link to={`training/${props.link}`} className="course">
            <div className="title">
                {props.name}
            </div>
            <div className="subtitle">
                {props.subtitle}
            </div>
            <img src={props.thumb} alt=""/>
            {
                props.sponsor ?
                <div className="sponsor">
                    <div>
                        Powered by
                    </div>
                    <img src={props.sponsor.logo} />
                </div>
                :
                null
            }
        </Link>       
    )
}

const courseStyle = css`
    .course-title {
        font-family: var(--font1);
        font-weight: 900;
        font-size: 30px;
        margin-bottom: 10px;
    }

    .sponsor {
        font-family: var(--font1);
        padding: 30px;
        img {
            margin-top: 10px;
            height: 80px;
        }
    }

    .session-title {
        font-family: var(--font1);
        font-weight: 900;
        font-size: 22px;
    }
`

const Course = (props) => {
    return (
        <div css={courseStyle}>
            <div className="course-title">
                {props.name}
            </div>
            {
                props.sponsor ?
                <div className="sponsor">
                    <div>
                        Powered by
                    </div>
                    <img src={props.sponsor.logo} />
                </div>
                :
                null
            }
            {props.sessions.map((notebook_ids, session_idx)=>{return <div>
                <div className="session-title">
                    Week {session_idx + 1}
                </div>
                {notebook_ids.map((nb_id, idx)=>{
                    console.log('NB ID:', nb_id)
                    var session = content.filter((c)=>{return c.id == nb_id})[0]
                    return <Section {...session} to={`${session.id}`} idx={idx} />})
                }
            </div>})}
        </div>
    )
}

const style = css`
    font-family: var(--font1);
    
    .body {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        .questions {
            flex: 1;
            width: 100vw;
            max-width: 900px;
        }
        > div {
            margin: 10px;
        }
        .panel {
            flex: 1;
        }
        .body-panel {
            width: 100vw;
            flex: 1;
            min-width: 300px;
        }
        .video {
            min-width: 300px;
            max-width: 1100px;
            iframe {
                max-height: 500px;
                width: 100%;
                height: 80%;
                height: 450px;
                margin: 0;
            }
            .panel {

                padding: 0;
            }
        }
        .btns {
            flex-direction: row;
            flex-wrap: wrap;
            padding: 0;
            // max-width: 200px;
        }
    }

    .title {
        font-size: 40px;
        font-weight: 1000;  
    }

    .sponsor {
        img {
            height: 60px;
        }
    }
    
    .btns {
        display: flex;
        > * {
            margin: 10px;
        }
    }
`

const Lesson = (props) => {return (
    <div css={style}>
        <div className="title">
            {props.title}
        </div>
        {
            props.sponsor ?
            <div className="sponsor">
                <div>
                    Powered by
                </div>
                <img src={props.sponsor.logo} />
            </div>
            :
            null
        }
        <div className="body">
            <div css={panel} className="body-panel video">
                {/* <video controls src={videos[`${props.id}.mp4`]}/>  */}
                {
                    props.video ?
                    <iframe src={props.video} frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    :
                    null
                }
                <div css={css`${panel}; max-width: 100%;`} className="btns">
                    {
                        props.repo ? <Button text='Link to repo' onClick={()=>{window.open(props.repo)}}/> : null
                    }
                    {
                        props.notebook ? <Button text='Link to code' onClick={()=>{window.open(props.notebook)}}/> : null
                    }
                    {
                        props.notebook ? <Button text='Link to solutions' onClick={()=>{window.open(props.solutions)}}/> : null
                    }
                    {
                        props.notebook ? <Button text='Feedback' onClick={()=>{window.open(props.feedback)}}/> : null
                    }
                    
                </div>
            </div>
            <div className="body-panel" css={panel}>
                <Questions id={props.id}/>
            </div>
        </div>
            { 
                props.challenge ?
                <div css={css`${panel}; max-width: 100%; flex-direction: row; justify-content: space-around;`}>
                    <div css={css`max-width: 800px;`}>
                        This workshop has an associated Kaggle challenge. Complete this and the other 2 in the Deep Learning series and earn a certificate.
                    </div>
                    <Button text="Link to challenge" onClick={()=>{window.open(props.challenge)}}/>
                </div>
                : null
            }
    </div>
)}
 