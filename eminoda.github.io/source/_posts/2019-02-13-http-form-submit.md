---
title: 服务端做 form 表单提交
tags:
  - http
categories:
  - 开发
  - 其他
date: 2019-02-13 18:25:11
---


服务端怎么做 form 表单提交？

## 场景

有个 node 服务 serverA 用于做业务接口中间层，完成和下游服务器之间的数据“加工”。普通 ajax api 完全可以胜任，但是遇到 **表单提交** 脑袋就有些懵逼。

比如：serverA 有个 order 订单接口，需要把客户端传过来的数据处理成 form 格式，然后再 submit 到第三方服务端，第三方服务端将回告一个支付页面给客户端。

如果在浏览器端，我们可以直接这样做：

```html
<form action="xxx" ...>
	...
</form>
```

然后 js 一个 submit 就完事了，现在因为这个中间层，这样的动作需要放到服务端来完成，就有些不知所措（在 **林同学** 点播后有了如下方案）。

## 解决

在服务端创建一个新接口，用于接受到 order 请求后，把下游服务器换成自己这个新接口（自己请求自己）

在这个新接口，处理客户端数据，并且提供一个渲染页面：

```html
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>platform</title>
	</head>

	<body>
		<form name="form1" id="form1" action="${ctx.query.url}" method="${ctx.query.method}">
			${inputList}
		</form>
		<script>
			// “自动” 提交
			document.getElementById('form1').submit();
		</script>
	</body>
</html>
```

当客户端接口到此页面后自动提交表单给第三方服务，即可

{% asset_img 1.png 示例 %}

## 总结

对于这样一个业务场景的解决方案，不需要高超的代码能力，但一定要有坚实的实战经验，和牢靠基础知识。

说个玩笑话：

> 我们有个坚强的后盾——Nodejs
