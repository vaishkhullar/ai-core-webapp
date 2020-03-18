import React, { Component } from "react"
import { connect } from "react-redux"
import { css } from "@emotion/core"
/** @jsx jsx */ import { jsx } from '@emotion/core'
import { makePostRequest } from "../../api_calls"

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const co = shuffle([
    'apple',
    'google',
    'facebook',
    'bain & co',
    'deloitte',
    'deliveroo',
    'netflix',
    'nvidia',
    'arm',
    'deepmind',
    'openai',
    'datatonic',
    'mckinsey',
    'quantumblack',
    'ocado',
    'y combinator',
    'microsoft',
])
 
class Companies extends Component {
    
    onChange = (company, update) => {
        // var company = e.target.id
        // var rating = e.target.value
        // console.log('rating', company, rating)

        var company_ratings = this.props.company_ratings
        company_ratings[company] = update
        makePostRequest('app/user/update-info', {company_ratings})
        this.props.rate(company, update)
    }

    render() {
        console.log('cos:', this.props.company_ratings)
        return (
            <div css={css`margin-bottom: 20px`}>
                <div css={css`font-family: var(--font1); font-size: 22px; font-weight: 100; padding: 10px;`}>
                    Let us know what companies you're most interested in
                </div>
                {co.map((c)=>{
                    return <Company 
                        name={c} 
                        rating={Object.keys(this.props.company_ratings).includes(c) ? this.props.company_ratings[c] : null} 
                        onChange={this.onChange}
                    />
                })}
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    console.log('state:', state.user.company_ratings)
    return {
        company_ratings: state.user.company_ratings
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        rate: (company, rating) => {
            dispatch({type: 'RATE_COMPANY', company, rating})
        }
    }
}

export default Companies = connect(mapStateToProps, mapDispatchToProps)(Companies)

class Company extends Component {
    constructor(props) {
        super(props)
    }
 
    onChange = (e) => {
        var update = {[e.target.id]: e.target.value}
        console.log('UPDATE:', update)
        console.log(this.props)
        update = {...this.props.rating, ...update} 
        console.log('UPDATE:', update)
        this.props.onChange(this.props.name, update) 
    }
 
    render() {
        var props = this.props
        var interest = props.rating ? props.rating.interest ? props.rating.interest : null : null
        var understanding = props.rating ? props.rating.understanding ? props.rating.understanding : null : null
        return (
            <div css={style}>
                <div className="title">
                    {props.name.toUpperCase()}
                </div>
                <div className="rating-container">
                    <div className='rating'>
                        <div>
                            <div>
                                Level of interest
                            </div>
                            <div>
                                {interest ? `${interest}/10` : 'unrated'}
                            </div>
                        </div>
                        <input className='slider' type='range' value={interest} min='0' max='10' id='interest' onChange={this.onChange}/>
                    </div>
                    <div className='rating'>
                        <div>
                            <div>
                                Level of understanding 
                            </div>
                            <div>
                                {understanding ? `${understanding}/10` : 'unrated'}
                            </div>
                        </div>
                        <input className='slider' type='range' value={understanding} min='0' max='10' id='understanding' onChange={this.onChange}/>
                    </div>
                </div>
            </div>
        )
    }
}

const style = css`
    background-color: var(--color2);
    border-radius: var(--radius);
    color: var(--color1);
    padding: 10px;
    font-family: var(--font1);
    margin: 5px auto;
    max-width: 650px;
    display: flex;
    flex-direction: column;

    justify-content: space-around;

    .title {
        font-size: 30px;
        font-weight: 1000;
        float: left;
        text-align: left;
    }

    .rating-container {
        display: flex; 
        flex-wrap: wrap;
        justify-content: space-between;
    }

    .rating {
        padding: 10px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        > div {
            display: flex;
            width: 100%;
            > * {
                padding: 10px;
            }
        }

        .slider {
            -webkit-appearance: none;
            width: 200px;
            height: 5px;
            border-radius: 5px;  
            background: black;
            outline: none;
            opacity: 0.7;
            -webkit-transition: .2s;
            transition: opacity .2s;
            margin: 15px 0px;
        }
        
        .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 15px;
            height: 15px;
            border-radius: 50%; 
            background: black;
            cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: black;
            cursor: pointer;
        }
    }

`