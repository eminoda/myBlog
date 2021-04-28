---
title: 拒绝当“CRUD工具人”，前端开发者如何高效coding？
tags:
  - yapi
  - vue
  - elsa
categories:
  - 开发
  - 前端开发
---

# 前言

# 使用 YApi Mock 接口

# 重构业务代码

## 引入状态机制 vuex

## 共用公共代码 mixins

```html
<template>
  <div class="app-container">
    <el-pro-table v-loading="loading" :columns="columns" :dataSource="list" :pagination="pagination">
      <div slot="action" slot-scope="scope">
        <el-button size="mini" type="text" icon="el-icon-search" @click="showDialog({ type: 'detail', data: scope.row })">详情</el-button>
        <el-button size="mini" type="text" icon="el-icon-edit" @click="showDialog({ type: 'edit', data: scope.row })">修改</el-button>
        <el-button size="mini" type="text" icon="el-icon-delete" @click="showDialog({ type: 'delete', data: scope.row })">删除</el-button>
      </div>
    </el-pro-table>
    <user-dialog ref="userDialogRef" @refresh="getList" />
  </div>
</template>

<script>
  import { mapActions } from 'vuex';
  import BaseListMixins from '@/mixins/BaseListMixin';
  import columns from './columns';

  import UserDialog from './components/UserDialog/Index';

  export default {
    components: { UserDialog },
    mixins: [BaseListMixins],
    data() {
      return {
        columns,
        dialogRef: 'userDialogRef',
      };
    },
    methods: {
      ...mapActions({
        GetList: 'GetUserList',
        DeleteAction: 'DeleteUser',
      }),
    },
  };
</script>
```

# 封装组件

# 借助 Vscode Snippets

# 最后
