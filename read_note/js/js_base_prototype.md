---
js基础--面向对象 原型那些事
---

# 原型对象 propotype

## 理解原型对象

```js
function User() {}
User.prototype.name = "aaaa";
User.prototype.age = 11;
```

当创建一个 User 函数，就会生成一个 prototype 属性，其指向函数的 **原型对象**。

函数的 **原型对象** 会包含一个 **constructor** 构造函数属性，并指向 User 函数。

每个实例化的对象 user1 将有一个 \***\*proto\*\***（不是显示可见的），指向构造函数的原型对象。

![prototype](https://github.com/eminoda/myBlog/blob/master/imgs/js_base/prototype.png?raw=true)

![说明constructor和__proto__](https://github.com/eminoda/myBlog/blob/master/imgs/js_base/prototype1.png?raw=true)

## isPrototypeOf(instance)

**isPrototypeOf** 用于确认实例对象内部的**proto**属性，是否调用 User 对象的 prototype 属性的引用 。

```js
User.prototype.isPrototypeOf(user1); //true
```

## getPrototypeOf(instance)

用于获取原型对象的属性。

```js
Object.getPrototypeOf(user1) == User.prototype; //true
user1.name = "bbbb";
user1.name; //bbbb
Object.getPrototypeOf(user1).name; //"aaaa"
```

## 实例对象共享原型属性&方法原理

```js
function User() {}
User.prototype.name = "aaaa";
var user = new User();
console.log(user.name); //aaaa
user.name = "bbbb";
console.log(user.name); //bbbb
delete user.name;
console.log(user.name); //aaaa
user.name = null;
console.log(user.name); //undefined
```

当获取对象某个属性 or 方法时，会先从对象实例开始查询是否有配对的属性；如果没有找到，则会寻找原型对象上的属性 or 方法，因为指针引用是指向原型对象上的。

当时要注意，如果赋值为 null 和使用 delete 删除属性的作用不是一样的。

## hasOwnProperty(key)

判断实例对象是否有自己的属性

```js
function User() {}
var user = new User();
User.prototype.name = "aaaa";
user.hasOwnProperty("name"); //false
user.name = "bbbb";
user.hasOwnProperty("name"); //true
user.hasOwnProperty("sex"); //false
```

追加 demo，vue 判断属性是否存在

```js
var hasOwnProperty = Object.prototype.hasOwnProperty;

function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
}

function User() {
  this.name = "aaaa";
}
User.prototype.nickName = "a";

var user = new User();
console.log(hasOwn(user, "name")); //true
console.log(hasOwn(user, "nickName")); //false
```

## in

判断属性是否存在于对象上或者原型上。

```js
// 结合上例
console.log("sex" in user); //false
console.log("name" in user); //true
```

## 遍历对象上的属性

获取对象上可枚举的属性

```js
function User() {}
var user = new User();
// 类似for-in
Object.keys(User.prototype); //['name']
Object.keys(user); //[] 因为没有定义instance上的属性
```

但要注意 IE8，会对是否设置了 Enumerable 属性有限制效果

获取对象上所有的属性

```js
Object.getOwnPropertyNames(User); //["length", "name", "arguments", "caller", "prototype"]
Object.getOwnPropertyNames(User.prototype); //["constructor", "name"]
```

## 原型的动态性

即使先实例化好了对象，后面再定义原型属性 or 方法，也是能马上在对象上看到效果。

```js
function User() {}
var user = new User();
User.prototype.say = function() {
  console.log("call");
};
user.say(); //call
```

但要注意不要重写原型对象,因为实例化对象和原型对象本身就是靠引用来保持关系，重写 prototype 后，相当于新建了一个原型对象，引用关系被破坏。

```js
User.prototype = {
  say: function() {
    console.log("call");
  }
};
user.say(); //error
```

## 原型对象的缺点

因为其共享特性是根据指针的引用来联系，所以共享例如数组等引用对象时，就会暴露问题。

```js
function User() {}
var user = new User();
User.prototype.girls = [];
var user1 = new User();
var user2 = new User();
user1.girls.push("cccc");
user2.girls; //["cccc"] user2被污染了
```

over
