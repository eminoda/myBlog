---
title: git 快速入门
tags:
    - git
categories:
    - 开发
    - 工程化
comments: true
date: 2017-02-09 20:27:57
---

## 版本控制

1. 集中化的版本控制系统
   {% asset_img 1.png Subversion，CVS... %}

2. 分布式版本控制系统
   {% asset_img 2.png git %}

3. 区别

    - 无网络，用 svn，不能向数据库提交修改
    - 控制文件方式
      _ svn：随时间逐步增加
      {% asset_img 3.png Subversion，CVS... %}
      _ git：快照流
      {% asset_img 4.png git %}

4. git 的三种状态
   {% asset_img 5.png git %}

## cli 基本操作

1. 服务器端创建项目
   {% asset_img 6.png Subversion，CVS... %}

2. 克隆项目

```
shixinghao@SC-201611201637 MINGW64 /e/my_work/github
$ git clone git@github.com:eminoda/hello-git.git
Cloning into 'hello-git'...
remote: Counting objects: 3, done.
remote: Total 3 (delta 0), reused 0 (delta 0), pack-reused 0
Receiving objects: 100% (3/3), done.
```

3. 检查状态
   已跟踪、未跟踪
   {% asset_img 7.png git %}
   {% asset_img 8.png git %}

```
$ git status -s
$ git diff
```

4. 提交
    ```
    $ git commit -m 'init'
    [master 4618f45] init
     1 file changed, 0 insertions(+), 0 deletions(-)
     create mode 100644 index.txt
    ```
    ```
    shixinghao@SC-201611201637 MINGW64 /e/my_work/github/hello-git (master)
    $ git commit -a -m 'init'
    ```
5. 移除文件
   提交区删除

    ```
    rm index.txt
    $ git rm index.txt
    ```

    暂存区删除

    ```
    $ git rm -f index.txt
    ```

6. 撤销
   覆盖提交
    ```
    $ git commit -m 'initial commit'
    $ git add forgotten_file
    $ git commit --amend
    ```
    撤销暂存区
    ```
    $ git reset HEAD 2.txt
    ```
    还原至上次提交版本
    ```
    $ git checkout -- 2.txt
    ```

## 分支管理

1. 新建分支
   {% asset_img 9.png %}
    ```
    $ git branch v1.0
    ```
2. 切换分支
    ```
    $ git checkout v1.0
    ```
3. 分支移动
   {% asset_img 10.png checkout到testing分支 %}
   {% asset_img 11.png 分叉 %}

4. 分支应用

### 合并 merge

    {% asset_img 12.png 开始 %}
    {% asset_img 13.png 处理新业务53 %}
    {% asset_img 14.png 提交53 %}
    {% asset_img 15.png 在主分支新建bug %}
    {% asset_img 16.png fix后merge到master %}
    {% asset_img 17.png 53继续进行 %}
    {% asset_img 18.png 53 merge到master %}

### 变基 rebase

    {% asset_img 19.png start %}
    {% asset_img 20.png git rebase master %}
    {% asset_img 21.png git merge experiment %}

## GUI 基本操作

1. clone
   {% asset_img g1.png clone %}
   {% asset_img g2.png clone %}

2. add/commit/ignore
   {% asset_img g3.png git %}
   {% asset_img g4.png git %}

3. branch
   {% asset_img g5.png 创建分支 %}
   {% asset_img g6.png 切换分支 %}
   {% asset_img g7.png 切换分支 %}
   {% asset_img g8.png 分支中修改文件提交 %}
   {% asset_img g9.png 比较目录变化 %}

## 帮助文档

1. [git download](https://git-scm.com/downloads)
2. [tortoiseGit download](https://tortoisegit.org/)
3. [git 在线操作](https://try.github.io/levels/1/challenges/1)
4. [git 中文文档](https://git-scm.com/book/zh/v2/%E8%B5%B7%E6%AD%A5-%E5%85%B3%E4%BA%8E%E7%89%88%E6%9C%AC%E6%8E%A7%E5%88%B6)

## 代码托管平台

1. [github](https://github.com/eminoda)
2. [coding](https://coding.net/)
3. [csdn](https://code.csdn.net/)
