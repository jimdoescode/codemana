var React = require("react");
var File = require("./File.js");
var Utils = require("./Utils.js");
var Spinner = require("./Spinner.js");
var LoginModal = require("./LoginModal.js");

module.exports = React.createClass({

    propTypes: {
        code: React.PropTypes.shape({
            fetch: React.PropTypes.func,
            fetchComments: React.PropTypes.func,
            commentTemplate: React.PropTypes.object
        }).isRequired,

        user: React.PropTypes.shape({
            login: React.PropTypes.func,
            logout: React.PropTypes.func,
            isLoggedIn: React.PropTypes.func,
            getData: React.PropTypes.func
        }).isRequired,

        style: React.PropTypes.string.isRequired
    },

    getInitialState: function () {
        return {
            files: [],
            comments: [],
            openComment: null,
            showLoginModal: false,
            processing: true
        };
    },

    componentDidMount: function () {
        this.populate();
    },

    componentDidUpdate: function (prevProps, prevState) {
        //If there is a hash specified then attempt to scroll there.
        if (window.location.hash) {
            var elm = document.getElementById(window.location.hash.substring(1));
            if (elm)
                window.scrollTo(0, elm.offsetTop);
        }
    },

    populate: function () {
        var self = this;

        self.props.code.fetch().then(function (files) {
            if (self.isMounted())
                self.setState({files: files, processing: false});
        }).catch(function (message) {
            console.log(message);
            window.alert('There was a problem fetching and or parsing this Gist.');
            self.setState({processing: false});
        });

        self.props.code.fetchComments().then(function (comments) {
            if (self.isMounted())
                self.setState({comments: comments});
        }).catch(function (message) {
            console.log(message);
            window.alert('There was a problem fetching the comments for this Gist.');
        });
    },

    onLoginModalClose: function () {
        this.setState({showLoginModal: false});
    },

    render: function() {
        var body = this.state.processing ?
                    <Spinner/> : this.state.files.map(function(file) {
                        return <File key={file.name}
                                     name={file.name}
                                     lines={file.lines}
                                     comments={this.state.comments[file.name]}/>
                    }, this);

        return (
            <div className={"container main " + this.props.style}>
                <LoginModal user={this.props.user} show={this.state.showLoginModal} onClose={this.onLoginModalClose}/>
                {body}
            </div>
        );
    }
});
