import React, { Component } from "react"
import { css, jsx } from "@emotion/core"
//** @jsx jsx */
import { TabbedMarquee, Button, Loading } from "mvp-webapp"
import { makePostRequest, makeGetRequest } from "../../api_calls"

const title = css`
    font-family: var(--font1);
    .title {
        font-size: 40px;
        font-weight: 1000;  
    }
`
const style = css`
    // .project-title{
    //     textarea {
    //         width: 100%;
    //         max-width: 600px;
    //         border-radius: 10px;
    //         height: 100px;
    //         padding: 10px; 
    //         height: 30px;
    //         margin-right: 10px;
    //     }
    //     // position: absolute;
    //     bottom: 10px;
    //     display: flex;
    //     flex-direction: row;
    //     align-items: center;
    //     width: 100%;
    //     margin: 50px;

    //     button {
    //         height: 50px;
    //         // position: absolute;
    //     }
    // }

    .update {
        // background-color: red;
        padding: 10px;
        border-radius: 10px;
        border: 2px solid var(--color2);
        margin: 5px;
        .heading {
            font-size: 12px;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
        }
        // height: 10px;
        width: 60%;
    }

    .update-input {

        textarea {
            width: 80%;
            max-width: 500px;
            border-radius: 10px;
            height: 100px;
            padding: 10px; 
            height: 30px;
            margin-right: 10px;
        }
        // position: absolute;
        bottom: 10px;
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%;
        margin: 50px;

        button {
            height: 50px;
            // position: absolute;
        }
    }

    display: flex;
    flex-direction: column;
    align-items: center;
    margin: auto;
    max-width: 80vw;
    width: 800px;
    position: relative;

    .tab-content {
        width: 90%; 
        
    }

`

class Projects extends Component {
    render() {
        return (
            <div css={title}>
                <div className="title">
                    Projects
                </div>
                <TabbedMarquee 
                    autoChange={false}
                    tabs={[
                        {
                            name: 'Your project',
                            html: <MyProject /> 
                        },
                        {
                            name: 'Community projects',
                            html: <div css={style} >
                                You need to submit an idea or update before you can see projects from the community.
                            </div>
                        }
                    ]}
                />
            </div>
        )
    }
}

export default Projects

class MyProject extends Component {
    constructor(props) {
        super(props)
        this.state = {
            updates: [],
            loading: false,
            update: '',
            updating: false,
            title: ''
        }   
    }

    componentDidMount = async () => {
        this.setState({loading: true})
        try {
            await makeGetRequest('app/user/project/updates', 
                (updates)=>{
                    this.setState({updates},
                        ()=>{
                            console.log('just got updates:', updates); 
                            console.log('state with updates:', this.state)
                            this.setState({loading: false})
                        }
                    )
                }
            )
        }
        catch {
            this.setState({loading: false})
        }
    }


    onChange = (e) => {
        console.log('changing')
        console.log(e.target.value)
        this.setState({update: e.target.value},
             e => {console.log(this.state)}
        )
    }

    updateTitle = () => {
        if (this.state.update == '') return
        this.setState({updating: true})
        makePostRequest('app/user/project/updates', {update: this.state.update})
        this.setState({updating: false})
    }

    updateProject = () => {
        if (this.state.update == '') return
        this.setState({updating: true}) 
        var update = {
            type: 'update',
            content: this.state.update,
            epoch: new Date().getTime()
        }
        console.log('update:', update)
        makePostRequest('app/user/project/updates', {update}, 
            ()=>{
                console.log('project updated')
                var updates = [...this.state.updates, update]
                this.setState({updates, update: ''}, ()=>{console.log(this.state)})
                window.analytics.track('updated project')
            }
        )
        // this.setState({updates: [...this.state.updates, this.state.update], update: ''})
        // try {
        // }
        // catch {
        //     alert('error')
        // }
        // this.setState({updating: false})
    }


    render() {
        return (
            <div css={style} lassName="project-tab">
                {this.state.loading ? <Loading /> : null}
                {/* <div className="project-title">
                    <textarea onChange={this.onChange} placeholder='Enter your latest update...' value={this.state.title} />
                </div> */}
                {this.state.updates.map((u) => {
                    switch (u.type) {
                        case 'update':
                            return <div className="update">
                                <div className="heading">
                                    <div>
                                        {u.type}
                                    </div>
                                    <div>
                                        {formatDate(new Date(u.epoch))}
                                    </div>
                                </div>
                                <div>
                                    {u.content}
                                </div>
                            </div>}

                    }
                )}
                <div className="update-input">
                    <textarea onChange={this.onChange} placeholder='Enter your latest update...' alue={this.state.update}/>
                    <Button onClick={this.updateProject} text='Submit update' loading={this.props.updating} />
                </div>
            </div>
        )
    }
}

function formatDate(date) {
  var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();
  var mins = date.getMinutes()
  mins = mins < 10 ? `0${mins}` : mins
  var time = date.getHours()

  return `${time}:${mins} ${day}/${monthIndex}/${year}`;
}