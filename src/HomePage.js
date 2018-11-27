import React, { Component } from 'react';
import { connect } from 'react-redux';

import GistForm from './GistForm.js';

import './HomePage.scss';
import './vendor-styles/pure-min.scss';

class HomePage extends Component {
    shouldComponentUpdate() {
        return false;
    }

    render() {
        return (
            <div className="container main">
                <section className="hero">
                    <h1>
                        <div className="fa fa-flask fa-3x"/>
                        <p>Up your Gist magic <i className="fa fa-magic"/></p>
                    </h1>
                    <p>
                        Code Mana lets you comment in line on your Gists, simply click the line you want to talk about.
                        It works entirely in your browser, only calling GitHub to post comments and retrieve Gists.
                    </p>
                    <p>
                        If you're curious <a href="https://github.com/jimdoescode/codemana">peruse the code</a>. It's comprised mostly of React components.
                    </p>
                    <GistForm origin={this.props.origin} className="pure-form" showButton={true}/>
                </section>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        origin: state.config.origin
    }
}

export default connect(mapStateToProps)(HomePage);