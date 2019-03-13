---
js扩展--JSON 序列化中忽视的小方法
---

# JSON

你肯定很熟悉以下两个方法：

```js
var foo = { name: 'abc', age: 123 };
var fooStr = JSON.stringify(foo); // "{"name":"abc","age":123}"
JSON.parse(fooStr); // {name: "abc", age: 123}
```

这些或许不值一提，平时很常用。但是今天遇到一个问题又让我耽搁很多时间，特此把这个知识点列到这里分享下。

## toJSON

我要讲的就是 toJSON()，先来还原遇到的场景：

使用 koa ，调用 mongoose 查询数据库某些数据

```js
async list() {
    const { ctx, service } = this;
    let data = await this.getTree(ctx.query.id); // mongoose 封装过的 fn
    data[0].test = { name: 111 };
    ctx.body = data;
}
```

我期望 data 是如下内容，但 test 属性屡试都赋值不上去

```js
[
	{
		id: '8e356640-44e3-11e9-bb7c-bb73bcb71afc',
		__v: 0,
		test: {
			name: 111
		}
	}
];
```

再三确认是否 async 或者对象引用，用的“有问题”。其实都没有问题，然后 debugger 找到了问题的源头。

路由层赋值正确

```js
ctx.body = data; // 符合预期
```

顺着 koa 封装的逻辑，跟到解析 body 处，发现前后数据发生了变化

```js
// node_modules\koa\lib\application.js line 243
body = JSON.stringify(body); // JSON 序列化后 不合预期
```

其实是 mongoose 有个 toJSON 方法，使得数据有个专门 schema 进行序列化，而非我们所想的数据单纯的进行 JSON.stringify

```js
Document.prototype.toJSON = function(options) {
	return this.$toObject(options, true);
};
```

扯回正题：

> 如果一个被序列化的对象拥有 toJSON 方法，那么该 toJSON 方法就会覆盖该对象默认的序列化行为：不是那个对象被序列化，而是调用 toJSON 方法后的返回值会被序列化。

终于这个细节问题找到了合理的解释。

## 格式化

如果觉得输出格式不美观，JSON.stringify 有专门设置制表格式的参数。

例如：

```js
JSON.stringify({ name: 'abc', age: 123 }, null, 4);
```

```js
"{
    "name": "abc",
    "age": 123
}"
```

当然也可以使用 制表符：'\t'

## 对象复制

使用 JSON 完成对象的深复制

over
