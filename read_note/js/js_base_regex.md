---
js 基础--正则表达式
---

# 正则表达式

我很烦躁去理解正则表达式 :weary:，就和很难进“大厂”一样头大。

每次需要完成校验逻辑都是去百度 **抄** 两个，并且老是出 bug，轮到自己写又一团乱麻，归根结底还是一知半解，希望再次学习能对这东西能有进一步的认识。

## 简单科普

正则表达式（Regular Expression），通常缩写成 regex，是计算机相关的概念。

使用单个字符串来描述、匹配一系列匹配某个句法规则的字符串。

## js 里的正则

正则表达式也是对象之一（RegExp），用于匹配字符串中字符组合的模式（pattern），有 exec 和 test 方法；同时我们常用的 String 对象中的 match ，replace 也可以使用 regex。

语法：使用 **字面量** 方式，通过 **/pattern/** 定义正则表达式：

> var regExp = /pattern/flags;

```js
var regex = /[a-zA-z]+\.com/g;
```

## pattern 和 flags 

### pattern 规则

列出常用规则意识，具体详见：[全部规则](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions#%E4%BD%BF%E7%94%A8%E7%89%B9%E6%AE%8A%E5%AD%97%E7%AC%A6)

| 字符   | 含义                                                                  |
| ------ | --------------------------------------------------------------------- |
| \      | 转义字符                                                              |
| ^      | 匹配输入的开始                                                        |
| \$     | 匹配输入的结束                                                        |
| \*     | 0 or 多次 等价于{0,}                                                  |
| +      | 1 or 多次，至少出现一次。等价于 {1,}                                  |
| ?      | 0 or 1 次，等价于 {0,1}                                               |
| .      | 换行 \n 之外的单个字符                                                |
| {n}    | 匹配重复出现 n 次                                                     |
| {n,m}  | n<= 匹配出现次数 <=m                                                  |
| [xyz]  | 匹配方括号中的任意字符                                                |
| [^xyz] | 匹配任何没有包含在方括号中的字符                                      |
| \b     | 匹配一个词的边界（前后没有其他字符）                                  |
| \s     | 匹配任何空白字符，包括空格、制表符、换页符等等。等价于[ \f\n\r\t\v]。 |
| \S     | 匹配任何非空白字符。等价于[^ \f\n\r\t\v]。                            |
| \w     | 匹配包括下划线的任何单词字符。等价于“[A-Za-z0-9_]”。                  |
| \W     | 匹配任何非单词字符。等价于“[^a-za-z0-9_]”。                           |
| x \| y | ‘x’或者‘y’                                                            |
| (x)    | 捕获括号（**匹配 'x' 并且记住匹配项**）                               |
| (?:x)  | 非捕获括号（**匹配 'x' 但是不记住匹配项**）                           |
| x(?=y) | 正向肯定查找                                                          |
| x(?!y) | 正向否定查找                                                          |


### 标识符 flags

定义在正则表达式 pattern 后面的标识符

| flag | 描述                                                                                          |
| ---- | --------------------------------------------------------------------------------------------- |
| g    | 全局模式（global），而非匹配到一个项就停止                                                    |
| i    | 不区分大小写（case-insensitive）                                                              |
| m    | 多行模式（multiline） ，和 ^\$结合使用，当表达式换行符\n，则会匹配中                          |
| u    | Unicode 字符集解析字符                                                                        |
| y    | Perform a "sticky" search that matches starting at the current position in the target string. |

- g 标识符，如下 demo 会依次输出匹配结果

	````js
	// 如果不适用结果就会一直是 ["11-", index: 0, input: "11-22-33-"]
	var regex = /[0-9]{2}-/g;
	for(var i=0; i<3; i++){
		console.log(regex.exec('11-22-33-'));
		// ["11-", index: 0, input: "11-22-33-"]
		// ["22-", index: 3, input: "11-22-33-"]
		// ["33-", index: 6, input: "11-22-33-"]
	}
	````

- i 标识符

	````js
	/[abc]/.test('ABC'); //false
	/[abc]/i.test('ABC'); //true
	````

- m 标识符

	和 **^ $** 搭配使用，遇到换行符就会当成 **^ $**
	````js
	/[abc]+$/.test("abc\r\n"); //false
	/[abc]+$/m.test("abc\r\n"); //true
	````
- u 标识符

	````js
	/^\uD83D/u.test('\uD83D\uDC2A') // false 正确处理 Unicode 字符，导致不匹配
	/^\uD83D/.test('\uD83D\uDC2A') // true ES5 不支持该字符，会将两个字符识别出一个
	````

- y 标识符

	和 g 做区分，y 是从上次匹配完的结果后，从剩余字符串的起始位置开始匹配（紧密粘连 sticky）；相反 g 修饰符是剩余数据有匹配就行，对位置没有要求。

	````js
	var s = 'aaa_aa_a';
	var r1 = /a+/g;
	var r2 = /a+/y;

	r1.exec(s) // ["aaa"]
	r2.exec(s) // ["aaa"]

	r1.exec(s) // ["aa"]
	r2.exec(s) // null '_aa_a' 不符合规则
	````

## RegExp 构造函数

> var regExp = new RegExp("pattern", "flags");

### 内置属性（prototype）

````js
var regex = new RegExp("[a-zA-z]+\\.com", "g"); 
// 需要注意的是，转移字符 \ 在字符串中要多个反斜杠（因为 \ 在字符串里面也是一个转义字符）

regex.global // true
regex.multiline // false
regex.ignoreCase // false
regex.source	// "[a-zA-z]+\.com"
regex.lastIndex	// 0 表示开始搜索下一个匹配项的位置，起始值 0
````

**lastIndex** 重点说明下

在 **全局模式** 下所造成非预期的结果，看如下例子：

```js
var camelizeRE = /-(\w)/g;
console.log(camelizeRE.test("app-list")); //true
console.log(camelizeRE.lastIndex); // 5
console.log(camelizeRE.test("app-List")); //false
// 重置索引
camelizeRE.lastIndex = 0;
console.log(camelizeRE.test("app-List")); //true
```

:grimacing: 注意 lastIndex 索引所指的位置，就清楚了为什么全局模式下同一个正则匹配结果会有不同 

### 常用方法

- test()

	如果不需要知道匹配内容，只需要是否有匹配命中的，可以选择该方法

	```js
	var re = /[0-9]/g;
	var result = re.test("a123"); //true
	var result = re.test("abc"); //false
	```

- exec()

	在一个指定字符串中执行一个搜索匹配。返回一个结果数组或 null

	```js
	var re = /test(test1(test2))/g;
	var matches = re.exec("testtest1test2");
	// ["testtest1test2", "test1test2", "test2", index: 0, input: "testtest1test2"]
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
	// ["testtest1test2", "test1test2", "test2", index: 3, input: "123testtest1test2"]
	```

- match()
	
	 注意 match 是 String 的内置方法，和 exec 类似，会返回一个匹配结果的数组

	````js
	"testtest1test2".match(/test(test1(test2))/);
	// ["testtest1test2", "test1test2", "test2", index: 0, input: "testtest1test2"]
	````

	**exec() 和 match() 的区别**

	但如果把 regex 改为 全局模式，结果就少许不同

	```js
	"testtest1test2".match(/test(test1(test2))/g);
	// ["testtest1test2"]
	```

	```js
	var data = "web2.0 .net2.0";
	var pattern = /(\w+)(\d)\.(\d)/g;
	var execResult = pattern.exec(data);
	//  ["web2.0", "web", "2", "0", index: 0, input: "web2.0 .net2.0", groups: undefined]
	var matchResult1 = data.match(pattern); // ["web2.0", "net2.0"]
	var matchResult2 = data.match(/(\w+)(\d)\.(\d)/); // 同 execResult
	```

	非全局模式下，exec 和 match 都会匹配所有结果；全局模式下 match 只匹配整个正则进行全匹配


## 贪婪与非贪婪匹配

在 Elasticsearch 中看到如下规则，很奇怪有什么不同，其实就是贪婪与非贪婪匹配

````js
DATA .*?
GREEDYDATA .*
````

````js
/\d+?/.exec('1234'); // 非贪婪 ["1", index: 0, input: "1234"]
/\d+/.exec('1234'); // 贪婪 ["1234", index: 0, input: "1234"]
````

区别就是正则后多个 ? ，是非贪婪模式，匹配到第一个结果就返回。贪婪模式则会一直匹配直到最后个为止。

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

# 参考

> :thought_balloon: 我只是知识点的搜集者，更多内容请查阅原文链接，同时感谢原作者的付出：

- [正则表达式 维基百科](https://zh.wikipedia.org/wiki/%E6%AD%A3%E5%88%99%E8%A1%A8%E8%BE%BE%E5%BC%8F)
- [正则表达式 MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions)
- [u、y 修饰符 阮一峰-ECMAScript 6 入门 ](http://es6.ruanyifeng.com/#docs/regex#u-%E4%BF%AE%E9%A5%B0%E7%AC%A6)
- [彻底领悟javascript中的exec与match方法](https://www.cnblogs.com/xiehuiqi220/archive/2008/12/01/1327487.html)
- [elastic logstash gork 规则](https://github.com/elastic/logstash/blob/v1.4.2/patterns/grok-patterns)