import * as monaco from 'monaco-editor'

const PYTHON_KEYWORD = ['and',
  'as',
  'assert',
  'break',
  'class',
  'continue',
  'def',
  'del',
  'elif',
  'else',
  'except',
  'finally',
  'for',
  'from',
  'False',
  'global',
  'if',
  'import',
  'in',
  'is',
  'lambda',
  'nonlocal',
  'not',
  'None',
  'or',
  'pass',
  'raise',
  'return',
  'try',
  'True',
  'while',
  'with',
  'yield']

export default function getSuggestions () {
  const pythonSuggestions = PYTHON_KEYWORD.map(keyword => {
    return {
      label: keyword,
      insertText: keyword,
      kind: monaco.languages.CompletionItemKind.Keyword,
      detail: 'keyword'
    }
  })

  return {
    pythonSuggestions: pythonSuggestions
  }
}
