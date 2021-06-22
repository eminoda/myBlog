---
title: 网站主题色动态切换
tags:
---

# 网站的主题色

随手打开几个站点，看了下：淘宝，美团。虽然网站要呈现的内容不同，导致布局排版不同，但如果把淘宝的主题色改为黄色，是不是觉得就是个美团了。

这里想表达的是：不同的网站在视觉上最大辨识性就是**主题颜色**，颜色是网站设计中重要的一环。

# 如何切换主题色

如今，前端开发一个网站都有很一套很成熟的 UI 组件框架，比如 **Ant Design** ，**Element UI** 等。

作为服务方只提供一个蓝色系的设计（就像上面 2 个组件框架一样），但使用方需要专门定义一种其他颜色的风格，甚至可以在线定制化，那就不是在开发阶段 **写死** 那么简单了。

那有没有现成的解决方案？肯定有。下面就看下 **ant-design-vue-pro** （基于 **Ant Design Pro**）是怎么做的？

{% asset_img antd-theme-replacer.gif %}

# ant-design-vue-pro 如何做的？

## 加载主题样式

当页面加载后，能看到 **/css/theme-colors-xxx.css** 的请求：

{% asset_img theme-fetch.png %}

然后页面新增了 **style** 标签并放置了响应内容 **css** 代码：

{% asset_img theme-style-tag.png %}

这些代码将覆盖原有样式代码，从而将达到主题色的切换。

## 代码怎么添加进去的？

对于一个有经验的开发者来说，马上就会去翻阅 **webpack** 的相关配置，看有没有类似的插件。然后发现如下 **plugins** 配置：

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

这个 **plugin.config** 就是对 **webpack-theme-color-replacer** 模块加载主题配置 **themePluginOption** 的封装：

```js
const ThemeColorReplacer = require("webpack-theme-color-replacer");

//...
const themePluginOption = {
  fileName: "css/theme-colors-[contenthash:8].css",
  matchColors: getAntdSerials("#1890ff"), // 主色系列
  // 改变样式选择器，解决样式覆盖问题
  changeSelector(selector) {},
};

const createThemeColorReplacerPlugin = () =>
  new ThemeColorReplacer(themePluginOption);

module.exports = createThemeColorReplacerPlugin;
```

如果你熟悉 **Ant Design Pro**，那么在 **[动态主题](https://pro.ant.design/docs/dynamic-theme-cn)** 中也能看到类似的设置，不过基于 **umi-plugin-antd-theme**。

当此插件运行起来后，就将调用 **ThemeColorReplacer.apply** 方法，从而调用 **Handler** 中的 **handler** 方法：

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

每个 **asset** 如下，**css** 的代码就为图中【绿色】中的内容：

{% asset_img cssSrc-replace.png %}

然后和主题色进行正则匹配，得到一个有关主题色的 **css** 数组，最后组装成新的 **css** 主题代码返回。

{% asset_img cssSrc-ret.png %}

## 切换动态主题

我们会预先定义好主题配置 **theme.config**，类似如下结构：

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

然后将其挂在至全局变量 **window.umi_plugin_ant_themeVar** 下。

在 **SettingDrawer** 组件中，会获取主题配置，提取主题色 **@primary-color** 并添加到每个 **list** 中：

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

当在 **SettingDrawer** 组件中主题配置被修改后，则会触发更新主题方法 **updateTheme** ：

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

**webpack-theme-color-replacer/client** 中定义了如何更改主题色的逻辑：

```js
// node_modules\webpack-theme-color-replacer\client\themeColorChanger.js
module.exports = {
  changeColor: function (options, promiseForIE) {
    //...
    return new Promise(function (resolve, reject) {
      //...
      setCssText(last, cssUrl, resolve, reject);
    });
  },
};
```

在 **setCssText** 中，会调用 **getCssString** 方法，如果当前页面没有 **css\_** 元素，则会通过 **xhr** 获取对应主题色对应的样式文件内容，然后通过 **setCssTo** 替换新老颜色：

```js
function setCssText(last, url, resolve, reject) {
  var id = "css_" + +new Date();
  elStyle = document
    .querySelector(options.appendToEl || "body")
    .appendChild(document.createElement("style"));

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

这里就和上面前后呼应了。

## ？

- 到底 plugins 先，还是 client 先
- 是否 plugins 和 client 重复
