<!-- vue_learn--init初始化 渲染 -->

# 渲染 initRender
初始化 vm 一些内部属性
````js
vm._vnode = null // the root of the child tree
vm._staticTrees = null // v-once cached trees
const options = vm.$options
const parentVnode = vm.$vnode = options._parentVnode // the placeholder node in parent tree
const renderContext = parentVnode && parentVnode.context
vm.$slots = resolveSlots(options._renderChildren, renderContext)
vm.$scopedSlots = emptyObject
// ...
vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)

// $attrs & $listeners are exposed for easier HOC creation.
// they need to be reactive so that HOCs using them are always updated
const parentData = parentVnode && parentVnode.data
````
这里注意 createElement、_c 方法，很多地方就用到了。

从文件路径 src\core\vdom\create-element.js 应该也猜到适用于 vdom 渲染用的
````js
export function createElement (context: Component,tag: any,data: any,children: any,normalizationType: any,alwaysNormalize: boolean
): VNode | Array<VNode> {
  ...
  return _createElement(context, tag, data, children, normalizationType)
}
````

来看下本体 **_createElement** ，首先接受5个参数

[参数说明](https://cn.vuejs.org/v2/guide/render-function.html#createElement-%E5%8F%82%E6%95%B0)

![举个例子](https://github.com/eminoda/myBlog/blob/master/read_note/vue_learn/imgs/createElement.png?raw=true)
````js
export function _createElement (
  context: Component,
  tag?: string | Class<Component> | Function | Object,
  data?: VNodeData,
  children?: any,
  normalizationType?: number
): VNode | Array<VNode> {
    ...
}
````