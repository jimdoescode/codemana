import React, { Component } from 'react';
import PropTypes from 'prop-types';

import GistForm from './GistForm.js';

import './AppHeader.scss';
import './vendor-styles/pure-min.scss';

class AppHeader extends Component {
    shouldComponentUpdate(nextProps, nextState) {
        return this.props.user !== nextProps.user;
    }

    render() {
        let userStatus = this.props.user ?
            <button className="pure-menu-link button-link" onClick={this.props.onClickUserStatus}>Logout <i className="fa fa-sign-out" aria-hidden="true"/></button> :
            <button className="pure-menu-link button-link" onClick={this.props.onClickUserStatus}><i className="fa fa-github" aria-hidden="true"/> Login</button>;

        return (
            <header className="app-header">
                <nav className="pure-menu pure-menu-horizontal pure-menu-fixed">
                    <div className="container">
                        <a className="pure-menu-heading pure-menu-link pull-left logo" href={this.props.origin}>
                            <span>CODE</span><i className="fa fa-flask" aria-hidden="true"/><span>MANA</span>
                        </a>
                        <GistForm origin={this.props.origin} className="pure-form pull-left pure-u-2-3"/>
                        <div className="pure-menu-heading pull-right">{userStatus}</div>
                    </div>
                </nav>
            </header>
        );
    }
}

AppHeader.propTypes = {
    user: PropTypes.object,
    origin: PropTypes.string,
    onClickUserStatus: PropTypes.func,
};

AppHeader.defaultProps = {
    user: null,
    origin: window.location.origin,
    onClickUserStatus: function () {}
};

export default AppHeader;