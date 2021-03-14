const harmonyMonarch = {
  defaultToken: '',
  tokenPostfix: '.hny',

  keywords: ['contexts', 'end', 'get_context', 'invariant', 'lambda', 'print'],

  builtInFunctions: [
    'all',
    'any',
    'atLabel',
    'choose',
    'go',
    'hash',
    'keys',
    'len',
    'max',
    'min',
    'nametag',
    'setintLevel',
    'spawn',
    'stop',
    'trap',
  ],

  reservedVars: ['result'],

  constants: ['True', 'False', 'None', 'inf'],

  typeStorages: ['let', 'const'],

  controlKeywords: [
    'as', //TODO: as in "except Exception as e:"
    'assert',
    'atomic',
    'await',
    'break',
    'continue',
    'del',
    'elif',
    'else',
    'except',
    'finally',
    'from',
    'global',
    'if',
    'import',
    'pass',
    'try',
    'where',
    'while',
    'with',
  ],

  operatorKeywords: [
    'and',
    'or',
    'in',
    'not',
    '=>',
    '&',
    '|',
    '^',
    '-',
    '+',
    '*',
    '/',
    '//',
    '%',
    'mod',
    '**',
    '<<',
    '>>',
    '==',
    '!=',
    '<',
    '<=',
    '>',
    '>=',
    'and=',
    'or=',
    '=>=',
    '&=',
    '|=',
    '^=',
    '-=',
    '+=',
    '*=',
    '/=',
    '//=',
    '%=',
    'mod=',
    '**=',
    '<<=',
    '>>=',
    '..',
    '->',
  ],

  symbols: /[=><!~?:&|+\-*/^%]+/,

  brackets: [
    { open: '{', close: '}', token: 'delimiter.curly' },
    { open: '[', close: ']', token: 'delimiter.bracket' },
    { open: '(', close: ')', token: 'delimiter.parenthesis' },
  ],

  tokenizer: {
    root: [
      { include: '@whitespace' },
      { include: '@numbers' },
      { include: '@strings' },

      [/[,:;]/, 'delimiter'],
      [/[{}[\]()]/, '@brackets'],
      [/@[a-zA-Z]\w*/, 'tag'],
      [/\bdef\b/, 'storage.type', '@funcDecl'],
      [/\bfor\b/, 'keyword.control', '@forStmts'],
      [/\bsuch\b\s+\bthat\b/, 'keyword.control'],
      [
        /[a-zA-Z]\w*/,
        {
          cases: {
            '@keywords': 'keyword',
            '@builtInFunctions': 'function.builtin',
            '@constants': 'constant.language',
            '@typeStorages': 'storage.type',
            '@reservedVars': 'variable.language.special',
            '@controlKeywords': 'keyword.control',
            '@operatorKeywords': 'keyword.operator',
            '@default': 'identifier',
          },
        },
      ],
      [
        /@symbols/,
        {
          cases: {
            '@operatorKeywords': 'keyword.operator',
            '@default': '',
          },
        },
      ],
    ],

    // Deal with white space, including single and multi-line comments
    whitespace: [
      [/\s+/, ''],
      [/(^#.*$)/, 'comment'],
      [/('''.*''')|(""".*""")/, 'string'],
      [/'''.*$/, 'string', '@endDocString'],
      [/""".*$/, 'string', '@endDblDocString'],
    ],
    endDocString: [
      [/\\'/, 'string'],
      [/.*'''/, 'string', '@popall'],
      [/.*$/, 'string'],
    ],
    endDblDocString: [
      [/\\"/, 'string'],
      [/.*"""/, 'string', '@popall'],
      [/.*$/, 'string'],
    ],

    // Recognize hex, octal, binary, negatives, decimals, imaginaries, longs, and scientific notation
    numbers: [
      [/-?0[xX]([abcdef]|[ABCDEF]|\d)+[lL]?/, 'number.hex'],
      [/-?0[oO]([0-7])+[lL]?/, 'number.octal'],
      [/-?0[bB]([01])+[lL]?/, 'number.bin'],
      [/-?(\d*\.)?\d+([eE][+-]?\d+)?[jJ]?[lL]?/, 'number'],
    ],

    // Recognize strings, including those broken across lines with \ (but not without)
    strings: [
      [/'$/, 'string.escape', '@popall'],
      [/'/, 'string.escape', '@stringBody'],
      [/"$/, 'string.escape', '@popall'],
      [/"/, 'string.escape', '@dblStringBody'],
    ],
    stringBody: [
      [/[^\\']+$/, 'string', '@popall'],
      [/[^\\']+/, 'string'],
      [/\\./, 'string'],
      [/'/, 'string.escape', '@popall'],
      [/\\$/, 'string'],
    ],
    dblStringBody: [
      [/[^\\"]+$/, 'string', '@popall'],
      [/[^\\"]+/, 'string'],
      [/\\./, 'string'],
      [/"/, 'string.escape', '@popall'],
      [/\\$/, 'string'],
    ],

    funcDecl: [
      [/\s+/, ''],
      [/(([a-zA-Z]|_)\w*)/, 'entity.name.function'],
      [/\(/, '@brackets', '@funcParams'],
    ],

    funcParams: [
      [/\s+/, ''],
      [/([a-zA-Z]|_\w*)/, 'variable.parameter.function'],
      [/,/, ''],
      [/\)/, '@brackets', '@popall'],
    ],

    forStmts: [
      [/\s+/, ''],
      [/(([a-zA-Z]|_)\w*)/, 'identifier', '@endForStmts'],
    ],

    endForStmts: [
      [/\s+/, ''],
      [/\bin\b/, 'keyword.control', '@popall'],
    ],
  },
}

export default harmonyMonarch
