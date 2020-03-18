import React, { Component } from "react"
import { Form } from "mvp-webapp"
import { makePostRequest } from "../../api_calls"
import { Auth } from "aws-amplify"
import { Redirect } from "react-router-dom"
import { connect } from "react-redux"

const makeid = (length=8) => {
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    };
    return text;
}

class SignUp extends Component {

    constructor(props) {
        super(props)
        this.state = {
            slide: 0,
            redirect: null
        }
    }

    submit = async (e) => {
        await Auth.signUp({
            username: e.email,
            password: makeid()
        })
        makePostRequest('core-signup', e)
    }

    render() {
        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }
        var email
        var password 
        return (
            <Form 
                redirect='/app'
                slides={[
                    {
                        title: "Join the network!",
                        questions: [
                            {
                                title: 'Email',
                                type: 'text',   
                                id: 'email'
                            }
                        ],
                        onSubmit: async (e) => {
                            // email = e.email
                            // password = makeid()
                            // password = 'hello there' 
                            try {
                                makePostRequest('app/join/add-member', e)
                                // await Auth.signUp({
                                //     username: e.email,`
                                //     password: password
                                // })
                            }
                            catch (err) {       // if username already exists but email not confirmed
                                console.log('caught error:', err)
                                return err
                                if (err.message === 'User is already confirmed.') {
                                    console.log('redirecting to login')
                                    this.setState({redirect: '/login'})
                                }
                                else if (err.message === "An account with the given email already exists.") {
                                    this.setState({redirect: '/login'})
                                    // Auth.resendSignUp(e.email)
                                    // .then(() => {
                                    //     console.log('code resent successfully');
                                    // }).catch(e => {
                                    //     console.log(e);
                                    // });
                                }
                            }
                        }
                    },
                    {
                        title: 'Create a password',
                        subtitle: "Creating an account allows you to learn from our content, and means we'll keep you up to date",
                        questions: [{title: 'Password', type: 'password', id: 'password'}],
                        onSubmit: async (e) => {
                            await Auth.signUp(e.email, e.password);
                        }
                    },
                    {
                        title: 'Confirm your email',
                        subtitle: 'Enter the code that you were emailed',
                        questions: [{title: 'Code', type: 'text', id: 'code'}],
                        onSubmit: async (e) => {
                            await Auth.confirmSignUp(e.email, e.code)
                            await Auth.signIn(e.email, e.password);
                        }
                    }
                    // {
                    //     title: 'Confirm email',
                    //     subtitle: 'Check that email for a confirmation code',
                    //     questions: [
                    //         {
                    //             title: 'Code',
                    //             type: 'text',
                    //             id: 'code',
                    //         }
                    //     ],
                    //     detail:
                    //         <button onClick={() =>{
                    //             Auth.resendSignUp(email)
                    //             .then(() => {
                    //                 console.log('code resent successfully');
                    //             }).catch(e => {
                    //                 console.log(e);
                    //             });
                    //         }}
                    //         style={{textDecoration: 'underline', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', padding: '0px'}}
                    //         >
                    //             Resend
                    //         </button>,
                    //     onSubmit: async (e) => {
                    //         try {
                    //             await Auth.confirmSignUp(e.email, e.code)
                    //             console.log('email verified');
                    //             console.log('EMAIL:', e.email)
                    //             console.log('PASSWORD:', password)
                    //             await Auth.signIn(e.email, password)
                    //             var s = await Auth.currentSession()
                    //             console.log('session:', s)
                    //             this.props.closeModal()
                    //         }
                    //         catch(err) {
                    //             console.log('failed with error', err);
                    //         }
                    //     }
                    // }

                ]}
            />
             
        )
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        closeModal: () => {
            dispatch({
                type: 'CLOSE_MODAL'
            })
        }
    }
}

export default SignUp = connect(null, mapDispatchToProps)(SignUp)