---
title: jenkins配置gitlab hook
tags:
  - jenkins
  - gitlab
categories:
  - 运维
thumb_img: hook.jpg
date: 2018-05-04 15:04:26
---


{% asset_img gitlab.png %}
我们已经用了github的web hook完成了和jenkins hook的对接。还需要了解的同学请看下[jenkins自动部署（github）](http://127.0.0.1:4000/2018/04/27/jenkins-auto-deploy/)
当然对于公司不想开源source，肯定内部需要搭建自己的版本管理平台，比如gitlab。这里讲解下配置过程，可能会解决你遇到的问题。

## 选择版本
下面给出我们的环境，尽可能保持一致以免发生不可描述的问题。
- gitlab v10.7.2
    如果还是8.x.x的，赶紧联系运维大佬升级，不然旧版本发送的地址是v3，而我们需要的是v4
    {% asset_img version.png %}
- jenkins v2.110
- jenkins plugins：Gitlab Authentication plugin v1.4

## 配置gitlab
1. 开启权限，不然你可能会遇到如下错误
    {% asset_img gitlab-1.png %}
    ````
    Requests to the local network are not allowed
    ````
    {% asset_img error-1.png %}

2. 生成token，他这个比较6，还有有效期
    {% asset_img gitlab-2.png %}

3. 在对应项目中，配置jenkins hook和token，以及触发条件
    {% asset_img gitlab-3.png %}

4. 测试一下
    {% asset_img gitlab-4.png %}
    会出现如下错误，是jenkins的gitlab插件没有配置好。[原因:https://github.com/jenkinsci/gitlab-plugin/issues/375](https://github.com/jenkinsci/gitlab-plugin/issues/375)
    ````
    executed successfully but returned HTTP 403
    ````
    {% asset_img error-2.png %}

## 配置jenkins
1. token Credentials配置
    {% asset_img jenkins-1.png %}

2. 插件检测，一定要Success
    注意这里的配置，解决executed successfully but returned HTTP 403
    {% asset_img jenkins-2.png %}

3. 在job中配置触发器
    注意：这里有jenkins的hook，供gitlab使用
    {% asset_img jenkins-3.png %}
    
## 放个结果
能看到新的构建#5
{% asset_img result.gif %}