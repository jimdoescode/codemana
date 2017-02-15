var Prism = require("./prism.js");
var Marked = require("marked");
var Config = require("./Config.js");

var CommentRegex = new RegExp(
    "^" + Config.origin.replace(/[\/\-\[\]\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + "\\/(.+)#(.+)-L(\\d+)$"
);

module.exports = {
    timeoutPromise: function (seconds = 10) {
        return new Promise(function (resolve, reject) {
            window.setTimeout(function() {
                reject('request timeout after ' + seconds + ' seconds')
            }, seconds * 1000);
        });
    },

    getRequestHeaders: function (token) {
        var obj = {'Content-Type': 'application/json'};
        if (token)
            obj['Authorization'] = 'Basic ' + token;

        return new Headers(obj);
    },

    tokenizeNewLines: function (str) {
        var tokens = [];
        var strlen = str.length;
        var lineCount = 0;
        for (var i=0; i < strlen; i++) {
            if (tokens[lineCount])
                tokens[lineCount] += str[i];
            else
                tokens[lineCount] = str[i];

            if (str[i] === '\n')
                lineCount++;
        }

        return tokens;
    },

    tokenize: function (code, lang) {
        var processed = [];
        var tokens = Prism.tokenize(code, lang);
        var token = tokens.shift();

        while (token) {
            var isObj = token instanceof Object;

            //Sometimes token content is more tokens. We need to handle that.
            if (isObj && token.content instanceof Array) {
                tokens = token.content.concat(tokens);
                token = tokens.shift();
                continue;
            }

            //If the content is a string then process it as normal
            var lines = this.tokenizeNewLines(isObj ? token.content : token);
            var count = lines.length;
            for (var i=0; i < count; i++) {
                if (isObj)
                    processed.push(new Prism.Token(token.type, Prism.util.encode(lines[i]), token.alias));
                else
                    processed.push(Prism.util.encode(lines[i]));
            }

            token = tokens.shift();
        }
        return processed;
    },

    syntaxHighlight: function (code, lang) {
        var lineCount = 0;
        var lines = [''];
        var prismLang = this.getPrismCodeLanguage(lang);
        var tokens = this.tokenize(code, prismLang);
        var token = tokens.shift();

        while (token) {
            code = (typeof token === 'object') ? Prism.Token.stringify(token, prismLang) : token;
            lines[lineCount] += code.replace(/\n/g, '');
            if (code.indexOf('\n') !== -1)
                lines[++lineCount] = '';

            token = tokens.shift();
        }

        return lines;
    },

    parseLines: function (text) {
        return text.split(/\n/);
    },

    getPrismCodeLanguage: function (gistLang) {
        var lang = gistLang.toLowerCase().replace(/#/, 'sharp').replace(/\+/g, 'p');
        if (Prism.languages[lang])
            return Prism.languages[lang];

        console.log("CodeMana Error - Prism doesn't support the language: " + gistLang + ". Help them and us out by adding it http://prismjs.com/");
        throw ({msg: "CodeMana Error - Prism doesn't support the language: " + gistLang});
    },

    parseGitHubComment: function (comment) {
        return this.parseComment(comment.id, comment.body, this.parseGitHubUser(comment.user), false, false);
    },

    /**
     * Returns a basic comment object.
     * @param id The id of this comment use 0 if it's new
     * @param rawComment The raw text of a comment
     * @param parsedUser The object returned by calling Utils.parseUser.
     * @param isOpen If this is a new comment or an existing one.
     * @param isPosting If this comment is currently being sent out
     * @returns {*}
     */
    parseComment: function (id, rawComment, parsedUser, isOpen, isPosting) {
        var filename = null;
        var body = '';
        var raw = '';
        var line = null;

        //If this is an existing comment then parse the rawComment
        if (!isOpen) {
            //Annoyingly I couldn't get a single regex to separate everything out...
            var split = rawComment.match(/^(\S+)\s([\s\S]+?)$/);
            var data = split[1].match(CommentRegex);

            if (!data)
                return null;

            filename = data[2];
            line = parseInt(data[3], 10);
            //We call dangerouslySetInnerHtml when setting
            //comment body so attempt to sanitize it.
            body = Marked(split[2], {"sanitize":true});
            raw = split[2];
        }

        return {
            id: id,
            fileName: filename,
            lineNumber: line,
            body: body,
            rawBody: raw,
            user: parsedUser,
            isOpen: isOpen,
            isPosting: isPosting
        };
    },

    parseGitHubUser: function (user) {
        return this.parseUser(user.id, user.login, user.html_url, user.avatar_url);
    },

    /**
     * Returns a general user object.
     *
     * @param id
     * @param name
     * @param url
     * @param avatar
     * @returns {{id: *, name: *, htmlUrl: *, avatarUrl: *}}
     */
    parseUser: function (id, name, url, avatar) {
        return {
            id: id,
            name: name,
            htmlUrl: url,
            avatarUrl: avatar
        };
    },

    /**
     * Returns a file object. This requires having a name
     * and lines of syntax highlighted code.
     *
     * @param content
     * @param language
     * @param filename
     * @returns {{name: *, lines: *}}
     */
    parseFile: function (content, language, filename) {
        // Plain text can't be syntax highlighted
        // so just parse the lines and return.
        var lines = (language === 'Text') ?
            this.parseLines(content) :
            this.syntaxHighlight(content, language);

        return {name: filename, lines: lines};
    },

    createCommentLink: function (id, filename, lineNumber) {
        return Config.origin+'/'+id+'#'+filename+'-L'+lineNumber;
    }
};