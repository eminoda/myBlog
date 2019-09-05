---
title: jenkins 自动部署（github）
tags: jenkins
categories:
  - 开发
  - 运维部署
date: 2018-04-27 10:59:04
thumb_img: jenkins2.jpg
---

看了[初识 jenkins](/2018/04/27/jenkins-quickstart/),应该对 jenkins 有个入门级的了解。
在这篇文章中，将继续进阶学习 jenkins 的**持续**集成，结合 github 完成自动化构建部署。

## 来看个**传统**方式

{% asset_img example-1.gif %}
我们要经历哪些步骤？

- 打开 IDE，进入项目
- 构建项目
- 将 build 后的包复制出来
- 打开 ftp 工具，进入指定路径
- 上传包
- 打开 shell 工具，进入指定路径。
- 解压包。并重启服务器

怎么说你也要经历这 7 步，你说很 ok，很方便。那我问你几个问题？

- 生产环境，间隔时间长，可能 1 周一次，感觉很 ok。但是手工发布，就算是老司机，你不怕出错（手抖 rm -rf /）？
- 如果测试环境，每天都要发怎么办？
- 如果团队支撑多个项目，每天都要给产品、测试看功能迭代，bug 修复，你还能忍受？（懂的人，知道我在说什么。这 TM 发个包都要浪费我的半天）
- 你能确保每次发布不出错？每次构建项目不会有 Bug（当然这个测试放在之后文章说）

## 持续交付

{% asset_img example-2.jpg %}
简单描述下：
项目成员 pull code 到代码仓库
然后专门一个 Server 开始构建项目（build->test->result）
然后 Result 实时返回给项目成员
最后整个通过，我们手工点击，发布项目。

这是持续交付，当然 jenkins 是持续集成，不知道这样说明不明确。

### 配置 git

{% asset_img config-1.png %}
选择版本工具，设置项目地址和证书权限，也能定义不同 Branch

### 配置 SSH

安装 SSH 插件，并授权到发布 Server。这样 jenkins 可以和发布 Server 建立起通信关系。
{% asset_img config-2.png 下载插件 %}
{% asset_img config-3.png 配置ssh认证 %}
{% asset_img config-4.png 配置ssh认证 %}

可以定义上传 package 的路径，自定义一些 shell 脚本
{% asset_img config-5.png 构建时候对远端server做一些处理 %}
{% asset_img config-6.png foo %}

## 持续部署（github hook）

和持续集成不同的是，发布是自动触发的。这里拿 github hook 举例。
{% asset_img example-3.jpg %}

### github 设置

选择 github 权限，哪些 event 会触发任务
{% asset_img github-1.png 设置token %}

生成 token，这里在 jenkins 需要使用，切记保存好，下次会是不同的 token!

{% asset_img github-2.png 保存好token %}

设置 Jenkins hook，github 最终调用这个 Api

{% asset_img github-3.png 进入项目，开启jenkins服务 %}

### jenkins 设置

将 github 的 token，配置到 jenkins 中
{% asset_img github-4.png 设置github credentials %}

在全局设置中，测试 token 的链接状态
{% asset_img github-5.png 配置github credentials %}

在 job 中，定义触发器
{% asset_img github-6.png 开始hook %}

## 现在的发布会变成什么样？

{% asset_img example-2.gif %}
我们要经历哪些步骤？

- 提交代码
- 等着看结果...
  一点都不浪费生命^.^
