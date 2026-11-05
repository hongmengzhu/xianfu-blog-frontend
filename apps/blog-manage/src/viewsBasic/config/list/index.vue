<script setup lang="ts">
import { Page, VbenButton } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';

import { List } from './api';
import { columns, useGridFormSchema } from './data';

/**
 * 配置列表
 * 当前仅接入查询（/basic/config-list/query）；
 * 新增/编辑/配置/删除/批量操作先占位，待后续接入 ConfigList.go 其余接口。
 */
const [Grid] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: false,
  },
  gridOptions: {
    columns,
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      pageSize: 20,
      pageSizes: [10, 20, 50, 100, 500, 1000],
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }: any, formValues: any) => {
          return await List({
            pageSize: page.pageSize,
            pageNum: page.currentPage,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    checkboxConfig: {
      highlight: true,
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      zoom: true,
    },
  } as any,
});
</script>

<template>
  <Page auto-content-height content-class="p-2">
    <Grid>
      <template #toolbar-actions>
        <VbenButton type="primary" class="pg-button-size-small" disabled>
          <Plus class="size-5" />
          新增
        </VbenButton>
      </template>
      <template #toolbar-tools>
        <VbenButton class="ml-2 pg-button-size-small" size="sm" disabled>
          批量有效
        </VbenButton>
        <VbenButton class="ml-2 pg-button-size-small" size="sm" disabled>
          批量停用
        </VbenButton>
        <VbenButton class="ml-2 pg-button-size-small" size="sm" disabled>
          删除恢复
        </VbenButton>
        <VbenButton class="ml-2 pg-button-size-small" size="sm" disabled>
          物理删除
        </VbenButton>
        <VbenButton class="ml-2 pg-button-size-small" size="sm" danger disabled>
          删除
        </VbenButton>
      </template>
      <template #operate>
        <VbenTableAction
          :actions="[
            {
              text: '编辑',
              disabled: true,
            },
            {
              text: '配置',
              disabled: true,
            },
            {
              text: '删除',
              danger: true,
              disabled: true,
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
  </Page>
</template>

<style scoped></style>
