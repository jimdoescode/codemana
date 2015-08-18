var React = require("react");

module.exports = React.createClass({
    getDefaultProps: function() {
        return {
            className: 'fa-spinner'
        };
    },

    render: function() {
        var classes = 'fa ' + this.props.className + ' fa-spin fa-5x';
        return (
            <p className="spinner"><i className={classes}/></p>
        );
    }
});