var React = require("react");

module.exports = React.createClass({
    getDefaultProps: function() {
        return {
            name: '',
            lines: [],
            comments: [],
        };
    },

    render: function() {
        var rows = [];
        var lineCount = this.props.lines.length;

        for (var i=0; i < lineCount; i++) {
            var num = i + 1;

            if (this.props.comments[i+1]) {
                rows.push(<Line key={this.props.name + num} file={this.props.name} number={num} content={this.props.lines[i]} toggle={this.props.name+"-C"+(i + 1)}/>);
                rows.push(<LineComments key={this.props.name + num + 'comments'} file={this.props.name} number={num} comments={this.props.comments[num]}/>);
            } else {
                rows.push(<Line key={this.props.name + num} file={this.props.name} number={num} content={this.props.lines[i]}/>);
            }
        }

        return (
            <section className="code-file-container">
                <table id={this.props.name} className="code-file">
                    <tbody>
                        <tr className="spacer line">
                            <td/>
                            <td className="line-num"/>
                            <td className="line-content"><pre/></td>
                        </tr>
                        {rows}
                        <tr className="spacer line">
                            <td/>
                            <td className="line-num"/>
                            <td className="line-content"><pre/></td>
                        </tr>
                    </tbody>
                </table>
            </section>
        );
    }
});

var Line = React.createClass({
    getDefaultProps: function() {
        return {
            number: 0,
            content: '',
            file: '',
            toggle: false
        }
    },

    render: function() {
        var toggleCol = this.props.toggle ? <td><CommentToggle toggle={this.props.toggle}/></td> : <td/>
        return (
            <tr id={this.props.file+"-L"+this.props.number} className="line">
                {toggleCol}
                <td className="line-num">{this.props.number}</td>
                <td className="line-content"><pre dangerouslySetInnerHTML={{__html: this.props.content}}/></td>
            </tr>
        );
    }
});

var LineComments = React.createClass({
    getDefaultProps: function() {
        return {
            number: 0,
            file: '',
            comments: []
        }
    },

    render: function() {
        return (
            <tr id={this.props.file+"-C"+this.props.number} className="line comment-row">
                <td/>
                <td className="line-num"/>
                <td>
                {
                    this.props.comments.map(function(comment) {
                        return (
                            <Comment key={comment.id} id={this.props.file+"-L"+this.props.number+"-C"+comment.id} user={comment.user} text={comment.body}/>
                        );
                    }.bind(this))
                }
                </td>
            </tr>
        );
    }
});

var Comment = React.createClass({
    getDefaultProps: function() {
        return {
            id: '',
            text: '',
            user: null
        };
    },

    render: function() {
        return (
            <div className="line-comment">
                <a className="avatar pull-left" href={this.props.user.html_url}><img src={this.props.user.avatar_url} alt=""/></a>
                <div className="pull-left content">
                    <header className="comment-header">
                        <a href={this.props.user.html_url}>{this.props.user.login}</a>
                    </header>
                    <p className="comment-body">{this.props.text}</p>
                </div>
            </div>
        );
    }
});

var CommentForm = React.createClass({
    getDefaultProps: function() {
        return {
            text: '',
            user: null,
            onSubmit: function() {},
            onCancel: function() {}
        }
    },

    render: function() {
        return (
            <div className="line-comment">
                <a className="avatar pull-left" href="#"><img src="" alt=""/></a>
                <div className="pull-left content">
                    <form action="#" onSubmit={this.props.onSubmit} className="comment-body">
                        <textarea name="comment-body" placeholder="Enter your comment...">{this.props.text}</textarea>
                        <button type="submit" className="pure-button button-primary">
                            <i className="fa fa-comment"/> Comment
                        </button>
                        <button type="button" className="pure-button button-error" onClick={this.props.onCancel}>
                            <i className="fa fa-times-circle"/> Cancel
                        </button>
                    </form>
                </div>
            </div>
        );
    }
});

var CommentToggle = React.createClass({
    getInitialState: function() {
        return {
            display: 'none',
            symbolClass: this.props.closeIcon
        };
    },

    getDefaultProps: function() {
        return {
            toggle: '',
            closeIcon: 'fa-comment-o fa-flip-horizontal',
            openIcon: 'fa-comment fa-flip-horizontal'
        };
    },

    handleClick: function(event) {
        var elm = document.getElementById(this.props.toggle);
        var display = elm.style.display;

        event.preventDefault();
        elm.style.display = this.state.display;

        this.setState({
            symbolClass: display === 'none' ? this.props.closeIcon : this.props.openIcon,
            display: display
        });
    },

    render: function() {
        return (
            <a href='#' onClick={this.handleClick}><i className={"fa " + this.state.symbolClass + " fa-fw"}/></a>
        );
    }
});