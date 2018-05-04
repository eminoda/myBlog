---
title: jenkins自动部署（github）
tags: 
  - jenkins
  - github
categories:
  - 运维
date: 2018-04-27 10:59:04
thumb_img: jenkins2.jpg
---

看了[初识jenkins](/2018/04/27/jenkins-quickstart/),应该对jenkins有个入门级的了解。
在这篇文章中，将继续进阶学习jenkins的**持续**集成，结合github完成自动化构建部署。

## 来看个**传统**方式
{% asset_img example-1.gif %}
我们要经历哪些步骤？
- 打开IDE，进入项目
- 构建项目
- 将build后的包复制出来
- 打开ftp工具，进入指定路径
- 上传包
- 打开shell工具，进入指定路径。
- 解压包。并重启服务器

怎么说你也要经历这7步，你说很ok，很方便。那我问你几个问题？
- 生产环境，间隔时间长，可能1周一次，感觉很ok。但是手工发布，就算是老司机，你不怕出错（手抖rm -rf /）？
- 如果测试环境，每天都要发怎么办？
- 如果团队支撑多个项目，每天都要给产品、测试看功能迭代，bug修复，你还能忍受？（懂的人，知道我在说什么。这TM发个包都要浪费我的半天）
- 你能确保每次发布不出错？每次构建项目不会有Bug（当然这个测试放在之后文章说）

## 持续交付
{% asset_img example-2.jpg %}
简单描述下：
项目成员pull code 到代码仓库
然后专门一个Server开始构建项目（build->test->result）
然后Result实时返回给项目成员
最后整个通过，我们手工点击，发布项目。

这是持续交付，当然jenkins是持续集成，不知道这样说明不明确。

### 配置git
{% asset_img config-1.png %}
选择版本工具，设置项目地址和证书权限，也能定义不同Branch

### 配置SSH
安装SSH插件，并授权到发布Server。这样jenkins可以和发布Server建立起通信关系。
{% asset_img config-2.png 下载插件 %}
{% asset_img config-3.png 配置ssh认证 %}
{% asset_img config-4.png 配置ssh认证 %}

可以定义上传package的路径，自定义一些shell脚本
{% asset_img config-5.png 构建时候对远端server做一些处理 %}
{% asset_img config-6.png foo %}

## 持续部署（github hook）
和持续集成不同的是，发布是自动触发的。这里拿github hook举例。
{% asset_img example-3.jpg %}

### github设置
    选择github权限，哪些event会触发任务
    {% asset_img github-1.png 设置token %}

    生成token，这里在jenkins需要使用，切记保存好，下次会是不同的token!
    {% asset_img github-2.png 保存好token %}

    设置Jenkins hook，github最终调用这个Api
    {% asset_img github-3.png 进入项目，开启jenkins服务 %}

### jenkins设置
    将github的token，配置到jenkins中
    {% asset_img github-4.png 设置github credentials %}

    在全局设置中，测试token的链接状态
    {% asset_img github-5.png 配置github credentials %}

    在job中，定义触发器
    {% asset_img github-6.png 开始hook %}

## 现在的发布会变成什么样？
{% asset_img example-2.gif %}
我们要经历哪些步骤？
- 提交代码
- 等着看结果...
一点都不浪费生命^.^