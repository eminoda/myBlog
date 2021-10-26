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

## 生成 ssh 秘钥对

创建 **SSH key pair** 已经不是什么新鲜事了，随便个代码托管平台都有代码示例。但本篇讨论的重点是：同台电脑如何管理多个 git 账号，这个就有些陌生了。



## 误删 .ssh 文件

如果我们有个 git 项目，但因为有些误操作导致 .ssh 中对应的配置不正确，则会出现和目标地址无法创建连接的错误：

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

{% assets_image known_hosts.png %}
