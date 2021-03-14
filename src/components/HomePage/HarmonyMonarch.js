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

  constants: ['True', 'False', 'None', 'inf'],

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
    'for',
    'global',
    'if',
    'import',
    'in', //TODO: only if it follows "for"
    'pass',
    'such that', //TODO: multiple whitespace between the two words allowed
    'try',
    'where',
    'while',
    'with',
  ],

  typeStorages: ['let', 'const', 'def'],

  operatorKeywords: [
    'and',
    'or',
    'in', //TODO: Due to collision with for..in, the linting is wrong when 'in' is an operator
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
      [
        /[a-zA-Z]\w*/,
        {
          cases: {
            '@keywords': 'keyword',
            '@builtInFunctions': 'function.builtin',
            '@constants': 'constant.language',
            '@controlKeywords': 'keyword.control',
            '@operatorKeywords': 'keyword.operator',
            '@typeStorages': 'storage.type',
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
      [/\s+/, 'white'],
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

    // Recognize hex, negatives, decimals, imaginaries, longs, and scientific notation
    numbers: [
      [/-?0x([abcdef]|[ABCDEF]|\d)+[lL]?/, 'number.hex'],
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
  },
}

export default harmonyMonarch
