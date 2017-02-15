const React = require("react");

module.exports = React.createClass({
    propTypes: {
        highlight: React.PropTypes.string.isRequired,
        onHighlightChange: React.PropTypes.func.isRequired
    },

    shouldComponentUpdate: function(nextProps) {
        return this.props.highlight !== nextProps.highlight;
    },

    render: function() {
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
});