---
title: js-继承
tags:
  - js
  - js 继承
categories: js
comments: true
date: 2017-06-26 22:04:31
---

## 1. 原型链
原理：
* 每个构造函数都有一个原型对象，原型对象包好一个构造函数指针，每个实例包含一个指向原型对象的内部指针。
* 入若原型对象等于另一个实例，原型对象将包含另一个原型的指针。
* 其实就是原型的搜索机制。但Zi.prototype的construtor指向Fu
{% asset_img 1.png 粗糙的图 %}

````
function Fu(){
	this.name = 'Fu';
}
Fu.prototype.getName = function(){
	return this.name;
}
function Zi(){
	this.ziname = 'zi';
}
//继承
Zi.prototype = new Fu();
Zi.prototype.getZiName = function(){
	return this.ziname;
};
var obj = new Zi();
obj.getName();//Fu
````
````
//确定原型和实例的关系
obj instanceof Object;//true
obj instanceof Fu;//true
obj instanceof Zi;//true
Object.prototype.isPrototypeOf(obj);//true
Fu.prototype.isPrototypeOf(obj);//true
Zi.prototype.isPrototypeOf(obj);//true
````
注意：
* 给原型添加的新方法，需要在替换原型语句后。（继承之后）
* 不能使用对象字面量来创建原型，会重写原型链。
缺点：
* 原型属性共享，包含引用类型值的原型属性会被所有实例共享污染。
* 创建子类不能向超类传递参数

## 2. 借用构造函数（经典继承）
````
function Super(newName){
	this.name = [1,2,3];
	this.newName = newName;
}
function Sub(){
	Super.call(this,'new');
}
var obj = new Sub();
obj.name.push(4);//1,2,3,4
var obj1 = new Sub();
obj.name;//1,2,3
````
特点：
* 通过call，apply可以传递参数；
* 构造函数没有复用性

## 组合继承（伪经典继承，常用）
````
function Super(){
	this.name = name;
	this.arr = [1,2,3];
}
Super.prototype.showName = function(){};
function Sub(name,age){
	Super.call(this,name);
	this.age = age;
}
Sub.prototype = new Super();
Sub.prototype.constructor = Sub;
Sub.prototype.showName = function(){};

var o1 = new Sub('aa',11);
o1.arr.push(4);
o1.arr;
o1.showName();

var o2 = new Sub('bb',22);
o2.arr;//1,2,3

````
特点：
1. 借用构造函数，实现对实例属性的继承。
2. 通过原型，实现方法复用。
3. 调用Super2次，call&new Super();

## 原型继承
````
function object(o){
	function F(){};
	F.prototype = o;
	return new F();
}
var person = {
	arr:[1,2,3]
};
var p1 = object(person);
p1.arr.push(4);
var p2 = object(person);
p2.arr;//1,2,3,4

````
````
es5规范：Object.create();
var p3 = Object.create(person);
````
注：Object.create();有两个参数，具体参见文档。
ie9。。。
## 寄生继承
````
function createAnother(original){
 var clone = Object.create(original); //通过调用函数创建一个新对象
 clone.sayHi = function(){    //以某种方式来增强这个对象
  alert("Hi");
 };
  
 return clone;      //返回这个对象
}
//对象不是构造，和自定义类型
var person = {
 name: "Bob",
 friends: ["Shelby", "Court", "Van"]
};
var anotherPerson = createAnother(person);
anotherPerson.friends.push('aaa');
anotherPerson.sayHi();

var anotherPerson2 = createAnother(person);
anotherPerson.friends;//["Shelby", "Court", "Van", "aaa"]
````

## 寄生组合继承(貌似很6)
````
function inheritPrototype(subType, superType){
	//创建父类原型对象一个副本
 var protoType = Object.create(superType.prototype); //创建对象
	//将创建的副本增强，弥补重写原型失去的constructor。将创建副本复制给子类原型
 protoType.constructor = subType;     //增强对象
 subType.prototype = protoType;      //指定对象
}
function SuperType(name){
 this.name = name;
 this.colors = ["red", "blue", "green"];
}
SuperType.prototype.sayName = function(){
 alert(this.name);
}
 
function SubType(name, age){
 SuperType.call(this, name);　　//第1次调用SuperType()
  
 this.age = age;
}
inheritPrototype(SubType, SuperType)
SubType.prototype.sayAge = function(){
 alert(this.age);
}
 
var instance = new SubType("Bob", 18);
instance.sayName();
instance.sayAge();
````