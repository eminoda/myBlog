---
title: https-ssl-tls
tags:
---

# Https

> HTTPS（HyperText Transfer Protocol Secure）: 超文本传输安全协议，是一种通过计算机网络进行安全通信的传输协议。HTTPS 经由 HTTP 进行通信，但利用 SSL/TLS 来加密数据包。HTTPS 开发的主要目的，是提供对网站服务器的身份认证，保护交换资料的隐私与完整性。

## TLS/SSL

> SSL（Secure Sockets Layer）:是 TLS 前身，由网景公司（Netscape）在 1994 年推出首版网页浏览器－网景导航者时，推出 HTTPS 协议，以 SSL 进行加密，这是 SSL 的起源。后由 IETF 将 SSL 进行标准化，才有了下面的 TLS。

> TLS（Transport Layer Security）: 传输层安全性协议，目的是为互联网通信提供安全及数据完整性保障。

# 数字认证

> On the Internet, nobody knows you're a dog. --- 在互联网上，没人知道你是一条狗。

## 证书

**证书类型**

根据安全程度分为如下三类

- DV: DV SSL 是企业/个人为纯信息展示类网站获得公信力的基础保证，拥有它才意味着您的网站所有权已经过严格审查。
- OV: 对于政府、学术机构、无盈利组织或涉及信息交互的企业类网站来说，一张 OV SSL 证书才能向您的用户证明您的网站真实可靠、安全可信，赢得他们的信赖。
- EV: EV 证书是最高级别的权威版本。拥有网站最高的信任等级，各行各业龙头企业首选证书类型。

## 哪里取“买”证书

## 数字签名（信息完整）

hash + public key => data

data + private key => hash

## 数字证书（身份确认）

# 搭建一个 Https 服务

## 开发时如何解析 Https 内容

# 最后

## 参考链接

[细说 CA 和证书](https://www.barretlee.com/blog/2016/04/24/detail-about-ca-and-certs/)
[彻底搞懂 HTTPS 的加密机制](https://zhuanlan.zhihu.com/p/43789231)
