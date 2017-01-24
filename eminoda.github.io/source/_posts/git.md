---
title: git入门
tags:
  - git
  - gitlab
categories: git
comments: true
date: 2017-01-24 14:33:38
---

## 种子
1. [git document](https://git-scm.com/doc)
2. [git 在线教程](https://try.github.io)

## 基础操作
### 拉取项目
1. 复制链接
{% asset_img git-url.png 复制git地址 %}

2. 复制项目
````
git clone
````
{% asset_img git-clone.png git clone %}

### 文件提交
1. 修改后，查看文件状态
  ````
  git status
  ````
  {% asset_img git-status.png git status %}
2. 加入暂存区
  ````
  git add .
  ````
3. 再次查看状态
  {% asset_img git-status2.png git status %}

### 提交版本
  ````
  git commit -m '注释'
  ````
  {% asset_img git-commit.png git commit %}

### 上传服务器
  {% codeblock lang:git %}
  git push orign master
  {% endcodeblock %}
  {% asset_img git-push.png git push %}

### 拉取文件
  ````
  git pull
  ````

## 分支管理
1. 新建分支
  ```` git
  git branch sxh
  ````
2. 切换分支
  ```` git
  git checout sxh
  ````
3. 提交分支
  ```` git
  git push origin sxh
  ````
  {% asset_img branch-push.png branch push %}

4. 分支合并
  {% asset_img branch-merge.png branch merge %}
  {% asset_img merge-submit.png merge submit %}
  {% asset_img merge-accept.png merge accept %}

5. 主干拉取
  ````
  git checkout master
  ````
  ````
  git pull
  ````
  ````
  git merge sxh
  ````