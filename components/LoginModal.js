const React = require("react");
const Modal = require("react-modal");
const Config = require("./Config.js");

Modal.setAppElement(document.getElementById("mount-point"));

module.exports = React.createClass({

    propTypes: {
        user: React.PropTypes.shape({
            login: React.PropTypes.func,
            logout: React.PropTypes.func,
            isLoggedIn: React.PropTypes.func
        }).isRequired,
        show: React.PropTypes.bool,
        onClose: React.PropTypes.func
    },

    getDefaultProps: function() {
        return {
            show: false,
            onClose: function() {}
        };
    },

    getInitialState: function() {
        return {processing: false};
    },

    attemptLogin: function(event) {
        var username = event.target.elements.namedItem("username").value.trim();
        var password = event.target.elements.namedItem("password").value;
        var store = event.target.elements.namedItem("store").checked;
        var self = this;

        event.preventDefault();

        if (username && password) {
            self.setState({processing: true});
            self.props.user.login(username, password).then(function (user) {
                self.onClose();
            }).catch(function (message) {
                window.alert("Failed to login. Please try again.");
                console.log(message);
                self.setState({processing: false});
            });
        }
    },

    onClose: function() {
        this.setState({processing: false});
        this.props.onClose();
    },

    render: function() {
        var form = (
            <form className="pure-form pure-form-stacked" onSubmit={this.attemptLogin}>
                <fieldset>
                    <input name="username" className="pure-input-1" type="text" placeholder="GitHub User Name..." required="true"/>
                    <input name="password" className="pure-input-1" type="password" placeholder="GitHub Password or Token..." required="true"/>
                    <label><input name="store" type="checkbox"/> Store in Memory</label>
                </fieldset>
                <fieldset>
                    <button type="submit" className="pure-button button-primary"><i className="fa fa-save"/> Save</button>
                    <button className="pure-button button-error" onClick={this.onClose}><i className="fa fa-times-circle"/> Cancel</button>
                </fieldset>
            </form>
        );

        return (
            <Modal isOpen={this.props.show} onRequestClose={this.onClose} className="react-modal-content" overlayClassName="react-modal-overlay">
                <h2><i className="fa fa-github"/> GitHub Access</h2>
                <p>To leave a comment you need to enter your GitHub user name and GitHub password. This is <strong>only</strong> used to post Gist comments to GitHub.</p>
                <p>If you prefer not to enter your password you can use a <a target="_blank" href={Config.github + "/settings/tokens/new"}>personal access token</a>. Make sure it has Gist access.</p>
                <hr/>
                { this.state.processing ? <Spinner className="fa-github-alt"/> : form }
            </Modal>
        );
    }
});