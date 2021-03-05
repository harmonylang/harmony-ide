const harmonyMonarch = {
    defaultToken: '',
    tokenPostfix: '.hny',

    keywords: [
        "all",
        "and",
        "any",
        "as",
        "assert",
        "atLabel",
        "atomic",
        "await",
        "choose",
        "const",
        "contexts",
        "def",
        "del",
        "elif",
        "else",
        "end",
        "except",
        "False",
        "for",
        "from",
        "get_context",
        "go",
        "hash",
        "if",
        "import",
        "in",
        "inf",
        "invariant",
        "keys",
        "lambda",
        "len",
        "let",
        "max",
        "min",
        "None",
        "not",
        "or",
        "pass",
        "print",
        "setintlevel",
        "spawn",
        "stop",
        "trap",
        "try",
        "True",
        "where",
        "while",
        "with"
    ],

    parenFollows: [
		'if', 'for', 'while'
	],

    operators: [
		"and", "or", "=>", "&", "|", "^", "-", "+", "*", "/", "//", "%", "mod",
        "**", "<<", ">>", "==", "!=", "<", "<=", ">", ">=", "and=", "or=", "=>=",
        "&=", "|=", "^=", "-=", "+=", "*=", "/=", "//=", "%=", "mod=", "**=", "<<=",
        ">>=", "..", "->"
	],

    symbols: /[=><!~?:&|+\-*/^%]+/,

    brackets: [
        { open: '{', close: '}', token: 'delimiter.curly' },
        { open: '[', close: ']', token: 'delimiter.bracket' },
        { open: '(', close: ')', token: 'delimiter.parenthesis' }
    ],

    tokenizer: {
        root: [
            { include: '@whitespace' },
            { include: '@numbers' },
            { include: '@strings' },

            [/[,:;]/, 'delimiter'],
            [/[{}[\]()]/, '@brackets'],

            [/@[a-zA-Z]\w*/, 'tag'],
            [/[a-zA-Z]\w*/, {
                cases: {
                    '@keywords': 'keyword',
                    '@default': 'identifier'
                }
            }],
            [/@symbols/, {
				cases: {
					'@operators': 'delimiter',
					'@default': ''
				}
			}],
        ],

        // Deal with white space, including single and multi-line comments
        whitespace: [
            [/\s+/, 'white'],
            [/(^#.*$)/, 'comment'],
            [/('''.*''')|(""".*""")/, 'string'],
            [/'''.*$/, 'string', '@endDocString'],
            [/""".*$/, 'string', '@endDblDocString']
        ],
        endDocString: [
            [/\\'/, 'string'],
            [/.*'''/, 'string', '@popall'],
            [/.*$/, 'string']
        ],
        endDblDocString: [
            [/\\"/, 'string'],
            [/.*"""/, 'string', '@popall'],
            [/.*$/, 'string']
        ],

        // Recognize hex, negatives, decimals, imaginaries, longs, and scientific notation
        numbers: [
            [/-?0x([abcdef]|[ABCDEF]|\d)+[lL]?/, 'number.hex'],
            [/-?(\d*\.)?\d+([eE][+-]?\d+)?[jJ]?[lL]?/, 'number']
        ],

        // Recognize strings, including those broken across lines with \ (but not without)
        strings: [
            [/'$/, 'string.escape', '@popall'],
            [/'/, 'string.escape', '@stringBody'],
            [/"$/, 'string.escape', '@popall'],
            [/"/, 'string.escape', '@dblStringBody']
        ],
        stringBody: [
            [/[^\\']+$/, 'string', '@popall'],
            [/[^\\']+/, 'string'],
            [/\\./, 'string'],
            [/'/, 'string.escape', '@popall'],
            [/\\$/, 'string']
        ],
        dblStringBody: [
            [/[^\\"]+$/, 'string', '@popall'],
            [/[^\\"]+/, 'string'],
            [/\\./, 'string'],
            [/"/, 'string.escape', '@popall'],
            [/\\$/, 'string']
        ]
    }
};

export default harmonyMonarch;