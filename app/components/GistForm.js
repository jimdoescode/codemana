var React  = require("react");
var Router = require('react-router');

module.exports = React.createClass({
    mixins: [Router.Navigation],

    getDefaultProps: function() {
        return {
            className: "",
            showButton: false
        };
    },

    handleSubmit: function(event) {
        event.preventDefault();

        var gistId = event.target.elements.namedItem("gistId").value.trim();
        if (gistId.length > 0)
            this.transitionTo('gist', {gistId: gistId});
    },

    render: function() {

        var body = (
                this.props.showButton ?
                    <fieldset className="pure-group">
                        <input className="pure-input-1-3" name="gistId" type="text" placeholder="Enter a Gist ID..." required="true"/>&nbsp;
                        <button type="submit" className="pure-button button-primary">Go <i className="fa fa-sign-in"/></button>
                    </fieldset>
                :
                    <input className="pure-input-1-3" name="gistId" type="text" placeholder="Enter a Gist ID..." required="true"/>
        );

        return (
            <form className={this.props.className} onSubmit={this.handleSubmit} action="#">{body}</form>
        );
    }
});

