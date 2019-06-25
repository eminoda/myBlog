---
es6 -- symbol
---

# [symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)

[参考：http://es6.ruanyifeng.com/#docs/proxy](http://es6.ruanyifeng.com/#docs/symbol)

Symbol 是一个方法函数，直接通过 Symbol() 使用，返回一个 **独一无二** symbol 类型的值。

同时 Symbol 不具备 constructor，无法实例化。

**唯一性**

因为 js 是比较灵活的语言，有时候在对象定义属性时，会发生和别人重名的现象，导致非预期的错误。

利用 Symbol 的 **唯一特性**，来更好的解决此问题

```js
let NAME = Symbol('NAME');
let AGE = Symbol('AGE');

let test = {
	name: 'aaaa'
};

test[NAME] = 'bbbb';
test[AGE] = 123;

console.log(test); //{ name: 'aaaa', [Symbol(NAME)]: 'bbbb', [Symbol(AGE)]: 123 }
console.log(test[NAME]); //bbbb
```

**无法构造**

```js
var instance = new Symbol(); // TypeError: Symbol is not a constructor
```
