import React, { Component } from "react"
import { Navbar, Section, TileGrid, Sidebar } from "mvp-webapp"
// import Section from "./Section"
// import "./store.css"
import profile from "../../images/profile.png"
import code from "../../images/code.png"
import company from "../../images/company.png"
import feedback from "../../images/feedback.jpg"
import up from "../../images/misc/upArrow.png"
import { connect } from "react-redux"
import { css, jsx } from "@emotion/core"
/** @jsx jsx */
import { faGlobe as opportunityIcon } from '@fortawesome/free-solid-svg-icons';
import { faProjectDiagram as projectIcon } from '@fortawesome/free-solid-svg-icons';
import { faCalendarAlt as eventsIcon } from '@fortawesome/free-solid-svg-icons';
import { faUniversity as classroomIcon } from '@fortawesome/free-solid-svg-icons';


class Home extends Component {
    constructor(props) {
        super(props)
    }

    componentDidMount = () => {
        window.analytics.page('home')
    }

    render() {
        return (
            <>
                <TileGrid tiles={[
                    {
                        to: "/app/training",
                        title: "Code",
                        icon: code
                    },
                    {
                        to: '/app/opportunities',
                        title: "Opportunities",
                        faIcon: opportunityIcon
                    },
                    {
                        // to: "app/events",
                        onClick: ()=>{window.open('https://www.eventbrite.co.uk/o/the-ai-core-18715367897')},
                        title: 'Events',
                        faIcon: eventsIcon
                    },
                    {
                        to: "app/projects",
                        title: 'Projects',
                        faIcon: projectIcon
                    },
                    // {
                    //     to: "app/classroom",
                    //     title: 'Classroom',
                    //     faIcon: classroomIcon
                    // },
                    // {
            //     // to: '/app/projects',
            //     title: 'Battle',
            //     faIcon: faJedi
            // },
            // {
            //     to: '/app/projects',
            //     title: 'Projects',
            //     faIcon: faChartLine
            // }
            // {
            //     to: '/app/companies',
            //     title: "Rate companies",
            //     icon: company
            // },
            // {
            //     onClick: ()=>{window.open('https://calendar.google.com/calendar/ical/theaicore.com_2uqfbi6mkkpg3uteu8v23gcmbk%40group.calendar.google.com/public/basic.ics')},
            //     title: 'Calendar'
            // }
            // {
            //     onClick: () => {this.props.openModal(
            //         <div css={css`${panel} img {height: 50px; padding: 20px; cursor: pointer;}`}>
            //             <div className="title">
            //                 Help us grow
            //             </div>
            //             <div>
            //                 The more we grow, the more we can leverage companies. 
            //                 This helps us to provide the training and content for free, fund projects and other stuff for the community.
            //                 <br/>
            //                 <br/>
            //                 If you others deserve to hear about it, and we deserve it, we've made it super easy for you to share with your friends and network!
            //                 <br/>
            //                 <br/>
            //                 Just click an icon below and add a quote to tell people why they should get involved.
            //             </div>
            //             <div>
            //                 <img src={linkedin} alt="LinkedIn" onClick={()=>{window.open('https://www.linkedin.com/shareArticle?mini=true&url=https://www.eventbrite.co.uk/o/the-ai-core-18715367897&title=LinkedIn%20Developer%20Network&summary=My%20favorite%20developer%20program&source=LinkedIn')}}/>
            //                 <img src={whatsapp} alt="Whatsapp" onClick={()=>{window.open("whatsapp://send?text=The text to share!")}}/>
            //                 <img src={twitter} alt="Twitter" onClick={()=>{window.open('https://twitter.com/intent/tweet?text=These%20workshops%20are%20epic!%20%40theaicore%20pbs.twimg.com/media/EKkmsxqWkAAIano?format=jpg&name=360x360')}} />
            //             </div>
            //         </div>
            //     )},
            //     title: "Help us grow",
            //     icon: up
            // }

                ]} />
            </>
        )
    }
}

const mapDispatchToProps = (dispatch) => {return{
    openModal: (content) => {
        dispatch({
            type: "OPEN_MODAL",
            content
        })
    },
    openSlideUp: (content) => {
        dispatch({
            type: "OPEN_SLIDEUP",
            content
        })
    },

}}

export default Home = connect(null, mapDispatchToProps)(Home)