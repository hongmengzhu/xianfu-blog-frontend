<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import { computed, reactive, ref } from 'vue';

import { Page, useVbenDrawer, VbenButton } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { PgTree } from '@pg/components-n';

import { message } from '#/adapter';
import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { selectNodeAllPublic as selectPublicCategory } from '#/viewsApi/diplCategory/api';

import {
  batchSelectDisable,
  batchSelectEnable,
  batchSelectPhysicalDeletion,
  batchSelectRecovery,
  cacheOverride,
  List,
} from './api';
import AccessKeyTpl from './components/DrawerAccessKey.vue';
import DrawerEdit from './components/DrawerEdit.vue';
import { columns, useGridFormSchema } from './data';

const currenRecord = ref(false);
const currenData = ref<Recordable<any>>({});
const reloadTreeState = ref(0);
const reloadTreeComputed = computed(() => reloadTreeState.value);
const formParam = reactive({ categoryNo: '' });

const treeChang = (record) => {
  currenRecord.value = true;
  currenData.value = record;
  // console.log('record', record);
  formParam.categoryNo = record.data.code;
  reloadTree();
  onRefresh();

  setTimeout(() => {
    reloadTree();
  }, 2000);
};
/**
 * 重新加载
 */
function reloadTree() {
  reloadTreeState.value++;
}
/**
 * 树重载
 * @param e
 */
const treeOverload = (e) => {
  formParam.categoryNo = '';
  onRefresh();
};

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: DrawerEdit,
  destroyOnClose: true,
});
const [DrawerAccessKey, drawerAccessKeyApi] = useVbenDrawer({
  connectedComponent: AccessKeyTpl,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: false,
  },
  gridOptions: {
    columns,
    height: 'auto',
    keepSource: true,
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    expandConfig: {
      expandAll: true,
    },
    columnConfig: {
      resizable: true,
    },
    sortConfig: {
      trigger: 'cell',
      remote: true,
    },
    filterConfig: {
      remote: true,
    },
    pagerConfig: {
      pageSize: 20,
      pageSizes: [10, 20, 50, 100, 500, 1000],
    },
    proxyConfig: {
      sort: true,
      filter: true,
      response: {
        result: 'data',
        total: 'total',
      },
      ajax: {
        query: async ({ page, sorts, filters }, formValues) => {
          const queryParams: any = { ...formValues };
          // 处理排序条件
          const firstSort = sorts?.[0];
          if (firstSort) {
            queryParams.sort = firstSort.field;
            queryParams.order = firstSort.order;
          }
          // 处理筛选条件
          if (filters) {
            filters.forEach(({ field, values }: any) => {
              queryParams[field] = values.join(',');
            });
          }
          queryParams.pageSize = page.pageSize;
          queryParams.pageNum = page.currentPage;
          return await List({ ...queryParams, ...formParam });
        },
      },
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      zoom: true,
    },
    checkboxConfig: {
      reserve: true,
      highlight: true,
      range: true,
    },
  } as any,
});

/**
 * 重新查询
 */
async function gridQuery(params: Record<string, any> = {}) {
  try {
    await gridApi.query(params);
  } catch (error) {
    console.error('Error occurred while reloading:', error);
  }
}

/**
 * 刷新表格
 */
async function onRefresh() {
  try {
    if (gridApi.state?.formOptions) {
      const formValues = await gridApi.formApi.getValues();
      gridApi.formApi.setLatestSubmissionValues(formValues);
      await gridQuery(formValues);
    } else {
      await gridQuery();
    }
  } catch (error) {
    console.error('Error occurred while reloading:', error);
  }
}

/**
 * 新增
 */
function onCreate() {
  drawerApi
    .setData({
      // 表单值
      values: {},
      parent: currenData.value?.data,
      isUpdate: false,
    })
    .open();
}

/**
 * 编辑
 * @param row 行数据
 */
function onEdit(row: any) {
  drawerApi.setData({ values: row, isUpdate: true }).open();
}

/**
 * 密钥
 * @param row 行数据
 */
function onAccessKey(row: any) {
  drawerAccessKeyApi
    .setData({
      // 表单值
      values: row,
      isUpdate: true,
    })
    .open();
}

/**
 * 批量有效
 */
function onBatchEnable() {
  const $grid = gridApi.grid;
  if (!$grid) return;
  const checkboxRecords = $grid.getCheckboxRecords();
  if (checkboxRecords.length <= 0) {
    message.warning('你没有选择任何数据');
    return;
  }
  const ids: any[] = [];
  checkboxRecords.forEach((item: any) => {
    if (item.state === 2) {
      ids.push(item.id);
    } else {
      $grid.setCheckboxRow(item, false);
    }
  });
  if (ids.length <= 0) {
    message.warning('你没有选择任何数据');
    return;
  }
  batchSelectEnable(ids, () => {
    onRefresh();
    $grid.setAllCheckboxRow(false);
  });
}

/**
 * 批量停用
 */
function onBatchDisable() {
  const $grid = gridApi.grid;
  if (!$grid) return;
  const checkboxRecords = $grid.getCheckboxRecords();
  if (checkboxRecords.length <= 0) {
    message.warning('你没有选择任何数据');
    return;
  }
  const ids: any[] = [];
  checkboxRecords.forEach((item: any) => {
    if (item.state == 1) {
      ids.push(item.id);
    } else {
      $grid.setCheckboxRow(item, false);
    }
  });
  if (ids.length <= 0) {
    message.warning('你没有选择任何数据');
    return;
  }
  batchSelectDisable(ids, () => {
    onRefresh();
    $grid.setAllCheckboxRow(false);
  });
}

/**
 * 物理删除
 */
function onBatchPhysicalDeletion() {
  const $grid = gridApi.grid;
  if (!$grid) return;
  const checkboxRecords = $grid.getCheckboxRecords();
  if (checkboxRecords.length <= 0) {
    message.warning('你没有选择任何数据');
    return;
  }
  const ids: any[] = [];
  checkboxRecords.forEach((item: any) => {
    ids.push(item.id);
  });
  if (ids.length <= 0) {
    message.warning('你没有选择任何数据');
    return;
  }
  batchSelectPhysicalDeletion(ids, () => {
    onRefresh();
    $grid.setAllCheckboxRow(false);
  });
}

/**
 * 删除恢复
 */
function onRecovery() {
  const $grid = gridApi.grid;
  if (!$grid) return;
  const checkboxRecords = $grid.getCheckboxRecords();
  if (checkboxRecords.length <= 0) {
    message.warning('你没有选择任何数据');
    return;
  }
  const ids: any[] = [];
  checkboxRecords.forEach((item: any) => {
    if (item.state > 10) {
      ids.push(item.id);
    } else {
      $grid.setCheckboxRow(item, false);
    }
  });
  if (ids.length <= 0) {
    message.warning('你没有选择任何数据');
    return;
  }
  batchSelectRecovery(ids, () => {
    onRefresh();
    $grid.setAllCheckboxRow(false);
  });
}

/**
 * 缓存更新
 */
function onCacheOverride() {
  cacheOverride();
}
</script>

<template>
  <Page auto-content-height content-class="p-2">
    <Drawer @ok="onRefresh" />
    <DrawerAccessKey />
    <div class="flex size-full">
      <n-card
        class="min-w-[160px]"
        style="width: unset"
        content-style="padding-left:10px;padding-right:10px;padding-top:10px;"
      >
        <PgTree
          :api="selectPublicCategory"
          :is-node-all="true"
          :reload="reloadTreeComputed"
          @ok="treeChang"
          @overload="treeOverload"
        />
      </n-card>
      <div class="w-[calc(100%-160px)] ml-2 pl-2 bg-card rounded-md">
        <Grid>
          <template #toolbar-actions>
            <VbenButton
              type="primary"
              class="pg-button-size-small"
              @click="onCreate"
            >
              <Plus class="size-5" />
              新增
            </VbenButton>
          </template>
          <template #toolbar-tools>
            <VbenButton
              class="ml-2 pg-button-size-small"
              size="sm"
              @click="onBatchEnable"
            >
              批量有效
            </VbenButton>
            <VbenButton
              class="ml-2 pg-button-size-small"
              size="sm"
              @click="onBatchDisable"
            >
              批量停用
            </VbenButton>
            <VbenButton
              class="ml-2 pg-button-size-small"
              size="sm"
              @click="onCacheOverride"
            >
              缓存更新
            </VbenButton>
            <!-- <VbenButton
              class="ml-2 pg-button-size-small"
              size="sm"
              @click="onRecovery"
            >
              删除恢复
            </VbenButton> -->
            <VbenButton
              class="ml-2 pg-button-size-small"
              danger
              @click="onBatchPhysicalDeletion"
            >
              删除
            </VbenButton>
          </template>
          <template #operate="{ row }">
            <VbenTableAction
              :actions="[
                {
                  tooltip: { content: '编辑' },
                  icon: 'lucide:edit',
                  onClick: () => onEdit(row),
                },
                {
                  text: '密钥',
                  onClick: () => onAccessKey(row),
                },
              ]"
              align="center"
            />
          </template>
        </Grid>
      </div>
    </div>
  </Page>
</template>

<style scoped></style>
