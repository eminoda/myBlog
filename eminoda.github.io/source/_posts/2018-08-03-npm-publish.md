---
title: npm 发布公共包
tags:
    - npm
categories:
    - 开发
    - node
thumb_img: npm.png
date: 2018-08-03 23:36:57
---

用了那么多 npm 包，那怎么自己上传一个 package 呢？随便一 Baidu 其实都有解决方法，此文只作为个人笔记记录。

[省去千言万语，你自己点进去看吧](https://docs.npmjs.com/getting-started/publishing-npm-packages)

# [先看看怎么 unpublish](https://docs.npmjs.com/cli/unpublish)

> It is generally considered bad behavior to remove versions of a library that others are depending on!

我们使用 npm，都是云上的东西，如果你写的玩意正好被他人用着，哪天**种子下不到了**，的确会造成很多人的麻烦。
如果真的迫不得已，还是使用 deprecate，[了解更多卸载政策？](https://www.npmjs.com/policies/unpublish)。

这里只是做个卸载发布的测试

```js
// 删除不了
E:\my_work\github\myBlog>npm unpublish niu-util@1.0.0
npm ERR! code E400
npm ERR! You can no longer unpublish this version. Please deprecate it instead
npm ERR! npm deprecate -f 'niu-util@*' "this package has been deprecated" : 1-77fa60bb9a3929ac7ce6b933673ba6bf
// 使其失效
E:\my_work\github\myBlog>npm deprecate niu-util "this is demo"
// 从个人账户删除这个pkg
E:\my_work\github\myBlog>npm owner rm eminoda niu-util
- eminoda (niu-util)
```

# 回归正题，怎么上传自己的 pkg

1. 创建一个 npm account
   自己去网上注册个号，没什么说的

2. 登录账号

```js
E:\my_work\github\myBlog>npm adduser
Username: eminoda
Password:
Email: (this IS public) 123456789@qq.com
Logged in as eminoda on https://registry.npmjs.org/.
```

3. [创建&编写 package.json，发布](https://docs.npmjs.com/getting-started/publishing-npm-packages)

```js
npm init
{
  "name": "@eminoda/jest-cli",
  "version": "0.0.1",
  "description": "simple jest command",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC"
}
npm publish
```

4. [当然你也可以自定义 scope](https://docs.npmjs.com/getting-started/scoped-packages)

```js
// 定义scope
E:\jest>npm init --scope=eminoda
// 设置scope
E:\jest>npm config set scope eminoda
// 如果没有公开，将无法提交
E:\jest>npm publish
npm ERR! publish Failed PUT 402
npm ERR! code E402
npm ERR! You must sign up for private packages : @eminoda/jest-cli

npm ERR! A complete log of this run can be found in:
npm ERR!     C:\Users\Administrator\AppData\Roaming\npm-cache\_logs\2018-08-03T15_21_14_351Z-debug.log

E:\jest>npm publish --access=public
+ @eminoda/jest-cli@0.0.1
```

# 总结下

本来如前言说的，半年前上传过一个 module，那时 Baidu 一贴基本包就上去了。但如果落地到知识的总结还是有很多需要学习的。，现在会考虑更多东西，对应的扩展面也大了。
比如：包上传上去，总要考虑如何 delete、update。总看到别人@username 命名的库名...都得到了解答。这 20 分钟收获简单，但意义不小。
如果你也看到这里了，[不妨下载个小包？hexo-jwt](https://www.npmjs.com/package/hexo-jwt)
