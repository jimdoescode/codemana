import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';

import Spinner from './Spinner.js';

import './LoginModal.scss';
import './vendor-styles/pure-min.scss';

Modal.setAppElement(document.getElementById('root'));

class LoginModal extends Component {
    shouldComponentUpdate(nextProps, nextState) {
        return this.props.processing !== nextProps.processing ||
            this.props.show !== nextProps.show;
    }

    render() {
        var form = (
            <form className="pure-form pure-form-stacked" onSubmit={e => this.props.onLogin(e.target.elements.namedItem("username").value.trim(), e.target.elements.namedItem("password").value)}>
                <fieldset>
                    <input name="username" className="pure-input-1" type="text" placeholder="GitHub User Name..."/>
                    <input name="password" className="pure-input-1" type="password" placeholder="GitHub Access Token..."/>
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
                <p>To leave a comment you need to enter your GitHub user name and GitHub <a target="_blank" rel="noopener noreferrer" href={this.props.github + "/settings/tokens/new?description=CodeMana&scopes=gist"}>personal access token</a>. This is <strong>only</strong> used to post Gist comments to GitHub.</p>
                <hr/>
                { this.props.processing ? <Spinner className="fa-github-alt"/> : form }
            </Modal>
        );
    }
}

LoginModal.propTypes = {
    github: PropTypes.string,
    show: PropTypes.bool.isRequired,
    processing: PropTypes.bool.isRequired,
    onLogin: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
};

LoginModal.defaultProps = {
    github: 'https://github.com',
    show: false,
    processing: false,
    onLogin: function () {},
    onClose: function () {}
};

export default LoginModal;