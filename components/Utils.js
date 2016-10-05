var Prism = require("./prism.js");
var Config = require("./Config.js");

var CommentRegex = new RegExp(
    Config.origin.replace(/[\-\[\]\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + "/(.*)#(.+)-L(\d+)"
);

module.exports = {
    tokenizeNewLines: function(str) {
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

    tokenize: function(code, lang) {
        var processed = [];
        var tokens = Prism.tokenize(code, lang);
        var token = tokens.shift();

        while (token) {
            var isObj = typeof token === 'object';
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

    syntaxHighlight: function(code, lang) {
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

    getPrismCodeLanguage: function(gistLang) {
        var lang = gistLang.toLowerCase().replace(/#/, 'sharp').replace(/\+/g, 'p');
        if (Prism.languages[lang])
            return Prism.languages[lang];

        console.log("CodeMana Error - Prism doesn't support the language: " + gistLang + ". Help them and us out by adding it http://prismjs.com/");
        throw ({msg: "CodeMana Error - Prism doesn't support the language: " + gistLang});
    },

    createComment: function(gistId, commentId, filename, lineNumber, commentBody, commentUser, replyTo, showForm) {
        return {
            gistId: gistId,
            id: commentId,
            filename: filename,
            line: parseInt(lineNumber, 10),
            body: commentBody,
            user: commentUser,
            replyTo: replyTo,
            showForm: showForm
        };
    },

    parseComment: function(id, body, user) {
        //Annoyingly I couldn't get a single regex to separate everything out...
        var split = body.match(/(\S+)\s(.*)/);
        var data = split[1].match(CommentRegex);

        return data !== null ? this.createComment(data[1], id, data[2], parseInt(data[3], 10), split[2], user, 0, false) : null;
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
    parseFile: function(content, language, filename) {
        var lines = this.syntaxHighlight(content, language);
        return {name: filename, lines: lines};
    },

    createCommentLink: function(id, filename, lineNumber) {
        return Config.origin+'/'+id+'#'+filename+'-L'+lineNumber;
    }
};