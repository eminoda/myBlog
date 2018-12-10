---
js基础--函数表达式 5.闭包
---
# 函数
## 两种定义方式
- 函数声明
- 函数表达式

## 函数声明提升
对于 **函数声明**，具有该特性

````js
say();//调用在声明之前，不会报错
function say(){}
````

**注意**
````js
if(true){
    function say(){
        console.log('if');
    }
}else{
    function say(){
        console.log('else');
    }
}
// 不同浏览器可能申明提升不同，if or else
````

# 闭包
有能力访问另一个函数作用域中的变量
````js
function compare(name){
    // 匿名函数？
    return function(obj1,obj2){
        var name1 = obj1[name];//闭包？
        var name2 = obj2[name];//闭包？
        return name1<name2?-1:name1>name2?1:0;
    }
}
compare('name')({name:2},{name:1});//1
````

**注意**

闭包只是保存了某个对象的引用，调用完后并不会自动垃圾回收。只有当匿名函数被销毁，才会清空引用。
````js
var result = compare('name')({name:2},{name:1});
compare = null;
````

**闭包与变量**

发现网上的面试题经常有类似的题目
````js
function test(){
    var arr = [];
    for(var i=1;i<=5;i++){
        console.log('loop::'+i)
        arr[i] = function(){
        console.log('call::'+i)
            return i;
        }
    }
    return arr;
}
````

虽然有些不可思议，原因其实也很简单：arr[i]虽然返回一个函数，并且看似是当前循环的索引，但是对于test函数来说作用域是同一个。也就是会取for循环结束后的i值。
````js
test()[1]()
//loop::1
//loop::2
//loop::3
//loop::4
//loop::5
//call::6
````

通过立即执行函数来对该函数做处理：给原来的函数改为立即执行函数，重新制定作用域。
````js
arr[i] = function(num){
    return function(){
        return num;
    }
}(i)
````