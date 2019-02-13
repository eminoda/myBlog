---
title: jenkins 配置 gitlab hook
tags: jenkins
categories:
    - 开发
    - 工程化
thumb_img: hook.jpg
date: 2018-05-04 15:04:26
---

{% asset_img gitlab.png %}
我们已经用了 github 的 web hook 完成了和 jenkins hook 的对接。还需要了解的同学请看下[jenkins 自动部署（github）](/2018/04/27/jenkins-auto-deploy/)
当然对于公司不想开源 source，肯定内部需要搭建自己的版本管理平台，比如 gitlab。这里讲解下配置过程，可能会解决你遇到的问题。

## 选择版本

下面给出我们的环境，尽可能保持一致以免发生不可描述的问题。

-   gitlab v10.7.2
    如果还是 8.x.x 的，赶紧联系运维大佬升级，不然旧版本发送的地址是 v3，而我们需要的是 v4
    {% asset_img version.png %}
-   jenkins v2.110
-   jenkins plugins：Gitlab Authentication plugin v1.4

## 配置 gitlab

1. 开启权限，不然你可能会遇到如下错误
   {% asset_img gitlab-1.png %}

    ```
    Requests to the local network are not allowed
    ```

    {% asset_img error-1.png %}

    备注下，如果是默认安装 gitlab，其日志输出在如下位置

    ```
    tail -f /var/log/gitlab/gitlab-rails/production.log
    ```

2. 生成 token，他这个比较 6，还有有效期
   {% asset_img gitlab-2.png %}

3. 在对应项目中，配置 jenkins hook 和 token，以及触发条件
   {% asset_img gitlab-3.png %}

4. 测试一下
   {% asset_img gitlab-4.png %}
   会出现如下错误，是 jenkins 的 gitlab 插件没有配置好。[原因:https://github.com/jenkinsci/gitlab-plugin/issues/375](https://github.com/jenkinsci/gitlab-plugin/issues/375)
    ```
    executed successfully but returned HTTP 403
    ```
    {% asset_img error-2.png %}

## 配置 jenkins

1. token Credentials 配置
   {% asset_img jenkins-1.png %}

2. 插件检测，一定要 Success
   注意这里的配置，解决 executed successfully but returned HTTP 403
   {% asset_img jenkins-2.png %}

3. 在 job 中配置触发器
   注意：这里有 jenkins 的 hook，供 gitlab 使用
   {% asset_img jenkins-3.png %}

## 放个结果

能看到新的构建#5
{% asset_img result.gif %}

## 参考

| https://docs.gitlab.com/ee/integration/jenkins.html

## 还有个其他方式

撇一嘴，如果因为某些原因公司的 gitlab 版本比较低，像我们公司是 8.8.5（运维说无法无缝升级到 10，所以就凉凉了），那是无法使用上面这种方式。
但你可以使用如下这个方式。

1. jenkins 下载 gitlab-hook-plugin

2. 配置 gitlab
   URL 配置：
   [官网写的很清楚，点击查看](https://github.com/jenkinsci/gitlab-hook-plugin#notify-commit-hook)

```
http://your-jenkins-server/gitlab/notify_commit
```

TOKEN 配置：
{% asset_img gitlab-old.png %}

3. 配置 gitlab webhook
   {% asset_img gitlab-old-setting.png %}

4. 设置 jenkins
   勾选 poll scm（Source Control Management）。注意红框内容，如果没有制定时间计划，那将根据 gitlab hook 自动构建。
   备注：构建跟着 jenkins 设置的 branch 走的，并非所有 branch 会执行。
   {% asset_img jenkins-scm.png %}
