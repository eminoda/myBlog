---
js基础--数组 常用方法
---

## splice

对数组做删除，添加元素操作

```js
arrayObject.splice(index,howmany,item1,.....,itemX)
```

-   index 索引，从 0 开始（删除：index 包含当前开始，添加：index 后开始）
-   howmany 设置 0 不会删除元素；（>=0 为合法参数）

```js
// splice
var arr = [2, 3, 4, 1];
// 删除
console.log(arr.splice(2, 1)); //[4]
console.log(arr); //[ 2, 3, 1 ]
console.log(arr.splice(2, 2)); //[1]
console.log(arr); //[ 2, 3 ]
// 非法
console.log(arr.splice(2, "sf")); //[]
console.log(arr); //[ 2, 3 ]
// 非法
console.log(arr.splice(2, -1)); //[]
console.log(arr); //[ 2, 3 ]

// 添加
arr = [2, 3, 4, 1];
arr.splice(1, 0, "a", "b");
console.log(arr); //[ 2, 'a', 'b', 3, 4, 1 ]

// vue 移除元素
function remove(arr, item) {
	if (arr.length) {
		var index = arr.indexOf(item);
		if (index > -1) {
			return arr.splice(index, 1);
		}
	}
}
console.log(remove(arr, "a")); //[ 'a' ]
console.log(arr); //[ 2, 'b', 3, 4, 1 ]
```

## slice

根据设置的开始和结束索引，返回一个新数组对象。**原数组不变**

```js
arrayObject.slice([begin], [end]);
```

-   begin 默认 0 开始
-   end 结束索引，如果为负数，则倒序获取。超出 length，则返回 length

```js
var arr = [2, 3, 4, 9, 6, 7];
// 从索引2开始
console.log(arr.slice(2)); //[ 4, 9, 6, 7 ];
// 原数组不变
console.log(arr); //[ 2, 3, 4, 9, 6, 7 ]

// 结束索引为负数，倒序获取
console.log(arr.slice(1, -3)); //[ 3, 4 ]
console.log(arr.slice(3, -3)); //[]

var objArr = [
	{
		name: "aaa"
	},
	{
		name: "bbb"
	}
];
```

浅拷贝

````js
var newObjArr = objArr.slice(); //copy
newObjArr[1].name = "ccc";

console.log(objArr); //[ { name: 'aaa' }, { name: 'ccc' } ]
```
````

## pop & push

> pop 从数组中删除最后一个元素，并返回该元素的值。此方法更改数组的长度。

> push 和 pop 相反，添加元素

对应就是队列的出栈和进栈操作。

```js
var popArr = [1, 2, 3, 4, 5, 6];
//数组 popArr 最后位元素被移除，数组长度 -1
popArr.pop();
console.log(popArr); //[ 1, 2, 3, 4, 5 ]
popArr.push(7);
console.log(popArr); //[ 1, 2, 3, 4, 5, 7 ]
```

## map&filter

这两者其实不像进出栈那么有关系，但是这里说一个小场景一起解释这两者的使用。先看下基本概念：

**map**

> 创建一个新数组，其结果是该数组中的每个元素都调用一个提供的函数后返回的结果

```js
var new_array = arr.map(function callback(currentValue[, index[, array]]) {
 // Return element for new_array }[,
thisArg])
```

```js
var newArr = [1, 2, 3].map(function(element) {
	return element * 2;
});
// [2, 4, 6]
```

**filter**

> 接受一个 callback 自定义函数，数组每个元素都会执行该函数，根据执行结果重新生成新的函数（相当于过滤功能）

```js
var new_array = arr.filter(callback(element[, index[, array]])[, thisArg])
```

```js
var newArr = [12, 5, 2, 20].filter(function(element) {
	return element > 10;
});
// [12, 20]
```

**备注至少 IE9 才能使用**

在 vue 一个运用 Example，这样就知道具体怎么回事了。

```js
function pluckModuleFunction<F: Function>(modules: ?Array<Object>, key: string): Array<F> {
	return modules ? modules.map(m => m[key]).filter(_ => _) : [];
}
```
