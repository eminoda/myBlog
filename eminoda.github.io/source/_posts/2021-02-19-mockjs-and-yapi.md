---
title: YApi 接口管理服务及 Mock.js
tags:
  - Mock.js
  - yapi
categories:
  - 开发
  - 前端开发
date: 2021-02-19 19:10:57
---


# YApi

## 现状

首先，先看下在 **前后端分离** 模式下，前端开发同学一直面临着这些问题：

- 文档编写难以开展，更难以维护
- 缺少接口文档，前端开发时间点滞后，**影响项目进度**
- 没有一个即时调用的后端服务，需要不断在页面中写假数据，**增加开发量**
- 即使有了接口文档，往往因为不清晰的描述，无法准确使用字段，**增加沟通成本**

## 什么是 YApi

> 旨在为开发、产品、测试人员提供更优雅的接口管理服务。可以帮助开发者轻松创建、发布、维护 API。

它的 **可视化的接口管理界面**，**集成 Mock 服务**，足够轻松解决上述这些问题。

Github 上 20k 的 Star 数足以证明它在接口管理领域大家对它的认可。

{% asset_img github.png %}

同时，它还有如下出众的特性：

- 支持 **权限管理**，**私有化部署**：方便，安全的在公司内部进行搭建，和人员管理
- 支持 **数据导入**：对于导入 Swagger、Postman 数据，方便迁移历史项目文档
- 支持 **自动化测试**：为测试团队进行赋能

## 环境安装

因为 YApi 主技术栈为前端，只要准备好 **nodejs** 和 **mongodb** 环境即可通过 **[yapi-cli](https://www.npmjs.com/package/yapi-cli)** 方便的完成，这里不做赘述。

更多详见：[Yapi 安装](https://hellosean1025.github.io/yapi/devops/index.html#%e5%ae%89%e8%a3%85)

## 基本使用

成功安装后，下面展示如何简单的维护一个接口 api：

1. 首先在指定空间下新建一个新项目

   {% asset_img 1.png %}

2. 为新项目设置统一的接口前缀等基础信息

   {% asset_img 2.png %}

3. 对不同模块的接口设置不同的文件夹进行分类

   {% asset_img 3.png %}

4. 创建第一个接口

   定义接口的 **Http 方法** 和 **请求 URL**（还有所属分类，以及接口名称）

   {% asset_img 4.png %}

5. 编写参数

   按照 Http 协议（主要是 **Content-Type** ），定义后端需要的请求参数和响应参数

   {% asset_img 5.png %}

6. 运行

   这里的运行是基于 YApi 的 Mock 服务，依靠此服务，能让完全前端独立出来，不在依赖后端服务
   {% asset_img 6.png %}

7. 预览

   作为文档供所有开发人员阅览

   {% asset_img 7.png %}

# 数据 Mock

## Mock.js

参考“基本使用”，只是完成了接口文档的阅读，及基础调用。下面来介绍 YApi 的核心功能：**数据 Mock**。

数据 Mock 的功能基于 Mock.js 实现，是由 [墨智](https://github.com/nuysoft)大佬 打造的。

下面配合一些使用场景来看下 **Mock.js 与 YApi 的进阶使用方法**：

## Mock 占位符

Mock.js 内置很多 **Random** 功能，便于我们能快速定义一些有意义的假数据。

比如：

- @boolean: 返回一个随机的布尔值
- @natural: 返回一个随机的自然数（大于等于 0 的整数）。
- @integer: 返回一个随机的整数。
- @string: 返回一个随机字符串。
- @word: 随机生成一个单词。
- @province: 随机生成一个（中国）省（或直辖市、自治区、特别行政区）。
- @email: 随机生成一个邮件地址。
- @id: 随机生成一个 18 位身份证。
- ...

以上这些都可以在 [https://github.com/nuysoft/Mock/wiki/Mock.Random](https://github.com/nuysoft/Mock/wiki/Mock.Random) 快速查阅到。

比如有一个 **“用户列表”** 接口，含有用户名，年龄，用户 id 等字段。当我们没有 mock 时，将返回如下数据：

```json
{
  "code": 200,
  "data": [
    {
      "name": "Lorem adipisicing in",
      "age": 18412897.588101894,
      "company": "r",
      "id": "eiusmod"
    },
    {
      "name": "ut eiusmod in",
      "age": 68070733.33913586,
      "company": "culpa quis",
      "id": "min"
    }
  ]
}
```

上述数据在实际使用毫无意义。我们更期望得到如下数据：

```json
{
  "code": 200,
  "data": [
    {
      "name": "是说林",
      "age": 64,
      "company": "non dolor magna minim sed",
      "id": "c970CE5A-B1b4-1faF-c52e-1171Cc6b946A"
    },
    {
      "name": "物南来",
      "age": 57,
      "company": "enim",
      "id": "4EC6Ec4b-b88A-d6Df-78A7-2457Af249Fb2"
    }
  ]
}
```

下面示意，**如何使用 mock 占位符对字段进行修饰**：

{% asset_img mock-basic-1.png %}

{% asset_img mock-basic-2.png %}

运行后，将得到 **“看得懂”** 的数据，这样维护的文档对前端和测试人员的体验感将提升很多：

{% asset_img mock-basic-3.png %}

## 高级 Mock

### 期望

比如在 **用户登录场景**，我们希望输入 **A 账户** 可以正常登录，其他账户则登录失败。

但在开发阶段，后端接口逻辑都没实现，甚至数据库连表都不存在，那前端怎么做？

这时就可以使用 YApi 的 **高级 Mock 期望** 特性：

{% asset_img mock-adv-1.png %}

通过定义 **参数过滤** 来指定可以正常登录的账户信息：

{% asset_img mock-adv-2.png %}

在运行界面，当 username/password 为 eminoda/123456 时才返回预期的成功报文：

{% asset_img mock-adv-3.png %}

### 脚本

单靠 Mock 内置的占位符，和简单的期望规则无法模拟出实际预期的效果。

比如，希望在 **“用户列表”** 接口中 company 字段从某个数组集合中挑选某个作为返回结果值。

这时就需要开发掌握一些 Mock.js 技巧以及 javascript 的语法来完成模拟逻辑（但这些对于经历过 jsp 的后端来说都不是问题，这和前端如今 vue，react 扯不上关系）：

{% asset_img mock-adv-4.png %}

```js
mockJson.code = 200;

params.page = params.page || 1;
params.pageSize = params.pageSize || 10;

const buildData = function (size) {
  let c = 0;
  const list = [];
  while (c < size) {
    list.push({
      name: Random.cword(3),
      age: Random.natural(10, 99),
      id: Random.guid(),
      company: Random.pick(['alibaba', 'bytedance', 'tencent']),
    });
    c++;
  }
  return list;
};
if (params.page < 2) {
  mockJson.data = buildData(10);
} else {
  mockJson.data = buildData(5);
}
```

运行后，将得到如下数据：

```json
{
  "code": 200,
  "data": [
    {
      "name": "六查山",
      "age": 30,
      "id": "67d2f1Fe-D276-fBF2-AdBF-b1FEBA28Dee3",
      "company": "bytedance"
    },
    {
      "name": "次养打",
      "age": 22,
      "id": "cbfF7e85-3CCB-98c4-5ff0-f4F2ee0D5ED6",
      "company": "tencent"
    }
  ]
}
```

高级 Mock 脚本中定义了些全局变量，我们可以从 header、params、cookie 中拿到请求头，和请求参数信息；以及可以通过 mockJson、resHeader、httpCode... 自定义响应数据。

[点击了解更多](https://hellosean1025.github.io/yapi/documents/adv_mock.html#%E8%87%AA%E5%AE%9A%E4%B9%89-mock-%E8%84%9A%E6%9C%AC)

# 自动化测试

这块内容将更多涉及测试（开发）人员，一个项目迭代多次，没有人会知道哪些接口对哪些功能造成什么后果，一个 **高覆盖率的测试用例+可自动化的脚本** 将为项目迭代提供保障。

多数公司的测试都偏向于“人肉”，必然会有不确定性，不稳定性。YApi 为我们提供了一套“可操作”的自动化测试方案：**期望/脚本+自动化执行（报告）**

## 添加用例

示意简单的用例创建

1. 在测试集合中关联对应接口

   {% asset_img mock-test-1.png %}

2. 针对“登录接口”，定义一个能登录成功的请求数据

   {% asset_img mock-test-2.png %}

3. 编写 Test，验证预期结果

   不用担心怎么写，在右侧都有快捷方式（点一下，即可在左侧代码区生成代码）

   {% asset_img mock-test-3.png %}

   **这样就完成了一个用例的编写。**

4. 参照上述步骤，再定义一个“登录失败”的用例（用于对比）

   请求参数填写“错误”的值，在 Test 验证错误的预期判断

   {% asset_img mock-test-4.png %}

## 用例 comb

比如我们有个“删除用户接口”，遵循 Restful 规范，通过 path 作为 id 参数来删除目标用户。

而实际这个 id 需要从“用户列表接口”返回的用户集合中取一条获得，这时删除接口就要依赖列表接口。

YAapi 也提供了 **变量参数** 对应这样的场景：

{% asset_img mock-test-5.png %}

通过特定表达式，来获取上个接口的参数：

```shell
$.4822.body.data[0].id
```

而这个 4822 就是测试集合中的 key 值（用户列表）：

{% asset_img mock-test-6.png %}

[点击了解更多](https://hellosean1025.github.io/yapi/documents/case.html#%e7%ac%ac%e4%ba%8c%e6%ad%a5%ef%bc%8c%e7%bc%96%e8%be%91%e6%b5%8b%e8%af%95%e7%94%a8%e4%be%8b)

## 自动化测试用例

当完成一批的测试集合用例后，可以批量进行自动化测试，从而看接口服务的目前情况。

{% asset_img mock-test-7.png %}

如果我们数据 Mock 足够真实，用例 Test 定义的足够完善，基本可以应对每次系统的迭代发布。一旦用例不通过，只会有两种情况：接口逻辑发生变化、用例写错。

另外，YApi 提供了服务端测试，我们可以获取到用例测试的报告（全量的接口信息，整体响应的时间等维度结果）

{% asset_img mock-test-8.png %}

# 最后

本文只起抛砖引玉作用，示例了小部分的 Mock.js 使用以及 YApi 的实际使用场景，更多的需要开发和相关人员到 YApi 及相关站点阅读更多资料。

另外，可惜的是 YApi 可能不在进行维护，需要额外更多功能的团队就需要二次开发，或者寻找其他适合的工具。

{% asset_img yapi-author.png %}

当然也感谢这些大佬对社区的贡献。

## 参考

- [yapi](https://hellosean1025.github.io/yapi/)
- [Mock.js](https://github.com/nuysoft/Mock/wiki)
- [nodejs assert](http://nodejs.cn/api/assert.html)
