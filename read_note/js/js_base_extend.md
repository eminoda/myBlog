---
js基础--面向对象 4.几种继承方式
---
# 原型链继承
## 原理
````js
function Parent(){}
Parent.prototype.name = 'parent';

function Child(){}
Child.prototype = new Parent();
Child.prototype.age = '11';

var instance = new Child();
instance.age//11
instance.name//parent
````
原型之间的引用如下：

![extend_proto](https://github.com/eminoda/myBlog/blob/master/imgs/js_base/extend_proto.png?raw=true)


大致原理：
Parent构造函数有个原型对象，Child构造函数同样也有个，只是将 **Child的原型对象指向Parent的实例**（如：虚线改为红色线），其实就是重写Child的原型引用，之后再定义Child.prototype属性，这样instance就包含Child prototype属性和 **Parent原型的引用**。
![extend](https://github.com/eminoda/myBlog/blob/master/imgs/js_base/extend.png?raw=true)

## 确定原型和实例的关系
1. instanceof
````js
instance instanceof Object; //true
instance instanceof Parent; //true
instance instanceof Child; //true
````

2. isPrototypeOf
判断实例原型是否是某对象原型的一部分
````js
Object.prototype.isPrototypeOf(instance);//true
Parent.prototype.isPrototypeOf(instance);//true
Child.prototype.isPrototypeOf(instance);//true
````

## 缺点
缺点依旧是原型的优点 共享特性 导致，如果定义的父类包含数组等引用类型，不同的子类实例还是会互相污染。
````js
function Parent(){
  this.books = ['parent']
}

function Child(){}
Child.prototype = new Parent();

var instance1 = new Child();
instance1.books.push('instance1')

var instance2 = new Child();
console.log(instance2.books);//["parent", "instance1"]
````

# 借用构造函数继承
**借用 call、apply** 重新创建函数执行环境，这样就会重新使用Parent，避免了共享的污染问题。
````js
function Parent(){
  this.books = ['parent']
}

function Child(){
  Parent.call(this);
}
Child.prototype = new Parent();

var instance1 = new Child();
instance1.books.push('instance1')

var instance2 = new Child();
console.log(instance2.books);//["parent"]
````

缺点：对复用性无从谈起。

# 组合继承
原型链继承+借用构造函数继承，取长补短。但也有其不足之处，调用2次父类的构造函数。
````js
function Parent(name){
    console.log('init');// 2次
    this.name = name;
    this.books = ['parent']
}

function Child(name,nickName){
    // 第一次
    Parent.call(this,name);
    this.nickName = nickName;
}
// 第二次
Child.prototype = new Parent();

var instance1 = new Child('aa','bb');
instance1.books.push('instance1');
console.log(instance1);//{name: "aa", books: Array(2), nickName: "bb"}

var instance2 = new Child();
console.log(instance2.books);//["parent"]
````

# 原型式继承
在函数方法内部创建全新的构造方法，将需要继承对象赋值于原型，从而达到该方式效果
````js
function object(o){
    // 相当于child
    function F(){};
    F.prototype = o;
    return new F();
}
````

值得注意ES5的 **Object.create()** 规范了原型式继承

# 寄生组合式继承
````js
function Parent(name){
  this.name = name;
  this.books = ['parent']
}
function Child(name,nickName){
    //借用构造函数继承
    Parent.call(this,name);
    this.nickName = nickName;
}
function inherits(Child,Parent){
    // 没有像组合继承那样 new Parent,而是通过原型对象来创建一个新的原型对象
    var prototype = Object.create(Parent.prototype);
    // 重新设定引用，Child而非Parent或其他
    prototype.contructor = Child;
    Child.prototype = prototype;
}
// 对于不支持Object.create的浏览器，还是用组合继承。参考：https://github.com/isaacs/inherits/blob/master/inherits_browser.js
inherits(Child,Parent);
var instance  = new Child('aa','bb')
console.log(instance);
````