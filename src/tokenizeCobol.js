/**
 * @enum number
 */
export const State = {
  TopLevelContent: 1,
  AfterInclude: 2,
  InsideLineComment: 3,
  InsideDoubleQuoteString: 4,
  InsideBlockComment: 5,
}

export const StateMap = {
  [State.TopLevelContent]: 'TopLevelContent',
  [State.AfterInclude]: 'AfterInclude',
  [State.InsideLineComment]: 'InsideLineComment',
  [State.InsideDoubleQuoteString]: 'InsideDoubleQuoteString',
}

/**
 * @enum number
 */
export const TokenType = {
  Whitespace: 2,
  Punctuation: 3,
  CurlyOpen: 6,
  CurlyClose: 7,
  PropertyColon: 8,
  VariableName: 10,
  None: 57,
  Unknown: 881,
  Numeric: 883,
  NewLine: 884,
  Include: 885,
  Import: 886,
  Keyword: 887,
  Comment: 888,
  PunctuationString: 889,
  String: 890,
  PlainText: 891,
  KeywordImport: 215,
  KeywordControl: 881,
  KeywordModifier: 882,
  KeywordReturn: 883,
  KeywordNew: 884,
  FunctionName: 885,
  KeywordThis: 886,
  KeywordOperator: 8887,
  KeywordFunction: 8889,
  Class: 8890,
  KeywordVoid: 8891,
  LanguageConstant: 13,
}

export const TokenMap = {
  [TokenType.Whitespace]: 'Whitespace',
  [TokenType.Punctuation]: 'Punctuation',
  [TokenType.CurlyOpen]: 'Punctuation',
  [TokenType.PropertyColon]: 'Punctuation',
  [TokenType.VariableName]: 'VariableName',
  [TokenType.None]: 'None',
  [TokenType.Unknown]: 'Unknown',
  [TokenType.Numeric]: 'Numeric',
  [TokenType.NewLine]: 'NewLine',
  [TokenType.Include]: 'Include',
  [TokenType.Import]: 'Import',
  [TokenType.Keyword]: 'Keyword',
  [TokenType.Comment]: 'Comment',
  [TokenType.PunctuationString]: 'PunctuationString',
  [TokenType.String]: 'String',
  [TokenType.PlainText]: 'PlainText',
  [TokenType.KeywordImport]: 'KeywordImport',
  [TokenType.KeywordControl]: 'KeywordControl',
  [TokenType.KeywordModifier]: 'KeywordModifier',
  [TokenType.KeywordReturn]: 'KeywordReturn',
  [TokenType.KeywordNew]: 'KeywordNew',
  [TokenType.FunctionName]: 'Function',
  [TokenType.KeywordThis]: 'KeywordThis',
  [TokenType.KeywordOperator]: 'KeywordOperator',
  [TokenType.KeywordFunction]: 'KeywordFunction',
  [TokenType.KeywordVoid]: 'KeywordVoid',
  [TokenType.Class]: 'Class',
  [TokenType.LanguageConstant]: 'LanguageConstant',
}

const RE_SELECTOR = /^[\.a-zA-Z\d\-\:>]+/
const RE_WHITESPACE = /^ +/
const RE_CURLY_OPEN = /^\{/
const RE_CURLY_CLOSE = /^\}/
const RE_PROPERTY_NAME = /^[a-zA-Z\-]+\b/
const RE_COLON = /^:/
const RE_PROPERTY_VALUE = /^[^;]+/
const RE_SEMICOLON = /^;/
const RE_COMMA = /^,/
const RE_ANYTHING = /^.+/s
const RE_NUMERIC = /^(([0-9]+\.?[0-9]*)|(\.[0-9]+))/
const RE_ANYTHING_UNTIL_CLOSE_BRACE = /^[^\}]+/
const RE_INCLUDE = /^#include\b/
const RE_IMPORT = /^<[^>]*>/
const RE_KEYWORD =
  /^(?:while|volatile|void|unsigned|union|typedef|switch|struct|static|sizeof|signed|short|return|register|long|int|if|goto|for|float|extern|enum|else|double|do|default|continue|const|char|case|break|auto)\b/

const RE_LINE_COMMENT_START = /^\/\//
const RE_ANYTHING_UNTIL_END = /^.+/s
const RE_VARIABLE_NAME = /^[a-zA-Z][a-zA-Z\d\_]*/
const RE_PUNCTUATION = /^[\(\)=\+\-><\.:\/\{\};,\[\]\*]/
const RE_DOUBLE_QUOTE = /^"/
const RE_STRING_DOUBLE_QUOTE_CONTENT = /^[^"]+/
const RE_BLOCK_COMMENT_START = /^\/\*/
const RE_BLOCK_COMMENT_CONTENT = /^.+?(?=\*\/)/
const RE_BLOCK_COMMENT_END = /^\*\//
const RE_SLASH = /^\//

export const initialLineState = {
  state: State.TopLevelContent,
  tokens: [],
}

export const hasArrayReturn = true

export const isEqualLineState = (lineStateA, lineStateB) => {
  return lineStateA.state === lineStateB.state
}

/**
 * @param {string} line
 */
export const tokenizeLine = (line, lineState) => {
  let next = null
  let index = 0
  let tokens = []
  let token = TokenType.None
  let state = lineState.state
  while (index < line.length) {
    const part = line.slice(index)
    switch (state) {
      case State.TopLevelContent:
        if ((next = part.match(RE_KEYWORD))) {
          switch (next[0]) {
            case 'true':
            case 'false':
            case 'null':
              token = TokenType.LanguageConstant
              state = State.TopLevelContent
              break
            case 'as':
            case 'switch':
            case 'default':
            case 'case':
            case 'else':
            case 'if':
            case 'break':
            case 'throw':
            case 'for':
            case 'try':
            case 'catch':
            case 'finally':
            case 'continue':
            case 'while':
            case 'goto':
              token = TokenType.KeywordControl
              state = State.TopLevelContent
              break
            case 'return':
              token = TokenType.KeywordReturn
              state = State.TopLevelContent
              break
            case 'of':
              token = TokenType.KeywordOperator
              state = State.TopLevelContent
              break
            case 'void':
              token = TokenType.KeywordVoid
              state = State.TopLevelContent
              break
            default:
              token = TokenType.Keyword
              state = State.TopLevelContent
              break
          }
        } else if ((next = part.match(RE_WHITESPACE))) {
          token = TokenType.Whitespace
          state = State.TopLevelContent
        } else if ((next = part.match(RE_VARIABLE_NAME))) {
          token = TokenType.VariableName
          state = State.TopLevelContent
        } else if ((next = part.match(RE_DOUBLE_QUOTE))) {
          token = TokenType.PunctuationString
          state = State.InsideDoubleQuoteString
        } else if ((next = part.match(RE_INCLUDE))) {
          token = TokenType.Include
          state = State.AfterInclude
        } else if ((next = part.match(RE_SLASH))) {
          if ((next = part.match(RE_BLOCK_COMMENT_START))) {
            token = TokenType.Comment
            state = State.InsideBlockComment
          } else if ((next = part.match(RE_LINE_COMMENT_START))) {
            token = TokenType.Comment
            state = State.InsideLineComment
          } else {
            next = part.match(RE_SLASH)
            token = TokenType.Punctuation
            state = State.TopLevelContent
          }
        } else if ((next = part.match(RE_PUNCTUATION))) {
          token = TokenType.Punctuation
          state = State.TopLevelContent
        } else if ((next = part.match(RE_NUMERIC))) {
          token = TokenType.Numeric
          state = State.TopLevelContent
        } else if ((next = part.match(RE_ANYTHING_UNTIL_END))) {
          token = TokenType.PlainText
          state = State.TopLevelContent
        } else {
          part //?
          throw new Error('no')
        }
        break
      case State.AfterInclude:
        if ((next = part.match(RE_WHITESPACE))) {
          token = TokenType.Whitespace
          state = State.AfterInclude
        } else if ((next = part.match(RE_DOUBLE_QUOTE))) {
          token = TokenType.PunctuationString
          state = State.InsideDoubleQuoteString
        } else if ((next = part.match(RE_IMPORT))) {
          token = TokenType.Import
          state = State.TopLevelContent
        } else {
          throw new Error('no')
        }
        break
      case State.InsideLineComment:
        if ((next = part.match(RE_ANYTHING_UNTIL_END))) {
          token = TokenType.Comment
          state = State.TopLevelContent
        } else {
          throw new Error('no')
        }
        break
      case State.InsideDoubleQuoteString:
        if ((next = part.match(RE_STRING_DOUBLE_QUOTE_CONTENT))) {
          token = TokenType.String
          state = State.InsideDoubleQuoteString
        } else if ((next = part.match(RE_DOUBLE_QUOTE))) {
          token = TokenType.PunctuationString
          state = State.TopLevelContent
        } else {
          throw new Error('no')
        }
        break
      case State.InsideBlockComment:
        if ((next = part.match(RE_BLOCK_COMMENT_END))) {
          token = TokenType.Comment
          state = State.TopLevelContent
        } else if ((next = part.match(RE_BLOCK_COMMENT_CONTENT))) {
          token = TokenType.Comment
          state = State.InsideBlockComment
        } else if ((next = part.match(RE_ANYTHING_UNTIL_END))) {
          token = TokenType.Comment
          state = State.InsideBlockComment
        } else {
          throw new Error('no')
        }
        break
      default:
        throw new Error('no')
    }
    const tokenLength = next[0].length
    index += tokenLength
    tokens.push(token, tokenLength)
  }
  return {
    state,
    tokens,
  }
}
