---
title: 网站主题色动态切换
tags:
---

# 网站最大的辨识度是什么？

打开 淘宝，京东两个网站，他们都是购物网站，除了品牌 logo 外，粗看之下网站首页基本很相像，那是什么让我们马上能区分这两个不同的网站呢？

我个人觉得是 **颜色**，颜色能在视觉上让我们快速辨别这是什么网站。比如：美团的黄色，汽车之家的蓝色，B 站的粉色...

如果把京东的主题色改为橘红色，是不是觉得就是个淘宝了。当然这只是个玩笑，我想引出的是，在前端开发中怎么能够快速切换网站的主题颜色，尤其千篇一律的后台管理系统，能交给不同业务方使用。

# 如何切换主题色

如今，前端开发一个网站都有很一套很成熟的 UI 组件框架，比如 **Ant Design** ，**Element UI** 等。

作为组件库提供只提供了一种主颜色设计（就像上面 2 个组件框架为蓝色系），但使用方需要专门定义一种其他颜色的风格，甚至可以在线定制化，那就不是在开发阶段 **写死** 那么简单了。

那有没有现成的解决方案？肯定有。下面就看下 **ant-design-vue-pro** （一款基于 **Vue** 和 **Ant Design Pro** 的中后台前端框架）是怎么做的？

{% asset_img antd-theme-replacer.gif %}

# ant-design-vue-pro 如何做的？

## 动态更改主题

从上图中，我们能看到，当在 **SettingDrawer** 组件（主题配置组件）更改主题配置时，页面颜色发生了更改。

打开调试工具，能看到当初次更配配置时，浏览器发送了一个 **/css/theme-colors-xxx.css** 的请求，响应内容为 **css** 代码：

{% asset_img theme-fetch.png %}

审查页面和颜色相关的元素，能看到新修改的主题色利用了 css 中 **样式覆盖** 的特性让新颜色起了效果。

{% asset_img theme-cover.png %}

这些新的样式被定义在 **id** 为 **css_xxxx** 的 **style** 标签内：

{% asset_img theme-style-tag.png %}

如此，将覆盖所有原有 UI 组件有关颜色样式，从而将达到主题色的切换。

到这里会有几个疑问：

- 请求 **/css/theme-colors-xxx.css** 哪里定义并发起的？
- **css** 样式代码生成的是什么？
- **css** 样式代码怎么做到更新的？

## **css** 代码的解析

翻阅 **ant-design-vue-pro** 中 **webpack** 配置，发现有个根据环境不同，会判断是否创建主题更新相关的 **plugins** 插件逻辑。

```js
// vue.config.js

const createThemeColorReplacerPlugin = require("./config/plugin.config");
//...
if (process.env.VUE_APP_PREVIEW === "true") {
  console.log("VUE_APP_PREVIEW", true);
  // add `ThemeColorReplacer` plugin to webpack plugins
  vueConfig.configureWebpack.plugins.push(createThemeColorReplacerPlugin());
}
```

**createThemeColorReplacerPlugin** 就是对 **webpack-theme-color-replacer** 模块加载主题配置 **themePluginOption** 的封装：

```js
const ThemeColorReplacer = require("webpack-theme-color-replacer");

//...
const themePluginOption = {
  fileName: "css/theme-colors-[contenthash:8].css",
  matchColors: getAntdSerials("#1890ff"), // 主色系列
  changeSelector(selector) {},
};

const createThemeColorReplacerPlugin = () => new ThemeColorReplacer(themePluginOption);

module.exports = createThemeColorReplacerPlugin;
```

**themePluginOption** 中能看到 **fileName** 和页面发送的请求地址一样；另外 **matchColors** 默认通过 **getAntdSerials** 把 **#1890ff** 转化为一组蓝色系的主题色：

```
["#1890ff", "#2f9bff", "#46a6ff", "#5db1ff", "#74bcff", "#8cc8ff", "#a3d3ff", "#badeff", "#d1e9ff", "#e6f7ff", "#bae7ff", "#91d5ff", "#69c0ff", "#40a9ff", "#1890ff", "#096dd9", "#0050b3", "#003a8c", "#002766", "24,144,255"]
```

当此插件运行后，就将调用 **ThemeColorReplacer.apply** 方法，并触发 **Handler.handler** 方法：

```js
class ThemeColorReplacer {
  constructor(options) {
    this.handler = new Handler(options);
  }
  apply(compiler) {
    //...
    this.handler.handle(compilation);
  }
}
```

**handle** 中，会先调用 **AssetsExtractor.extractAssets** 来提取有关主题色的 **css** 代码，然后通过 **addToEntryJs** 方法，将提取结果加到每个入口文件里。

```js
class Handler {
  constructor(options) {
    //...
    this.assetsExtractor = new AssetsExtractor(this.options);
  }
  handle(compilation) {
    var output = this.assetsExtractor.extractAssets(compilation.assets);
    //...
    this.addToEntryJs(outputName, compilation, output);
  }
}
```

**AssetsExtractor** 内部逻辑过于复杂，代码流程如下：

```js
function AssetsExtractor(options) {
  this.extractor = new Extractor(options);

  this.extractAssets = function (assets) {
    // 1. 遍历 assets 文件对象
    var srcArray = this.extractToArray(assets);
    var output = dropDuplicate(srcArray).join("\n");
    //...
    return output;
  };

  this.extractToArray = function (assets) {
    //...
    var cssSrcs = [];
    Object.keys(assets).map((fn) => {
      var asset = assets[fn];
      cssSrcs = cssSrcs.concat(that.extractAsset(fn, asset));
    });
    return cssSrcs;
  };

  this.extractAsset = function (fn, asset) {
    //...
    return this.extractor.extractColors(src);
  };
}
function Extractor(options) {
  // 2. 通过指针逐个遍历符合条件的内容，并提取到 ret 数组中
  this.extractColors = function (src) {
    src = src.replace(Reg_Lf_Rem, "");
    var ret = [];
    var nameStart,
      nameEnd,
      cssEnd = -1;
    while (true) {
      //...
      ret.push(selector + "{" + rules.join(";") + "}");
    }
    return ret;
  };
}
```

主要会遍历 **compilation.assets** 下每个资源内容，通过正则将符合 **css** 代码的内容抓取出来。

解析出来的每个 **asset** 文件中， **css** 的代码就为图中【绿色】中的内容：

{% asset_img cssSrc-replace.png %}

然后和主题色进行正则匹配，得到一个有关主题色的 **css** 数组，最后组装成新的 **css** 主题样式代码，作为文件输出到 **theme-colors-xxx.css** 中。

{% asset_img cssSrc-ret.png %}

这里回答其中一个问题：

> **css** 代码生成的是什么？

最后，相关 **请求地址** 以及 **matchColors** 将被赋值到 **window.\_\_theme_COLOR_cfg** 作为入口文件的一部分代码，供客户端使用：

```js
getEntryJs(outputName, assetSource, cssCode) {
  var config = {url: outputName, colors: this.options.matchColors}
  var configJs = '\n(typeof window==\'undefined\'?global:window).__theme_COLOR_cfg=' + JSON.stringify(config) + ';\n'
  //...
  return new ConcatSource(assetSource, configJs)
}
```

## 怎么更改样式

**SettingDrawer** 组件内展示主题相关的配置：

{% asset_img settingDrawer.png %}

对于主题色，**SettingDrawer** 组件在初始化时会解析 **config\themePluginConfig.js** 配置，并将其挂载至 **window.umi_plugin_ant_themeVar** 下，最后可视化到页面上：

```js
export default {
  theme: [
    {
      key: "#F5222D",
      fileName: "#F5222D.css",
      modifyVars: {
        "@primary-color": "#F5222D",
      },
    },
    {
      key: "#FA541C",
      fileName: "#FA541C.css",
      modifyVars: {
        "@primary-color": "#FA541C",
      },
    },
  ],
};
```

```js
// main.js
window.umi_plugin_ant_themeVar = themePluginConfig.theme;
```

```js
var getThemeList = function getThemeList(i18nRender) {
  var list = window.umi_plugin_ant_themeVar || [];
  //...
  list.forEach(function (item) {
    var color = (item.modifyVars || {})["@primary-color"];

    //...
    lightColorList.push(
      _objectSpread(
        {
          color: color,
        },
        item
      )
    );
  });
  return {
    colorList: {
      dark: darkColorList,
      light: lightColorList,
    },
    themeList: themeList,
  };
};
```

如果你熟悉 **Ant Design Pro**，那么在 **[动态主题](https://pro.ant.design/docs/dynamic-theme-cn)** 中也能看到类似的设置，不过基于 **umi-plugin-antd-theme**。

当主题配置被修改后，则会触发更新主题方法 **updateTheme** ：

```js
function handleChangeSetting(key, value, hideMessageLoading) {
  if (key === "primaryColor") {
    // 更新主色调
    updateTheme(value);
  }
}
```

**updateTheme** 会调用 **themeColor.changeColor** 方法，通过 **getAntdSerials** 将新的主题色转化为多个主题系色 **newColors** ，再交给 **webpack-theme-color-replacer/client** 处理：

```js
export var themeColor = {
  //...
  changeColor: function changeColor(newColor) {
    var options = {
      newColors: this.getAntdSerials(newColor),
      // new colors array, one-to-one corresponde with `matchColors`
      changeUrl: function changeUrl(cssUrl) {
        return "/".concat(cssUrl); // while router is not `hash` mode, it needs absolute path
      },
    };
    return client.changer.changeColor(options, Promise);
  },
};
```

**webpack-theme-color-replacer/client** 中定义了如何更改主题色的逻辑，注意这里会用到前面 **plugins** 中定义的 **\_\_theme_COLOR_cfg** 变量，如此确认了主题色系 **oldColors** 和样式请求地址 **cssUrl**：

```js
// node_modules\webpack-theme-color-replacer\client\themeColorChanger.js
module.exports = {
  changeColor: function (options, promiseForIE) {
    //...
    return new Promise(function (resolve, reject) {
      //...
      if (!theme_COLOR_config) {
        theme_COLOR_config = win().__theme_COLOR_cfg;
        var later = retry();
        //重试直到theme_COLOR_config加载
        if (later) return later;
      }
      var oldColors = options.oldColors || theme_COLOR_config.colors || [];
      var newColors = options.newColors || [];

      var cssUrl = theme_COLOR_config.url || options.cssUrl;
      //...
      setCssText(last, cssUrl, resolve, reject);
    });
  },
};
```

在 **setCssText** 中，会去寻找 **id** 为 **css_xxx** 的 **style** 标签，并调用 **getCssString** 方法：

```js
function setCssText(last, url, resolve, reject) {
  var id = "css_" + +new Date();
  elStyle = document.querySelector(options.appendToEl || "body").appendChild(document.createElement("style"));

  elStyle.setAttribute("id", id);

  _this.getCssString(
    url,
    function (cssText) {
      setCssTo(cssText);
      _urlColors[url] = { id: id, colors: newColors };
      resolve();
    },
    reject
  );
}
```

**getCssString** 方法内定义了 **xhr** 来前面 **webpack** 生成的问题件，从而回答了第一个问题：

> 请求 **/css/theme-colors-xxx.css** 哪里定义并发起的？

```js
module.exports = {
  getCssString: function (url, resolve, reject) {
    var css = win().__theme_COLOR_css;
    if (css) {
      // css已内嵌在js中
      win().__theme_COLOR_css = "";
      resolve(css);
      return;
    }

    var xhr = new XMLHttpRequest();
    //...
    xhr.open("GET", url);
    xhr.send();
  },
};
```

调用完 **getCssString** 后，将得到 **cssText** 代码。然后通过 **setCssTo** 替换新老颜色，这就回答了最后个问题：

> **css** 样式代码怎么做到更新的？

```js
function setCssTo(cssText) {
  cssText = _this.replaceCssText(cssText, oldColors, newColors);
  elStyle.innerText = cssText;
}
function replaceCssText(cssText, oldColors, newColors) {
  oldColors.forEach(function (color, t) {
    //#222、#222223、#22222350、222, 255,3 => #333、#333334、#33333450、211,133,53、hsl(27, 92.531%, 52.745%)
    var reg = new RegExp(color.replace(/\s/g, "").replace(/,/g, ",\\s*") + "([\\da-f]{2})?(\\b|\\)|,|\\s)", "ig");
    cssText = cssText.replace(reg, newColors[t] + "$1$2"); // 255, 255,3
  });
  return cssText;
}
```

这个有个好处，请求的主题样式文件将只有一份，后续修改只会替换文件内和颜色有关的内容。
