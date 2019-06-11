---
css 基础 -- nth-of-type
---

看如下代码， 如果你知道哪些内容会以 **红色** 输出， 说明你应该有不错的基础， 反正我是相当晕菜的（实事求是 :sob:）。

```html
<h3><code>.line:nth-of-type(2n+1)</code></h3>
<style>
	.wrap-a .line:nth-of-type(2n + 1) {
		font-size: 16px;
		font-weight: bold;
		color: red;
	}
</style>
<div class="wrap">
	<p class="line hello">id:1---p1</p>
	<div class="line">id:2---div1</div>
	<p class="line">id:3---p2</p>
	<div class="line hello">id:4---div2</div>
	<p class="line">id:5---p3</p>
	<div class="line hello">id:6---div3</div>
	<p class="line">id:7---p4</p>
	<div class="line">id:8---div4</div>
	<p class="line">id:9---p5</p>
	<div class="line">id:10---div5</div>
</div>
```

结果如下， 不知你是否正确？ 这篇的目的就是搞懂这些小知识点， 不然对不起几年搬砖留下的腰肌劳损。

![nth-of-type(2n+1)](https://raw.githubusercontent.com/eminoda/myBlog/master/read_note/css/imgs/nthOfType1.png)

## nth-of-type

> 这个 CSS 伪类匹配文档树中在其之前具有 an+b-1 个 **相同兄弟节点的元素**， 其中 n 为正值或零值。 简单点说就是， 这个选择器匹配那些在相同兄弟节点中的位置与模式 an+b 匹配的相同元素。

依旧混乎乎， 还是结合几个例子看下：

### p:nth-of-type(2n+1)

```html
<h3><code>p:nth-of-type(2n+1)</code></h3>
<style>
	.wrap p:nth-of-type(2n + 1) {
		font-size: 16px;
		font-weight: bold;
		color: red;
	}
</style>
<div class="wrap">
	<p class="line">id:1---p1</p>
	<div class="line">id:2---div1</div>
	<p class="line">id:3---p2</p>
	<div class="line">id:4---div2</div>
	<p class="line">id:5---p3</p>
	<div class="line">id:6---div3</div>
	<p class="line">id:7---p4</p>
	<div class="line">id:8---div4</div>
	<p class="line">id:9---p5</p>
	<div class="line">id:10---div5</div>
</div>
```

![p:nth-of-type(2n+1)](https://raw.githubusercontent.com/eminoda/myBlog/master/read_note/css/imgs/nthOfType.png)

这个 demo 可能发现不出自己的问题， 毕竟符合预期显示了符合 **奇数规则的 p 标签**。

### .line:nth-of-type(2n+1)

2n+1 是取 **符合条件的奇数** 标签（我试过 2n-1 也结果一致， 如果不对请 issue :octocat:）

```html
<h3><code>.line:nth-of-type(2n+1)</code></h3>
<style>
	.wrap-a .line:nth-of-type(2n + 1) {
		font-size: 16px;
		font-weight: bold;
		color: red;
	}
</style>
<div class="wrap-a">
	<p class="line">id:1---p1</p>
	<div class="line">id:2---div1</div>
	<p class="line">id:3---p2</p>
	<div class="line">id:4---div2</div>
	<p class="line">id:5---p3</p>
	<div class="line">id:6---div3</div>
	<p class="line">id:7---p4</p>
	<div class="line">id:8---div4</div>
	<p class="line">id:9---p5</p>
	<div class="line">id:10---div5</div>
</div>
```

和上面不同， 标签 p 换成了 **样式选择器** .line ， 那哪些符合条件？

![.line:nth-of-type(2n+1)](https://raw.githubusercontent.com/eminoda/myBlog/master/read_note/css/imgs/nthOfType1.png)

原以为和上例一样， 会类似按照 .line 取奇数行做显示， 结果却不是。

其实 .line:nth-of-type(2n+1) 是按照元素类型做个集合， 然后再根据不同的集合取符合奇数规则的显示。 这就解释了为何 p 和 div 都有显示。 而非揉在一起间隔显示。

### .hello:nth-of-type(2n+1)

为了证明上例的猜想， 用了 .hello 选择器做区分， 确认了 **标签类别** 和伪类共同决定哪些显示。

```html
<h3><code>.hello:nth-of-type(2n+1)</code></h3>
<style>
	.wrap-b .hello:nth-of-type(2n + 1) {
		font-size: 16px;
		font-weight: bold;
		color: red;
	}
</style>
<div class="wrap-b">
	<p class="hello">id:1---p1</p>
	<div class="hello">id:2---div1</div>
	<p class="hello">id:3---p2</p>
	<!-- 虽 .hello 奇数，但 p 标签偶数。未显示 -->
	<div class="">id:4---div2 <span style="padding-left:10px">未显示</span></div>
	<p class="hello">id:5---p3</p>
	<!-- 虽 .hello 偶数，但 div 标签奇数。显示 -->
	<div class="hello">id:6---div3 <span style="padding-left:10px">显示</span></div>
	<p class="">id:7---p4</p>
	<div class="hello">id:8---div4</div>
	<div class="hello">id:9---div5</div>
</div>
```

![.hello:nth-of-type(2n+1)](https://raw.githubusercontent.com/eminoda/myBlog/master/read_note/css/imgs/nthOfType2.png)

注意： id:3---p2 内容没有显示。

上述内容，所属 .hello 样式选择器，并且也符合奇数规则，但标签 p 是第二个（偶数），所以没有输出。

同理：id:6---div3 显示了。虽然符合偶数规则，但标签 div 是第三个（奇数）

### .line:nth-of-type(2)

```html
<h3><code>.line:nth-of-type(2)</code></h3>
<style>
	.wrap-c .line:nth-of-type(2) {
		font-size: 16px;
		font-weight: bold;
		color: red;
	}
</style>
<div class="wrap-c">
	<p class="line">id:1---p1</p>
	<div class="line">id:2---div1</div>
	<p class="line">id:3---p2</p>
	<div class="line">id:4---div2</div>
	<p class="line">id:5---p3</p>
	<div class="line">id:6---div3</div>
	<p class="line">id:7---p4</p>
	<div class="line">id:8---div4</div>
	<p class="line">id:9---p5</p>
	<div class="line">id:10---div5</div>
</div>
```

![.line:nth-of-type(2)](https://raw.githubusercontent.com/eminoda/myBlog/master/read_note/css/imgs/nthOfType3.png)

结合之前例子，就能知道为何这两行显示。

## 参考

> 我只是知识点的“加工者”， 更多内容请查阅原文链接 :thought_balloon: ， 同时感谢原作者的付出：

-   [:nth-of-type MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/:nth-of-type#语法)

-   [CSS3 选择器:nth-child 和:nth-of-type 之间的差异 张鑫旭](https://www.zhangxinxu.com/wordpress/2011/06/css3%E9%80%89%E6%8B%A9%E5%99%A8nth-child%E5%92%8Cnth-of-type%E4%B9%8B%E9%97%B4%E7%9A%84%E5%B7%AE%E5%BC%82/)

-   [The Difference Between :nth-child and :nth-of-type css-tricks](https://css-tricks.com/the-difference-between-nth-child-and-nth-of-type/)

## 关于我

如果你觉得这篇文章对你有帮助，请点个赞或者分享给更多的道友。

也可以扫码关注我的 **微信订阅号 - [ 前端雨爸 ]**，第一时间收到技术文章 :rocket:

![微信订阅号-前端雨爸](https://raw.githubusercontent.com/eminoda/myBlog/master/imgs/webcat-qrcode.jpg)

我会把学习和工作心得持续输出 :fire: ，你们的支持是我写作的最大动力 :tada:
