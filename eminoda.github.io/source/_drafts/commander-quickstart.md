---
title: 打造属于自己的一款命令行 cli 脚手架工具
tags: commander
categories:
  - 开发
  - 前端开发
thumb_img:
  - npm.jpg
---

# 前言

# commander

首先需要知道 commander 这个 npm 库，它帮我们封装了命令行解析的能力。

## 先了解几个简单的使用方式

### 显示帮助&版本信息

```js
const program = require('commander');
// 定义程序名称，版本
program.name(cliName).version(pkg.version);
// 解析命令行
program.parse(process.argv);
```

执行 **node ./bin/fl-cli --help** ，将看到如下效果：

```shell
D:\project\frontend-learn-cli>node ./bin/fl-cli --help
Usage: fl [options]

Options:
  -V, --version  output the version number
  -h, --help     display help for command
```

这个 **program.parse** 方法必须调用，不然命令行工具就不能“正常的工作了”。

能看到 **Usage** 向我们展示如何去使用这个命令，我们也可以更改它：

```js
program.usage('<command> [options]');
```

```shell
Usage: fl <command> [options]
```

### 如何约定命令 Command？

定义一个 **create** 命令，用于创建应用（类似 vue create）

```js
program
  .command('create')
  .description('创建应用')
  .action(() => {
    console.log('hello command');
  });
```

通过 **help** 命令，可以看到 **create** 的使用方式：

```shell
D:\project\frontend-learn-cli>node ./bin/fl-cli --help
Usage: fl <command> [options]

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  create          创建应用
  help [command]  display help for command
```

执行 **create** 命令：

```shell
D:\project\frontend-learn-cli>node ./bin/fl-cli create
hello command
```

### 如何定义命令参数 Options？

我们需要额外增加参数，来让命令应对多种情况，比如可以设置 -f 使得创建的应用强制覆盖当前路径：

```js
program
  .command('create')
  .description('创建应用')
  .option('-f,', '是否强制创建')
  .action((options, command) => {
    console.log(options);
  });
```

```shell
D:\project\frontend-learn-cli>node ./bin/fl-cli create -f
{ f: true }
```

我们也能自定义参数值：

```js
.option('-f,--force <path>', '是否强制创建')
```

```shell
D:\project\frontend-learn-cli>node ./bin/fl-cli create --force /use/local
{ force: '/use/local' }
```

需要注意，如果用户输入了非预期的参数将报错：

```shell
D:\project\frontend-learn-cli>node ./bin/fl-cli create -abc
error: unknown option '-abc'
```

我们可以添加 **allowUnknownOption()** 方法，防止非预期参数影响命令的执行：

```js
program
  .command('create')
  .description('创建应用')
  .option('-f,--force <path>', '是否强制创建')
  .allowUnknownOption()
  .action((options, command) => {
    console.log(options);
  });
```

```shell
D:\project\frontend-learn-cli>node ./bin/fl-cli create -abc
{}
```

## 进阶技巧

如上，我们就能进行开发简单的命令行工具了。下面提供几种进阶方式，让我们能有跟 **人性化** 的命令行工具。

### 控制台输出语句的颜色

有个仓库叫 **chalk** ，让我们可以自定义 **console.log** 输出的颜色。这对于命令行有非常好的可视化效果。

我们对 --help 命令做个封装，在 help 信息末尾添加蓝色的帮助命令语句：

```js
const chalk = require('chalk');
exports.outputHelp = (cliName) => {
  console.log();
  console.log(`  Run ${chalk.cyan(`${cliName} <command> --help`)} for detailed usage of given command.`);
  console.log();
};
```

```js
program.on('--help', () => {
  outputHelp(cliName);
});
```

同时，遍历每个 **Command** 命令，也为其添加这一功能：

```js
program.commands.forEach((c) => c.on('--help', () => outputHelp(cliName)));
```

{% asset_img chalk.png 效果展示 %}

### “命令/参数”错误的封装

由于命令错误，参数错误或者值漏填会导致命令行的出错，对于这类非预期的错错误需要及时提示使用者，而不是只展示：**error: option '-f,--force <path>' argument missing** 这样的错。

参考 [Vue 的错误处理](https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli/bin/vue.js#L219) 我们可以覆写 **commander** 的方法，结合 **chalk** 加强输出错误信息：

```js
var enhanceErrorMessages = (methodName, log) => {
  program.Command.prototype[methodName] = function (...args) {
    if (methodName === 'unknownOption' && this._allowUnknownOption) {
      return;
    }
    this.outputHelp();
    console.log(`  ` + chalk.red(log(...args)));
    console.log();
    process.exit(1);
  };
};
// 类似有：missingArgument，unknownOption，optionMissingArgument 方法
enhanceErrorMessages('missingArgument', (argName) => {
  return `Missing required argument ${chalk.yellow(`<${argName}>`)}.`;
});
```

{% asset_img enhance-error.png 加强错误显示 %}

# 交互式命令行 inquirer

我们可以通过 **command** ，**option** 定义所有命令行需要的功能，但在与使用者交互会相当不友好（会面对大量的命令说明）。

相信大家用过 **vue-cli**，在创建项目时，我们可以跟随命令行的提示来选择对应需要的功能。

这种交互式的命令行可以通过 **inquirer** 来完成。

下面是采用了输入，列表选择，多选方式的效果图：

{% asset_img inquirer.gif 效果图 %}

先定义一批 **questions** 交互问题：

```js
const defaultQuestions = [
  // 列表选择
  {
    type: 'list',
    name: 'template',
    message: '请选择模板',
    choices: [{ name: 'express' }, { name: 'vue2' }],
  },
  // 输入
  {
    type: 'input',
    name: 'appName',
    message: '请输入应用名称',
    default() {
      return 'app';
    },
  },
];
const expressQuestions = [
  {
    type: 'checkbox',
    name: 'express.middleware',
    message: '请选择中间件',
    choices: [
      { name: 'express.json', checked: true },
      { name: 'express.urlencoded', checked: false },
    ],
    when(answers) {
      return answers.template == 'express';
    },
  },
];

const questions = [...defaultQuestions, ...expressQuestions];
```

然后在命令的 **action** 回调中调用 **inquirer.prompt** 方法：

```js
program
  .command('create')
  .description('创建应用')
  .option('-f,--force <path>', '是否强制创建')
  // .allowUnknownOption()
  .action((options, command) => {
    inquirer.prompt(questions).then(async (answers) => {
      console.log(answers);
    });
  });
```

# Demo

再了解上面有关命令行的工具操作后，下面可以实际“造”一个脚手架工具了。

这里将简单完成一个前端代码模板的脚手架，用于快速生成相关代码目录，而不用去技术栈网站去拷贝大量代码。

## express 代码模板

## global 命令行
