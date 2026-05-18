/**
 * @enum number
 */
export const State = {
  TopLevelContent: 1,
  InsideDoubleQuoteString: 2,
  InsideSingleQuoteString: 3,
}

export const StateMap = {
  [State.TopLevelContent]: 'TopLevelContent',
  [State.InsideDoubleQuoteString]: 'InsideDoubleQuoteString',
  [State.InsideSingleQuoteString]: 'InsideSingleQuoteString',
}

/**
 * @enum number
 */
export const TokenType = {
  Whitespace: 2,
  Punctuation: 3,
  VariableName: 10,
  LanguageConstant: 13,
  None: 57,
  KeywordControl: 881,
  Numeric: 883,
  FunctionName: 885,
  Keyword: 887,
  Comment: 888,
  PunctuationString: 889,
  String: 890,
  PlainText: 891,
  KeywordOperator: 8887,
}

export const TokenMap = {
  [TokenType.Whitespace]: 'Whitespace',
  [TokenType.Punctuation]: 'Punctuation',
  [TokenType.VariableName]: 'VariableName',
  [TokenType.LanguageConstant]: 'LanguageConstant',
  [TokenType.None]: 'None',
  [TokenType.KeywordControl]: 'KeywordControl',
  [TokenType.Numeric]: 'Numeric',
  [TokenType.FunctionName]: 'Function',
  [TokenType.Keyword]: 'Keyword',
  [TokenType.Comment]: 'Comment',
  [TokenType.PunctuationString]: 'PunctuationString',
  [TokenType.String]: 'String',
  [TokenType.PlainText]: 'PlainText',
  [TokenType.KeywordOperator]: 'KeywordOperator',
}

const RE_WHITESPACE = /^ +/
const RE_NUMERIC = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)/
const RE_WORD = /^[A-Za-z][A-Za-z0-9_-]*/
const RE_PUNCTUATION = /^(?:>=|<=|<>|[(),.;=+\-/*<>:&])/
const RE_INLINE_COMMENT = /^\*>/
const RE_DOUBLE_QUOTE = /^"/
const RE_SINGLE_QUOTE = /^'/
const RE_DOUBLE_QUOTE_ESCAPE = /^""/
const RE_SINGLE_QUOTE_ESCAPE = /^''/
const RE_DOUBLE_QUOTE_CONTENT = /^[^"]+/
const RE_SINGLE_QUOTE_CONTENT = /^[^']+/
const RE_END_PROGRAM = /^end +program\b/i
const RE_FUNCTION_CALL = /^(function)( +)([A-Za-z][A-Za-z0-9_-]*)/i
const RE_PERFORM_TARGET = /^(perform)( +)([A-Za-z0-9][A-Za-z0-9_-]*)\b/i
const RE_THRU_TARGET = /^(thru|through)( +)([A-Za-z0-9][A-Za-z0-9_-]*)\b/i
const RE_ACCESS_MODE = /^(access)( +)(mode)\b/i
const RE_FILE_STATUS = /^(file)( +)(status)\b/i

const languageConstants = new Set(['FALSE', 'NULL', 'NULLS', 'TRUE'])

const figurativeConstants = new Set([
  'HIGH-VALUE',
  'HIGH-VALUES',
  'LOW-VALUE',
  'LOW-VALUES',
  'QUOTE',
  'QUOTES',
  'SPACE',
  'SPACES',
  'ZERO',
  'ZEROES',
  'ZEROS',
])

const keywordControls = new Set([
  'AT',
  'ELSE',
  'END',
  'END-CALL',
  'END-DISPLAY',
  'END-EVALUATE',
  'END-IF',
  'END-PERFORM',
  'END-READ',
  'END-SEARCH',
  'END-START',
  'END-STRING',
  'END-UNSTRING',
  'END-WRITE',
  'EVALUATE',
  'EXIT',
  'FOREVER',
  'GO',
  'GOBACK',
  'IF',
  'INVALID',
  'NEXT',
  'NOT',
  'ON',
  'OTHER',
  'PARAGRAPH',
  'PERFORM',
  'READ',
  'RETURN',
  'RUN',
  'SEARCH',
  'SIZE',
  'START',
  'STOP',
  'THEN',
  'UNTIL',
  'VARYING',
  'WHEN',
])

const keywordOperators = new Set([
  'AND',
  'BY',
  'CONTENT',
  'DESCENDING',
  'EQUAL',
  'FROM',
  'GREATER',
  'IN',
  'INTO',
  'IS',
  'LESS',
  'OF',
  'OR',
  'REFERENCE',
  'THROUGH',
  'THRU',
  'TO',
  'USING',
  'VALUE',
])

const functionNames = new Set([
  'ACCEPT',
  'CLOSE',
  'DISPLAY',
  'ENTRY',
  'MERGE',
  'MOVE',
  'OPEN',
  'ORGANIZATION',
  'PERFORM',
  'PIC',
  'PICTURE',
  'READ',
  'SELECT',
  'SET',
  'SORT',
  'WRITE',
])

const keywords = new Set([
  'ADD',
  'ADDRESS',
  'ADVANCING',
  'AFTER',
  'ALL',
  'ALPHABETIC',
  'ALPHANUMERIC',
  'ASCENDING',
  'ASSIGN',
  'AUTHOR',
  'BACKGROUND-COLOR',
  'BELL',
  'BLANK',
  'CALL',
  'CANCEL',
  'CLOSE',
  'COLUMN',
  'COMP',
  'COMP-3',
  'COMP-5',
  'COMPUTE',
  'CONFIGURATION',
  'CONNECT',
  'COUNT',
  'CURSOR',
  'DATA',
  'DATE',
  'DECLARE',
  'DELETE',
  'DEPENDING',
  'DIVISION',
  'END-EXEC',
  'END-JSON',
  'ENVIRONMENT',
  'ERASE',
  'ERROR',
  'EVERY',
  'EXCEPTION',
  'EXEC',
  'EXTEND',
  'FD',
  'FETCH',
  'FILE',
  'FILE-CONTROL',
  'FIRST',
  'FOREGROUND-COLOR',
  'FUNCTION',
  'GENERATE',
  'GIVING',
  'IDENTIFICATION',
  'INDEXED',
  'INITIALIZE',
  'INPUT',
  'INPUT-OUTPUT',
  'JSON',
  'KEY',
  'LIKE',
  'LINE',
  'LINKAGE',
  'LOCAL-STORAGE',
  'MERGE',
  'MODE',
  'NAME',
  'NO',
  'OCCURS',
  'OPEN',
  'ORGANIZATION',
  'OUTPUT',
  'PIC',
  'PICTURE',
  'POINTER',
  'PROCEDURE',
  'PROGRAM-ID',
  'RECORDING',
  'REDEFINES',
  'REPLACE',
  'REPLACING',
  'RESET',
  'RETURNING',
  'REWRITE',
  'SD',
  'SECTION',
  'SELECT',
  'SEQUENTIAL',
  'SET',
  'SORT',
  'SQL',
  'STATUS',
  'STRING',
  'SUBTRACT',
  'THAN',
  'TIMES',
  'UNSTRING',
  'UPON',
  'VALUE',
  'VALUES',
  'WHENEVER',
  'WITH',
  'WORKING-STORAGE',
  'WRITE',
  'XML',
])

export const initialLineState = {
  state: State.TopLevelContent,
  tokens: [],
}

export const hasArrayReturn = true

export const isEqualLineState = (lineStateA, lineStateB) => {
  return lineStateA.state === lineStateB.state
}

const classifyWord = (value) => {
  const upper = value.toUpperCase()
  if (languageConstants.has(upper)) {
    return TokenType.LanguageConstant
  }
  if (figurativeConstants.has(upper)) {
    return TokenType.Keyword
  }
  if (functionNames.has(upper)) {
    return TokenType.FunctionName
  }
  if (keywordControls.has(upper)) {
    return TokenType.KeywordControl
  }
  if (keywordOperators.has(upper)) {
    return TokenType.KeywordOperator
  }
  if (keywords.has(upper)) {
    return TokenType.Keyword
  }
  return TokenType.VariableName
}

const isCallableTarget = (value) => {
  if (/^\d/.test(value)) {
    return true
  }
  return classifyWord(value) === TokenType.VariableName
}

const pushToken = (tokens, token, length) => {
  if (length > 0) {
    tokens.push(token, length)
  }
}

const tokenizeSequenceArea = (prefix, tokens) => {
  let index = 0
  while (index < prefix.length) {
    const part = prefix.slice(index)
    const whitespaceMatch = part.match(RE_WHITESPACE)
    if (whitespaceMatch) {
      pushToken(tokens, TokenType.Whitespace, whitespaceMatch[0].length)
      index += whitespaceMatch[0].length
      continue
    }
    const numericMatch = part.match(RE_NUMERIC)
    if (numericMatch) {
      pushToken(tokens, TokenType.Numeric, numericMatch[0].length)
      index += numericMatch[0].length
      continue
    }
    pushToken(tokens, TokenType.PlainText, 1)
    index += 1
  }
}

const tokenizeTopLevel = (part, tokens) => {
  if (RE_INLINE_COMMENT.test(part)) {
    pushToken(tokens, TokenType.Comment, part.length)
    return {
      consumed: part.length,
      state: State.TopLevelContent,
    }
  }
  const whitespaceMatch = part.match(RE_WHITESPACE)
  if (whitespaceMatch) {
    pushToken(tokens, TokenType.Whitespace, whitespaceMatch[0].length)
    return {
      consumed: whitespaceMatch[0].length,
      state: State.TopLevelContent,
    }
  }
  const doubleQuoteMatch = part.match(RE_DOUBLE_QUOTE)
  if (doubleQuoteMatch) {
    pushToken(tokens, TokenType.PunctuationString, 1)
    return {
      consumed: 1,
      state: State.InsideDoubleQuoteString,
    }
  }
  const singleQuoteMatch = part.match(RE_SINGLE_QUOTE)
  if (singleQuoteMatch) {
    pushToken(tokens, TokenType.PunctuationString, 1)
    return {
      consumed: 1,
      state: State.InsideSingleQuoteString,
    }
  }
  const endProgramMatch = part.match(RE_END_PROGRAM)
  if (endProgramMatch) {
    pushToken(tokens, TokenType.KeywordControl, endProgramMatch[0].length)
    return {
      consumed: endProgramMatch[0].length,
      state: State.TopLevelContent,
    }
  }
  const functionCallMatch = part.match(RE_FUNCTION_CALL)
  if (functionCallMatch) {
    pushToken(tokens, TokenType.Keyword, functionCallMatch[1].length)
    pushToken(tokens, TokenType.Whitespace, functionCallMatch[2].length)
    pushToken(tokens, TokenType.FunctionName, functionCallMatch[3].length)
    return {
      consumed: functionCallMatch[0].length,
      state: State.TopLevelContent,
    }
  }
  const performTargetMatch = part.match(RE_PERFORM_TARGET)
  if (performTargetMatch && isCallableTarget(performTargetMatch[3])) {
    pushToken(tokens, TokenType.FunctionName, performTargetMatch[1].length)
    pushToken(tokens, TokenType.Whitespace, performTargetMatch[2].length)
    pushToken(tokens, TokenType.FunctionName, performTargetMatch[3].length)
    return {
      consumed: performTargetMatch[0].length,
      state: State.TopLevelContent,
    }
  }
  const thruTargetMatch = part.match(RE_THRU_TARGET)
  if (thruTargetMatch && isCallableTarget(thruTargetMatch[3])) {
    pushToken(tokens, TokenType.KeywordOperator, thruTargetMatch[1].length)
    pushToken(tokens, TokenType.Whitespace, thruTargetMatch[2].length)
    pushToken(tokens, TokenType.FunctionName, thruTargetMatch[3].length)
    return {
      consumed: thruTargetMatch[0].length,
      state: State.TopLevelContent,
    }
  }
  const accessModeMatch = part.match(RE_ACCESS_MODE)
  if (accessModeMatch) {
    pushToken(tokens, TokenType.FunctionName, accessModeMatch[1].length)
    pushToken(tokens, TokenType.Whitespace, accessModeMatch[2].length)
    pushToken(tokens, TokenType.FunctionName, accessModeMatch[3].length)
    return {
      consumed: accessModeMatch[0].length,
      state: State.TopLevelContent,
    }
  }
  const fileStatusMatch = part.match(RE_FILE_STATUS)
  if (fileStatusMatch) {
    pushToken(tokens, TokenType.FunctionName, fileStatusMatch[1].length)
    pushToken(tokens, TokenType.Whitespace, fileStatusMatch[2].length)
    pushToken(tokens, TokenType.FunctionName, fileStatusMatch[3].length)
    return {
      consumed: fileStatusMatch[0].length,
      state: State.TopLevelContent,
    }
  }
  const wordMatch = part.match(RE_WORD)
  if (wordMatch) {
    pushToken(tokens, classifyWord(wordMatch[0]), wordMatch[0].length)
    return {
      consumed: wordMatch[0].length,
      state: State.TopLevelContent,
    }
  }
  const numericMatch = part.match(RE_NUMERIC)
  if (numericMatch) {
    pushToken(tokens, TokenType.Numeric, numericMatch[0].length)
    return {
      consumed: numericMatch[0].length,
      state: State.TopLevelContent,
    }
  }
  const punctuationMatch = part.match(RE_PUNCTUATION)
  if (punctuationMatch) {
    pushToken(tokens, TokenType.Punctuation, punctuationMatch[0].length)
    return {
      consumed: punctuationMatch[0].length,
      state: State.TopLevelContent,
    }
  }
  pushToken(tokens, TokenType.PlainText, 1)
  return {
    consumed: 1,
    state: State.TopLevelContent,
  }
}

const tokenizeInsideDoubleQuoteString = (part, tokens) => {
  const escapedQuoteMatch = part.match(RE_DOUBLE_QUOTE_ESCAPE)
  if (escapedQuoteMatch) {
    pushToken(tokens, TokenType.String, 2)
    return {
      consumed: 2,
      state: State.InsideDoubleQuoteString,
    }
  }
  const closingQuoteMatch = part.match(RE_DOUBLE_QUOTE)
  if (closingQuoteMatch) {
    pushToken(tokens, TokenType.PunctuationString, 1)
    return {
      consumed: 1,
      state: State.TopLevelContent,
    }
  }
  const stringContentMatch = part.match(RE_DOUBLE_QUOTE_CONTENT)
  if (stringContentMatch) {
    pushToken(tokens, TokenType.String, stringContentMatch[0].length)
    return {
      consumed: stringContentMatch[0].length,
      state: State.InsideDoubleQuoteString,
    }
  }
  pushToken(tokens, TokenType.String, 1)
  return {
    consumed: 1,
    state: State.InsideDoubleQuoteString,
  }
}

const tokenizeInsideSingleQuoteString = (part, tokens) => {
  const escapedQuoteMatch = part.match(RE_SINGLE_QUOTE_ESCAPE)
  if (escapedQuoteMatch) {
    pushToken(tokens, TokenType.String, 2)
    return {
      consumed: 2,
      state: State.InsideSingleQuoteString,
    }
  }
  const closingQuoteMatch = part.match(RE_SINGLE_QUOTE)
  if (closingQuoteMatch) {
    pushToken(tokens, TokenType.PunctuationString, 1)
    return {
      consumed: 1,
      state: State.TopLevelContent,
    }
  }
  const stringContentMatch = part.match(RE_SINGLE_QUOTE_CONTENT)
  if (stringContentMatch) {
    pushToken(tokens, TokenType.String, stringContentMatch[0].length)
    return {
      consumed: stringContentMatch[0].length,
      state: State.InsideSingleQuoteString,
    }
  }
  pushToken(tokens, TokenType.String, 1)
  return {
    consumed: 1,
    state: State.InsideSingleQuoteString,
  }
}

export const tokenizeLine = (line, lineState) => {
  let index = 0
  let state = lineState.state
  const tokens = []

  if (state === State.TopLevelContent && line.length >= 7) {
    const prefix = line.slice(0, 6)
    tokenizeSequenceArea(prefix, tokens)
    const indicator = line[6]
    if (
      indicator === '*' ||
      indicator === '/' ||
      indicator === 'D' ||
      indicator === 'd'
    ) {
      pushToken(tokens, TokenType.Comment, line.length - 6)
      return {
        state: State.TopLevelContent,
        tokens,
      }
    }
    if (indicator === ' ') {
      pushToken(tokens, TokenType.Whitespace, 1)
    } else if (indicator === '-') {
      pushToken(tokens, TokenType.Punctuation, 1)
    } else {
      pushToken(tokens, TokenType.PlainText, 1)
    }
    index = 7
  }

  while (index < line.length) {
    const part = line.slice(index)
    let result
    switch (state) {
      case State.TopLevelContent:
        result = tokenizeTopLevel(part, tokens)
        break
      case State.InsideDoubleQuoteString:
        result = tokenizeInsideDoubleQuoteString(part, tokens)
        break
      case State.InsideSingleQuoteString:
        result = tokenizeInsideSingleQuoteString(part, tokens)
        break
      default:
        throw new Error('unknown tokenizer state')
    }
    index += result.consumed
    state = result.state
  }

  return {
    state,
    tokens,
  }
}
