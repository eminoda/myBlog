---
title: vscode设置配置
tags: vscode
categories:
  - 开发
  - vscode
no_sketch: true
date: 2018-05-24 11:23:18
---


# 在哪里对vscode进行设置
{% asset_img where.png %}
{% asset_img where2.png %}

# 一些个人配置，供参考
主要配置，在系统默认的配置中描述很详细（都有中文介绍）
[官网-设置介绍](https://code.visualstudio.com/docs/getstarted/settings)

````json
{
    "git.path": "D:\\git\\Git\\cmd\\git.exe", //git地址，然后可以在控制台使用git shell
    "terminal.integrated.shell.windows": "C:\\WINDOWS\\Sysnative\\cmd.exe", //选择终端模式，cmd or prower shell
    "window.zoomLevel": 0, // 窗口大小
    "editor.detectIndentation": false, 
    "editor.formatOnSave": true, //保存后自动格式化
    "eslint.autoFixOnSave": true, //格式化后 自动修复
    "extensions.ignoreRecommendations": false, //忽略插件推荐
    "fileheader.Author": "shixinghao", // 插件vscode-fileheader，具体设置
    "fileheader.LastModifiedBy": "shixinghao", // 插件vscode-fileheader，具体设置
    "vetur.format.defaultFormatter.js": "vscode-typescript", //插件vetur，默认格式化风格
    "vetur.format.defaultFormatter.html": "js-beautify-html", //插件vetur，默认格式化风格
    "javascript.format.insertSpaceBeforeFunctionParenthesis": true, // 针对eslint规则，对js特殊配置
    "typescript.format.insertSpaceBeforeFunctionParenthesis": true, // 针对eslint规则，对js特殊配置
    "workbench.colorTheme": "Visual Studio Dark" //ide style
}
````