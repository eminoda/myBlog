---
title: JS工程化之代码校验
tags: eslint
categories: 
  - 前端
  - eslint
thumb_img: eslint.png
---

## 为什么要对代码做校验
1. 检查代码格式，团队统一风格format
2. 检查变量引用等错误
    比如：
    - 没有var声明变量，但会被全局化到window中，影响逻辑功能。
    - 没有用对es6里的let、const
3. 检查代码复杂度
4. 避免人为错误，提升项目健壮性，安全性

## 那些不容易察觉的问题代码
1. error  Resolve error: unable to load resolver "node"  import/no-duplicates
需要安装
````
npm install eslint-import-resolver-node -D
````

### 会引起麻烦的error（必须修改）
1. [eslint] Unexpected trailing comma. (comma-dangle)
{% asset_img error-1.png 不允许逗号结尾 %}

2. [eslint] Unexpected trailing comma. (comma-dangle)
{% asset_img error-2.png ===&== %}

3. [eslint] Expected { after 'if' condition. (curly)
{% asset_img error-4.png if后跟代码块 %}

4. [eslint] Duplicate key 'strToArr'. (no-dupe-keys)
{% asset_img error-5.png 重复定义 %}

5. [eslint] 'PC_URL' is not defined. (no-undef)
{% asset_img error-6.png 变量没有定义 %}
{% asset_img error-9.png 变量没有定义 %}
{% asset_img error-11.png 变量没有定义 %}

6. [eslint] 'API' is defined but never used. (no-unused-vars)
变量没有使用

7. [eslint] Return statement should not contain assignment. (no-return-assign)
{% asset_img error-7.png return中不要执行逻辑 %}

8. [eslint] Import in body of module; reorder to top. (import/first)
{% asset_img error-8.png import置于顶部 %}

9. error  Type of the default value for 'list' prop must be a function  vue/require-valid-default-prop
````
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
````

### 不容忽视的警告（不影响功能，但会造成其他麻烦）
1. [eslint] Missing space before value for key 'updatePzType'. (key-spacing)
    {% asset_img warn-1.png 缺少空格 %}

2. [eslint] Trailing spaces not allowed. (no-trailing-spaces)
    {% asset_img warn-2.png 缺少空格 %}
3. error  Missing space after =>     arrow-spacing
    {% asset_img warn-4.png 缺少空格 %}

4. [eslint] Expected the Promise rejection reason to be an Error. (prefer-promise-reject-errors)
{% asset_img error-3.png 需要reject error对象 %}

5. [eslint] Redundant use of `await` on a return value. (no-return-await)
{% asset_img warn-3.png 不能返回await %}

## [环境配置](https://eslint.org/docs/user-guide/getting-started#local-installation-and-usage)
1. 安装eslint
````
npm install eslint --save-dev
````
2. [配置文件](https://eslint.org/docs/user-guide/configuring)
````
cd your project root dir
mkdir .eslintrc(.js|.json|.yaml)
````

## 配置说明
### [Rule](https://eslint.org/docs/rules/#best-practices)

### 定义全局变量
````
globals: {
    PC_URL: true
}
````

### 使eslint部分报错失效
{% asset_img vscode.png vscode插件 %}
````
//提供代码提示
/* eslint-disable no-console */
console.log();
/* eslint-enable no-console */
````

### 忽略指定路径eslint的校验
````
mkdir .eslintignore

/src/*.js
````

### [扩展配置文件](https://eslint.org/docs/user-guide/configuring#extending-configuration-files)
1. extends规则逻辑
    - 添加额外规则
    - 继承rule规则
    - 覆盖rule重复规则


2. 如何使用内置规则
    ````
    extends:"eslint:recommended"
    ````
3. 使用其他eslint package配置的规则
    ````
    npm install eslint-config-xxx
    ````

    ````
    extends: standard
    ````
4. 使用第三方plugins提供的规则
    ````
    npm install eslint-plugin-xxx
    ````

    ````
    "plugins": [
        "react"
    ],
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    ````

## 配置vue project
1. 安装插件
````
npm install eslint-plugin-vue -D
````
2. [未能解析vue](https://github.com/vuejs/eslint-plugin-vue#what-is-the-use-the-latest-vue-eslint-parser-error)
    {% asset_img vue-1.png %}

    eslint-plugin-vue require vue-eslint-parser
    ````
    npm vue-eslint-parser -D 
    ````

    .eslintrc.js
    ````
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
    ````
    {% asset_img vue-2.png eslint-plugin-vue内置规则 %}
