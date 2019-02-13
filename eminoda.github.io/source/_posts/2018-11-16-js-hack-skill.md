---
title: js 那些"奇技淫巧"
tags: js
categories:
  - 开发
  - js
thumb_img: javascript.jpg
date: 2018-11-16 17:07:14
---

> 记录一些常用JS的操作，一方面弥补基础的不足，一方面提升使用技巧。

# 数组中取最大值
一个以逗号分隔的数据，预取数据中最大的数值
````
var data = "3,2,1,4,4,6";
Math.max.apply({},data.split(',')); // 6
````

通常肯定会把类似数据转成array，然后通过“那些算法”循环出最大值。
但此例设法通过现有Math库的API计算，然后很阴B的通过apply的arg的特征然array通过。

# 保留小数位
Math 对象提供简单的数学计算，但对于保留小数做四舍五入等操作，却不行。我们可以通过如下方式，变相实现：
````js
function round(num,digit=2){
  let unit = 10;
  let extend = 10;
  for(var i=1;i<digit;i++){
    extend = extend*unit;
  }
  return Math.round(num*extend)/extend;
}
round(1.12945,2); //1.13
````
相同 **ceil，floor** 也可以类似实现

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
注意，上面两例中只是说明平时的常用场景，但用途就一个 **变量的赋值处理**

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

# [对象属性的merge，Object.assign()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
> The Object.assign() method is used to copy the values of all enumerable own properties from one or more source objects to a target object. It will return the target object.

````
Object.assign(target, ...sources)
````

用于copy对象的 **简单属性**，如果已存在属性则会覆盖。

````js
var obj = {
    a: 1
};
var obj1 =
    a: 2,
    b: 3
}
var copy = Object.assign(obj, obj1);// { a: 2, b: 3 }
````

注意：通常对于对象引用的deep copy 不建议使用此方法。

````js
var obj1 = {
    a: 0,
    b: {
        c: 0
    }
}
var obj2 = Object.assign({}, obj1); //merge 空对象{}和obj1

console.log(obj1); //{ a: 0, b: { c: 0 } }
console.log(obj2); //{ a: 0, b: { c: 0 } }

obj1.a = 1;

console.log(obj1); //{ a: 1, b: { c: 0 } }
console.log(obj2); //{ a: 0, b: { c: 0 } }

obj1.b.c = 3; //此处改变obj1引用，影响到obj2
console.log(obj1); //{ a: 1, b: { c: 3 } }
console.log(obj2); //{ a: 0, b: { c: 3 } }
````

其他
- 原型链上的属性不会被copy
- 非 enumerable 类型的属性不会被copy
- IE 需要注意兼容

# 除了apply、call，bind某些地方更适合
> 创建一个新的函数， 当这个新函数被调用时其this置为提供的值，其参数列表前几项置为创建时指定的参数序列。

参考 **koa-compose** 一段核心代码，中间用到了 **bind**。
````
function compose (middleware) {
  ...
  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)
    function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
````
其作用在看了几个示例便可明白。
1. 改变作用域
类似你可以用在jquery的事件、setTimeout来“修正”作用域

````
var name = 'global';
var User = function() {
    this.name = 'aaaa';
    this.age = 11;
    this.getName = function() {
        return this.name
    }
}
var user = new User();
console.log(user.getName()); //aaaa
// 应该拿user这个对象引用来做后续的方法调用，而非把方法拿出来。
var userGetName = user.getName;
console.log(userGetName()); //undefined

var userGetName2 = userGetName.bind(user);
console.log(userGetName2()); //aaaa
````

2. 偏函数
> 使一个函数拥有预设的初始参数。这些参数（如果有的话）作为bind()的第二个参数跟在this（或其他对象）后面，之后它们会被插入到目标函数的参数列表的开始位置，传递给绑定函数的参数会跟在它们的后面。

````
function argumentsChangeArray() {
    // 通过call，调用array的slice，进行copy
    return Array.prototype.slice.call(arguments);
}
console.log(argumentsChangeArray(1, 2, 3)); //[1,2,3]

var createNewList = argumentsChangeArray.bind(null, 1, 2, 3)

console.log(createNewList(4, 5)); //[ 1, 2, 3, 4, 5 ]
````

# 巧用 reduce 做对象转化
看一端 **egg-core** 的源码，大致作用参考下注释（将controller、service等文件，通过文件读取全部读到内存，然后调用load将这些属性同步到FileLoader的属性上）
````js
// item { properties: [ 'a', 'b', 'c'], exports }
// => target.a.b.c = exports
item.properties.reduce((target, property, index) => {
  let obj;
  const properties = item.properties.slice(0, index + 1).join('.');
  if (index === item.properties.length - 1) {
    ...
    obj = item.exports;
    if (obj && !is.primitive(obj)) {
      obj[FULLPATH] = item.fullpath;
      obj[EXPORTS] = true;
    }
  } else {
    obj = target[property] || {};
  }
  target[property] = obj;
  debug('loaded %s', properties);
  return obj;
}, target);
````

简单看下语法：
````
arr.reduce(callback,[initialValue])
````
callback
- accumulator:  累计器，return 上一次结果
- currentValue：当前处理值
- currentIndex：当前处理的索引
- array：正在调用的数据

initialValue：初始值，默认为arr的第一位元素

1. 简单使用，累加功能
````js
const array1 = [1, 2, 3, 4];
const reducer = function(accumulator, currentValue, index) {
    console.log(`第${index}调用---`);
    console.log(`accumulator:${accumulator},currentValue:${currentValue}`);
    return accumulator + currentValue
}
// 1 + 2 + 3 + 4
console.log(array1.reduce(reducer));//10
// 第1调用---
// accumulator:1,currentValue:2
// 第2调用---
// accumulator:3,currentValue:3
// 第3调用---
// accumulator:6,currentValue:4
````
2. 数组去重
````
let arr = [1, 2, 1, 2, 3, 5, 4, 5, 3, 4, 4, 4, 4];
let result = arr.sort().reduce((init, current) => {
    if (init.length === 0 || init[init.length - 1] !== current) {
        init.push(current);
    }
    return init;
}, []);
console.log(result); //[1,2,3,4,5]
````
3. 其他业务的使用（对象加工处理、二维转一维、Prmoise加工、pipe...）
````
var global = {}
var properties = ['getName', 'getAge', 'getSex']
var exports = [() => 'name', () => 'age', () => 'sex']

properties.reduce((target, curr, index) => {
    target[curr] = exports[index];
    return target;
}, global)

console.log(global.getAge()); //age
````

# 参考来源
- [mozilla](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference)
- [逗号操作符 & (0, function)()](https://www.jianshu.com/p/cd188bda72df)
- [void 0 & undefined](https://github.com/hanzichi/underscore-analysis/issues/1)
- [apply call bind](http://web.jobbole.com/83642/)
- [JavaScript专题之偏函数](https://github.com/mqyqingfeng/Blog/issues/43)