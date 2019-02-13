---
title: node 版本升级还需谨慎
tags:
    - node
categories:
    - 开发
    - node
no_sketch: true
date: 2018-08-16 19:29:46
---

给 2 年前的一台机子做 node 升级（4.4 to 8.11），结果报了如下错。

```
[root@iZ23o1c307rZ ~]# node -v
node: /usr/lib64/libstdc++.so.6: version `GLIBCXX_3.4.10' not found (required by node)
node: /usr/lib64/libstdc++.so.6: version `GLIBCXX_3.4.11' not found (required by node)
node: /usr/lib64/libstdc++.so.6: version `CXXABI_1.3.3' not found (required by node)
node: /usr/lib64/libstdc++.so.6: version `GLIBCXX_3.4.9' not found (required by node)
```

原因该 Node 缺少某些依赖库，然后这些库是系统自带（开发根本不涉足这些玩意儿，我不会升级安装这些 lib）

关键，问运维，也不造，呵呵哒。

> 所以如果服务器需要更新 node 版本，请先确定可行性

但不能止步不前，还是能吸收一些知识点

## [libstdc++](https://gcc.gnu.org/onlinedocs/libstdc++/faq.html#faq.what)

注意到上例的错误，都提到了 libstdc++，那是什么呢？

### 什么是 libstdc++

一个符合 GUN 规范标准的 C++库

### 为何要用 libstdc++

GUN(Gun compiler collection，也可叫做 gcc、g++)编译器，其被应用于 libstdc++。
很简单，Node 底层是 C 写的，当然需要这类库的支持

### 出现如上错误，如何处理？

[可参考](https://gcc.gnu.org/onlinedocs/libstdc++/faq.html#faq.how_to_install)

1. [下载 gcc source](https://gcc.gnu.org/mirrors.html)
2. make gcc

```
   get gcc sources
   extract into gccsrcdir
   mkdir gccbuilddir
   cd gccbuilddir
   gccsrcdir/configure --prefix=destdir --other-opts...
   make
   make check
   make install
```

## 不同 Node 适合哪些 linux 的系统

翻阅 Node doc，暂时没发现对系统有什么明显的说明，对于这个错误只是系统级别上缺少依赖包，说白了就是系统**太老了**

[不过还可以参考](https://nodejs.org/en/download/package-manager/)
[不过还可以参考 nodesource distributions](https://github.com/nodesource/distributions)

## 参考

[https://blog.csdn.net/haibosdu/article/details/77094833](https://blog.csdn.net/haibosdu/article/details/77094833)
[`GLIBCXX_3.4.10' not found](https://stackoverflow.com/questions/16605623/where-can-i-get-a-copy-of-the-file-libstdc-so-6-0-15)
[https://askubuntu.com/questions/575505/glibcxx-3-4-20-not-found-how-to-fix-this-error](https://askubuntu.com/questions/575505/glibcxx-3-4-20-not-found-how-to-fix-this-error)
