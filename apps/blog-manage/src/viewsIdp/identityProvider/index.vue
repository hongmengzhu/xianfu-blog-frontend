<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { Page, useVbenDrawer, VbenButton } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { message } from '#/adapter';
import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';

import { useIdpLookups } from '../shared/useIdpLookups';
import {
  batchSelectDeleteIds,
  batchSelectDisableIds,
  batchSelectEnableIds,
  batchSelectPhysicalDeletionIds,
  batchSelectRecoveryIds,
  deleteIds,
  List,
} from './api';
import DrawerEdit from './components/DrawerEdit.vue';
import { columns, useGridFormSchema } from './data';

defineOptions({ name: 'IdpIdentityProvider' });

const { reload: reloadLookups } = useIdpLookups();

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: DrawerEdit,
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
          const firstSort = sorts?.[0];
          if (firstSort) {
            queryParams.sort = firstSort.field;
            queryParams.order = firstSort.order;
          }
          filters?.forEach(({ field, values }: any) => {
            queryParams[field] = values.join(',');
          });
          queryParams.pageSize = page.pageSize;
          queryParams.pageNum = page.currentPage;
          return await List(queryParams);
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
      labelField: 'id',
      reserve: true,
      highlight: true,
      range: true,
    },
  } as VxeTableGridOptions,
});

async function gridQuery(params: Record<string, any> = {}) {
  try {
    await gridApi.query(params);
    await reloadLookups();
  } catch (error) {
    console.error('Error occurred while reloading:', error);
  }
}

async function onRefresh() {
  try {
    const formValues = await gridApi.formApi.getValues();
    await gridQuery(formValues);
  } catch (error) {
    console.error('Error occurred while reloading:', error);
  }
}

function onAdd() {
  drawerApi.setData({ values: {}, isUpdate: false }).open();
}

function onEdit(row: any) {
  drawerApi.setData({ values: row, isUpdate: true }).open();
}

function onDelete(row: any) {
  deleteIds([row.id]).then(() => onRefresh());
}

/** 取勾选行，并可按状态过滤 */
function takeCheckedIds(state?: number) {
  const $grid = gridApi.grid;
  if (!$grid) {
    return [];
  }
  const records = $grid.getCheckboxRecords();
  if (records.length <= 0) {
    message.warning('你没有选择任何数据');
    return [];
  }
  const ids: any[] = [];
  records.forEach((item: any) => {
    if (state === undefined) {
      ids.push(item.id);
      return;
    }
    if (Number(item.state) === state) {
      ids.push(item.id);
    } else {
      $grid.setCheckboxRow(item, false);
    }
  });
  if (ids.length <= 0) {
    message.warning('没有符合条件的数据');
  }
  return ids;
}

function onBatchEnable() {
  const ids = takeCheckedIds(2);
  if (ids.length <= 0) return;
  batchSelectEnableIds(ids, () => {
    onRefresh();
    gridApi.grid?.setAllCheckboxRow(false);
  });
}

function onBatchDisable() {
  const ids = takeCheckedIds(1);
  if (ids.length <= 0) return;
  batchSelectDisableIds(ids, () => {
    onRefresh();
    gridApi.grid?.setAllCheckboxRow(false);
  });
}

function onBatchDelete() {
  const ids = takeCheckedIds();
  if (ids.length <= 0) return;
  batchSelectDeleteIds(ids, () => {
    onRefresh();
    gridApi.grid?.setAllCheckboxRow(false);
  });
}

function onRecovery() {
  const ids = takeCheckedIds();
  if (ids.length <= 0) return;
  batchSelectRecoveryIds(ids, () => {
    onRefresh();
    gridApi.grid?.setAllCheckboxRow(false);
  });
}

function onBatchPhysicalDeletion() {
  const ids = takeCheckedIds();
  if (ids.length <= 0) return;
  batchSelectPhysicalDeletionIds(ids, () => {
    onRefresh();
    gridApi.grid?.setAllCheckboxRow(false);
  });
}
</script>

<template>
  <Page auto-content-height content-class="p-2">
    <Drawer @ok="onRefresh" />
    <Grid>
      <template #toolbar-actions>
        <VbenButton type="primary" class="pg-button-size-small" @click="onAdd">
          <Plus class="size-5" />
          新增提供商
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
          @click="onBatchDelete"
        >
          批量删除
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
          danger
          @click="onBatchPhysicalDeletion"
        >
          物理删除
        </VbenButton>
      </template>
      <template #nameCell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium">{{ row.name }}</span>
          <span class="text-xs text-gray-400">
            {{ row.nameFull || row.nameFl || row.description || '-' }}
          </span>
        </div>
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
  </Page>
</template>
