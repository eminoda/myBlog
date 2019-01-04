<!-- vue_learn--渲染 基础编译 baseCompile -->

# 基础编译 baseCompile

**compile** 在 render 中贯彻从头至尾，看下如果作用于 template

## parse

```js
//E:\github\vue\src\compiler\index.js
const ast = parse(template.trim(), options);
```

首先通过 parse 把模板解析成 ast

> AST：抽象语法树（abstract syntax tree ）

看下 parse 如何定义

```js
function parse(template,options){
    ...
    let root;
    ...
    // 交给此方法
    parseHTML(template,{...})
    ...
    return root;
}
```

**parseHTML**

```js
function parseHTML(html, options) {
    ...
    while (html) {
        last = html
        // Make sure we're not in a plaintext content element like script/style
        // 判断标签不存在（首次解析），或者 内容不为sripct、style
        if (!lastTag || !isPlainTextElement(lastTag)) {
            // 注释
            if (comment.test(html)) {
                // 切割 html
            advance(...);
            }
            // CDATA
            if(conditionalComment.test(html)){
            advance(...);
            }
            // doctype
            const doctypeMatch = html.match(doctype)
            if (doctypeMatch) {
            advance(doctypeMatch[0].length)
            continue
            }
            if (endTagMatch) {
                ...
            }
            if(startTagMatch){
                ...
            }
        }
    }
    // 有关 html 一些修正
    ...
}
```

忽略注释等解析，先来看 startTagMatch，其是由 **parseStartTag** 解析 html 的 **开始标签**，赋值给 **startTagMatch**

```js
const startTagMatch = parseStartTag();
```

解析出来的 match 大致这样：

```js
{
	attrs: [
        [" id="app"", "id", "=", "app", undefined, undefined, index: 0, input: "html"]
    ],
	end: 29,
	start: 0,
	tagName: "div",
	unarySlash: ""
}
```

```js
function parseStartTag() {
	const start = html.match(startTagOpen);
	if (start) {
		const match = {
			tagName: start[1], //div
			attrs: [],
			start: index // 0
		};
		advance(start[0].length); // html 去除开头标签部分 如：<div
		let end, attr;
		// 判断起始的标签结尾or含属性（读完开头标签所有内容，break）
		while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
			advance(attr[0].length);
			match.attrs.push(attr);
		}
		if (end) {
			match.unarySlash = end[1]; // 闭合标签相关问题
			advance(end[0].length);
			match.end = index;
			return match;
		}
	}
}
```

对于 html 来说，它经历了一次“剃头”

```html
<div id="app">content</div>
```

变成

```html
   content
</div>
```

拿着 startTagMatch 做进一步处理

```js
if (startTagMatch) {
    handleStartTag(startTagMatch);
    ...
    continue;
}
```

**handleStartTag**

```js
function handleStartTag(match) {
	const tagName = match.tagName;
	const unarySlash = match.unarySlash;

	...

	const l = match.attrs.length;
	const attrs = new Array(l);
	for (let i = 0; i < l; i++) {
		const args = match.attrs[i];
		const value = args[3] || args[4] || args[5] || "";
        ...
        // 将 attrs 从 regex 的结果进行标准化
        attrs[i] = {
			name: args[1],
			value: decodeAttr(value, shouldDecodeNewlines)
		};
	}

	if (!unary) {
		stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs });
		lastTag = tagName;
	}

	if (options.start) {
		options.start(tagName, attrs, unary, match.start, match.end);
	}
}
```
