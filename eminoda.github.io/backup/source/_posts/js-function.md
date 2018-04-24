---
title: js-创建函数对象
tags:
  - js
  - js object
categories: js
comments: true
date: 2017-06-25 21:39:12
---

复习下javascript对象函数的一些概念，摘自红宝书

# 创建对象的几种方式
## 1. 工厂模式
````
function createPerson(name,age){
	var o = new Object();
	o.name = name;
	o.age = age;
	o.showName = function(){
		//...
	}
	return o;
};

var person = createPerson('Eminoda',28);
````
解决了创建对个类似对象的问题，但没有解决判断对象类型识别。

## 2. 构造函数
````
function Person(name,age){
	this.name = name;
	this.age = age;
	this.showName = function(){
		//...
	}
}
var person = new Person('FangFang',27);
````
特点：
* 没有显式创建对象;
* 属性赋值给this;
* 无return;
* 函数名首字母大写;
* person保存Person的实例：person.constructor = Person;
* person instanceof Object/Person;
* 通过new创建，不然会属性会定义到window中;

缺点
* 构造函数中定义的方法，在每个实例上要创建一遍（不同实例上调用相同的属性方法是不等价的）
	````
		person1.showName !=person2.showName;
	````

## 3. 原型模式
````
function Person(){}
Person.prototype.name = 'Eminoda';
Person.prototype.age = 10;
Person.prototype.showName = function(){
	//...
}
var person = new Person();
````
原型对象：
创建一个函数，就会为该函数创建一个prototype属性，并指向原型对象。
原型对象会获得一个constructor构造函数属性，指向prototype属性所在函数的指针。
````
Person.prototype.isPrototypeOf(person);//true
Object.getPrototypeOf(person)==Person.prototype;//true
````
特点：
* 属性查找：先在实例对象中寻找，没有往原型对象中找。
* 检查实例中属性存在：
	````
	person.hasOwnProperty('name');//false
	person.name = 'new val';
	person.hasOwnProperty('name');//true
  ````
* 检查原型中属性存在：
	````
	person.hasPrototypeProperty('name');//true
	person.name = 'new val';
	person.hasPrototypeProperty('name');//false
  ````
* 检查属性存在：
	````
	'name' in person;//true
	person.name = 'new val';
	'name' in person;//true
	````
* 如果用{}对象字面量的形式封装prototype下的属性，则会让constructor不指向Person。指向Object。需要在{}中专门再定义construtor属性。
	````
	Person.prototype = {
		construtor:Person,
		//....
	}
	````
缺点：
- 省略了构造函数传参过程;
- 属性被多个实例共享;
	````
	//...
	Person.prototype = {
		//...
		friends:[111,222]
	}
	person1.friends.push('333');
	person2.friends;//111,222,333
	````
## 4. 构造函数模式+原型模式
````
function Person(name,age){
	this.name = name;
	this.age = age;
}
Person.prototype.showName = {
	//...
}
var person = new Person(...)
````
目前使用最广泛

## 5. 动态原型模式
````
function Person(name,age){
	this.name = name;
	this.age = age;
	if(typeof this.showName!='function'){
		Person.prototype.showName = function(){
			//...;
		}
	}
}
var person = new Person(...)
````
将原型和构造函数整合在一起，封装在构造中。
## 6. 寄生构造函数模式
````
function Person(name,age){
	var o = new Object();
	o.name = name;
	o.age = age;
	o.showName = function(){
		//...
	}
	return o;
}
var person = new Person(...);
````
与工厂创建类似
## 7. 稳妥构造函数模式
不知道其意义。和寄生函数类似。只不过对外只暴露方法，目的获取构造属性。






