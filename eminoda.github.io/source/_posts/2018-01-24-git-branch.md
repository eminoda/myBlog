---
title: git merge 分支遇到的奇葩现象
tags:
  - git
categories:
  - 开发
  - 开发工具
comments: true
date: 2018-01-24 13:39:43
---

# 遇到的问题

切换分支的时候，A 分支新建的文件居然被 B 分支历史文件夹同步了。

# 重现步骤

{% asset_img 1.png 1.master 目录结构 %}
{% asset_img 2.png 2.分别创建test1，test2 %}
{% asset_img 3-1.png 3.test1上，剪切src目录文件到dist中 %}
{% asset_img 3-2.png 4.提交 %}
{% asset_img 4-1.png 5.test2上，修改src下文件 %}
{% asset_img 4-2.png 6.提交 %}
{% asset_img 5-1.png 7.切换到test1，merge test2的修改 %}

**神奇的一 B：test2 中 src 的修改，居然到了 test1 的 dist 中提现出来**
{% asset_img 5-2.png 8.神奇的一B %}

# 大致原因

{% asset_img 6.png 流程 %}

官方介绍：[git branch 介绍](https://git-scm.com/book/zh/v2/Git-分支-分支的新建与合并)
如图所示，C3&C4 是由 C2 开始，并且根据不同的需求做修改。当 test1 和 test2 合并的时候，test2 并不是 test1 的父级，所以会出现**'recursive' strategy**策略的处理。
这个策略，将 C3，C4 作为两个副本快照，和他们公共的父节点 C2 做策略合并（three way merge）。
值得注意的是，C3 上做剪切动作时，git status 是**rename**，估计是这个原因 merge 后，会把 c4 的修改同步到 dist 的文件中。
{% asset_img 7.png rename %}
