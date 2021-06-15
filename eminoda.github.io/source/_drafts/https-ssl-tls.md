---
title: https-ssl-tls
tags:
---

# Https

> HTTPS（HyperText Transfer Protocol Secure）: 超文本传输安全协议，是一种通过计算机网络进行安全通信的传输协议。HTTPS 经由 HTTP 进行通信，但利用 SSL/TLS 来加密数据包。HTTPS 开发的主要目的，是提供对网站服务器的身份认证，保护交换资料的隐私与完整性。

## TLS/SSL

> SSL（Secure Sockets Layer）:是 TLS 前身，由网景公司（Netscape）在 1994 年推出首版网页浏览器－网景导航者时，推出 HTTPS 协议，以 SSL 进行加密，这是 SSL 的起源。后由 IETF 将 SSL 进行标准化，才有了下面的 TLS。

> TLS（Transport Layer Security）: 传输层安全性协议，目的是为互联网通信提供安全及数据完整性保障。

# 公钥密码学标准（Public Key Cryptography Standards, PKCS）

PKCS #1 2.1 RSA 密码编译标准（RSA Cryptography Standard） 定义了 RSA 的数理基础、公/私钥格式，以及加/解密、签/验章的流程。1.5 版本曾经遭到攻击[1]。
PKCS #2 - 弃用 原本是用以规范 RSA 加密摘要的转换方式，现已被纳入 PKCS#1 之中。
PKCS #3 1.4 DH 密钥协议标准（Diffie-Hellman key agreement Standard） 规范以 DH 密钥协议为基础的密钥协议标准。其功能，可以让两方透过金议协议，拟定一把会议密钥(Session key)。
PKCS #4 - 弃用 原本用以规范转换 RSA 密钥的流程。已被纳入 PKCS#1 之中。
PKCS #5 2.0 密码基植加密标准（Password-based Encryption Standard） 参见 RFC 2898 与 PBKDF2。
PKCS #6 1.5 证书扩展语法标准（Extended-Certificate Syntax Standard） 将原本 X.509 的证书格式标准加以扩展。
PKCS #7 1.5 密码消息语法标准（Cryptographic Message Syntax Standard） 参见 RFC 2315。规范了以公开密钥基础设施（PKI）所产生之签名/密文之格式。其目的一样是为了拓展数字证书的应用。其中，包含了 S/MIME 与 CMS。
PKCS #8 1.2 私钥消息表示标准（Private-Key Information Syntax Standard）. Apache 读取证书私钥的标准。
PKCS #9 2.0 选择属性格式（Selected Attribute Types） 定义 PKCS#6、7、8、10 的选择属性格式。
PKCS #10 1.7 证书申请标准（Certification Request Standard） 参见 RFC 2986。规范了向证书中心申请证书之 CSR（certificate signing request）的格式。
PKCS #11 2.20 密码设备标准接口（Cryptographic Token Interface (Cryptoki)） 定义了密码设备的应用程序接口（API）之规格。
PKCS #12 1.0 个人消息交换标准（Personal Information Exchange Syntax Standard） 定义了包含私钥与公钥证书（public key certificate）的文件格式。私钥采密码(password)保护。常见的 PFX 就履行了 PKCS#12。
PKCS #13 – 椭圆曲线密码学标准（Elliptic curve cryptography Standard） 制定中。规范以椭圆曲线密码学为基础所发展之密码技术应用。椭圆曲线密码学是新的密码学技术，其强度与效率皆比现行以指数运算为基础之密码学算法来的优秀。然而，该算法的应用尚不普及。
PKCS #14 – 拟随机数产生器标准（Pseudo-random Number Generation） 制定中。规范拟随机数产生器的使用与设计。
PKCS #15 1.1 密码设备消息格式标准（Cryptographic Token Information Format Standard） 定义了密码设备内部数据的组织结构。

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

## 使用 openSSL 生成证书

创建 CA 根证书

```shell
# 准备目录结构
mkdir -p root/ca
cd root/ca
mkdir certs crl newcerts private
touch index.txt
echo 1000 > serial
# 下载 openssl.cnf
# 创建秘钥
winpty openssl genrsa -aes256 -out private/ca.key.pem 4096
# 创建证书
winpty openssl req -config openssl.cnf \
        -key private/ca.key.pem \
        -new -x509 -days 365 -sha256 -extensions v3_ca \
        -out certs/ca.cert.pem
# 验证证书
openssl x509 -noout -text -in certs/ca.cert.pem
```

https://stackoverflow.com/questions/3758167/openssl-command-hangs

创建机构

```shell
mkdir intermediate
cd intermediate
mkdir certs crl csr newcerts private
touch index.txt
echo 1000 > serial
echo 1000 > crlnumber
cd ..
# 创建秘钥
winpty openssl genrsa -aes256 -out intermediate/private/intermediate.key.pem 4096
# 生成证书签发请求
winpty openssl req -config intermediate/openssl.cnf -new -sha256 \
        -key intermediate/private/intermediate.key.pem \
        -out intermediate/csr/intermediate.csr.pem
# 颁发证书
winpty openssl ca -config openssl.cnf \
    -extensions v3_intermediate_ca \
    -days 180 -notext -md sha256 \
    -in intermediate/csr/intermediate.csr.pem \
    -out intermediate/certs/intermediate.cert.pem
```

```
$ winpty openssl ca -config /d/demo/openssl/root/ca/openssl.cnf     -extensions v3_intermediate_ca     -days 180 -notext -md sha256     -in intermediate/csr/intermediate.csr.pem     -out intermediate/certs/intermediate.cert.pem
Using configuration from D:/demo/openssl/root/ca/openssl.cnf
Enter pass phrase for /demo/openssl/root/ca/private/ca.key.pem:
Check that the request matches the signature
Signature ok
Certificate Details:
        Serial Number: 4096 (0x1000)
        Validity
            Not Before: Jun  8 08:25:15 2021 GMT
            Not After : Dec  5 08:25:15 2021 GMT
        Subject:
            countryName               = CN
            stateOrProvinceName       = Shanghai
            organizationName          = ABC
            organizationalUnitName    = ABC DEF
            commonName                = ABC Intermediate CA
        X509v3 extensions:
            X509v3 Subject Key Identifier:
                5B:3E:72:53:43:18:37:6D:E5:2A:E1:86:34:B5:04:52:04:2E:C6:91
            X509v3 Authority Key Identifier:
                keyid:62:BB:F3:8C:D1:6A:28:34:36:31:BC:96:2A:20:58:0A:4A:1F:20:C
9

            X509v3 Basic Constraints: critical
                CA:TRUE, pathlen:0
            X509v3 Key Usage: critical
                Digital Signature, Certificate Sign, CRL Sign
Certificate is to be certified until Dec  5 08:25:15 2021 GMT (180 days)
Sign the certificate? [y/n]:y


1 out of 1 certificate requests certified, commit? [y/n]y
Write out database with 1 new entries
Data Base Updated
```

```shell
# 验证证书
openssl x509 -noout -text \
      -in intermediate/certs/intermediate.cert.pem
openssl verify -CAfile certs/ca.cert.pem ../intermediate/certs/intermediate.cert.pem

# 证书链
cat ./intermediate/certs/intermediate.cert.pem ./certs/ca.cert.pem > ./intermediate/certs/ca-chain.cert.pem

```

服务端证书

```
winpty openssl genrsa -aes256 -out intermediate/private/www.democa.com.key.pem 2048
winpty openssl req -config intermediate/openssl.cnf \
 -key intermediate/private/www.democa.com.key.pem \
 -new -sha256 -out intermediate/csr/www.democa.com.csr.pem

winpty openssl ca -config ./intermediate/openssl.cnf \
 -extensions server_cert \
 -days 10 -notext -md sha256 \
 -in intermediate/csr/www.democa.com.csr.pem \
 -out intermediate/certs/www.democa.com.cert.pem

```

## 开发时如何解析 Https 内容

# 最后

## 参考链接

[细说 CA 和证书](https://www.barretlee.com/blog/2016/04/24/detail-about-ca-and-certs/)
[彻底搞懂 HTTPS 的加密机制](https://zhuanlan.zhihu.com/p/43789231)
https://stackoverflow.com/questions/44850725/whats-the-difference-between-openssl-and-letsencrypt

```

```
