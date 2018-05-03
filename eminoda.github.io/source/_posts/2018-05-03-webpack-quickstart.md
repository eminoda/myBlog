---
title: webpack快速入门
tags: webpack
categories:
  - 前端
  - webpack
thumb_img: webpack.jpg
date: 2018-05-03 16:11:17
---


{% asset_img start.png %}

## [什么是webpack](https://webpack.js.org/concepts/)
webpack是模块打包工具，官网介绍就是辣么简单

## webpack和gulp
如果新项目用什么构建，我觉得webpack足矣。如果追求更好的构建，到部署等需求，应该webpack+少量的gulp。
从使用gulp和webpack的实践上看，webpack给我带来很多好处：
1. plugins不要费尽心思去找，webpack官网给你罗列了基本够用的插件
2. 模块化打包。以前用gulp还是传统的手动导入js、css，现在webpack可以一条龙服务
3. 各种loader，方便配置es6，jslint等...
4. 相比以前写各种gulp task，现在webpack配置更像一个框架，系统化配置调教，不用再像gulp可能还在为task执行顺序发愁。

缺点：
1. 如果真的有，那就是编译、构建速度真慢。虽然有很多解决方法，但破电脑真心带不动。
2. 配置繁琐

当然两者**不能这样定性的比较，两者定位不同**。
webpack是模块化的解决方法，只是里面有了gulp的许多功能，让我们有了gulp被webpack取代的错觉。
gulp、grunt是构建工具，当然浅显的看没有webpack强大
平时使用，具体看大家的需求定位。

## 解读一个常见的配置
这是一个常见的webpack配置文件，里面基本包含平时够用的配置方法。完全可以使用以下文件，开始一个quickstart的Demo。
我尽可能通过注释描述这个文件，前提是你刚接触webpack。
[当然不用担心，github上传了这个Demo](https://github.com/eminoda/webpack_demo)

````js
// 导入模块
const path = require('path');
const devServer = require('webpack-dev-server');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
module.exports = {
    // 全局作用域
    context: __dirname,
    // 模块入口
    entry: {
        index: './src/index.js'
    },
    // 文件输出
    output: {
        filename: '[name].bundle.js', //多个chunk
        path: path.resolve(__dirname, 'dist'), //输出路径
        publicPath: process.env.NODE_ENV === 'production' ? 'http://cdn.foo.com/assets' : '/' //资源文件设置CDN路径
    },
    // loader模块加载处理
    module: {
        rules: [{
            // 代码检查
            test: /\.js$/, //匹配哪些文件
            loader: 'eslint-loader',
            enforce: 'pre', //前置loader
            exclude: /(node_modules|libs)/, //排除路径
            options: {
                emitError: true,
                emitWarning: true
            }
        }, {
            // es6编译
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['env']
                }
            }
        }, {
            // 图片
            test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            loader: 'url-loader',
            options: {
                limit: 8000,//限制大小
                name: 'static/images/[name].[hash:7].[ext]'
            }
        }, {
            // 字体文件导出
            test: /\.(woff|eot|ttf|svg)(\?.*)?$/,
            loader: 'url-loader',
            options: {
                // fallback: 'file-loader',// file-loader已集成到url-loader中
                limit: 10,
                name: 'static/fonts/[name].[hash:7].[ext]'
            }
        }, {
            // css预编译
            test: /\.scss$/,
            // 使用插件
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: [{
                    loader: "css-loader" // translates CSS into CommonJS
                }, {
                    loader: "resolve-url-loader" // 解决Sass Bug
                }, {
                    loader: "sass-loader?sourceMap" // compiles Sass to CSS
                }]
            })
        }]
    },
    // 插件
    plugins: [
        // 删除旧文件
        new CleanWebpackPlugin(['dist'], {
            root: __dirname,
            verbose: true
        }),
        // html导出
        new HtmlWebpackPlugin({
            title: 'Development',
            filename: 'index.html',
            template: 'index.html'
        }),
        // css导出
        new ExtractTextPlugin('[name].[hash:7].css'),
    ],
    // source map 生成方式
    devtool: 'inline-source-map',
    // 本地服务
    devServer: {
        contentBase: path.join(__dirname, "dist"),
        compress: false,
        port: 4200,
        open: false
    }
};
````
### 项目文件目录结构
{% asset_img dir.png %}

### 脚手架命令
````
// 构建项目
npm run build
// or 启动Server
npm run start
````

### [entry](https://webpack.js.org/concepts/entry-points/#separate-app-and-vendor-entries)
可以定义单页面SPA，或者MPA多页面导入多个模块
````js
entry: {
    pageOne: './src/pageOne/index.js',
    pageTwo: './src/pageTwo/index.js',
    pageThree: './src/pageThree/index.js'
}
````

### [output](https://webpack.js.org/configuration/output/)
- filename
    可以根据需求，定义不同的变量，以下几个变量在不同需求场景使用不同。
    {% asset_img example-1.png %}
- publicPath
    定义一个类似CDN的域名，然后你可以资源文件（image，fonts...）丢上去，比如你nginx有个cache的目录，配合hash，你也不用担心每次构建的缓存问题，是不是很方便。

### [module](https://webpack.js.org/configuration/module/)
配置Loader的地方，[官方推荐了一系列best practise](https://webpack.js.org/loaders/)，你真的不必像用gulp找符合你需求的plugins。
常用几种范式，基本每个loader都会给个Example
````js
module: {
    rules: [{
        test: /\.js$/,
        loader: loader_name
    }, {
        test: /\.js$/,
        use: [loader_name1,loader_name12,loader_name3]
    }, {
        test: /\.js$/,
        use: [{
            loader:loader_name1
        },{
            laoder:loader_name2
        }]
    }
    ...
````
上面例子中用的Loaders：
- eslint-loader 代码审查
- babel-loader es6编译-->es5
- url-loader&file-loader 对资源文件base64编译，或者超出预定大小，导出到指定目录
- style-loader&css-loader&sass-loader css编译使用的一套comb

### [plugins](https://webpack.js.org/configuration/plugins/)
解决光使用Loader无法完成的一些事情
上面例子中用的plugins：
- clean-webpack-plugin 清除项目旧文件
- html-webpack-plugin 将entry的module导入到指定html
- extract-text-webpack-plugin 将css从js中导出，html中引入