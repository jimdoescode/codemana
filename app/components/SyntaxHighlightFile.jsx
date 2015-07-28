var React = require("react");
var Prism = require("prismjs");
var BlockToggle = require("./BlockToggle.jsx");

module.exports = React.createClass({
    tokenizeNewLines: function(str) {
        var tokens = [];
        var strlen = str.length;
        var lineCount = 0;
        for (var i=0; i < strlen; i++)
        {
            if (tokens[lineCount])
                tokens[lineCount] += str[i];
            else
                tokens[lineCount] = str[i];

            if (str[i] === '\n')
                lineCount++;
        }

        return tokens;
    },

    tokenize: function(code, lang) {
        var tokens = Prism.tokenize(code, Prism.languages[lang]);
        var processed = [];
        var token = tokens.shift();

        while (token)
        {
            var isObj = typeof token === 'object';
            var lines = this.tokenizeNewLines(isObj ? token.content : token);
            var count = lines.length;
            for (var i=0; i < count; i++)
            {
                if (isObj)
                    processed.push(new Prism.Token(token.type, Prism.util.encode(lines[i]), token.alias));
                else
                    processed.push(Prism.util.encode(lines[i]));
            }

            token = tokens.shift();
        }
        return processed;
    },

    componentWillMount: function() {
        var lang = this.props.lang.toLowerCase();
        var tokens = this.tokenize(this.props.content, lang);
        var lineCount = 0;
        var lines = [''];
        var token = tokens.shift();

        while(token)
        {
            var code = (typeof token === 'object') ? Prism.Token.stringify(token, Prism.languages[lang]) : token;
            lines[lineCount] += code.replace(/\n/g, '');
            if (code.indexOf('\n') !== -1)
                lines[++lineCount] = '';

            token = tokens.shift();
        }

        this.setState({
            lines: lines
        });

    },

    getInitialState: function() {
        return {
            lines: []
        };
    },

    getDefaultProps: function() {
        return {
            lang: '',
            name: '',
            content: '',
            comments: [],
        };
    },

    render: function() {
        var self = this;
        var rows = [];
        var lineCount = self.state.lines.length;

        for (var i=0; i < lineCount; i++) {
            var num = i + 1;

            if (self.props.comments[i+1]) {
                rows.push(<SyntaxHighlightLine key={self.props.name + num} file={self.props.name} number={num} code={self.state.lines[i]} toggle={self.props.name+"-C"+(i + 1)}/>);
                rows.push(<LineComments key={self.props.name + num + 'comments'} file={self.props.name} number={num} comments={self.props.comments[num]}/>);
            } else {
                rows.push(<SyntaxHighlightLine key={self.props.name + num} file={self.props.name} number={num} code={self.state.lines[i]}/>);
            }
        }

        return (
            <section className="code-file-container">
                <table id={self.props.name} className="code-file">
                    <tbody>
                        <tr className="spacer line">
                            <td/>
                            <td className="line-num"/>
                            <td className="line-content">
                                <pre/>
                                <CommentBox/>
                            </td>
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

var SyntaxHighlightLine = React.createClass({
    getDefaultProps: function() {
        return {
            number: 0,
            code: '',
            file: '',
            toggle: false
        }
    },

    lineClick: function(event) {
        var lineNum = this.props.number;
        var commentBox = document.getElementById('comment-box');

        commentBox.style.display = 'none';
        event.preventDefault();


    },

    render: function() {
        var toggleCol = this.props.toggle ? <td><BlockToggle toggle={this.props.toggle}/></td> : <td/>

        return (
            <tr id={this.props.file+"-L"+this.props.number} className="line">
                {toggleCol}
                <td className="line-num">{this.props.number}</td>
                <td onClick={this.lineClick} className="line-content"><pre dangerouslySetInnerHTML={{__html: this.props.code}}/></td>
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

var CommentBox = React.createClass({
    getDefaultProps: function() {
        return {
            handleSubmit: function() {}
        }
    },

    render: function() {
        return (
            <div id="comment-box" style="display: none;">
                <form action="#" onSubmit={this.props.handleSubmit}>
                    <textarea name="comment-body" placeholder="Enter your comment..."/>
                    <input type="submit" className="pure-button pure-button-primary"/>
                </form>
            </div>
        );
    }
});
