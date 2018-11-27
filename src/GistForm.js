import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './vendor-styles/pure-min.scss';

class GistForm extends Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();

        let gistId = event.target.elements.namedItem("gistId").value.trim();
        if (gistId.length > 0) {
            window.location = this.props.origin + "/" + gistId;
        }
    }

    shouldComponentUpdate(newProps, newState) {
        return false;
    }

    render() {
        let body = (
                this.props.showButton ?
                    <fieldset>
                        <input name="gistId" type="text" className="pure-input-1-3" placeholder="Enter a Gist ID..." required/>&nbsp;
                        <button type="submit" className="pure-button button-primary">Go <i className="fa fa-sign-in"/></button>
                    </fieldset>
                :
                    <input className="pure-input-1-3" name="gistId" type="text" placeholder="Enter a Gist ID..." required/>
        );

        return (
            <form className={this.props.className} onSubmit={this.handleSubmit} action="#">{body}</form>
        );
    }
}

GistForm.propTypes = {
    origin: PropTypes.string.isRequired,
    className: PropTypes.string,
    showButton: PropTypes.bool
};

GistForm.defaultProps = {
    className: "",
    showButton: false
};

export default GistForm;