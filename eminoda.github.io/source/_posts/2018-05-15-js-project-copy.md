---
title: js 重复代码块检查
tags: quality
categories:
  - 开发
  - 前端开发
thumb_img: copy.jpg
date: 2018-05-15 15:38:50
---

{% asset_img dry.jpg %}
项目复杂了，人员沟通不通畅，开发进度赶时间，不可避免的会造成代码的重复。为了实现一个相似功能，可能会**ctrl+c，ctrl+v**然后修改个参数，草草交差。给后期增加更大的维护成本。

其实这违反了[**DRY**原则（Don't repeat yourself）](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)，说起来好像很高大上，其实它就是软件设计中一种最佳实践的开发模式。通过抽象、消除重复数据，避免数据冗余。

那我们怎么检测平时工程项目中的重复代码呢？下面介绍几个工具：

## [jsinspect](https://github.com/danielstjules/jsinspect)

Detect copy-pasted and structurally similar code
值得注意的，只支持 js 和 jsx

> The tool accepts a list of paths to parse and prints any found matches. Any directories among the paths are walked recursively, and only .js and .jsx files are analyzed

快速使用：

```
npm install -g jsinspect
jsinspect -t 50 ./server/src/js
```

效果：
{% asset_img example-1.png 检测出类似代码块 %}

当然你还可以在 project root 下新建.jsinspectrc，配置更多参数：

```
{
  "threshold":     30,// 指定规则命中的节点数量
  "identifiers":   true,// variables, methods, properties, etc
  "literals":      true,// strings, numbers, etc.
  "color":         true,
  "minInstances":  2,// 最小匹配数量
  "ignore":        "test|spec|node_modules",
  "reporter":      "default",// 报告格式，还有pmd、json
  "truncate":      10// 截取行数
}
```

## [jscpd](https://github.com/kucherenko/jscpd)

Copy/paste detector for programming source code.

和 jsinspect 不同：

1. 它支持多种 extension 的语言
2. 具有 report 导出功能

| _Supported languages_ |          |             |
| --------------------- | -------- | ----------- |
| JavaScript            | Java     | YAML        |
| CoffeeScript          | C++      | Haxe        |
| PHP                   | C#       | TypeScript  |
| Go                    | Python   | Mixed HTML  |
| Ruby                  | C        | SCSS        |
| Less                  | CSS      | erlang      |
| Swift                 | xml/xslt | Objective-C |
| Puppet                | Twig     | Vue.js      |
| Scala                 | Lua      | Perl        |

快速使用：

```
npm install jscpd -g
jscpd --languages vue --path ./src
```

同样，也可以定义配置文件**.cpd.yaml**，简化命令

```
path: "./src" //校验路径
output: "../jscpd-report.xml" //report文件
languages:
  - vue
blame: false //是否显示详细信息，会列出git等信息
verbose: false //是否输出具体信息
files:
  - "./**/*.vue" //需要加载的文件
exclude:
  - "./pages/Test.vue" //ignore路径
reporter: xml
languages-exts:
  javascript:
    - es
    - es5
    - es6
    - es7
```

效果：
{% asset_img example-2.png 检测出类似代码块，这里关掉了verbose %}

## [PMD](https://pmd.github.io/pmd-6.3.0/index.html)

> an extensible cross-language static code analyzer. It finds common programming flaws like unused variables, empty catch blocks, unnecessary object creation, and so forth. Additionally it includes CPD, the copy-paste-detector. CPD finds duplicated code.

感觉很高大上，不过感觉很不友好

1. 需要安装 java 环境，命令行方式不易上手（可能我玩不来，cmd 没有跑出来）。
2. npm 不支持，无法匹配前端脚手架。
3. 不支持 vue 等语言（可能是我玩不来）
4. 上面两个插件基本可以解决目前遇到的问题

效果：
{% asset_img example-3.png 下载解压pmd，点击图上bat %}
{% asset_img example-4.png 图形化界面 %}
