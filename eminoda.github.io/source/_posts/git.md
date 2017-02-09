---
title: git
tags:
  - git
  - gitlab
categories: git
comments: true
date: 2017-02-09 20:27:57
---

## 版本控制
1. 集中化的版本控制系统
{% asset_img 1.png Subversion，CVS... %}

2. 分布式版本控制系统
{% asset_img 2.png git %}

3. 区别
	* 无网络，用svn，不能向数据库提交修改
	* 控制文件方式
		*	svn：随时间逐步增加
		{% asset_img 3.png Subversion，CVS... %}
		* git：快照流
		{% asset_img 4.png git %}

4. git的三种状态
{% asset_img 5.png git %}

## 基本cli
1. 服务器端创建项目
{% asset_img 6.png Subversion，CVS... %}

2. 克隆项目
````
shixinghao@SC-201611201637 MINGW64 /e/my_work/github
$ git clone git@github.com:eminoda/hello-git.git
Cloning into 'hello-git'...
remote: Counting objects: 3, done.
remote: Total 3 (delta 0), reused 0 (delta 0), pack-reused 0
Receiving objects: 100% (3/3), done.
````
3. 检查状态
已跟踪、未跟踪
{% asset_img 7.png git %}
{% asset_img 8.png git %}
````
$ git status -s
$ git diff
````
4. 提交
	````
	$ git commit -m 'init'
	[master 4618f45] init
	 1 file changed, 0 insertions(+), 0 deletions(-)
	 create mode 100644 index.txt
	````
	````
	shixinghao@SC-201611201637 MINGW64 /e/my_work/github/hello-git (master)
	$ git commit -a -m 'init'
	````
5. 移除文件
	提交区删除
	````
	rm index.txt
	$ git rm index.txt
	````
	暂存区删除
	````
	$ git rm -f index.txt
	````

6. 撤销
	覆盖提交
	````
	$ git commit -m 'initial commit'
	$ git add forgotten_file
	$ git commit --amend
	````
	撤销暂存区
	````
	$ git reset HEAD 2.txt
	````
	还原至上次提交版本
	````
	$ git checkout -- 2.txt
	````

## 分支管理
1. 新建分支
	{% asset_img 9.png %}
	````
	$ git branch v1.0
	````
2. 切换分支
	````
	$ git checkout v1.0
	````
3. 分支移动
	{% asset_img 10.png checkout到testing分支 %}
	{% asset_img 11.png 分叉 %}

4. 分支应用
### 合并merge
	{% asset_img 12.png 开始 %}
	{% asset_img 13.png 处理新业务53 %}
	{% asset_img 14.png 提交53 %}
	{% asset_img 15.png 在主分支新建bug %}
	{% asset_img 16.png fix后merge到master %}
	{% asset_img 17.png 53继续进行 %}
	{% asset_img 18.png 53 merge到master %}
### 变基rebase
	{% asset_img 19.png start %}
	{% asset_img 20.png git rebase master %}
	{% asset_img 21.png git merge experiment %}
