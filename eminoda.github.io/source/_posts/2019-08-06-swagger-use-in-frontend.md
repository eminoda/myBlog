---
title: Swagger 在前端的使用
tags: eslint
categories:
  - 开发
  - 前端开发
thumb_img: swagger.png
date: 2019-08-06 18:23:59
---

一直游走于客户端开发，服务端没怎么涉及。之前团队有过这样的议题：Rap2 vs Swagger 哪个好？我真不知道怎么回答，因为没用过两者。

这篇，将尽可能“从无到有”来说明使用 Swagger 写文档在前端的使用的可行性。置于前面那个问题，在长时间的使用下肯定会有定论。

## 大背景（流水账）

在开始使用 Swagger 之前，先看下我们公司目前的情况。

### 谁在使用

Java 是服务端“大户”。随着前后端分离，“使用方”（原生开发 er、前端开发 er）的不断加入。Java 开发们从自给自足，这时需要给外界提供更好的 Api 文档机制。这通常也是开发 **最头疼** 的玩意。

不断尝试摸索，文档方式从原先 Excel ，到 Gitbook、Wiki ，当然对于我们“使用方”来说，早就受够了他们提供的这些糟粕的文档。

上年，他们转战 Spring boot 玩新项目时，开始用了 Swagger ，同时也是我首次接触这么个工具。

相对于前些方式，Swagger 无论文档质量，还是更新维护都给我留下了不错的使用体验。

### 前端的契机

是契机还是“坑”？

随着后端 Java 的逐渐“沉淀”，越来越多的需求冲突，场景问题暴露在现实中。公司开始增加 Node 在项目中的比重，前端慢慢的担当起整个链路上的主角（只是没有光环而已 :sweat_smile:，出问题还要背锅）

既然 Node 会在后端提供服务，那不可避免会和 Java 一样需要输出 Api 文档。有文档，就需要维护，有维护就会有成本。

面对更多的技术挑战，这到底是坑，还是契机，需要各位执行判断了。

## Swagger

### 编辑服务

swagger-api 提供了基础的 Swagger 服务，通过它能搭建一个最简单的 API 服务。

假如你是个有经验的前端开发，以下这些都不是什么问题：

```js
npm install -g swagger
```

```js
// 创建一个 hello-world 项目
swagger project create hello-world
```

```js
// Swagger 文档编辑模式
swagger project edit
```

一切 ok，你将看到一个 Swagger 基础的编辑页面

{% asset_img swagger-edit.png edit-page %}

如果“使用方”不在意这样的编辑模式，完全可以把这个服务放到测试环境，供团队使用。

当然还有些问题：

- 可以再用 start 命令起个供接口调用的服务，但服务就会变成两个（edit 和 start）不易维护
- edit 虽然有点同步更新作用，但和项目代码“离得太远”
- 通过 edit 维护，成本太高

### 初版服务

是否有类似 Java 注解解析生成 Swagger 文档的工具？

答案是有的。

#### jsdoc

在开始之前，先介绍前端 **注释解析生成文档的工具 —— jsdoc**，我觉得说下很有必要

按照 jsdoc 的规范，描述一个方法将通过如下形式：

```js
/**
 * @function GET /
 *
 * @description 首页
 *
 * @param ctx {Number} ctx
 * @param ctx.username {String} 用户名
 * @param ctx.password {Number} 密码
 *
 * @returns {Html}
 */
router.get('/', async (ctx, next) => {
  await ctx.render('index');
});
```

这样的注释有什么用？

- 更规范的注释结构
- 通过命名，会自动输出文档（egg 的文档就是这样输出的）

{% asset_img jsdoc.png jsdoc 部分文档 %}

#### swagger-jsdoc

参照 jsdoc ，很容易找到社区有类似的插件 swagger-jsdoc，作用就不在解释了，可以直接输出 Swagger 可识别的 json 规则。

使用 @swagger 作为注释解析的专用标题，注释以 yaml 维护

```js
/**
 * @swagger
 * /user:
 *   get:
 *     description: 用户信息
 *     tags:
 *      - Users
 *     parameters:
 *      - name: username
 *        in: query
 *        description: 用户名
 *        required: true
 *        type: string
 *        default: '18702141422'
 *     responses:
 *       200:
 *         description: users
 */
router.get('/user', function(ctx, next) {
  ctx.body = {};
});
```

声明一个 Swagger 定义文件 swaggerOptions.js

```js
module.exports = {
  info: {
    // API informations (required)
    title: 'Hello World', // Title (required)
    version: '1.0.0', // Version (required)
    description: 'A sample API' // Description (optional)
  },
  schemes: ['http'],
  consumes: ['application/x-www-form-urlencoded'],
  produces: ['application/json'],
  apis: ['./routes/global.js', './routes/users.js'],
  basePath: '/api' // Base path (optional)
};
```

运行命令，输出 swagger.json （后续使用）

```text
swagger-jsdoc -d ./swaggerOptions.js
```

#### swagger-ui

swagger-api 社区也提供了一个 Swagger 风格的 ui 模块 —— swagger-ui

你可以结合自己项目的情况，选择 swagger-ui 细致化构建。但我这里直接使用 swagger-ui-dist 直接使用。

既然你是个有经验的开发者，相信对 express 不陌生，swagger-ui-dist 提供了页面所需要的 ui 组件，作为外部资源挂在到 express 公共目录上：

```js
const express = require('express');
const pathToSwaggerUi = require('swagger-ui-dist').absolutePath();

const app = express();

app.use(express.static(pathToSwaggerUi));

app.listen(3000);
```

还记得前面的 swagger.json 吗？swagger-ui 需要这样一个 json 数据包，来显示文档数据。（我把它放到测试机上，并用 Nginx 提供了服务地址）

{% asset_img swagger-ui.jpg swagger-ui %}

#### 雏形

通过这几步，一套初步的前端 Swagger 方案应该能看到了：

1. 维护 yaml 格式的 swagger 注释，描述 api 信息
2. 通过脚本，生成 swagger.json
3. 访问 swagger-ui 服务，输入 swagger 数据源 swagger.json
4. 查看 api 文档

### 自动化服务

相信还是不完美，中间需要运行脚本，还要手动输入 swagger.json 的地址。那有没有办法让 Swagger 文档跟随项目服务，项目一旦有改动提交自动更新 swagger 数据。

你是个有经验的前端开发，答案依旧有。这里只提供思路。

上例中，swagger-ui 基于 express 的公共服务，可以把这些 node_modules/swagger-ui 资源文件导出，放到自己项目中某个目录。

假如你也用 express 服务，可以设置专门的 Swagger 路径，这些在 [serve-static](https://www.npmjs.com/package/serve-static) 都有参考。

关键是其中的 index.html 中间的 script 脚本。

参考 swagger-ui 文档，他们已经为你想到了这一步：

```js
// 修改 index.html

var SwaggerUIBundle = require('swagger-ui-dist').SwaggerUIBundle;

const ui = SwaggerUIBundle({
  url: 'https://petstore.swagger.io/v2/swagger.json', // swagger.json
  dom_id: '#swagger-ui',
  presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
  layout: 'StandaloneLayout'
});
```

这样就解决了 Swagger 跟随项目这个问题。他们是捆绑在一起的，访问项目服务的特殊路径，就能看到 API 文档。

那如何识别自动更新？

构建项目时，加个脚本即可。这里就不再展开了，webpack、gulp 挑个用就行。

## 参考

> 我只是知识点的“加工者”， 更多内容请查阅原文链接 :thought_balloon: ， 同时感谢原作者的付出：

- [swagger](https://github.com/swagger-api/swagger-node)
- [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc)
- [swagger-ui](https://github.com/swagger-api/swagger-ui/blob/551007fe473980427e8b08ff8796ddea5585210e/docs/SUMMARY.md)
