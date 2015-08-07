var React = require("react");

module.exports = React.createClass({
    getDefaultProps: function() {
        return {
            name: '',
            lines: [],
            comments: [],
            onCommentFormOpen: function() {},
            onCommentFormCancel: function() {},
            onCommentFormSubmit: function() {}
        };
    },

    render: function() {
        var rows = [];
        var lineCount = this.props.lines.length;

        for (var i=0; i < lineCount; i++) {
            var num = i + 1;

            if (this.props.comments[num] && this.props.comments[num].length > 0) {
                rows.push(<Line key={this.props.name + num}
                                onClick={this.props.onCommentFormOpen}
                                file={this.props.name}
                                number={num}
                                content={this.props.lines[i]}
                                toggle={LineComments.generateNodeId(this.props.name, num)}/>);
                rows.push(<LineComments key={this.props.name + num + 'comments'}
                                        onEditOrReply={this.props.onCommentFormOpen}
                                        onCancel={this.props.onCommentFormCancel}
                                        onSubmit={this.props.onCommentFormSubmit}
                                        file={this.props.name}
                                        number={num}
                                        comments={this.props.comments[num]}/>);
            } else {
                rows.push(<Line key={this.props.name + num}
                                onClick={this.props.onCommentFormOpen}
                                file={this.props.name}
                                number={num}
                                content={this.props.lines[i]}/>);
            }
        }

        return (
            <section className="code-file-container">
                <table id={this.props.name} className="code-file">
                    <tbody>
                        <tr className="spacer line">
                            <td className="line-marker"/>
                            <td className="line-num"/>
                            <td className="line-content"/>
                        </tr>
                        {rows}
                        <tr className="spacer line">
                            <td className="line-marker"/>
                            <td className="line-num"/>
                            <td className="line-content"/>
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
            toggle: false,
            onClick: function() {}
        }
    },

    //Lines only need to rerender when a new file is set.
    shouldComponentUpdate: function(newProps, newState) {
        return this.props.content !== newProps.content ||
               this.props.file !== newProps.file ||
               this.props.toggle !== newProps.toggle;
    },

    render: function() {
        var toggleCol = this.props.toggle ? <td className="line-marker"><CommentToggle toggle={this.props.toggle}/></td> : <td className="line-marker"/>
        return (
            <tr id={this.props.file+"-L"+this.props.number} className="line">
                {toggleCol}
                <td className="line-num">{this.props.number}</td>
                <td className="line-content" onClick={this.props.onClick.bind(null, this.props.file, this.props.number, 0)}>
                    <pre>
                        <code dangerouslySetInnerHTML={{__html: this.props.content}}/>
                    </pre>
                </td>
            </tr>
        );
    }
});

var LineComments = React.createClass({
    statics: {
        generateNodeId: function(filename, number) {
            return filename + "-C" + number;
        }
    },

    getDefaultProps: function() {
        return {
            number: 0,
            file: '',
            comments: [],
            onEditOrReply: function() {},
            onCancel: function() {},
            onSubmit: function() {}
        }
    },

    render: function() {
        var comments = this.props.comments.map(function(comment) {
            return comment.showForm ?
                <CommentForm user={comment.user} text={comment.body} key="comment-form" onCancel={this.props.onCancel} onSubmit={this.props.onSubmit}/> :
                <Comment     user={comment.user} text={comment.body} key={comment.id} onEditOrReply={this.props.onEditOrReply} id={this.props.file+"-L"+this.props.number+"-C"+comment.id}/>;

        }, this);

        return (
            <tr id={LineComments.generateNodeId(this.props.file, this.props.number)} className="line comment-row">
                <td className="line-marker"/>
                <td className="line-num"/>
                <td className="line-comments">{comments}</td>
            </tr>
        );
    }
});

var Comment = React.createClass({
    getDefaultProps: function() {
        return {
            id: '',
            text: '',
            user: null,
            onEditOrReply: function() {}
        };
    },

    //Comments only need to rerender when new text is set.
    shouldComponentUpdate: function(newProps, newState) {
        return this.props.text !== newProps.text;
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
                <a className="avatar pull-left" href={this.props.user.html_url}><img src={this.props.user.avatar_url} alt=""/></a>
                <div className="pull-left content">
                    <header className="comment-header">
                        <a href={this.props.user.html_url}>{this.props.user.login}</a>
                    </header>
                    <form action="#" onSubmit={this.props.onSubmit} className="comment-body">
                        <textarea name="text" placeholder="Enter your comment..." defaultValue={this.props.text}/>
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
            <a href='#' onClick={this.handleClick}>
                <i className={"fa " + this.state.symbolClass + " fa-fw"}/>
            </a>
        );
    }
});