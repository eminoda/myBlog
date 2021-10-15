---
title: docker 入门
tags: docker
categories:
  - 开发
  - 运维部署
thumb_img: docker.png
date: 2021-08-23 21:51:50
---


# 前言

这篇是看 [Docker 官方安装文档](https://docs.docker.com/engine/install/) 的总结，我不是 Docker 专家，也不是运维，但身边的工作环境都在说 docker，所以知晓一种技术怎么使用，解决什么问题是非常有必要的，**技术类的东西只有实践了才有概念**。

如果你也刚接触 docker，但看不怎么想官方文档的说明，想了解下 docker 到底怎么回事，说不定这篇可以帮助你。

# 类 Unix 环境的准备

我是 windows 平台，虽然 docker 也有 windows 版本，但需要准备 [WSL 2](https://docs.microsoft.com/zh-cn/windows/wsl/install-win10#step-4---download-the-linux-kernel-update-package)，安装也比较麻烦 ，并且对于系统也有要求（版本要高于 19041，我是家庭版不合适）。

为了让这次的 docker 学习更贴近真实的生产环境，装个虚拟机是非常有必要的，当然也可以阿里云申请个 ecs（按时计费，也就几块，学完就回收）

搜索引擎直接搜：wmware download，进入 wmware 官网下载免费版的虚拟机 [vSphere Hypervisor](https://www.vmware.com/products/vsphere-hypervisor.html)，当然我选择了 [VMware Workstation Pro](https://www.vmware.com/products/workstation-pro/workstation-pro-evaluation.html)，它有一个月的试用时间。

因为是 windows 平台，点击 exe 文件后，直接安装，启动后首页如下：

{% asset_img vwmare-home.png vwmare首页 %}

由于这只是个虚拟机，对应的系统镜像需要自己下载，而 Linux 是个开源的操作系统，我这里选择了 CentOS（对应下载了 [x86_64 的 ios](http://isoredirect.centos.org/centos/8/isos/x86_64/)），在 CentOS 下载页面里有一堆镜像地址，你可以随便选择一个：

{% asset_img centos-ios-download.png 选择ios镜像 %}

然后回到 vmware 新建个虚拟机，选择前面下载好的 ios 镜像：

{% asset_img centos-ios-choose.png 安装CentOS-IOS %}

之后没特别的，一直下一步即可，中间稍稍关注下用户名和密码配置：

{% asset_img wmware-config.png 配置 %}

# 安装 docker 环境

1. 切换用户到 root

   之后的操作将建立在系统权限下，所以实现将用户切换至 root，避免导致一些“不顺利”的情况发生。

   {% asset_img docker-1.png %}

2. 设置 docker 仓库地址

   {% asset_img docker-2.png %}

3. 安装 docker

   {% asset_img docker-3.png %}

4. 将 docker 添加到系统服务中

   {% asset_img docker-4.png %}

# 开始第一个镜像

1.  下载一个 [Node.js 项目](https://github.com/docker/getting-started/tree/master/app)

    > https://github.com/docker/getting-started/tree/master/app

    你不需要懂得它能干嘛，就是起个服务，完成一些简单的功能让我们了解 docker 容器。

2.  在根目录新建一个 Dockerfile

    ```shell
    # syntax=docker/dockerfile:1
    FROM node:12-alpine\
    # 切换 apk 镜像
    RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
    RUN apk add --no-cache python g++ make
    WORKDIR /app
    COPY . .
    RUN yarn install --production
    CMD ["node", "src/index.js"]
    ```

    它有什么作用呢？

    - 从 alpine 中拉取 node12 的镜像
    - 通过 apk 安装此项目需要的软件库
    - 指定 docker 容器目录为 app，并将本地内容复制到此目录
    - 安装 node 项目依赖，并启动项目

3.  构建镜像

    在 docker 中构建一个镜像，并命名为：getting-started

    ```shell
    docker build -t getting-started .
    ```

4.  运行镜像

    启动 getting-started 镜像，对外暴露 3000 端口，并映射为此 node 服务 3000 端口

    ```shell
    docker run -dp 3000:3000 getting-started
    ```

    最后能看到这个 node 服务运行后的效果：

    {% asset_img docker-5.png %}

5.  镜像的操作

    {% asset_img docker-6.png %}

    查看所运行的镜像进程状态

    ```shell
    docker ps
    ```

    从上表中找到需要操作的镜像 ID，停止镜像

    ```shell
    docker stop <the-container-id>
    ```

    移除镜像

    ```shell
    docker rm <the-container-id>
    ```

# 在 dockerhub 创建自己的镜像

上面这些操作都是在本地环境，而镜像只有被“大家”都在使用才能体现出更高的价值，所以需要把镜像推到大家能下载到的平台才行。

docker 就提供了 hub 平台，我们可以把镜像扔到上面，下面就简单的操作下：

1.  首先你要在 dockerhub 注册一个账号，并登录上去

    {% asset_img docker-7.png %}

    ```shell
    docker login -u eminoda
    ```

2.  然后在将构建好的镜像推送上去

    ```shell
    docker tag getting-started eminoda/getting-started
    ```

3.  如果本地没有这个镜像，就会加载远程镜像，并启动

    ```shell
    docker run -dp 3000:3000 eminoda/getting-started
    ```
