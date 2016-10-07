const React  = require("react");
const Config = require("./Config.js");

module.exports = React.createClass({
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
            window.location = Config.origin + "/" + gistId;
    },

    render: function() {

        var body = (
                this.props.showButton ?
                    <fieldset>
                        <input name="gistId" type="text" className="pure-input-1-3" placeholder="Enter a Gist ID..." required="true"/>&nbsp;
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

