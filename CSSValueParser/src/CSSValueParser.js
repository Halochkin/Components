//should we add "/gi" ?
/*
needs to be split up into a series of value tokens and comma tokens.
Then, this big list will be split up into a set of smaller lists on the comma tokens.
So, we can get a flat list,
or a list of comma separated lists.
This is simplest to always return as a list of comma separated lists, kinda.
Then, to get the value of each token, we have to access it as either a primitive word, a number value, or a function.
(The #color is a shortcut for an rgb function, but this is simple and not very relevant.)
The real problem is parsing the CSS function.
The function consists of a function name, then a "(" and then a list of comma separated function expressions, and then ")".
what can be a function name?
what can be a function expression?
the function expression can be either a:
1. quoted string
2. another function expression
3. primitive word, or number value
4. calc expression (boolean expression):
   10px + 20%vh
   width >= 200px
1. CSS Value token list:
********************
0. <space>                                          \s+
1. <word>                                           [a-z]+
2. <number>                                         [+-]?(\d+.\d+|.\d+|\d+)(e[+-]?\d+)?
4. <operator>                                       >=|<=|==|[#\(\),<>/*+%-]
"==", "<=", ">=", "#", "+", "-", "*", "/", ">", "<", "%", "(", ",", ")"
5. <singlequote>                                    '((\\\\|\\'|[^'\n])*)'
6. <doublequote>                                    "((\\\\|\\"|[^"\n])*)"
7. any other finding would be an error              .+
1.b Regex Tokenizer:
***************
  \s+ |
  [a-z]+ |
  [+-]?\d*\.?\d+(e[+-]?\d+)? |
  >=|<=|==|[#\(\),<>/*+%-] |
  '((\\\\|\\'|[^'\n])*)'|
  "((\\\\|\\"|[^"\n])*)"|
  .+
/\s+|[a-z]+|[+-]?\d*\.?\d+(e[+-]?\d+)?|>=|<=|==|[#(),/<>+*%-]|'((\\\\|\\'|[^'\n])*)'|"((\\\\|\\"|[^"\n])*)"|(.*)/g
2.b JS Parser:
*********
3 getPropertyValueObject:
************************
[
  [value, value, value],
  [value, value, value],
  ...
]
CSSValue
   .getType() returns "color", "number", "word"
   .getValue() returns the interpreted result of the value as a String, that would compute the "if(..)" expression
   .getNumberValue()
   .getNumberType()
   .getColorValue()
*
**/


// const tokenizer = /(\s+)|([-]*[a-z]+[3d]?)+|([+-]?\d*\.?\d+(e[+-]?\d+)?)|>=|<=|==|(#[0-9a-f]+)|[(),/<>+*%]|'((\\\\|\\'|[^'\n])*)'|"((\\\\|\\"|[^"\n])*)"|(.+)/gi;
//(#[0-9a-f]+)|here was added regex for hash colors                              | i flags for hash colors (FFF)
const tokenizer = /(\s+)|3d|([+-]?\d*\.?\d+(e[+-]?\d+)?)|([a-zA-Z_-]+)|(#[0-9a-fA-F]+)|(>=|<=|==|[(),/<>+*%-])|'((\\\\|\\'|[^'\n])*)'|"((\\\\|\\"|[^"\n])*)"|(.+)/g;

//
export class CssValueTokenizer {
  constructor(str) {
    this._input = str.trim();
    this._next = undefined;
    this._nextNext = undefined;
    this._active = true;
  }

  hasNext() {
    return this._active;
  }

  _nextToken() {
    if (!this._active)
      return null;
    const token = tokenizer.exec(this._input);
    if (token === null) {
      this._active = false;
      return null;
    }
    if (token[9])
      throw new SyntaxError("Illegal token: " + token[0]);
    return token;
  }

  next() {
    if (this._next === undefined)
      return this._nextToken();
    let n = this._next;
    this._next = this._nextNext;
    this._nextNext = undefined;
    return n;
  }

  lookAhead() {
    if (this._next === undefined)
      this._next = this._nextToken();
    return this._next;
  }

  lookAheadAhead() {
    if (this._nextNext === undefined) {
      this.lookAhead();
      this._nextNext = this._nextToken()
    }
    return this._nextNext;
  }
}


export class CssValue {
  constructor(obj) {
    this._obj = obj;
  }

  getRgbValue() {
    if (this._obj.unit === "rgb" || this._obj.unit === "rgba" || this._obj.unit === "hsl" || this._obj.unit === "hsla")
      return this._obj.children.map(number => [number.value] + [number.unit]);  //todo  fixed units (%)
    if (this._obj.color === "#") {
      const str = this._obj.value;
      if (str.length === 3)
        return [parseInt(str[0], 16) * 16, parseInt(str[1], 16) * 16, parseInt(str[2], 16) * 16];
      if (str.length === 6)
        return [parseInt(str[0] + str[1], 16), parseInt(str[2] + str[3], 16), parseInt(str[4] + str[5], 16)];
    }

    if (this._obj.type === "word" || this._obj.type === "function") {
      return this._obj;
    }


    return undefined;
  }

  getValue() {
    return this._obj;
  }


}


export function parseByTypeValue(str, typeValue) {
  const tokens = new CssValueTokenizer(str);
  let result = [];
  let value;
  for (let next = tokens.lookAhead(); next; next = tokens.lookAhead()) {
    if (next[1]) {
      tokens.next();
      continue;
    }
    // typeValue === "function" ? console.log("lal"):


    if (typeValue === "function") {
      value = (new CssValue(parseValue(tokens)).getRgbValue(tokens));
      // regex first returns the function name and then 3d. Some functions as a rotate3d or matrix3d.
      if (value && value.type === "word" || value && value.type === "function") {

        /*if the previous value corresponds to the type "word" - and the current - "3D" combine them.*/
        if (result.length !== 0 && result[result.length - 1] && result[result.length - 1].type === "word" && value.unit && value.unit === "3d") {
          value.unit = result[result.length - 1].value + value.unit;
          //Then remove the previous value from the array
          result.splice(result.length - 1, 1);
          //Push new value with 3d
          result.push(value);
          // tokens.next();
        }
      }
      // for function names. For example rotate3d(...) will return rotate as a type:word and then 3d as a type: function with an array of values as a children property
      if (value && value.type === "word")
        result.push(value);
      //Url values
      if (value && value.unit === "url")
        result.push(value);
      // for rgb. We can transform hash colors to rgb by calls ("#123456", "function"). It returns value as an array without type property
      if (value && !value.type)
        result.push(value);
    }

    //if type is number|color ..
    else {
      value = (new CssValue(parseValue(tokens)).getValue());
      if (value && !value.type)
        result.push(value);


      if (value && value.type && value.type === typeValue)
        result.push(value);
    }
  }
  return result;
}

// export function parseNumberValue(str) {
//   const tokens = new CssValueTokenizer(str);
//   let result = [];
//   for (let next = tokens.lookAhead(); next; next = tokens.lookAhead()) {
//     if (next[1]) {
//       tokens.next();
//       continue;
//     }
//     let number = (new CssValue(parseValue(tokens)).getValue());
//     if (number.type === "number")
//       result.push(number);
//   }
//   return result;
// }
//
// // export function parseColorValue(str) {
// //   const tokens = new CssValueTokenizer(str);
// //   let result = [];
// //   for (let next = tokens.lookAhead(); next; next = tokens.lookAhead()) {
// //     if (next[1]) {
// //       tokens.next();
// //       continue;
// //     }
// //     let color = (new CssValue(parseValue(tokens)).getColor());
// //     if (color)
// //       result.push(color);
// //   }
// //   return result;
// // }
//
// export function parseCssTypeValue(str, typeValue) {
//   const tokens = new CssValueTokenizer(str);
//   let result = [];
//   for (let next = tokens.lookAhead(); next; next = tokens.lookAhead()) {
//     if (next[1]) {
//       tokens.next();
//       continue;
//     }
//     let type = (new CssValue(parseValue(tokens)).getTypeValue(typeValue));
//     if (type)
//       result.push(type);
//   }
//   return result;
// }

export function parseCssValue(str) {
  const tokens = new CssValueTokenizer(str);
  let result = [];
  while (tokens.hasNext()) {
    result.push(parseSpaceSeparatedValueList(tokens));
    if (!tokens.hasNext())
      return result;
    let next = tokens.next();
    if (next && next[0] !== ",")
      throw new SyntaxError("not a list of values nor a comma, but: " + next[0]);
  }
  return result;
}


function parseSpaceSeparatedValueList(tokens) {
  let result = [];
  for (let next = tokens.lookAhead(); next; next = tokens.lookAhead()) {
    if (next[1] /*isSpace*/) {
      tokens.next();
      continue;
    }
    if (next[0] === ",")            //todo check if ,, is a syntax error for ValueList?
      return result;
    result.push(new CssValue(parseValue(tokens)));
  }
  return result;
}

function parseValue(tokens) {
  const lookAheadAhead = tokens.lookAheadAhead();
  if (lookAheadAhead && lookAheadAhead[0] === "(") {
    const type = tokens.next()[0];
    tokens.next();  //skip the "("
    const children = parseCssExpressionList(tokens);
    return {type: "function", unit: type, children};
  }
  return parsePrimitive(tokens);
}

function parseCssExpressionList(tokens) {
  let result = [];
  for (let next = tokens.lookAhead(); next; next = tokens.lookAhead()) {
    if (next[1]) //isSpace
      tokens.next();
    else {
      result.push(parseExpression(tokens));
      next = tokens.next();
      if (next[1]) //isSpace
        next = tokens.next();
      if (next[0] === ",")
        continue;
      if (next[0] === ")")
        return result;
      throw SyntaxError("Illegal CSS expression list.");
    }
  }
}

function parseExpression(tokens) {
  let value = parseValue(tokens);
  let potentialOperator = getOperator(tokens);
  if (potentialOperator) {
    tokens.next();                                 //todo: Max: skipped space after operator
    return {
      type: "function",
      left: value,
      operator: potentialOperator,
      right: parseExpression(tokens)
    };
  }
  return value;
}

function getOperator(tokens) {
  const lookAhead = tokens.lookAhead();
  const lookAheadAhead = tokens.lookAheadAhead();
  if (lookAhead && lookAhead[1] /*isSpace*/ && lookAheadAhead && lookAheadAhead[6] /*isOperator*/) {
    tokens.next(); //skip space
    let operator = tokens.next()[0];
    let next;
    if (!(next = tokens.next())[1] /*isNotSpace*/)
      throw new SyntaxError("Css value operator '" + operator + "' must be surrounded by space: " + next[0]);
    return operator;
  }
  return undefined;
}

function parsePrimitive(tokens) {
  const next = tokens.next();

  /*check is a value starts with a hash*/
  /*This check has been moved bottom up*/
  //-------------------------------------------------------------------------------------------------
  if (next[0].startsWith("#")) {                     //todo Max: it make a sense to check hash symbol in the beginning to avoid errors (especially for hash colors)
    const nextNext = tokens.next();
    /*Check if it has a valid character length (include #symbol) */
    if (next[0].length === 4 || next[0].length === 5 || next[0].length === 7 || next[0].length === 9)  //todo Max: fixed # colors possible lengths
    /*Remove first character from the string in the value property to remove #*/
      return {type: "color", color: "#", value: next[0].substr(1)};
    throw new SyntaxError("illegal #color: " + next[0] + nextNext[0]);
  }
  //-------------------------------------------------------------------------------------------------
  if (next[9])                                  //todo how to treat errors, should we allow it to exist?
    return {type: "error", value: next[8]};
  if (next[4] /*isWord*/)
    return {type: "word", value: next[0]};
  if (next[6] /*isSingleQuote*/)
    return {type: "quote", value: next[0], text: next[6]};
  if (next[8] /*isDoubleQuote*/)
    return {type: "quote", value: next[0], text: next[8]};
  if (next[2] /*isNumber*/) {
    let nextNextLookahead = tokens.lookAhead();
    if (nextNextLookahead && nextNextLookahead[4] /*isWord*/ || nextNextLookahead && nextNextLookahead[0] === "%")  //todo Max: nextNextLookahead&&nextNextLookahead[..]
      return {type: "number", unit: tokens.next()[0], value: next[0]};
    return {type: "number", value: next[0]};
  }

  throw new SyntaxError("Illegal CSS primitive value: " + next[0]);
}
