---
title: 如何在 hexo 博客中，集成 gitalk 评论插件
tags:
  - hexo
  - gitalk
categories:
  - 开发
  - 前端开发
thumb_img: gitalk.png
date: 2021-06-16 16:11:32
---


# 前言

我的 **hexo** 站点跑了 2 年多，自从多说凉了后，就没法看到访客的反馈。

有幸前阵子看到了 **gitalk**，一款和 **gitment** 一样的评论插件，评论数据都被国人骚操存储在 **github issues** 中，也免去管理后台查看，很是方便。

这篇就来看下， **hexo** 如何集成 **gitalk** 吧。

# Github 添加 OAuth Apps 授权应用

1. 登录 **Github** ，右键头像，在下拉菜单中，选择“**Settings**”选项

   {% asset_img github-oauth-setting-1.png github授权应用设置1 %}

2. 在左侧菜单选择“**Developer settings**”选项，进入开发者页面

   {% asset_img github-oauth-setting-2.png github授权应用设置2 %}

3. 选择 **OAuth Apps** ，并点击“**New OAuth App**”创建新授权应用

   {% asset_img github-oauth-setting-3.png github授权应用设置3 %}

4. 设置该应用相关信息

   - Application name 应用名称
   - Homepage URL 博客主页
   - Authorization callback URL 授权回调页面（同 Homepage URL）

   {% asset_img github-oauth-setting-4.png github授权应用设置4 %}

5. 保存好 **Client ID** 和 **Client secrets**，后续初始化 **gitalk** 需要

   {% asset_img github-oauth-setting-5.png github授权应用设置5 %}

# Hexo 添加 gitalk 模板

为了在每篇文章底部嵌入评论模块，需要在 **hexo** 对应的主体 **post** 模板中添加相关代码。

进入到 **themes\next\layout_macro\post.swig**（我的博客是基于 Next，如果有差异，替换路径中的 next 即可），添加 **gitalk** 模板文件的导入：

```html
<!-- {### Line 357，如果行数有差异，只需要在 POST END 文章结束后添加即可 ###} -->
{% if theme.git_talk.enabled and not is_index %}
<div>{% include 'git-talk.swig' %}</div>
{% endif %}
```

因为需要用到 **Client ID** 和 **Client secrets**，可以在对应主题的配置文件 **themes\next_config.yml** 中，将这两个参数配置化：

```yaml
git_talk:
  enabled: true
  clientID: xxxxxxxxx
  clientSecret: xxxxxxxxxxxxxx
```

然后添加 **git-talk.swig** 文件（**themes\next\layout_macro\git-talk.swig**）

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.css" />
<script src="https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.min.js"></script>

<div id="gitalk-container"></div>

<script type="text/javascript">
  var gitalk = new Gitalk({
    clientID: "{{theme.git_talk.clientID}}",
    clientSecret: "{{theme.git_talk.clientSecret}}",
    repo: "eminoda.github.io", // 博客仓库地址
    owner: "eminoda", // github 用户名
    admin: ["eminoda"], // github 用户名
    perPage: 20,
    id: location.pathname.slice(0, 50), // 查找 issus 的条件，后面将对 id 有针对逻辑
    title: "{{page.title}}",
    body: "🚀 " + location.href + "\n\n欢迎通过 issues 留言 ，互相交流学习😊", // 初始化后，issues 的内容
  });
  gitalk.render("gitalk-container");
</script>
```

**gitalk** 插件的逻辑是这样的：

首先，查询该 **repo** 仓库里 **issues** 中是否有 **id** 的记录，如果没有，则需要对应管理员 **admin** （也就是博主）来进行 **issue** 的创建。

当对应 **admin** 在页面点击创建后，**gitalk** 将在 **issues** 新增一条记录（该 **issue** 的内容就是 **new Gitalk** 中的 **body**）：

{% asset_img github-issue.png 新增 issue %}

如果 **issue** 已创建，当前授权的访客将通过 **gitalk** 做评论回复。我们整个博客地评论体系就达成了。

# 历史文章批量初始化

对于一个刚起步的博客站点没有任何问题，新增一篇文章，初始化下 **issue**，顺手的事情。

但对于一个历史站点，里面可能有百篇文章，如果希望看到别人阅读的回复，则需要人工每篇进行初始化，不太现实，则需要程序来批量初始化。

这里需要注意：

- **gitalk** 初始化中的 **id** 参数，需要通过 **hash** 算法计算一个相对准确的唯一摘要，用于判断 **issue** 是否初始化过
- 需要调用 Github API 来得知目前 **issues** 的情况，接口调用有 [频率限制](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting)，对于未授权的接口 60 个/小时，授权接口 5000 个/小时
- 开启 **OAuth** 认证，需要在 **Developer Setting** 开启 **Personal access tokens**

{% asset_img github-token.png token设置 %}

下面新建 **[gittalk-batch.js](https://github.com/eminoda/myBlog/blob/master/eminoda.github.io/gittalk-batch.js)** 来批量初始化：

```js
// 模块
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const md5 = require("blueimp-md5");
const yaml = require("yaml-js");

// github 配置
const github = {
  token: "", // 创建 Personal access tokens 得到（需要保护好）
  clientID: "f5e934819613a06d3a38",
  clientSecret: "f9ff1926fed5174d6f6e438e5e37dd5341af81fe",
  owner: "eminoda",
  repo: "eminoda.github.io",
};
const ISSUES_API = "https://api.github.com/repos/" + github.owner + "/" + github.repo + "/issues";
const POST_DIR = path.join(__dirname, "/source/_posts");

// 针对 Rate Limiting 限速问题（目前没用）
const lazyTimer = (fn) => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      await fn();
      resolve();
    }, 0);
  });
};

// 初始化创建 Issues
const createIssues = async ({ title, id, filePath, hrefTitle }) => {
  const errMsg = [];
  try {
    // 是否初始化过
    const { data: issues } = await axios.get(ISSUES_API, {
      params: { labels: ["Gitalk", id].join(",") },
      headers: {
        Authorization: "token " + github.token,
      },
    });
    if (!issues || issues.length == 0) {
      console.log(filePath, "正在创建 issues ...");
      try {
        // 开始初始化
        await axios.post(
          ISSUES_API,
          {
            body: "🚀 " + "https://eminoda.github.io" + hrefTitle + "\n\n欢迎通过 issues 留言 ，互相交流学习😊",
            labels: ["Gitalk", id],
            title,
          },
          {
            headers: {
              Authorization: "token " + github.token,
            },
          }
        );
        console.log(filePath, "创建完毕");
      } catch (err) {
        console.log(filePath, "创建失败");
        errMsg.push({ filePath, msg: "生成 issues 错误", err });
      }
    } else {
      console.log(filePath, "已存在");
    }
  } catch (err) {
    console.log(filePath, "查询失败");
    errMsg.push({ filePath, msg: "新建 issues 错误", err });
  }
  return errMsg;
};
```

```js
const pFn = [];

// 遍历 post 文件夹，判断有多少文章需要创建评论模块
fs.readdirSync(POST_DIR).forEach((item) => {
  const filePath = path.join(POST_DIR, item);
  const stat = fs.statSync(filePath);
  if (stat && !stat.isDirectory()) {
    const str = fs.readFileSync(filePath).toString();
    const yamlStr = str.split("---")[1];
    if (yamlStr) {
      const title = yaml.load(yamlStr).title;
      const hrefTitle = "/" + item.slice(0, 10).replace(/-/g, "/") + "/" + item.slice(11).split(".md")[0] + "/";
      const id = md5(hrefTitle);
      pFn.push((next) => {
        lazyTimer(async () => {
          await createIssues({ title, id, filePath, hrefTitle });
          next();
        });
      });
      // pFn.push(createIssues({ title, id, filePath }));
    }
  }
});
```

```js
// 依次发送请求，copy koa-compose
function compose(pFns) {
  return function (next) {
    let index = -1;
    return dispatch(0);
    function dispatch(i) {
      index = i;
      let fn = pFns[i];
      // 最后次
      if (i == pFns.length) fn = next;
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
}

compose(pFn)(() => {
  console.log("over");
});
```

再次修改 **git-talk.swig**，根据上面的 **id** 调整 **gitalk** 中 **id** 值，通过 **md5** 算出页面地址对应的 **hash** 值作为 **issue** 主键：

```html
<div id="gitalk-container"></div>

<!-- 前端页面添加 md5 文件（blueimp-md5） -->
{% set md5_js_uri = url_for('/lib/md5/md5.min.js') %}
<script src="{{ md5_js_uri }}"></script>

<script type="text/javascript">
  var gitalk = new Gitalk({
    // ...
    id: md5("{{url_for(page.path)}}"),
    // ...
  });
  gitalk.render("gitalk-container");
</script>
```

# 安全授权问题

由于用户评论需要通过 **Github OAuth** 授权给 **gitalk**，中间 **gitalk** 会在浏览器的 **localStorage** 中保存 **GT_ACCESS_TOKEN**，这个 **token** 权限过于粗大。

对于 [不怀好意](https://www.v2ex.com/t/535608) 的博客站点，可能会利用这个 **token** 做一些我们预料不到的事情，甚至于删库跑路。

目前解决方案过于复杂，完全背离使用这个插件的便利性，无论对博主还是访客。所以对于访客还需甄别 **网站的质量**。

为了避免访客的顾虑问题，我在 **git-talk.swig** 模板中添加了跳转 github issues 的链接选项（这里不过多展开，有兴趣[可以看下](https://github.com/eminoda/myBlog/blob/master/eminoda.github.io/themes/next/layout/_macro/git-talk.swig)）

{% asset_img gitalk-safe.png %}

# 参考

- [Hexo 中 Gitalk 配置使用教程-可能是目前最详细的教程](https://iochen.com/post/use-gitalk-in-hexo/)
- [hexo gitalk 评论自动初始化](https://blog.jijian.link/2020-01-10/hexo-gitalk-auto-init/)
- [报错出现 Error: Validation Failed.](https://github.com/gitalk/gitalk/issues/102)
- [hexo 全局页面变量](https://hexo.io/zh-cn/docs/variables.html#%E9%A1%B5%E9%9D%A2%E5%8F%98%E9%87%8F)
- [Github Rate limiting](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting)
- [Github oauth2-token](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#oauth2-token-sent-in-a-header)
- [建议大家弃用 Gitalk 和 Gitment 等权限过高的 Github OAuth App](https://www.v2ex.com/t/535608)
