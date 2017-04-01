const React = require("react");
const Modal = require("react-modal");
const Spinner = require("./Spinner.js");

Modal.setAppElement(document.getElementById("mount-point"));

module.exports = React.createClass({

    propTypes: {
        github: React.PropTypes.string,
        show: React.PropTypes.bool.isRequired,
        processing: React.PropTypes.bool.isRequired,
        onLogin: React.PropTypes.func.isRequired,
        onClose: React.PropTypes.func.isRequired
    },

    getDefaultProps: function() {
        return {
            github: 'https://github.com',
            show: false,
            processing: false,
            onLogin: function () {},
            onClose: function () {}
        };
    },

    render: function() {
        var form = (
            <form className="pure-form pure-form-stacked" onSubmit={e => this.props.onLogin(e.target.elements.namedItem("username").value.trim(), e.target.elements.namedItem("password").value)}>
                <fieldset>
                    <input name="username" className="pure-input-1" type="text" placeholder="GitHub User Name..."/>
                    <input name="password" className="pure-input-1" type="password" placeholder="GitHub Password or Token..."/>
                </fieldset>
                <fieldset className="buttons">
                    <button type="submit" className="pure-button button-primary"><i className="fa fa-save" aria-hidden="true"/> Save</button>
                    <button className="pure-button button-error" onClick={this.props.onClose}><i className="fa fa-times-circle" aria-hidden="true"/> Cancel</button>
                </fieldset>
            </form>
        );

        return (
            <Modal contentLabel="Modal" isOpen={this.props.show} onRequestClose={this.props.onClose} className="react-modal-content" overlayClassName="react-modal-overlay">
                <h2><i className="fa fa-github"/> GitHub Access</h2>
                <p>To leave a comment you need to enter your GitHub user name and GitHub password. This is <strong>only</strong> used to post Gist comments to GitHub.</p>
                <p>
                    If you prefer not to enter your password you can use a <a target="_blank" href={this.props.github + "/settings/tokens/new?description=CodeMana&scopes=gist"}>personal access token</a>.
                    <br/><i className="fa fa-asterisk" aria-hidden="true"/>Make sure it has Gist access.
                </p>
                <hr/>
                { this.props.processing ? <Spinner className="fa-github-alt"/> : form }
            </Modal>
        );
    }
});