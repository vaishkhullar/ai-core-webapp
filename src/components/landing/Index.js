import React, { Component } from "react"
// import "./Index.css"
import { connect } from "react-redux"
import { Button, LandingPage } from "mvp-webapp"
import hero from "../../images/hero.jpg"
import { makePostRequest } from "../../api_calls"
import SignUpModal from "./SignUpModal"
import { css } from "@emotion/core"
/** @jsx jsx */ import { jsx } from '@emotion/core'
import MainWorkshops from "./MainWorkshops"
import { WorkshopsPreview } from "./Partnerships"
import { importAll } from "../../utils"
import Testimonials from "./Testimonials"
import WhyTheAICore from "./landing_sections/WhyTheAICore"

var heros = importAll(require.context('../../images/heros'), false)
heros = Object.values(heros)

class Home extends Component{
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <>
            <LandingPage 
                nav={{
                    links: ['events', 'partnerships', 'about'],
                    actionText: 'Login',
                    to: '/login'
                }}
                // hero={hero}
                fold={{
                    hero,
                    heading: "The world's largest network of university AI talent",
                    subtitle: 
                        <div css={css`> div {margin-bottom: 10px;}`}>
                            <div>
                                Over 5000 students with data science, coding and AI skills from top London universities.
                                {/* We run London's largest network of university AI talent, with over 5000 members, and run free workshops to train them in both the theory and code underpinning state of the art techniques in artificial intelligence.
                                <br/>
                                We believe we are a unique place to teach more people to code, making these skills accessible to individuals from various backgrounds. 
                                <br/>
                                We are bringing tech to a new audience, across subjects. Regardless of whether they were students of engineering and technology, arts and humanities, social sciences, or business & economics. We are developing a community adept in both AI and their own academic discipline, scientific or not.
                                <br/>
                                We are here to get more people in tech, closing the skills gap and growing diversity along the way.  */}
                            </div>
                        </div>,
                    actionText: 'Get involved',
                    action: () => {this.props.openModal(<SignUpModal/> )},
                }}
                heros={heros}
                sections={[
                    <WhyTheAICore />,
                    // <MainWorkshops />,
                    <WorkshopsPreview />,
                    <Testimonials />
                ]}
                socials={{'twitter': 'https://twitter.com/TheAICore', 'linkedin': 'https://www.linkedin.com/company/18690627', 'facebook': 'https://www.facebook.com/THEAICORE'}}
            />
            </>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        name: state.app.name
    }
}

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

export default Home 
= connect(mapStateToProps, mapDispatchToProps)(Home)



















class TabbedIndexSection extends Component {
    constructor(props) {
        super(props)
        this.state = {
            tab: 0
        }
        this.tabs = [
            {
                'name': 'Customer 1',
                'html': (
                    <>
                        <div className="medium">
                            Customer 1 now gets 100x as many customers as before
                            <br/><br/>
                            "This app helps us to provide a great user experience and make more money" - The Owner, 
                        </div>
                    </>
                )
            },
            {
                'name': 'Customer 2',
                'html': (
                    <>
                        <div className="medium">
                            Customer 2 increased its revenue by 20% within the first month of using MyApp
                            <br/><br/>
                            "More customers = more money!" - The Owner
                         </div>
                    </>                
                )
            },
        ]
        this.interval = setInterval(() => {this.setState({tab: (this.state.tab + 1) % this.tabs.length})}, 4000)
    }

    getTab = () => {
        var tabs = [

        ]
        return tabs[this.state.tab]
    }

    handleTabChange = (e) => {
        clearInterval(this.interval)
        this.setState({
            'tab': e.target.id
        })
    }

    render() {
        return (
            <>
                <div style={{position: "abslute", display: 'flex', flexDirection: 'row', width: '100%', boxSizing: 'border-box', justifyContent: 'space-around', padding: '20px'}}>
                    {
                        this.tabs.map(
                            (i, idx) => {
                                return (
                                    <div id={idx} className="large tab-font" style={{opacity: this.state.tab == idx ? 1 : 0.25, transitionDuration: '0.5s', textDecoration: this.state.tab == idx ? 'underline': null, cursor: 'pointer', fontSize: '18px', width: '30%', padding: '20px'}} onClick={this.handleTabChange}>
                                        {i.name}
                                    </div>
                                )
                            }
                        )
                    }
                </div>
                <div style={{display: 'flex', flexDirection: 'row', overflow: 'hidden', marginTop: '0'}}>
                    {
                        this.tabs.map(
                            (i) => {
                                return (
                                    <div style={{transform: `translateX(${- this.state.tab * 101}%)`, transitionDuration: '0.5s', display: 'relative', paddingTop: '0px', minHeight: '35vh', minWidth: '100%'}}>
                                        {i.html}
                                    </div>
                                )
                            }
                        )
                    }
                </div>
            </>
        )
    }
}

class _ContactButton extends Component {

    mobilecheck = function() {
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    };

    openModal = () => {
        this.props.openModal('Call 447765892392')
    }

    getExpert = () => {
        if (this.mobilecheck()) {
            return (
                <a style={{textDecoration: 'underline', cursor: 'pointer'}} href="tel:447765892392">Talk to an expert</a>
            )
        }
        else {
            return (
                <span style={{textDecoration: 'underline', cursor: 'pointer'}} onClick={this.openModal} >Talk to an expert</span>
            )
        }
    }

    render() {
        return (
            <>
                <Button className="medium contact-button" style={{maxWidth: '300px'}} onClick={this.openModal} text='Get started'/>
                <div className="small" style={{padding: '5px'}}>
                    Questions? {this.getExpert()}
                </div>
            </>
        )
    }
}
// const ContactButton = connect(null, mapDispatchToProps)(_ContactButton)

class VideoDemo extends Component {
    constructor(props) {
        super(props)
        this.state = {
            step: 0
        }
        this.steps = [
            {video: 'demo.mp4', explanation: 'Step 1'},
            {video: 'phrase.mp4', explanation: 'Step 2'},
            {video: 'share.mp4', explanation: 'Step 3'},
            {video: 'claim.mp4', explanation: 'Step 4'}
        ]
    }

    nextStep = () => {
        console.log('stepping')
        this.setState({step: (this.state.step + 1) % this.steps.length})
    }

    render() {
        return (
            <div style={{display: 'flex', alignItems: 'center'}}>
                <div>
                    <div className="large index-section-title">
                        How does {this.props.name ? this.props.name : 'it'} work?
                    </div>
                    <ol>
                        {this.steps
                        .map((s, idx) => {return (
                            <>
                            <li className="medium" style={{textAlign: 'left', minWidth: '50%', boxSizing: 'border-box', padding: '30px !important', opacity: this.state.step == idx ? 1 : 1}} >
                                {s.explanation}
                            </li>
                            <br/>
                            </>
                        )})}
                    </ol>
                </div>
                <div>
                    {/* <PhoneDemo video={this.steps[this.state.step].video} onEnded={this.nextStep} /> */}
                </div>
            </div>
        )
    }
}