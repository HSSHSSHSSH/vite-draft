export enum TokenType {
  // let
  Let = "Let",
  // =
  Assign = "Assign",
  // function
  Function = "Function",
  // 变量名
  Identifier = "Identifier",
  // (
  LeftParen = "LeftParen",
  // )
  RightParen = "RightParen",
  // {
  LeftCurly = "LeftCurly",
  // }
  RightCurly = "RightCurly",
}

export type Token = {
  type: TokenType;
  value?: string;
  start: number;
  end: number;
  raw?: string;
};

const TOKENS_GENERATOR: Record<string, (...args: any[]) => Token> = {
  let(start: number) {
    return { type: TokenType.Let, value: "let", start, end: start + 3 };
  },
  assign(start: number) {
    return { type: TokenType.Assign, value: "=", start, end: start + 1 };
  },
  function(start: number) {
    return {
      type: TokenType.Function,
      value: "function",
      start,
      end: start + 8,
    };
  },
  leftParen(start: number) {
    return { type: TokenType.LeftParen, value: "(", start, end: start + 1 };
  },
  rightParen(start: number) {
    return { type: TokenType.RightParen, value: ")", start, end: start + 1 };
  },
  leftCurly(start: number) {
    return { type: TokenType.LeftCurly, value: "{", start, end: start + 1 };
  },
  rightCurly(start: number) {
    return { type: TokenType.RightCurly, value: "}", start, end: start + 1 };
  },
  identifier(start: number, value: string) {
    return {
      type: TokenType.Identifier,
      value,
      start,
      end: start + value.length,
    };
  },
}

type SingleCharTokens = "(" | ")" | "{" | "}" | "=";

// 单字符到 Token 生成器的映射
const KNOWN_SINGLE_CHAR_TOKENS = new Map<
  SingleCharTokens,
  typeof TOKENS_GENERATOR[keyof typeof TOKENS_GENERATOR]
>([
  ["(", TOKENS_GENERATOR.leftParen],
  [")", TOKENS_GENERATOR.rightParen],
  ["{", TOKENS_GENERATOR.leftCurly],
  ["}", TOKENS_GENERATOR.rightCurly],
  ["=", TOKENS_GENERATOR.assign],
]);

export class Tokenizer {
  private _tokens: Token[] = [];
  private _currentIndex: number = 0
  private _source: string
  constructor(source: string) {
    this._source = source
  }

  tokenize(): Token[] { // 扫描字符
    const isAlpha = (char: string): boolean => {
      return (char >= "a" && char <= "z") || (char >= "A" && char <= "Z");
    }
    while(this._currentIndex < this._source.length) {
      let currentChar = this._source[this._currentIndex]
      const startIndex = this._currentIndex
      // 当前字符为分隔符，如空格，跳过
      // 处理空格
      if(currentChar === ' ') {
        this._currentIndex++
        continue
      } else if (isAlpha(currentChar)) {
        // 当前字符为母，继续扫描获取完整单词
        let identifier = '' // 拼接完整单词
        while(isAlpha(currentChar)) { // 扫描完整单词
          identifier += currentChar
          this._currentIndex++
          currentChar = this._source[this._currentIndex]
        }
        let token: Token
        if(identifier in TOKENS_GENERATOR) { // 是一个关键字
          token = TOKENS_GENERATOR[identifier](startIndex)
        } else { // 普通标识符
          token = TOKENS_GENERATOR.identifier(startIndex, identifier)
        }
        this._tokens.push(token)
        continue
      } else if (KNOWN_SINGLE_CHAR_TOKENS.has(currentChar as SingleCharTokens)) {
        // 当前字符为单字符，如 {、 }、 （、）,新建单字符对应的 token
        const token = KNOWN_SINGLE_CHAR_TOKENS.get(currentChar as SingleCharTokens)!(startIndex)
        this._tokens.push(token)
        this._currentIndex++
        continue
      }

    }
    return this._tokens
  }
}

