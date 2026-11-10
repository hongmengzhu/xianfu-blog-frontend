<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import { computed, onMounted, ref } from 'vue';

import { Page, useVbenDrawer, VbenButton } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { PgTree } from '@pg/components-n';

import { message } from '#/adapter';
import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';

import { selectNodeAllPublic as selectPublicCategory } from '../category/api';
import {
  batchSelectDisable,
  batchSelectEnable,
  batchSelectPhysicalDeletion,
  batchSelectRecovery,
  deleteIds,
  List,
} from './api';
import DrawerEdit from './components/DrawerEdit.vue';
import { columns, useGridFormSchema } from './data';

const moduleNo = ref('');
const currenRecord = ref(false);
const currenData = ref<Recordable<any>>({});
const reloadTreeState = ref(0);
const reloadTreeComputed = computed(() => reloadTreeState.value);

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: DrawerEdit,
  destroyOnClose: true,
});

const treeChang = (record) => {
  currenRecord.value = true;
  currenData.value = record;
  // console.log('record', record);
  gridApi.formApi.setFieldValue('categoryNo', record.key);
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
  gridApi.formApi.reset();
  onRefresh();
};

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
    checkboxConfig: {
      highlight: true,
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      zoom: true,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await List({
            pageSize: page.pageSize,
            pageNum: page.currentPage,
            module: moduleNo.value,
            ...formValues,
          });
        },
      },
    },
    pagerConfig: {
      pageSize: 20,
      pageSizes: [10, 20, 50, 100, 500, 1000],
    },
  } as any,
});

onMounted(async () => {});

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
  drawerApi.setData({ values: {}, isUpdate: false }).open();
}

/**
 * 编辑
 */
function onEdit(row: any) {
  drawerApi.setData({ values: row, isUpdate: true }).open();
}

/**
 * 删除
 */
function onDelete(row: any) {
  deleteIds([row.id]).then(() => {
    onRefresh();
  });
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
    message.warning('你没有选择停用状态的数据');
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
    if (item.state === 1) {
      ids.push(item.id);
    } else {
      $grid.setCheckboxRow(item, false);
    }
  });
  if (ids.length <= 0) {
    message.warning('你没有选择有效状态的数据');
    return;
  }
  batchSelectDisable(ids, () => {
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
    message.warning('你没有选择已删除的数据');
    return;
  }
  batchSelectRecovery(ids, () => {
    onRefresh();
    $grid.setAllCheckboxRow(false);
  });
}

/**
 * 物理删除
 */
function onPhysicalDeletion() {
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
    message.warning('你没有选择已删除的数据');
    return;
  }
  batchSelectPhysicalDeletion(ids, () => {
    onRefresh();
    $grid.setAllCheckboxRow(false);
  });
}
</script>

<template>
  <Page auto-content-height content-class="p-2">
    <Drawer @ok="onRefresh" />
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
              @click="onRecovery"
            >
              删除恢复
            </VbenButton>
            <VbenButton
              class="ml-2 pg-button-size-small"
              size="sm"
              @click="onPhysicalDeletion"
            >
              物理删除
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
                  tooltip: { content: '删除' },
                  icon: 'lucide:trash-2',
                  danger: true,
                  popConfirm: {
                    title: `确定删除 [${row.name}] 吗？`,
                    confirm: () => onDelete(row),
                  },
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
