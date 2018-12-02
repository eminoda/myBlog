---
node基础——exports和module.exports的区别？
---

首先要先了解node的模块机制，其实符合commonJS的规范。

node对js做模块编译时，会对模块做 **修改**，看了下面的修改，可能也会明白 **__dirname** 之类的变量为何获取的到之类的问题：

````js
(function(exports,require,module,__filename,__dirname){
    
})
````
那exports和module.exports又有什么区别？

通常情况下，我们直接exports属性方法是不会有什么问题
````js
// test.js
(function(exports,require,module,__filename,__dirname){
    var obj = {
        name:'aaaa',
        say:function(){
            console.log(this.name);
        }
    }
    exports.instance = obj;
})
// other.js
var test = require('./test.js');
console.log(test);//{ instance: { name: 'aaaa', say: [Function: say] } }
````

但是重写exports就会出现问题，不合预期效果：
````js
// test.js
var obj = {
    name: 'aaaa',
    say: function () {
        console.log(this.name);
    }
}
exports = obj;
// other.js
var test = require('./test.js');
console.log(test);//{}
````

**为什么**

因为exports是属于 **形式参数**，如果重写了值，就会影响到导出效果。真正导出的是 **module.exports**，exports其实是module的引用而已。

````js
var obj = {
    name:'aaaa'
}
function doSth(obj){
    obj = {
        nickName:'a'
    }
    return obj;
}
doSth(obj);//{nickName: "a"}
````

````js
var obj = {
    name:'aaaa'
}
function doSth(obj){
    obj.nickName = 'a';
    return obj;
}
doSth(obj);//{name: "aaaa", nickName: "a"}
````