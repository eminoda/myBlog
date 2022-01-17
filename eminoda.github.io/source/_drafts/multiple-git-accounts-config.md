---
title: 多个 git 账号配置
tags: git
categories:
  - 开发
  - 前端开发
post_img:
  bg_color: '#ff9c6e'
  title: git
  title_color: '#fff'
  sub_title: 同台电脑如何管理多个git账号
  sub_color: '#fff'
---

# 前言

为了避免 **git** 使用中，频繁的输入账户名及密码，就要借助 **SSH** 机制完成公钥登录。相信每个开发都在代码托管平台看过 **SSH key pair** 代码的生成示例。

本篇将讲述：如何在一台电脑上配置多个 git 账号，并聊些加密相关概念。

# SSH

> Secure Shell（安全外壳协议，简称 SSH）是一种加密的网络传输协议，可在不安全的网络中为网络服务提供安全的传输环境。 SSH 最常见的用途是远程登录系统，人们通常利用 SSH 来传输命令行界面和远程执行命令。

说到 **SSH**，离不开的就是**非对称加密算法**，那和**对称加密算法**有什么区别呢？

## 对称加密和非对称加密算法

> 对称加密算法：也叫私钥加密，指加密和解密使用相同密钥的加密算法。有时又叫传统密码算法，就是加密密钥能够从解密密钥中推算出来，同时解密密钥也可以从加密密钥中推算出来。

常见有：DES，3DES，TDEA，Blowfish，RC5，IDEA...（我压根没用过 🙈）

{% asset_img dcjm.png dcjm.png %}

抛开算法的破解难易程度，密钥相当于加密和解密的唯一钥匙，一个显而易见的问题：如果有人得知了其中加密的密钥，那么就相当于公开了加密数据。那客户端怎么安全的保存这个密钥呢？

通常数据放在服务端是相对安全，靠谱的。那客户端总不能通过 http 请求明着获取密钥咯？所以就有了：**非对称加密算法**

> 非对称加密算法需要两个密钥：公开密钥（publickey:简称公钥）和私有密钥（privatekey:简称私钥）。公钥与私钥是一对，如果用公钥对数据进行加密，只有用对应的私钥才能解密。因为加密和解密使用的是两个不同的密钥，所以这种算法叫作非对称加密算法

常见有：RSA、Elgamal、背包算法、Rabin、D-H、ECC（椭圆曲线加密算法）

## 生成 SSH 秘钥对

创建 **SSH key pair** 已经不是什么新鲜事了，随便个代码托管平台都有代码示例。但本篇讨论的重点是：同台电脑如何管理多个 git 账号，这个就有些陌生了。

## 误删 .SSH 文件

如果我们有个 git 项目，但因为有些误操作导致 .SSH 中对应的配置不正确，则会出现和目标地址无法创建连接的错误：

```txt
git pull

The authenticity of host 'github.com (20.205.243.166)' can't be established.
RSA key fingerprint is SHA256:nThbg6kXUpJWGl7E1IGOCspRomTxdCARLviKw6E5SY8.
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

如果我们选择 yes，硬创建连接后（在 knows_hosts 添加了对应站点的公钥）还是不能达到预期效果：

```text
Warning: Permanently added 'github.com,20.205.243.166' (RSA) to the list of known hosts.
git@github.com: Permission denied (publickey).
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

{% asset_img known_hosts.png %}

https://www.cnblogs.com/dzblog/p/6930147.html

git@e.coding.net:sheca-dev/docker/sheca-apisixdash-web.git

https://e.coding.net/sheca-dev/docker/sheca-apisixdash-web.git