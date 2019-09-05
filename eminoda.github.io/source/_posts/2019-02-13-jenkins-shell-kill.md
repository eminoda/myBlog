---
title: jenkins 执行脚本成功，但进程未启动
tags: jenkins
categories:
  - 开发
  - 运维部署
thumb_img: jenkins.png
date: 2019-02-13 18:25:27
---

记录个问题，jenkins 成功执行了脚本，但是后台却未见服务进程。

## 还原经过

设置如下：
{% asset_img 1.png 示例 %}

jenkins 构建时，shell 基本操作都执行 ok（创建文件夹，目录切换），同时 **xx.sh** 脚本也正常运行，所有输出都打在 jenkins 的控制台上。

蛋疼的事情来了，进到服务器却没有看到 **xx.sh** 脚本启动的新服务。可是控制台却告诉我服务启动成功的（一个黑人脸）

## 原因

也不知道怎么去百度这个问题，好在看到 google 2 篇文章基本知道了原由所在。

原链接如下，相同问题的道友可以直接看下：
[Jenkins 中通过 execute shell 无法启动进程-解决方案合集](https://blog.csdn.net/u011781521/article/details/80210985)
[jenkins 自动部署中执行 shell 脚本启动 tomcat，但是 tomcat 不启动的问题](https://blog.csdn.net/weixin_39483907/article/details/80840948)

[和 **processTreeKiller** 有关](https://wiki.jenkins.io/display/JENKINS/ProcessTreeKiller#space-menu-link-content)

> To reliably kill processes spawned by a job during a build, Jenkins contains a bit of native code to list up such processes and kill them. This is tested on several platforms and architectures, but if you find a show-stopper problem because of this, you can disable this feature by setting a Java property named "hudson.util.ProcessTree.disable" to the value "true".

大概是：在 job 构建时会杀掉进程，我们如上写的 shell 脚本相当于在 jenkins 提供的容器环境中执行，完事后 jenkins 就会回收掉。如果想要避免就要按照 jenkins 提供的参数，设置 hudson.util.ProcessTree.disable 为 true 解决。

```js
java -Dhudson.util.ProcessTree.disable=true -jar jenkins.war
```

当然在没有找到这个原因时，我这边通过其他方式解决，如果官方方式没有用的同学可以参考下：

利用 Send build artifacts over SSH

在该插件中，维护 Exec command 选项，输入需求的 sh 脚本即可。

{% asset_img 2.png 示例 %}
