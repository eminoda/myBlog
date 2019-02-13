---
title: git 隐藏敏感文件
tags: git
categories:
    - 开发
    - 工程化
no_sketch: true
date: 2018-06-19 13:49:46
---

最近在 github 托管一个小 Demo，发现一个问题：
写了个 mongo 的配置文件，里面包含账号密码，年轻的我写了个 ignore 忽略文件。

{% asset_img ignore.png 提交记录依旧存在%}

但是万一有人拉 log，还是可以通过你的提交记录，看到敏感信息，这时候怎么做？

# [git-filter-branch](https://git-scm.com/docs/git-filter-branch)

```
git filter-branch [--setup <command>] [--subdirectory-filter <directory>]
	[--env-filter <command>] [--tree-filter <command>]
	[--index-filter <command>] [--parent-filter <command>]
	[--msg-filter <command>] [--commit-filter <command>]
	[--tag-name-filter <command>] [--prune-empty]
	[--original <namespace>] [-d <directory>] [-f | --force]
	[--state-branch <branch>] [--] [<rev-list options>…​]
```

## 操作步骤

```
# 复写敏感文件记录
shixinghao@Lenovo-PC MINGW64 /e/NextInnovation (master)
$ git filter-branch --force --index-filter \
> 'git rm --cached --ignore-unmatch server/conf/mongo.conf.js' \
> --prune-empty -- --all
Rewrite 865e20cc140d596dc23b7d65467b53dea1b7f62d (13/17)rm 'server/conf/mongo.conf.js'
Rewrite 0f7676b5fe1db28534de85b5b038b1643087adfe (17/17)
Ref 'refs/heads/master' was rewritten
Ref 'refs/remotes/origin/master' was rewritten
WARNING: Ref 'refs/remotes/origin/master' is unchanged

# 提交到远程仓库
shixinghao@Lenovo-PC MINGW64 /e/NextInnovation (master)
$ git push origin --force --all
Counting objects: 191, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (104/104), done.
Writing objects: 100% (191/191), 626.68 KiB | 0 bytes/s, done.
Total 191 (delta 51), reused 172 (delta 47)
remote: Resolving deltas: 100% (51/51), done.
To https://github.com/eminoda/NextInnovation
 + 0f7676b...b65e33d master -> master (forced update)
```

## 命令说明

1. [filter-branch --index-filter<command> --prune-empty -- --all](https://git-scm.com/docs/git-filter-branch#git-filter-branch---index-filterltcommandgt)
   用来重写 git 的版本历史记录。
   index-filter 和 tree-filter 类似，但由于不走 git tree 等内容，直接走索引速度更快。
   prune-empty 重写后如果产生 empty 的 commit，这个选项将移除到这些 commit。

2. [git rm --cached --ignore-unmatch](https://git-scm.com/docs/git-rm)
   使用 cached，使文件在版本管理中去除，但本地硬盘中保留。
   如果没有匹配到对应 file，ignore-unmatch 则会忽略警告错误。

# 当然还有其他方式——BFG

暂未尝试，[如果有兴趣，请点击](https://rtyley.github.io/bfg-repo-cleaner/)

# 参考

-   [git-filter-branch 使用场景说明](https://git-scm.com/book/zh/v2/Git-内部原理-维护与数据恢复)
-   [git filter branch](https://blog.csdn.net/lwfcgz/article/details/49453375)
-   [github 处理敏感文件](https://help.github.com/articles/removing-sensitive-data-from-a-repository/)
