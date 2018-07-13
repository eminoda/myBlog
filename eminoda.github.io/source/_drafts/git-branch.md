---
title: git merge分支遇到的奇葩现象
date: 2018-01-24 13:39:43
tags:
  - git
categories:
    - 前端
    - git
comments: true
---

# 遇到的问题
切换分支的时候，A分支新建的文件居然被B分支历史文件夹同步了。

# 重现步骤
{% asset_img 1.png 1.master 目录结构 %}
{% asset_img 2.png 2.分别创建test1，test2 %}
{% asset_img 3-1.png 3.test1上，剪切src目录文件到dist中 %}
{% asset_img 3-2.png 4.提交 %}
{% asset_img 4-1.png 5.test2上，修改src下文件 %}
{% asset_img 4-2.png 6.提交 %}
{% asset_img 5-1.png 7.切换到test1，merge test2的修改 %}

**神奇的一B：test2中src的修改，居然到了test1的dist中提现出来**
{% asset_img 5-2.png 8.神奇的一B %}

# 大致原因

{% asset_img 6.png 流程 %}

官方介绍：[git branch介绍](https://git-scm.com/book/zh/v2/Git-分支-分支的新建与合并)
如图所示，C3&C4是由C2开始，并且根据不同的需求做修改。当test1和test2合并的时候，test2并不是test1的父级，所以会出现**'recursive' strategy**策略的处理。
这个策略，将C3，C4作为两个副本快照，和他们公共的父节点C2做策略合并（three way merge）。
值得注意的是，C3上做剪切动作时，git status 是**rename**，估计是这个原因merge后，会把c4的修改同步到dist的文件中。
{% asset_img 7.png rename %}
