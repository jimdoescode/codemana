var Prism = require("./Prism.js");

module.exports = {
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
        var processed = [];

        if (Prism.languages[lang]) {
            var tokens = Prism.tokenize(code, Prism.languages[lang]);
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
        }
        return processed;
    },

    syntaxHighlight: function(code, lang) {
        var lineCount = 0;
        var lines = [''];
        var tokens = this.tokenize(code, lang.toLowerCase());
        var token = tokens.shift();

        while (token)
        {
            code = (typeof token === 'object') ? Prism.Token.stringify(token, Prism.languages[lang.toLowerCase()]) : token;
            lines[lineCount] += code.replace(/\n/g, '');
            if (code.indexOf('\n') !== -1)
                lines[++lineCount] = '';

            token = tokens.shift();
        }

        return lines;
    },

    getUserFromStorage: function(store) {
        return JSON.parse(store.getItem('user'));
    },

    saveUserToStorage: function(user, store) {
        store.setItem('user', JSON.stringify(user));
    }
};