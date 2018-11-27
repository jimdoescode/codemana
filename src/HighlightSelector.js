import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './HighlightSelector.scss';

class HighlightSelector extends Component {
    shouldComponentUpdate(nextProps) {
        return this.props.highlight !== nextProps.highlight;
    }

    render() {
        return (
            <div className="highlight-selector">
                <select value={this.props.highlight} onChange={this.props.onHighlightChange}>
                    <option value="okaidia" >Okaidia Highlighting</option>
                    <option value="twilight">Twilight Highlighting</option>
                    <option value="funky">Funky Highlighting</option>
                    <option value="dark">Dark Highlighting</option>
                </select>
            </div>
        );
    }
}

HighlightSelector.propTypes = {
    highlight: PropTypes.string.isRequired,
    onHighlightChange: PropTypes.func.isRequired
};

export default HighlightSelector;