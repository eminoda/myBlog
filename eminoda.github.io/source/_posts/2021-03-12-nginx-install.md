---
title: windows 和 linux 平台上安装 nginx
tags: nginx
categories:
  - 开发
  - 运维部署
thumb_img: nginx.jpg
date: 2021-03-12 19:08:29
---


# 前言

虽然多数前端开发在团队中定位只是 **切图仔**，每天忙碌于和后端的接口联调。但随着越来越 **内卷**，“被迫”要学习（了解）很多非前端的技术栈，~~把搞得我们越来越“全栈”。（当个玩笑看吧！手动狗头 🐶）~~。

认真的说，学习是要主动自发的，你可以说这些技术栈和 js 没有关系，比如这篇是讲 **nginx** 的安装。相信只要公司不要太差，总有运维帮我们搭建好环境，团队中总有人帮我们梳理好开发文档。

如今 2021 了，即使前端生态已经趋于稳定，起个 **webpack server** 光靠 **http-proxy-middleware** 就可以玩转各类代理需要，**但真的不去接触可以吗？**

站在我的角度，有学习的必要性。虽然这篇只涉及环境的安装，但总有一天你会站在运维，或者团队管理的角色去解决复杂问题。**总之，技多不压身**。

说了那么多，下面就开始吧。

# windows 平台

## 资源下载

在 **nginx.org** 的 download 页面，下载对应的 windows exe 执行文件：

```
http://nginx.org/en/download.html
```

{% asset_img windows-download.png 下载 windows 包 %}

## 文件目录

解压对应的下载文件，将会得到如下目录：

{% asset_img windows-folds.png 文件目录 %}

## 配置&启动

因为 **nginx** 已经帮我们写好了配置文件骨架，所以并不需要我们“白手起家”：

```shell
# D:\devtool\nginx-1.19.7\conf\nginx.conf
#...
http{
    #...
    server {
        listen       80;
        server_name  localhost;

        location / {
            root   html;
            index  index.html index.htm;
        }
    }
}
```

直接点击 **nginx.exe** 后，访问：http://127.0.0.1/ 就能看到成功页：

{% asset_img windows-hello.png 成功页 %}

## 示意一个简单的转发

比如，本地有个 koa 服务（端口：3000），那怎么通过 **nginx** 来进行反向代理呢？（如果有类似跨域的问题）

增加解析后端服务的配置：

```shell
# conf/includes/koa.conf
server {
    listen  82;

    location / {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

然后在 nginx.conf include 导入上述文件：

```shell
# conf/nginx.conf
...
http{
    ...
    include conf/includes/*.conf;
    ...
}
```

到此 **windows** 平台的安装教程到此结束，下面来讲下 **linux** 平台。

# linux 平台

**linux** 也很容易，可以参考[官网说明文档](http://nginx.org/en/linux_packages.html#RHEL-CentOS)

## 配置 yum repo

如果 **yum install nginx** 出现如下提示，需要配置 **nginx** 仓库：

```shell
yum -y install nginx
# ...
No package nginx available.
Error: Nothing to do
```

编辑 **repo** 文件：

```shell
vi /etc/yum.repos.d/nginx.repo

# 文件如下
[nginx-stable]
name=nginx stable repo
baseurl=http://nginx.org/packages/centos/$releasever/$basearch/
gpgcheck=1
enabled=1
gpgkey=https://nginx.org/keys/nginx_signing.key
module_hotfixes=true

[nginx-mainline]
name=nginx mainline repo
baseurl=http://nginx.org/packages/mainline/centos/$releasever/$basearch/
gpgcheck=1
enabled=0
gpgkey=https://nginx.org/keys/nginx_signing.key
module_hotfixes=true
```

最后再使用 **yum** 重新安装 **nginx** 即可。

## nginx 装在哪？

通过 **whereis** 找到 **nginx** 相关文件夹：

```shell
whereis nginx

nginx: /usr/sbin/nginx /usr/lib64/nginx /etc/nginx /usr/share/nginx /usr/share/man/man8/nginx.8.gz
```

然后我们就知道，**nginx** 对应的资源，依赖，及启动文件的路径：

{% asset_img linux-folds.png 成功页 %}

## 配置&启动

同 **windows** ，这里的 **nginx** 也不需要配置，我们只需要直接启用即可。

```shell
vi /etc/nginx/nginx.conf
# 首次启动
nginx
```

对应如果有配置更改，或者想要重启可以参考如下命令：

```shell
# 重启
nginx -s reload

# 停止
nginx -s stop
```

# 最后

这和代码 HelloWorld 一样，只是一篇简单的环境安装文章，主要示范如何从官方渠道下载 **nginx** 包然后安装到服务端。希望能帮到卡在入门安装的同学。
