---
title: git 免密操作
tags:
  - git
categories:
  - 开发
  - 工程化
comments: true
date: 2019-08-02 09:58:48
---


在码云上有个 work 的项目，每次拉取都需要输入账号/密码，很烦。

{% asset_img auth.jpg %}

查看了下如何关闭相关授权操作，有需要的同学可以参考。

## 操作步骤

1. 实现已设置好 ssh 相关信息，这里不作展开，可参见附录
2. 授权 gitee 码云

   ```text
    ssh -T git@gitee.com
   ```

   起初认为按照如上操作，就会和 linux ssh 免密登录一样可事实并非如此

   ```text
   [root@localhost ~]# ssh-copy-id -i
   ```

   可事实并非如此，虽然成功，但 Gitee 并没有提供更多的权限：

   ```text
   Hi XXX! You've successfully authenticated, but Gitee.com does not provide shell access.
   ```

3. 设置 git config

   通过设置 git 配置，保存用户名和密码，让 git 帮我们做一次登录动作

   **设置账号密码的储存时效**

   ```text
   git config --global credential.helper store
   ```

   不过首次需要人工输入，之后就可以达到免密登录了，可以在 git 授权文件中查看到相关信息：

   ```text
   shixinghao@Lenovo-PC MINGW64 ~/.ssh
   $ vi ~/.git-credentials

   https://your username:your password@gitee.com
   ```

## 参考

> 我只是知识点的“加工者”， 更多内容请查阅原文链接 :thought_balloon: ， 同时感谢原作者的付出：

- [Git 免密码操作](https://blog.csdn.net/fg881218/article/details/86017187)
- [码云-生成/添加 SSH 公钥](https://gitee.com/help/articles/4181#article-header0)
