---
js基础--正则表达式
---

# 正则表达式

首先正则表达式也是对象之一，用于匹配字符串中字符组合的模式（pattern）

```
var exp = /pattern/flags;
```

## RegExp 构造函数

可以通过 **/pattern/** 来表达一个正则表达式

也可以通过 new RegExp('patternStr') 来创建一个

注意需要对 pattern 转义成字符串

```js
var re1 = /[a-zA-z]+\.com/g;
console.log(re1.test("abc.com"));
var re2 = new RegExp("[a-zA-z]+\\.com", "g");
console.log(re2.test("abc.com"));
```

## flags

定义在正则后面的标识符

| flag | 描述                                                                                                     |
| ---- | -------------------------------------------------------------------------------------------------------- |
| g    | 全局模式（global），而非匹配到一个项就停止                                                               |
| i    | 不区分大小写（case-insensitive）                                                                         |
| m    | 多行模式（multiline） ，和 ^\$结合使用，当表达式换行符\n，则会匹配中                                     |
| u    | Unicode 字符集解析字符                                                                                   |
| y    | Perform a "sticky" search that matches starting at the current position in the target string. See sticky |

## pattern 特殊规则

只列出常用，[具体全部规则](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions#%E4%BD%BF%E7%94%A8%E7%89%B9%E6%AE%8A%E5%AD%97%E7%AC%A6)

| 字符   | 含义                                                                  |
| ------ | --------------------------------------------------------------------- |
| \      | 转义                                                                  |
| ^      | xx 开头                                                               |
| \$     | xx 结尾                                                               |
| \*     | 0 or 多次 等价于{0,}                                                  |
| +      | 1 or 多次，至少出现一次。等价于 {1,}                                  |
| ?      | 0 or 1 次，等价于 {0,1}                                               |
| .      | 换行 \n 之外的单个字符                                                |
| {n}    | xx 重复出现 n 次                                                      |
| {n,m}  | xx 出现次数 n<= xx <=m                                                |
| [xx]   | 匹配 xx 字符串                                                        |
| \s     | 匹配任何空白字符，包括空格、制表符、换页符等等。等价于[ \f\n\r\t\v]。 |
| \S     | 匹配任何非空白字符。等价于[^ \f\n\r\t\v]。                            |
| \w     | 匹配包括下划线的任何单词字符。等价于“[A-Za-z0-9_]”。                  |
| \W     | 匹配任何非单词字符。等价于“[^a-za-z0-9_]”。                           |
| x \| y | ‘x’或者‘y’                                                            |
| (x)    | 捕获括号（**匹配 'x' 并且记住匹配项**）                               |
| (?:x)  | 非捕获括号（**匹配 'x' 但是不记住匹配项**）                           |
| x(?=y) | 正向肯定查找                                                          |
| x(?!y) | 正向否定查找                                                          |

## 实例属性

-   global
-   multiline
-   ignoreCase
-   source
-   lastIndex 表示开始搜索下一个匹配项的位置，起始值 0

```js
var re1 = /\[a-zA-z\]+\.com/g;
console.log(re1.global); //true
console.log(re1.multiline); //false
console.log(re1.ignoreCase); //false
console.log(re1.source); // [a-zA-z]+\.com
console.log(re1.lastIndex); //0
```

**lastIndex** 重点说明下

注意使用 **全局模式** 下所造成非预期的结果

```js
var camelizeRE = /-(\w)/g;
console.log(camelizeRE.test("app-list")); //true
console.log(camelizeRE.test("app-List")); //false
// 重置索引
camelizeRE.lastIndex = 0;
console.log(camelizeRE.test("app-List")); //true
```

## 实例方法

**exec()**

> 在一个指定字符串中执行一个搜索匹配。返回一个结果数组或 null

个人理解：专门用于 **捕获组**

```js
var re = /test(test1(test2))/g;
var matches = re.exec("testtest1test2");
// ["testtest1test2", "test1test2", "test2", index: 0, input: "testtest1test2", groups: undefined]
```

| 数组索引     | 说明                                                            |
| ------------ | --------------------------------------------------------------- |
| [0]          | 匹配的全部字符串                                                |
| [1], ...[n ] | 括号中的 **分组捕获**                                           |
| index        | 匹配到的字符位于原始字符串的基于 0 的索引值（从哪里开始匹配中） |
| input        | 原始字符串                                                      |

对于 index ，举个例子说明下

```js
var matches = re.exec("123testtest1test2");
// ["testtest1test2", "test1test2", "test2", index: 3, input: "123testtest1test2", groups: undefined]
```

**exec() 和 match() 的区别**

相同点：这两个方法都会返回一个数组结果

```js
var str = "cat,hat";
var p = /at/; //没有g属性
console.log(p.exec(str)); //["at", index: 1, input: "cat,hat", groups: undefined]
console.log(str.match(p)); //["at", index: 1, input: "cat,hat", groups: undefined]
```

但如果把 regex 改为 全局，结果就少许不同

```js
var p2 = /at/g;
console.log(p2.exec(str)); //["at", index: 1, input: "cat,hat", groups: undefined]
console.log(str.match(p2)); //["at", "at"]
```

那还有什么不同？
首先 match 是 String 的方法

match 是匹配正则整体的结果，exec 是匹配整段匹配和部分捕获的内容

```js
var someText = "web2.0 .net2.0";
var pattern = /(\w+)(\d)\.(\d)/g;
var outCome_exec = pattern.exec(someText);
//  ["web2.0", "web", "2", "0", index: 0, input: "web2.0 .net2.0", groups: undefined]
var outCome_matc = someText.match(pattern);
// ["web2.0", "net2.0"]
```

**test()**

如果不需要知道匹配内容，只需要是否有匹配命中的，可以选择该方法

```js
var re = /[0-9]/g;
var result = re.test("a123"); //true
var result = re.test("abc"); //false
```

## 关于（非）括号捕获、肯定，否定查找 Example

-   capturing parentheses 括号捕获
-   non-capturing parentheses 非括号捕获
-   lookahead 正向查找
-   negated lookahead 否定查找

```js
// 括号捕获
/(\d{4}-(\d{2}-(\d\d)))/.exec("2018-12-17");
// ["2018-12-17", "2018-12-17", "12-17", "17", index: 0, input: "2018-12-17", groups: undefined]
/(\d{4})-(\d{2})-(\d{2})/.exec("2018-12-17");
RegExp.$1; //2018
// ["2018-12-17", "2018", "12", "17", index: 0, input: "2018-12-17", groups: undefined]

// 非括号捕获
/(?:\d{4})-(?:\d{2})-(?:\d{2})/.exec("2018-12-17");
RegExp.$1; //''
//["2018-12-17", index: 0, input: "2018-12-17", groups: undefined]
/(?:\d{4})(-(?:\d{2}))+/.exec("2018-12-17");
//["2018-12-17", "-17", index: 0, input: "2018-12-17", groups: undefined]

// 正向查找
// 不会把捕获到的东西，展示到结果中
/aaa(?=\d+)/.exec("aaa123"); //["aaa", index: 0, input: "aaa123", groups: undefined]
/aaa(?=\d+)/.test("aaa123"); //true
/aaa(?=\d+)/.exec("aaabbb"); //null
/aaa(?=\d+)/.test("aaabbb"); //false
/\d{4}-(?=\d{2})/.exec("2018-12-17");
//["2018-", index: 0, input: "2018-12-17", groups: undefined]
/\d{4}-(?=[a-z]+)/.exec("2018-12-17"); //null

// 否定查找
/aaa(?!\d+)/.exec("aaa123"); //null
/aaa(?!\d+)/.exec("aaabbb"); //["aaa", index: 0, input: "aaabbb", groups: undefined]
/\d{4}(?!-d{2})+/.exec("2018-12-17"); //["2018", index: 0, input: "2018-12-17", groups: undefined]
/\d{4}-(?![a-z]+)/.test("2018-12-17"); //true
```

## vue 里那些 Demo

再看 vue 模板解析那些正则前，先热身一些简单的

```js
// 获取属性key-value中 去除引号的 value
var excludeQuotesRe = /[^\s]*=(?:"([^\s]+)")/;
'id="app"'.match(excludeQuotesRe); //["id="app"", "app", index: 0, input: "id="app"", groups: undefined]
```

```js
var html = "<!doctype html><html></html>";
// 判断 doctype 标签
const doctype = /^<!DOCTYPE [^>]+>/i;
const doctypeMatch = html.match(doctype);
console.log(doctypeMatch); //["<!doctype html>", index: 0, input: "<!doctype html><html></html>", groups: undefined]

const ncname = "[a-zA-Z_][\\w\\-\\.]*";
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;

// /^<\/((?:[a-zA-Z_][\w\-\.]*\:)?[a-zA-Z_][\w\-\.]*)[^>]*>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
var endHtml = "";
"</div>".match(endTag); //["</div>", "div", index: 0, input: "</div>", groups: undefined]
"<div>".match(endTag); //null
"</foo-bar>".match(endTag); //["</foo-bar>", "foo-bar", index: 0, input: "</foo-bar>", groups: undefined]
"</foo-bar:baz>".match(endTag); // ["</foo-bar:baz>", "foo-bar:baz", index: 0, input: "</foo-bar:baz>", groups: undefined]
"</foo-bar:>".match(endTag); //["</foo-bar:>", "foo-bar", index: 0, input: "</foo-bar:>", groups: undefined]

// /^<((?:[a-zA-Z_][\w\-\.]*\:)?[a-zA-Z_][\w\-\.]*)/
const startTagOpen = new RegExp(`^<${qnameCapture}`);
"<div><span>123</span></div>".match(startTagOpen); //["<div", "div", index: 0, input: "<div><span>123</span></div>", groups: undefined]

const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
// 非空制表符开头(括号捕获：属性key){非括号捕获：制表符(括号捕获：等于号)[非括号捕获：双引号(括号捕获：非引号所有字符)or 单引号(括号捕获：非引号所有字符)or (括号捕获：非制表符，单双引号，=<>`)]}
` id="app" v-if="message">
	<!-- 我是注释 -->
	<div>parent:{{ message }}</div>
</div>`.match(attribute);
// [" id="app"", "id", "=", "app", undefined, undefined, index: 0, input: " id="app" v-if="message">↵	<!-- 我是注释 -->↵	<div>parent:{{ message }}</div>↵</div>", groups: undefined]
```
