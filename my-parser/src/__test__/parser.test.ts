// src/__test__/parser.test.ts
import { describe, test, expect } from "vitest";
import { Tokenizer } from "../tokenizer";
import {Parser} from '../parser'
describe("testParserFunction", () => {
  test("test example code", () => {
    const result = {
      type: "Program",
      body: [
        {
          type: "VariableDeclaration",
          kind: "let",
          declarations: [
            {
              type: "VariableDeclarator",
              id: {
                type: "Identifier",
                name: "a",
                start: 4,
                end: 5,
              },
              init: {
                type: "FunctionExpression",
                id: null,
                params: [],
                body: {
                  type: "BlockStatement",
                  body: [],
                  start: 19,
                  end: 21,
                },
                start: 8,
                end: 21,
              },
              start: 0,
              end: 21,
            },
          ],
          start: 0,
          end: 21,
        },
      ],
      start: 0,
      end: 21,
    };
    const code = `let a = function() {}`;
    const tokenizer = new Tokenizer(code);
    const parser = new Parser(tokenizer.tokenize());
    console.log(parser)
    expect(parser.parse()).toEqual(result);
    expect(1).toEqual(1);
  });
});
