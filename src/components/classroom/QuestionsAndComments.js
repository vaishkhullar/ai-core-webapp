import React, { Component } from "react"
import { panel, Button } from "mvp-webapp"
import { makeGetRequest, makePostRequest } from "../../api_calls"
import { css, jsx } from "@emotion/core"
/** @jsx jsx */
import up from "../../images/misc/up.png"
import reply from "../../images/misc/reply.png"
import { makeid } from "../../utils"
import { Auth } from "aws-amplify"

const style = css`
    // width: 85%;
    height: 100%;
    // max-height: 200px;
    // overflow: scroll;
    font-size: 14px;
    padding: 10px;
    box-sizing: border-box;

    .make-post {
        button {
            margin: 0 5px;
            min-width: 100px;
            background-color: var(--color1);
            color: var(--color2);
        }
    }

    > div {
        width: 100%;
        display: flex;
        textarea {
            resize: none;
            width: 80%;
            flex: 1;
            border-radius: 5px;
            border: 0;
            padding: 10px;
            font-family: var(--font1);
        }
    }

    .comments {
        max-height: 200px;
        flex-direction: column;
        overflow-y: scroll;
        margin-top: 5px;
        height: 74%;

        ::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 5px;
        }
        ::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 5px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
    }

    .comment {
        display: flex;
        // min-height: 50px;
        width: 98%;
        background-color: whitesmoke;
        margin-bottom: 10px;
        box-sizing: border-box;
        padding: 5px;
        border-radius: var(--radius);

        text-align: left;

        .votes {
            display: flex;
            flex-direction: column;
            width: 30px;
            height: 100%;
            text-align: center;
            font-size: 10px;

            img {
                height: 15px;
                width:30px;
                opacity: 0.5;
                cursor: pointer;
                :hover {
                    opacity: 1;
                }
            }
            .down {
                transform: rotate(180deg);
            }
        }

        .content {
            padding: 5px;
            width: 90%;
        }

        .reply-btn {
            height: 20px;
            cursor: pointer;
        }

    }

    .reply {
        background-color: whitesmoke;
        width: 90%;
        float: right;
        margin: 0 8px 10px 10px;
        border-radius: var(--radius);
        text-align: left;
        padding: 5px;
    }

    .new-reply {
        width: 60%;
        float: right;
        display: flex;
        justify-content: flex-end;
        width: 96%;
        margin-bottom: 10px;
        textarea {
            margin-right: 5px;
        }
    }
`

export default class Questions extends Component {
    constructor(props) {
        super(props)
        this.state = {
            comments: {},
            post: null,
            user_id: null
        }
    }

    componentDidMount = async () => {
        this.getLatestComments()
        var uid = await Auth.currentAuthenticatedUser()
        uid = uid.username
        this.setState({user_id: uid})
        this.sync = setInterval(this.getLatestComments, 10000)
    }

    getLatestComments = () =>{
        makeGetRequest('app/user/comments?id=' + this.props.id,
            (comments) => {
                // console.log('got comments:', comments)
                this.setState({comments})
            }
        )
    }

    componentWillUnmount = () => {
        clearInterval(this.sync)
    }

    post = () => {
        var post = {
            [makeid()]: {
                epoch: new Date(), 
                content: this.state.post, 
                user_id: this.state.user_id,
                replies: [],
                votes: []
            }
        }
        makePostRequest('app/user/comments?id=' + this.props.id, post, ()=>{
            // console.log('posted comment')
        })
        this.setState({post: '', comments: {...this.state.comments, ...post}},
            () => {console.log('post:', this.state.post)}
        )
    }

    vote = async (up, id) => {
        var comment = this.state.comments[id]           // get the comment
        var votes = comment.votes ? comment.votes : []  // votes is a list
        var uid = await Auth.currentAuthenticatedUser()
        uid = uid.username
        var vote = {    // create vote object
            user_id: uid,
            time: new Date(),
            upvote: up          // was it upvoted (true) or not (false)
        }
        votes = votes.filter((v) => {        // remove any old votes from this user
            return v.user_id !== uid
        })
        votes.push(vote)    // add new vote to list
        comment = {...comment, votes}
        var update = {[id]: comment}
        this.setState({comments: {...this.state.comments, ...update}})
        makePostRequest('app/user/comments?id=' + this.props.id, update, ()=>{console.log('updated votes')})
    }

    reply = (reply, id) => {
        // console.log(this.state.comments)
        var comment = this.state.comments[id]
        reply = {
            user_id: this.state.user_id,
            content: reply,
            epoch: new Date()
        }
        comment.replies.push(reply)
        // console.log(comment)
        var update = {[id]: comment}
        this.setState({comments: {...this.state.comments, ...update}})
        makePostRequest('app/user/comments?id=' + this.props.id, update, ()=>{console.log('updated')})
    }

    handleChange = (e) => {
        this.setState({post: e.target.value})
    }

    render() {
        var comments = this.state.comments
        var comment_ids = Object.keys(comments)
        .sort((a, b)=>{      // sort by number of upvotes
            // console.log(a.votes)
            a = comments[a]
            b = comments[b]
            var a_votes = a.votes.filter((v) => {return v.upvote}).length - a.votes.filter((v) => {return !v.upvote}).length
            var b_votes = b.votes.filter((v) => {return v.upvote}).length - b.votes.filter((v) => {return !v.upvote}).length
            return b_votes- a_votes
        })
        return (
            <div css={style} >
                {/* <div css={css`padding-bottom: 10px;`}>
                    Questions and comments
                </div> */}
                <div className="make-post">
                    <textarea placeholder='Ask a question or make a comment...' onChange={this.handleChange} value={this.state.post}></textarea>
                    <Button text="Post" onClick={this.post}/>
                </div>
                <div className="comments">
                {
                    comment_ids.map((id)=>{
                        var comment = this.state.comments[id]
                        return(
                        <Comment id={id} {...comment} post={this.reply} vote={this.vote} my_vote={comment.votes.filter((v)=>{return v.user_id == this.state.user_id})[0]} />
                    )})
                }
                </div>
            </div>
        )
    }
} 

class Comment extends Component {
    constructor(props) {
        super(props)
        this.state = {
            replying: false,
            reply: null
        }
    }

    handleChange = (e) => {
        this.setState({reply: e.target.value},
            ()=>{console.log(this.state.reply)})
    }
    
    render(){
        
        var votes = this.props.votes
        var my_vote = this.props.my_vote
        var i_upvoted 
        var i_downvoted 
        var upvote_style
        var downvote_style
        if (my_vote) {  // if passed a prop that says that i have already up or down voted this comment
            i_upvoted = my_vote.upvote === true
            var upvote_style = css`opacity: ${i_upvoted ? "1 !important": 0.5}`
            i_downvoted = my_vote.upvote === false
            var downvote_style = css`opacity: ${i_downvoted ? "1 !important": 0.5}`
        }
        return(
        <>
        <div className="comment">
            <div className="votes">
                <img src={up} css={upvote_style} onClick={()=>{this.props.vote(true, this.props.id)}}/>
                <div>
                    {votes ? votes.filter((v)=>{return v.upvote}).length - votes.filter((v)=>{return !v.upvote}).length : 0}
                </div>
                <img src={up} css={downvote_style} onClick={()=>{this.props.vote(false, this.props.id)}} className="down"/>
            </div>
            <div className="content">
                {this.props.content}
            </div>
            <img onClick={()=>{this.setState({replying: true})}} src={reply} className="reply-btn"/>
        </div>
        <div className="replies">
            {
                this.props.replies.map((r)=>{
                    // console.log(r)
                    // console.log(r.content)
                    return(
                    <div className="reply">{r.content}</div>
                )})
            }
        </div>
        {
            this.state.replying ?
            <div className="reply new-reply">
                <textarea onChange={this.handleChange} value={this.state.reply} placeholder="Reply..."></textarea>
                <Button text="Post" onClick={()=>{this.setState({reply: null, replying: false});this.props.post(this.state.reply, this.props.id)}}/>
            </div>
            :
            null
        }
        </>
    )}
}