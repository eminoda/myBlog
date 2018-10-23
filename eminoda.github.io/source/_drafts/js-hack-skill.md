---
title: js 那些"奇技淫巧"
tags: js 持续更新
categories:
  - 前端
  - js
no_sketch: true
---

# 数组中取最大值
一个以逗号分隔的数据，预取数据中最大的数值
````
var data = "3,2,1,4,4,6";
Math.max.apply({},data.split(',')); // 6
````

通常肯定会把类似数据转成array，然后通过“那些算法”循环出最大值。
但此例设法通过现有Math库的API计算，然后很阴B的通过apply的arg的特征然array通过。

# [逗号操作符Comma_Operator](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Comma_Operator)
再看express-graphql代码时，发现多次出现如下操作：
````
return (0, _graphql.execute)(schema, documentAST, rootValue, context, variables, operationName);
````
其实，平时我们多用这种形式，只是没有发现
````
var data = 0,data2 = 1; // 当然这不是想说的重点
````
````
for (var i = 0, j = 9; i <= 9; i++, j--){

}
````
注意，上面两例中只是说明平时的常用场景，但用途就一个**变量的赋值处理**
````
function myFunc () {
  var x = 0;
  return (x += 1, x); // the same of return ++x;
  // 相当于
  // x = x+1;
  // return x;
}
````

# void 0 和 undefined
一定会忽略的知识点，红宝书肯定有讲到。我问你，**undefined是js的保留关键字吗？**

[有哪些reserved—word?](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Reserved_words)

所以在部分浏览器比如IE，就会出现undefined被复写的可能，多人合作，鬼知道谁会有这样神奇的操作。

同样再抛个问题：**void是干什么的？**
> 这个运算符能向期望一个表达式的值是undefined的地方插入会产生副作用的表达式。

说白了就是用于定义undefined，可以void(0),void 0

这样一方面避免了使用undefined，第二简化书写，代码变得更加语义好理解，提升了逼格

# 参考来源
[逗号操作符 & (0, function)()](https://www.jianshu.com/p/cd188bda72df)

[void 0 & undefined](https://github.com/hanzichi/underscore-analysis/issues/1)

[apply call bind](http://web.jobbole.com/83642/)