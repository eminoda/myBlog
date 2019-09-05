---
title: 如何配置 vscode debugger 能力
tags: vscode
categories:
  - 开发
  - 开发工具
no_sketch: true
date: 2018-01-26 14:38:38
---

# 场景

## chrome debugger

1. 启动本地项目（你可能用 gulp、webpack，这些不重要，先把服务启动起来）
2. vscode start debugger - url：本地项目的地址 - webRoot：项目资源路径
   {% asset_img 1.png launch %}
3. 打个断点，试试（请无视里面的代码，注意黄色的 line）

   - 点击 debugger 中绿色的箭头，启动 chrome
   - 再项目指定的文件上，打个红点
   - 再刷下，就能和 F12 一样效果了

   {% asset_img 2.gif 一个简单的断点 %}

4. 另外你需要提前安装一个**Debugger for Chrome**（vscode 插件）

## node debugger

1. 基本步骤如上
2. 打个断点试试

   - 拿 express 举例
   - 不用专门起服务，debugger 会自动开启
   - node_modules 里也可以 debug

   {% asset_img 3.gif node %}
