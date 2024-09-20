import { Token, TokenType } from "./tokenizer"

export enum NodeType {
  Program = "Program",
  VariableDeclaration = "VariableDeclaration",
  VariableDeclarator = "VariableDeclarator",
  Identifier = "Identifier",
  FunctionExpression = "FunctionExpression",
  BlockStatement = "BlockStatement",
}


export interface Node {
  type: string,
  start: number,
  end: number,
}

export interface Identifier extends Node {
  type: NodeType.Identifier,
  name: string,
}

interface Expression extends Node {}

interface Statement extends Node {}

export interface Program extends Node {
  type: NodeType.Program,
  body: Statement[],
}

export interface VariableDeclarator extends Node {
  type: NodeType.VariableDeclarator,
  id: Identifier,
  init: Expression,
}

export interface VariableDeclaration extends Node {
  type: NodeType.VariableDeclaration,
  kind: "var" | "let" | "const",
  declarations: VariableDeclarator[],
}

export interface FunctionExpression extends Node {
  type: NodeType.FunctionExpression,
  id: Identifier | null,
  params: Expression[] | Identifier[]
  body: BlockStatement,
}

export interface BlockStatement extends Node {
  type: NodeType.BlockStatement,
  body: Statement[],
}

export type VariableKind = "let"



export class Parser {
  private _tokens: Token[] = []
  private _currentIndex = 0
  constructor(token: Token[]) {
    console.log('token', token)
    // this._tokens = [...token]
  }

  parse(): Program {
    console.log('weqweqeq')
    const program = this._parseProgram()
    return program
  }

  private _parseProgram(): Program {
    const program: Program = {
      type: NodeType.Program,
      body: [],
      start: 0,
      end: Infinity
    }
    // 解析 token 数组
    while(!this._isEnd()) {
      const node = this._parseStatement()
      program.body.push(node)
      if(this._isEnd()) {
        program.end = node.end
      }
      console.log('0-0-0-0-')
    }
    return  program
  }

  // 解析语句
  private _parseStatement(): Statement {
    if(this._checkCurrentTokenType(TokenType.Let)) {
      return this._parseVariableDeclaration()
    }
    throw new Error(`Unexpected token ${this._getCurrentToken().value}`)
  }
  // 解析变量声明
  private _parseVariableDeclaration(): VariableDeclaration {
    const token = this._getCurrentToken()
    const {start} = token
    const kind = token.value as VariableKind
    this._goNext(TokenType.Let) // 消费 let
    // 解析变量名
    const id = this._parseIdentifier()
    // 解析等号
    this._goNext(TokenType.Assign)
    // 解析函数表达式
    const init = this._parseFunctionExpression()
    const declarator: VariableDeclarator = {
      type: NodeType.VariableDeclarator,
      id,
      init,
      start: id.start,
      end: init? init.end : id.end
    }

    // 构造 Declaration 节点
    const node: VariableDeclaration = {
      type: NodeType.VariableDeclaration,
      kind: kind as VariableKind,
      declarations: [declarator],
      start,
      end: this._getPreviousToken().end
    }
    return node
  }
  // 解析函数表达式
  private _parseFunctionExpression(): FunctionExpression {
    const {start} = this._getCurrentToken()
    this._goNext(TokenType.Function) // 消费 function
    let id 
    if(this._checkCurrentTokenType(TokenType.Identifier)) {
      id = this._parseIdentifier()
    }
    const node: FunctionExpression = {
      type: NodeType.FunctionExpression,
      id,
      params: [],
      body: {
        type: NodeType.BlockStatement,
        body: [],
        start,
        end: Infinity
      },
      start,
      end: 0
    }
    return node
  }

  // 解析函数参数
  private _parseParams(): Identifier[] | Expression[] {
    this._goNext(TokenType.LeftParen) // 消费左括号
    const params: Identifier[] | Expression[] = []
    // 逐个解析括号中的参数
    while(!this._checkCurrentTokenType(TokenType.RightParen)) { // 没有遇到右括号
      let param = this._parseIdentifier()
      params.push(param)
    }
    this._goNext(TokenType.RightParen) // 消费右括号
    return params
  }
  // 解析函数体
  private _parseBlockStatement(): BlockStatement {
    const { start } = this._getCurrentToken()
    const blockStatement: BlockStatement = {
      type: NodeType.BlockStatement,
      body:[],
      start,
      end: Infinity
    }
    // 消费 {
      this._goNext(TokenType.LeftCurly)
      while(!this._checkCurrentTokenType(TokenType.RightCurly)) {
        const node = this._parseStatement()
        blockStatement.body.push(node)
      }
      blockStatement.end = this._getCurrentToken().end
      // 消费 }
      this._goNext(TokenType.RightCurly)
    return blockStatement
  }
  // 解析变量名
  private _parseIdentifier(): Identifier {
    const {start, end, value} = this._getCurrentToken()
    const identifier: Identifier = {
      type: NodeType.Identifier,
      name: value!,
      start: start,
      end: end
    }
    this._goNext(TokenType.Identifier) // 消费变量名
    return identifier
  }

  // 判断 tokens 是否解析完毕
  private _isEnd(): boolean {
    return this._currentIndex >= this._tokens.length
  }

  // 消费一个 token
  private _goNext(type: TokenType | TokenType[]): Token {
    const currentToken = this._tokens[this._currentIndex]
    if(Array.isArray(type)) {
      if(!type.includes(currentToken.type)) {
        throw new Error(`Unexpected token ${currentToken.value}`)
      }
    } else {
      if(currentToken.type !== type) {
        throw new Error(`Unexpected token ${currentToken.value}`)
      }
    }
    this._currentIndex++
    return currentToken
  } 


  // 检查当前 token 类型是否符合预期
  private _checkCurrentTokenType(type: TokenType | TokenType[]):boolean {
    if(this._isEnd()) {
      return false
    }
    const currentToken = this._tokens[this._currentIndex]
    if(Array.isArray(type)) {
      return type.includes(currentToken.type)
    } else {
      return currentToken.type === type
    }
  }

  private _getCurrentToken(): Token {
    return this._tokens[this._currentIndex]
  }

  private _getPreviousToken(): Token {
    return this._tokens[this._currentIndex - 1]
  }


}