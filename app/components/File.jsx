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
        var self = this;
        var rows = [];
        var lineCount = self.props.lines.length;

        for (var i=0; i < lineCount; i++) {
            var num = i + 1;

            if (self.props.comments[i+1]) {
                rows.push(<Line key={self.props.name + num} file={self.props.name} number={num} content={self.props.lines[i]} toggle={self.props.name+"-C"+(i + 1)}/>);
                rows.push(<LineComments key={self.props.name + num + 'comments'} file={self.props.name} number={num} comments={self.props.comments[num]}/>);
            } else {
                rows.push(<Line key={self.props.name + num} file={self.props.name} number={num} content={self.props.lines[i]}/>);
            }
        }

        return (
            <section className="code-file-container">
                <table id={self.props.name} className="code-file">
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
        var self = this;
        var toggleCol = self.props.toggle ? <td><CommentToggle toggle={self.props.toggle}/></td> : <td/>
        return (
            <tr id={self.props.file+"-L"+self.props.number} className="line">
                {toggleCol}
                <td className="line-num">{self.props.number}</td>
                <td className="line-content"><pre dangerouslySetInnerHTML={{__html: self.props.content}}/></td>
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
        var self = this;
        return (
            <tr id={self.props.file+"-C"+self.props.number} className="line comment-row">
                <td/>
                <td className="line-num"/>
                <td>
                {
                    self.props.comments.map(function(comment) {
                        return (
                            <div key={comment.id} id={self.props.file+"-L"+self.props.number+"-C"+comment.id} className="line-comment">
                                <a className="avatar pull-left" href={comment.user.html_url}><img src={comment.user.avatar_url} alt=""/></a>
                                <div className="pull-left content">
                                    <header className="comment-header">
                                        <a href={comment.user.html_url}>{comment.user.login}</a>
                                    </header>
                                    <p className="comment-body">{comment.body}</p>
                                </div>
                            </div>
                        );
                    })
                }
                </td>
            </tr>
        );
    }
});

var CommentForm = React.createClass({
    getDefaultProps: function() {
        return {
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
                        <textarea name="comment-body" placeholder="Enter your comment..."></textarea>
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