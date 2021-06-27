---
title: 如何定制化网站主题色
date: 2021-06-24 20:08:08
tags:
---

# 如何切换主题色

首先抛个问题，我们根据什么来辨别同类型的网站？

我觉得是网站的“主题色”，试想下把淘宝的橘红色换成京东的红色，是不是就和后者一样了。

> 可以说：主题色作为网站辨识度最高的设计元素之一。

实际工作场景中，一个 web 项目可能改个主题色及页面内容，就可以给不同业务方使用。对于如今的前端开发来说，即使有着成熟的 UI 组件框架，比如 **Ant Design** ，**Element UI** 等，
但为了变出不同主题色系的网站风格，我们往往会创建新的主题样式来覆盖原有的 UI ，工作量仍然巨大，稍有疏忽就会有遗漏。

> 那有没有省时省力的方式来定制化 UI 组件色系呢？

肯定有。下面就举例 **[Ant Design Pro](https://github.com/vueComponent/ant-design-vue-pro)** （一款基于 **Vue** 和 **Ant Design** 的中后台前端框架），看下它是基于什么实现的？

# Ant Design Pro 到底有什么魔法？

我们通过 **npm run serve** 启动项目，进入主页后，在页面右侧的设置按钮来切换主题色，能看到页面颜色也跟着发生了改变：

{% asset_img antd-theme-replacer.gif %}

试着找些明面上能看到的东西：

打开调试工具，重新刷新页面，看到浏览器发送了一个 **/css/theme-colors-xxx.css** 的请求，响应内容为一大段样式代码：

{% asset_img theme-fetch.png %}

审查页面有关主题颜色的元素，发现利用了 **样式覆盖** 的特性让新颜色起了效果：

{% asset_img theme-cover.png %}

这些新的样式代码被定义在一个 **style** 标签内：

{% asset_img theme-style-tag.png %}

如此，将覆盖原先 UI 组件的颜色样式，从而将达到主题色切换的目的。不知所以然的你，肯定就会有如下问题：

- **css** 样式代码根据什么规则生成的？
- 请求 **/css/theme-colors-xxx.css** 哪里发起的？
- 主题色的切换，页面怎么快速做样式更新的？

这些都围绕着 **webpack-theme-color-replacer** 展开，下面就进入代码来一探究竟。

# 主题样式代码生成规则？

翻阅 **Ant Design Pro** 中 **webpack** 配置，发现有个和主题颜色配置相关的 **plugins** 逻辑：

```js
// vue.config.js

const createThemeColorReplacerPlugin = require("./config/plugin.config");
//...
vueConfig.configureWebpack.plugins.push(createThemeColorReplacerPlugin());
```

**createThemeColorReplacerPlugin** 返回的就是 **webpack-theme-color-replacer** 插件对象：

```js
const ThemeColorReplacer = require("webpack-theme-color-replacer");

//...
const themePluginOption = {
  fileName: "css/theme-colors-[contenthash:8].css",
  matchColors: getAntdSerials("#1890ff"), // 主色系列
  changeSelector(selector) {},
};

const createThemeColorReplacerPlugin = () =>
  new ThemeColorReplacer(themePluginOption);

module.exports = createThemeColorReplacerPlugin;
```

注意到：**themePluginOption** 中的 **fileName** 和主题样式请求地址一样（和问题二有关）；另外 **matchColors** 默认通过 **getAntdSerials** 把 **#1890ff** 转化为一组蓝色系的主题色：

```
[
  "#1890ff", "#2f9bff", "#46a6ff", "#5db1ff", "#74bcff", "#8cc8ff", "#a3d3ff", "#badeff", "#d1e9ff",
  "#e6f7ff", "#bae7ff", "#91d5ff", "#69c0ff", "#40a9ff",
  "#1890ff", "#096dd9", "#0050b3", "#003a8c", "#002766",
  "24,144,255"
]
```

webpack plugins 运行时，则调用 **ThemeColorReplacer.apply** 方法，并触发 **Handler.handler** 方法：

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

**Handler** 中，会先初始化一个文件提取器 **AssetsExtractor** ，通过内部 **extractAssets** 方法来提取主题样式代码到 **output**，最后调用 **addToEntryJs** 方法，将提取结果加到每个入口文件里：

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
    var cssSrcs = [];
    // 2. 解析 js module 中符合 cssReg 的 css 代码
    var CssCodeReg = Css_Loader_Reg_UGLY;
    src.replace(CssCodeReg, (match, $1) => {
      cssSrcs = cssSrcs.concat(this.extractor.extractColors($1));
    });
    return cssSrcs;
  };
}
function Extractor(options) {
  // 3. 通过指针逐个遍历符合条件的内容，重新组装层复合 css 语法的代码，并提取到 ret 数组中
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

遍历 **compilation.assets** 下每个资源内容，通过正则 **CssCodeReg** 将符合 **css** 代码的内容抓取出来。这些代码就是图中【绿色】中的内容：

{% asset_img cssSrc-replace.png %}

再通过 **extractColors** 方法逐行解析，得到一个有关主题色的 **css** 数组：

{% asset_img cssSrc-ret.png %}

最后将结果输出到 **theme-colors-xxx.css** 中。

这里就回答其中一个问题：

> **css** 样式代码根据什么规则生成的？

不能遗漏的是：添加样式代码到入口文件时，相关 **themePluginOption** 配置将被赋值到 **window.\_\_theme_COLOR_cfg** 作为入口文件的一部分代码，供客户端使用：

```js
getEntryJs(outputName, assetSource, cssCode) {
  var config = {url: outputName, colors: this.options.matchColors}
  var configJs = '\n(typeof window==\'undefined\'?global:window).__theme_COLOR_cfg=' + JSON.stringify(config) + ';\n'
  //...
  return new ConcatSource(assetSource, configJs)
}
```

# 主题样式请求怎么发起？

我们以页面的主题设置为入口，看下 **SettingDrawer** 组件内部的功能。

首先该组件提供了这些配置选项：

{% asset_img settingDrawer.png UI展示 %}

在该项目中，会发现有 **config\themePluginConfig.js** 配置：

```js
// config\themePluginConfig.js
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

如果你熟悉 **Ant Design Pro**，那么在 **[动态主题](https://pro.ant.design/docs/dynamic-theme-cn)** 中也能看到一样的配置，其通过 **umi-plugin-antd-theme** 进行设置。

这些配置在程序启动时，就挂载至 **window.umi_plugin_ant_themeVar** 下：

```js
// main.js
window.umi_plugin_ant_themeVar = themePluginConfig.theme;
```

作为页面主题的调色板元数据：

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

当主题颜色修改时，则会触发更新主题方法 **updateTheme()** ：

```js
function handleChangeSetting(key, value, hideMessageLoading) {
  if (key === "primaryColor") {
    // 更新主色调
    updateTheme(value);
  }
}
```

**updateTheme** 会调用 **themeColor.changeColor** 方法，生成新的主题色系 **newColors** ，再交给 **webpack-theme-color-replacer/client** 处理：

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

在 **setCssText** 方法中，会去寻找 **id** 为 **css_xxx** 的 **style** 标签，并调用 **getCssString()** 方法：

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

**getCssString()** 内通过 **xhr** 来发动主题样式文件的请求。从而回答了第二个问题：

> 请求 **/css/theme-colors-xxx.css** 哪里发起的？

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

> 主题色的切换，页面怎么快速做样式更新的？

```js
function setCssTo(cssText) {
  cssText = _this.replaceCssText(cssText, oldColors, newColors);
  elStyle.innerText = cssText;
}
function replaceCssText(cssText, oldColors, newColors) {
  oldColors.forEach(function (color, t) {
    //#222、#222223、#22222350、222, 255,3 => #333、#333334、#33333450、211,133,53、hsl(27, 92.531%, 52.745%)
    var reg = new RegExp(
      color.replace(/\s/g, "").replace(/,/g, ",\\s*") +
        "([\\da-f]{2})?(\\b|\\)|,|\\s)",
      "ig"
    );
    cssText = cssText.replace(reg, newColors[t] + "$1$2"); // 255, 255,3
  });
  return cssText;
}
```

这样有个好处，有关主题颜色的样式文件只在首次加载，后续通过替换 **style** 标签内容，从而达到主题切换。

# 总结

**webpack-theme-color-replacer** 是个很小众的库，github 才 200 个 Star。但它的确解决了产品上某些问题。

有时候我们每天忙碌于业务代码的“搬砖”中，枯燥乏味。作为一个软件程序员，除了完成需求外，还需要更多的思考业务，来促使代码有更多的扩展性。

如果你说业务固定不变，或者离我太远，也可以发现开发中的“重复性劳动”，将 ctrl C/V 最大程度地程序化。什么页面可视化搭建，低代码平台可不光光是 KPI 产物，我觉得它们能促使开发人员有更多时间思考，去挖掘更高的价值。

最后，还是需要不断纵向学习，本篇只简单说了该插件的工作过程。但它内部有关生成调色板的逻辑，怎么解析 css 代码，怎么和 webpack 融合都没有呈现出来，更多需要你去深究，别想用到时方恨少。
