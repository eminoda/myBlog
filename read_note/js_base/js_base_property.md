---
js基础--面向对象 1.对象属性
---

众所周知，js是一门弱类型、解释型的语言。对于我们后端比如java之类具有**对面对象**（Object-Oriented）的语言来说，其缺少类Class的概念，虽然ES6开始出现了Class，但只是语法糖。

以上只是说个大概意思。本文讲下对象上属性一些API。

# 属性类型
````javascript
var user = {
  name:'aaaa',
  age:10
}
````
这是创建对象最简单的方式（对象字面量），也是我们常用的。虽然简洁，但需要知道对象上定义的属性有其可配置的属性。
> 用于描述属性property的各种特征

## 数据类型
- configurable 是否能调用delete删除属性、修改属性特性、修改访问数据。default：true
- enumerable 可遍历性 for-in。default：true
- writable 修改属性值。default：true
- value 值。default：undefined

````
var user = {};
// 在user对象上，定义name属性，并定义2个内置属性类型
Object.defineProperty(user,'name',{
  writable:false, //属性不可被修改，严格模式下会出错
  value:'bbbb' //设置初始化的值
})
console.log(user.name);// bbbb
user.name = 'cccc'; 
console.log(user.name);// bbbb
````

````
Object.defineProperty(user,'name',{
  configurable:false, //有writable的作用，还有限制不能删除name属性
  value:'bbbb' //设置初始化的值
})
delete user.name //error
Object.defineProperty(user,'name',{
  configurable:true, //如果之前设置false，就不能再次修改回来
})
````

## 访问器属性
- configurable 是否能调用delete删除属性、修改属性特性、修改访问数据。default：true
- enumerable 可遍历性 for-in。default：true
- get
- set

getter、settter和Java语言一样，用于对象数据的读取

````
var user = {
  _name:'aaaa',// 定义一个private属性
  age:10
}
Object.defineProperty(user,'name',{ //创建一个新属性name
  get:function(){
    console.log('get call');
    return this._name;
  }
  set:function(newName){
    console.log('set call');
    this._name = newName
  }
})
user.name //get call  "aaaa"
user.name= 'bbbb' //set call "bbbb"
````
## 定义多个属性
上例都是围绕 Object.defineProperty 定义单个属性。如下定义多个属性：
````
Object.defineProperties(obj,{
  property1:{
    ...
  },
  property2:{
    ...
  }
})
````
## 读取属性
````
var propertyDesc = Object.getOwnPropertyDescriptor(obj,"property");
propertyDesc.value
propertyDesc.writable
...
````

over