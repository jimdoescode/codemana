import React, { Component } from 'react';
import { connect } from 'react-redux';

import * as Actions from './Actions.js';
import LoginModal from './LoginModal.js';
import AppHeader from './AppHeader.js';
import AppFooter from './AppFooter.js';

import './App.scss';

class App extends Component {
    constructor(props) {
        super(props);

        // In React components declared as ES6 classes, methods follow the same semantics
        // as regular ES6 classes. This means that they don’t automatically bind this to
        // the instance. You have to explicitly use .bind(this) in the constructor
        this.clickUserStatus = this.clickUserStatus.bind(this);
        this.hideLoginModal = this.hideLoginModal.bind(this);
        this.attemptLogin = this.attemptLogin.bind(this);
    }

    componentWillMount() {
        this.props.dispatch(Actions.fetchStoredUser());
    }

    clickUserStatus(e) {
        e.preventDefault();
        if (this.props.user === null) {
            this.props.dispatch(Actions.showLoginModal());
        } else {
            this.props.dispatch(Actions.userLogout());
        }
    }

    hideLoginModal() {
        this.props.dispatch(Actions.hideLoginModal());
    }

    attemptLogin(username, password) {
        this.props.dispatch(Actions.userLogin(username, password));
    }

    render() {
        return (
            <div className="app">
                <AppHeader origin={this.props.config.origin} user={this.props.user} onClickUserStatus={this.clickUserStatus}/>
                <LoginModal github={this.props.config.github}
                            processing={this.props.processingLogin}
                            show={this.props.displayLoginModal}
                            onClose={this.hideLoginModal}
                            onLogin={this.attemptLogin}/>
                {this.props.children}
                <AppFooter/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        user: state.user.data,
        config: state.config,
        displayLoginModal: state.user.displayLoginModal,
        processingLogin: state.user.isFetching
    }
}

export default connect(mapStateToProps)(App);
