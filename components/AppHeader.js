const React = require("react");
const GistForm = require("./GistForm.js");

module.exports = React.createClass({
    propTypes: {
        user: React.PropTypes.shape({
            logout: React.PropTypes.func,
            isLoggedIn: React.PropTypes.func
        }).isRequired,
        origin: React.PropTypes.string
    },

    getDefaultProps: function () {
        return {origin: window.location.origin};
    },

    render: function () {
        return (
            <header className="app-header">
                <nav className="pure-menu pure-menu-horizontal pure-menu-fixed">
                    <div className="container">
                        <Logo className="pure-menu-heading pure-menu-link pull-left" origin={this.props.origin}/>
                        <GistForm className="pure-form pull-left pure-u-2-3"/>
                        <div className="pure-menu-heading pull-right">
                            <UserStatus className="pure-menu-link " user={this.props.user}/>
                        </div>
                    </div>
                </nav>
            </header>
        );
    }
});

const Logo = React.createClass({
    propTypes: {
        origin: React.PropTypes.string.isRequired,
        className: React.PropTypes.string
    },

    getDefaultProps: function () {
        return {className: ''};
    },

    shouldComponentUpdate: function (newProps, newState) {
        return false;
    },

    render: function () {
        return (
            <a className={this.props.className + " logo"} href={this.props.origin}>
                <span>CODE</span><i className="fa fa-flask"/><span>MANA</span>
            </a>
        );
    }
});

const UserStatus = React.createClass({
    propTypes: {
        user: React.PropTypes.shape({
            logout: React.PropTypes.func,
            isLoggedIn: React.PropTypes.func
        }).isRequired,
        className: React.PropTypes.string
    },

    getDefaultProps: function () {
        return {className: ''};
    },

    onLogout: function (e) {
        e.preventDefault();
        this.props.user.logout();
        this.forceUpdate();
    },

    onLogin: function (e) {
        e.preventDefault();

        document.dispatchEvent(
            new CustomEvent('showLoginModal')
        );
    },

    render: function () {
        return this.props.user.isLoggedIn() ?
            <a href="#" className={this.props.className} onClick={this.onLogout}>Logout <i className="fa fa-sign-out"/></a> :
            <a href="#" className={this.props.className} onClick={this.onLogin}><i className="fa fa-github"/> Login</a>;
    }
});