---
node 基础 -- path
---

# Path

又是个基础模块，不过也有让人晕乎的概念：

-   path.resolve 和 path.relative 有什么区别？
-   path.posix 是什么？

这次就搞个明白 :smirk:

## path.resolve 和 path.relative 有什么区别？

resolve 输出绝对路径；relative 输出相对路径，relative 解析前会对内部路径参数进行一次 resolve，再对比输出相对路径。

### path.resolve([...paths])

根据绝对和相对路径解析多个 path，返回一个解析好的 **绝对路径**。

```js
// 有公共路径，公共路径+后者路径
path.resolve('/test/foo/boo', '/test/a.js'); // e:\test\a.js
// 没有公共路径，且都为绝对路径，以后者路径为准
path.resolve('/other/foo', '/test/a.js'); // e:\test\a.js
// 后者为相对路径，则基于前者路径 + 后者路径
path.resolve(__dirname, 'test/a.js');
// e:\my_work\github\myBlog\read_note\node\demo\path\test\a.js
```

### path.relative(from, to)

返回相对于 from 路径的路径 to，再做相对解析前，先要把 from to 这两个 path 进行一次 **path.resolve**，再拿两个结果值做相对路径解析。

如果 to 是绝对路径，则结果直接是 to 相对根路径。

```js
path.resolve('/test/foo/boo'); // e:\test\foo\boo
path.resolve('/test/a.js'); // e:\test\a.js
// 在公共路径 /test 基础上，to 需要 from 往上两级（\foo\boo）才能解析到 a.js
path.relative('/test/foo/boo', '/test/a.js'); // ..\..\a.js
```

```js
path.resolve('/other/foo/boo'); // e:\other\foo
path.resolve('/test/a.js'); // e:\test\a.js
// 没有公共路径。直接 to 返回到绝对路径处解析
path.relative('/other/foo', '/test/a.js'); // ..\..\test\a.js
```

```js
// to 包含 from 的公共路径，直接输出 to 的路径
path.relative(__dirname, 'test/a.js'); // test\a.js
```

## 文件操作常用 api

### path.basename(path[, ext])

返回路径下的文件名，可以撇除后缀

```js
console.log(path.basename('/test/foo', '.js')); // foo
console.log(path.basename('/test/foo.html', '.html')); // foo
```

### path.dirname(path)

截取目录（路径）

```js
path.dirname('/foo/bar/baz/asdf/quux');
// Returns: '/foo/bar/baz/asdf'
```

### path.extname(path)

获取后缀

```js
path.extname('index.html');
// Returns: '.html'

path.extname('index.');
// Returns: '.'

path.extname('.index.coffee.md');
// Returns: '.md'
```

### path.join([...paths])

类似数组的 join 方法，会把路径参数拼接起来，并且解析相对路径标识（./ , ../）

```js
path.join('/foo', 'bar', 'baz/asdf', 'quux', '..');
// \foo\bar\baz\asdf

path.join('/foo', 'bar', 'baz/asdf', '/quux'); // 注意绝对路径只做拼接之用
// \foo\bar\baz\asdf\quux
```

### path.normalize(path)

当我看到它时，觉得用 webpack 等构建工具搭项目脚手架时会有用，因为团队成员电脑系统可能会有 mac 的。

用来处理不同系统的 **路径分隔符**（sequential path segment separation），管你是什么斜杠，管你路径里有什么相对路径，拿来就是一顿统一式的解析 :tada:

```js
path.normalize('C:////temp\\\\/\\/\\/foo/..\\bar/test/hello.js')
C:\temp\bar\test\hello.js
```

### path.parse(path)

分析一个路径，输出它的 目录，根路径，当前 base 的名称和后缀

```js
path.parse('/foo/bar/test.js');
// { root: '/',
//   dir: '/foo/bar',
//   base: 'test.js',
//   ext: '.js',
//   name: 'test' }
```

```js
path.parse('C:\\foo\\bar\\test.js');
// { root: 'C:\\',
//   dir: 'C:\\foo\\bar',
//   base: 'test.js',
//   ext: '.js',
//   name: 'test' }
```

这个图就很形象：

```
┌─────────────────────┬────────────┐
│          dir        │    base    │
├──────┬              ├──────┬─────┤
│ root │              │ name │ ext │
" C:\      path\dir   \ file  .txt "
└──────┴──────────────┴──────┴─────┘
```

### path.isAbsolute(path)

判断绝对路径

```js
path.isAbsolute('/foo/bar'); // true
path.isAbsolute('qux/'); // false
path.isAbsolute('C:\\foo\\..'); // true
path.isAbsolute('.'); // false
```

## POSIX 是什么？和 win32 有什么区别？

### POSIX

> POSIX 表示可移植操作系统接口（Portable Operating System Interface of UNIX，缩写为 POSIX ）

简单的可以认为是 UNIX 系统提供的接口方法。

path 提供 posix 系列接口的封装，只要在普通 api 前加上 posix 即可。区别如下：

特别说明我是在 windows 系统下

```js
path.posix.resolve('/test/foo'); // /test/foo
path.resolve('/test/foo'); // e:\test\foo 在 windows 中就会有盘符的出现
```

### win32

win32 是专门给 windows 用的

```js
path.win32.resolve('/test/foo'); // e:\test\foo
```

说到这里，如果你有兴趣，可以看下这个 bug 的原因：[vue 编译 Error: Could not load /src/core/config](https://segmentfault.com/a/1190000017335977)

## 分隔符

### path.delimiter

windows 为 ;， POSIX 为 :

POSIX

```js
// 获取系统变量
console.log(process.env.PATH);
// Prints: '/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin'

process.env.PATH.split(path.delimiter);
// Returns: ['/usr/bin', '/bin', '/usr/sbin', '/sbin', '/usr/local/bin']
```

windows

```js
console.log(process.env.PATH);
// Prints: 'C:\Windows\system32;C:\Windows;C:\Program Files\node\'

process.env.PATH.split(path.delimiter);
// Returns ['C:\\Windows\\system32', 'C:\\Windows', 'C:\\Program Files\\node\\']
```

### path.sep

windows 为 \， POSIX 为 /

POSIX

```js
'foo/bar/baz'.split(path.sep);
// Returns: ['foo', 'bar', 'baz']
```

windows

```js
'foo\\bar\\baz'.split(path.sep);
// Returns: ['foo', 'bar', 'baz']
```

## 参考

> 我只是知识点的“加工者”，更多内容请查阅原文链接 :thought_balloon: ，同时感谢原作者的付出：

-   [nodejs api path](https://nodejs.org/dist/latest/docs/api/path.html)
