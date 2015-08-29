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
        var tokens = Prism.tokenize(code, lang);
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

    syntaxHighlight: function(code, lang) {
        var lineCount = 0;
        var lines = [''];
        var prismLang = this.getPrismCodeLanguage(lang);
        var tokens = this.tokenize(code, prismLang);
        var token = tokens.shift();

        while (token)
        {
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
        if (Prism.languages[lang]) {
            return Prism.languages[lang];
        }
        console.log("CodeMana Error - Prism doesn't support the language: "+gistLang+". Help them and us out by adding it http://prismjs.com/");
        throw ({msg: "CodeMana Error - Prism doesn't support the language: " + gistLang});
    },

    getUserFromStorage: function(store) {
        return JSON.parse(store.getItem('user'));
    },

    saveUserToStorage: function(user, store) {
        store.setItem('user', JSON.stringify(user));
    }
};