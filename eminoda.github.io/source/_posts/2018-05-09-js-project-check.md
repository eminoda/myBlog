---
title: JS 工程化之代码 QA 校验
tags: eslint
categories:
  - 开发
  - 前端开发
thumb_img: eslint.png
date: 2018-05-09 23:13:24
---

{% asset_img eslint.png %}
eslint，和 jslint 等一样，都是 js 方向的检验工具。目标就是提前有规则的规范项目代码，提供 error、warn 提示，避免人为疏忽造成的错误，提升代码健壮性，稳定性。
eslint 对比其他工具，具有更强大的功能，社区有非常多的 plugins，对不同脚手架的前端工具都能使用，vscode 等 ide 也有支持插件。
官方也给出了 best practice，任何人都能简单的享受那种**安全感**

## 代码校验好处

1. 规范代码格式，统一团队 format 风格
2. 提前发现代码错误
   比如：
   - 没有 var 声明变量，但会被全局化到 window 中，影响逻辑功能。
   - 没有用对 es6 里的 let、const
   - [下面举例说明](#那些不容易察觉的问题代码)
3. 检查代码复杂度
4. 帮助 CI 集成

## [环境配置](https://eslint.org/docs/user-guide/getting-started#local-installation-and-usage)

1. 安装 eslint

```
npm install eslint --save-dev
```

2. [配置文件](https://eslint.org/docs/user-guide/configuring)
   eslint 默认会读项目路径下的配置文件，根据 ide 的插件，就能马上投入使用

```
cd your project root dir
mkdir .eslintrc(.js|.json|.yaml)
```

## 配置说明

### [Rule](https://eslint.org/docs/rules/#best-practices)

### 定义全局变量

避免外部资源等原因，某些变量没有专门 declare 报的错。需要全局定义

```
globals: {
    PC_URL: true
}
```

### 有条件的跳过 eslint 检验

如果使用 vscode，通过以下插件可以方便更改
{% asset_img vscode.png vscode插件 %}

```
// 特殊注解
/* eslint-disable no-console */
console.log();
/* eslint-enable no-console */
```

### 忽略指定路径 eslint 的校验

```
mkdir .eslintignore

/src/*.js
```

### [扩展配置文件](https://eslint.org/docs/user-guide/configuring#extending-configuration-files)

参考社区最佳实践，引用需要的插件，完善 eslint 规则检查

1. extends 规则逻辑
   - 添加额外规则
   - 继承 rule 规则
   - 覆盖 rule 重复规则

2) 如何使用内置规则
   ```
   extends:"eslint:recommended"
   ```
3) 使用其他 eslint package 配置的规则

   ```
   npm install eslint-config-xxx
   ```

   ```
   extends: standard
   ```

4) 使用第三方 plugins 提供的规则

   ```
   npm install eslint-plugin-xxx
   ```

   ```
   "plugins": [
       "react"
   ],
   "extends": [
       "eslint:recommended",
       "plugin:react/recommended"
   ],
   ```

## 配置 vue project

1. 安装插件
   ```
   npm install eslint-plugin-vue -D
   ```
2. [未能解析 vue](https://github.com/vuejs/eslint-plugin-vue#what-is-the-use-the-latest-vue-eslint-parser-error)
   {% asset_img vue-1.png %}

   eslint-plugin-vue require vue-eslint-parser

   ```
   npm vue-eslint-parser -D
   ```

   .eslintrc.js

   ```
   {
       "parser": "vue-eslint-parser",
       "parserOptions": {
           "parser": "babel-eslint",
       },
       extends: [
           'plugin:vue/essential',
       ],
       plugins: [
           'vue'
       ]
   }
   ```

   {% asset_img vue-2.png eslint-plugin-vue内置规则 %}

3. error Resolve error: unable to load resolver "node" import/no-duplicates
   需要安装
   ```
   npm install eslint-import-resolver-node -D
   ```

## 那些不容易察觉的问题代码

### 会引起麻烦的 error（必须修改）

1. [eslint] Unexpected trailing comma. (comma-dangle)
   {% asset_img error-1.png 不允许逗号结尾 %}
   代码不和规范，压缩代码可能会出错。

2. [eslint] Unexpected trailing comma. (comma-dangle)
   {% asset_img error-2.png ===&== %}
   由于 js 太过灵活，弱类型的判断通过可能会引致执行逻辑错误。

```
var test = '1';
if(test>0){
    test = test.toFixed(2); //TypeError: "1".toFixed is not a function
}
```

3. [eslint] Expected { after 'if' condition. (curly)
   {% asset_img error-4.png if后跟代码块 %}
   代码不和规范，压缩代码可能会出错。

4. [eslint] Duplicate key 'strToArr'. (no-dupe-keys)
   {% asset_img error-5.png 重复定义 %}
   处理冲突、代码复制粘贴、项目重构后造成的疏漏

5. [eslint] 'PC_URL' is not defined. (no-undef)
   {% asset_img error-6.png 变量没有定义 %}
   {% asset_img error-9.png 变量没有定义 %}
   {% asset_img error-11.png 变量没有定义 %}

6. [eslint] 'API' is defined but never used. (no-unused-vars)
   变量没有使用，一定程度会导致打包额外不需要的文件

7. [eslint] Return statement should not contain assignment. (no-return-assign)
   {% asset_img error-7.png return中不要执行逻辑 %}

8. [eslint] Import in body of module; reorder to top. (import/first)
   {% asset_img error-8.png import置于顶部 %}
   方便维护查找引用

9. error Type of the default value for 'list' prop must be a function vue/require-valid-default-prop
   vue prop 需要明确返回类型，array object 都是引用类型，需要指定清晰

```
props: {
  propA: {
    type: String,
    default: {}
  },
  propB: {
    type: String,
    default: []
  },
  propC: {
    type: Object,
    default: []
  },
  propD: {
    type: Array,
    default: []
  },
  propE: {
    type: Object,
    default: { message: 'hello' }
  }
}
```

### 不容忽视的警告（不影响功能，但会造成其他麻烦）

1. [eslint] Missing space before value for key 'updatePzType'. (key-spacing)
   {% asset_img warn-1.png 缺少空格 %}
   减少因代码格式化风格不同，导致代码冲突，不易查看别人代码情况

2. [eslint] Trailing spaces not allowed. (no-trailing-spaces)
   {% asset_img warn-2.png 缺少空格 %}
3. error Missing space after => arrow-spacing
   {% asset_img warn-4.png 多余空格 %}

4. [eslint] Expected the Promise rejection reason to be an Error. (prefer-promise-reject-errors)
   {% asset_img error-3.png 需要reject error对象 %}
   reject 要符合语义

5. [eslint] Redundant use of `await` on a return value. (no-return-await)
   {% asset_img warn-3.png 不能返回await %}
   虽然逻辑没问题，但指出了 es6 等语法理解不深刻，使用不当的问题

## 总结

本来测试通过的代码，在 eslint 的帮助下，暴露了更多的安全隐患，和测试人员没有发现的问题。
js 本来就灵活多变，稍不留神就会给自己埋下大坑，如果没有提前检测机制，根本就是防不胜防。
如果你还没用，赶紧使用起来...
