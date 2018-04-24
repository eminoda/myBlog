---
title: git-init
date: 2017-06-13 13:23:35
tags:
  - git
  - gitlab
categories: git
comments: true
---

## 已有项目如何git版本控制
### 参考gitlab
````
cd existing_folder
git init
git remote add origin git@192.168.1.99:niu_front/fanfan.git
git add .
git commit
git push -u origin master
````