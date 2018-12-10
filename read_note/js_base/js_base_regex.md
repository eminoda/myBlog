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

- g 全局模式（global），而非匹配到一个项就停止
- i 不区分大小写（case-insensitive）
- m 多行模式（multiline）

## pattern 特殊规则

只列出常用，[具体全部规则](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions#%E4%BD%BF%E7%94%A8%E7%89%B9%E6%AE%8A%E5%AD%97%E7%AC%A6)

| 字符   | 含义                                        |
| ------ | ------------------------------------------- |
| \      | 转义                                        |
| ^      | xx 开头                                     |
| \$     | xx 结尾                                     |
| -      | 0 or 多次                                   |
| -      | 1 or 多次，至少出现一次。等价于 {1,}        |
| ?      | 0 or 1 次，等价于 {0,1}                     |
| .      | 换行之外的单个字符                          |
| (x)    | 捕获括号（**匹配 'x' 并且记住匹配项**）     |
| (?:x)  | 非捕获括号（**匹配 'x' 但是不记住匹配项**） |
| x(?=y) | 正向肯定查找                                |
| x(?!y) | 正向否定查找                                |
| x \| y | ‘x’或者‘y’                                  |
| {n}    | xx 重复出现 n 次                            |
| {n,m}  | xx 出现次数 n<= xx <=m                      |
| [xx]   | 匹配 xx 字符串                              |

## 实例属性

- global
- multiline
- ignoreCase
- source
- lastIndex 表示开始搜索下一个匹配项的位置，起始值 0

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

1. exec()

   专门用于 **捕获组**，个人理解正则表达式匹配到哪些规则

   ```js
   var re = /test(test1(test2))/g;
   // ["testtest1test2", "test1test2", "test2", index: 0, input: "testtest1test2", groups: undefined]
   var matches = re.exec("testtest1test2");
   ```

2. test()

   如果不需要知道匹配内容，只需要是否有匹配命中的，可以选择该方法

   ```js
   var re = /[0-9]/g;
   var result = re.test("a123"); //true
   var result = re.test("abc"); //false
   ```

## 关于（非）括号捕获、肯定，否定查找 Example

- capturing parentheses
- non-capturing parentheses
- lookahead
- negated lookahead

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
