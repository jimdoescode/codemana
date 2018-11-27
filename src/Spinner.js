import React, { Component } from 'react';
import './Spinner.scss';

class Spinner extends Component {
    render() {
        let classes = 'fa ' + this.props.className + ' fa-spin fa-5x';
        return (
            <p className="spinner"><i className={classes}/></p>
        );
    }
}

Spinner.defaultProps = {
    className: 'fa-spinner'
};

export default Spinner;