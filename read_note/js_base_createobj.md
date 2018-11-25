---
js基础--面向对象 2.创建对象
---
# 创建对象
来看下没有类概念的js语言怎么创建对象，已经了解他们之间的区别。

## 工厂模式&构造函数模式
工厂模式
````js
function createUser(name,age){
    var o = new Object();
    o.name = name;
    o.age = age;
    return o;
}
var user = createUser('aaaa',10);
````

构造函数模式
````js
function User(name,age){
    this.name = name;
    this.age = age;
}
var user = new User('aaaa',10);
````

这两者是最简单创建对象，当然还有我们字面量那种方式。对比工厂模式，**构造函数** 的特点如下：
- 没有在函数内部创建对象
- 使用了**this**，属性挂在this上
- 没有return，靠的是对象引用
- 函数名称大写（规范）
- 创建不同对象，其实例不同

优点：
> 创建自定义的构造函数可以将其实例化的对象作为一种特定的类型（能有继承等特性，方便对象的扩展）

缺点&注意点：
- 如果缺失new，其中的this引用就会变成window
- 由于是构造函数，创建不同对象都会实例其中每个属性和方法，即使某些属性和方法是有共性的作用，但不同实例后的对象这些共性方法却是不同的。有些冗余的感觉

````js
User('bbbb',22)
window.name;//bbbb
var user2 = new User('aaaa',11);
user2.name;//aaaa
````
````js
function User(name,age){
    this.name = name;
    this.age = age;
    this.say = function(){
        console.log(`name:${name}`);
    }
}
var user1 = new User('aaaa',11);
var user2 = new User('bbbb',22);

console.log(user1.say==user2.say);//false
````

## 原型模式
用于解决构造函数上定义 **具有共性属性和方法** 的那些特性类型。

````js
function User(name,age){
    this.name = name;
    this.age = age;
}
User.prototype.say = function(){
    console.log(`name:${name}`);
}
var user1 = new User('aaaa',11);
var user2 = new User('bbbb',22);

console.log(user1.say==user2.say);//true
````

## 构造函数+原型模式
> 可以说是一种创建对象的最佳模式，结合了两者的短长
- 利用原型的共享特性，解决重复创建对象属性的问题，节省内存
- 依旧支持对象传参

````js
function User(name){
    this.name = name;
}
User.prototype.say = function(){}
````

## 其他模式
### 动态原型模式
基本同 **构造函数+原型模式**，只是为了更好的只通过构造函数来创建对象，这样符合OO面向对象开发者的习惯，或者是疑惑（原型）
````js
function User(name){
    this.name = name;
    if(typeof this.say != "function"){
        User.prototype.say = function(){}
    }
}
````

### 寄生构造函数模式
和工厂模式类似，只是在构造函数内部创建一个空对象，最后返回

### 稳妥构造函数模式
不知道哪些框架会用这个，或者上面那个，个人感觉没什么意义（打个疑问）
目的：构造函数内部避免使用 **this,new**，防止环境污染等问题
````js
function User(name){
    var o = new Object();
    o.name = name;
    o.say = function(){}
    return 0;
}
var user = User('aaaa');
````

over