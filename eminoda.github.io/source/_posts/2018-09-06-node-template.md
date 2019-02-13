---
title: Node 页面模板之 Nunjucks
tags:
    - nunjucks
categories:
    - 开发
    - node
thumb_img: nunjucks.png
date: 2018-09-06 15:46:51
---

# 看下常见的 Template

**github 上一些对比**
{% asset_img github.png %}

# 为何选择 nunjuks？

-   mozilla 项目
-   有完善的文档，简约设计，详细 API，还有 **中文版本**
-   模板 html 风格。不像 jade 那么重视严谨的缩进
-   包含主流模板功能。继承、过滤器、逻辑判断、循环...
-   可支持到 IE8

# nunjuck 常用 API

如果你愿意，直接跳过以下内容，[点击看官网](https://mozilla.github.io/nunjucks/templating.html)

## 变量（Variables）

```
<div>{{member.realName}}</div>
```

若一个 undefined 的变量，获取其下的属性，模板是不会有输出的，当然不会 throw error

```
{{user.name}} // user=undefined
```

## 过滤器（filters）

[常用内置过滤器](https://mozilla.github.io/nunjucks/templating.html#builtin-filters)

**自定义过滤器**

1. create nunjucks env
2. env 下挂载过滤器方法

app.js

```
env.addFilter('money', (value, format) => {
  return numeral(value).format(format);
})
```

njk

```
{{money|money('0.00')}}
```

## 模板继承（template inheritance）

parent.njk

```
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>{{ title }}</title>
        <link href="/stylesheets/style.css" rel="stylesheet">
    </head>
    <body>
        {% block content %}
        // 如果你想保留此书的业务数据，可以在child使用{{super()}}
        {% endblock %}
    </body>
</html>
```

child.njk

```
{% extends './layout.nunjucks' %}

{% block content %}
    {{money|money('0.00')}}
{% endblock %}
```

## [标签 Tag](https://mozilla.github.io/nunjucks/templating.html#tags)

-   if
-   for
-   set
-   extends
-   block
-   include
-   filter
-   ...

## 注释 Comments

```
{# Loop through all the users #}
```

## 表达式 Expressions

1. 逻辑 Logic

-   and
-   or
-   not **注意没有!foo 这样的判断**
-   组合

```
{% if users and showUsers %}...{% endif %}
{% if i == 0 and not hideFirst %}...{% endif %}
{% if (x < 5 or y < 5) and foo %}...{% endif %}
```

2. Math 支持数学运算
3. 比较能力 == === >= != >...
4. 正则&函数运行

# 如何在 Node 中使用

## 直接利用 njk 的 api（复杂）

app.js

```js
// 创建njk环境
const env = nunjucksService.createEnvironment(path.join(__dirname, 'views'), {});
// 设置njk过滤器
nunjucksService.setFilter(env);
// 设置njk中间件，以适应koa模式
app.use(
	nunjucksService.createMiddleware({
		env: env,
		ext: '.html',
		path: path.join(__dirname, 'views')
	})
);
```

nunjucksService.js

```js
const bluebird = require('bluebird');
const path = require('path');
const nunjucks = require('nunjucks');
module.exports = {
	// 创建环境
	createEnvironment: function(path, options) {
		return new nunjucks.Environment(
			// 由于基于node，所以要建立一个文件系统体系
			new nunjucks.FileSystemLoader(path, options)
		);
	},
	// 模板渲染中间件
	createMiddleware: function(options) {
		options.env.renderAsync = bluebird.promisify(options.env.render);
		return async (ctx, next) => {
			ctx.render = async (view, data) => {
				view += options.ext || '.html';
				// 将ctx的data数据，交给njk render
				return options.env.renderAsync(path.resolve(options.path, view), data).then(html => {
					ctx.type = 'html';
					ctx.body = html;
				});
			};
			await next();
		};
	}
};
```

xx.router.js

```
router.get('/', async (ctx, next) => {
    await ctx.render('index', ctx.state)
})
```

## koa-views（推荐）

之前没有发现这个库，自己造了个轮子（崩溃）。

使用很简单，封装了市面上各种 template，也支持配置

```js
const views = require('koa-views');
app.use(
	views(__dirname + '/views', {
		// 指定模板引擎，default 同extension
		map: {
			suffix: 'nunjucks'
		},
		extension: 'nunjucks', //模板后缀,default html
		options: {
			nunjucks: {
				configure: [
					path.resolve(__dirname, 'views'),
					{
						noCache: false
					}
				]
			}
		}
	})
);
```
