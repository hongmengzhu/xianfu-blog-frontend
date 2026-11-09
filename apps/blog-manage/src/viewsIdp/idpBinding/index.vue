<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { Page, useVbenDrawer, VbenButton } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { message } from '#/adapter';
import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';

import {
  bindStateLabel,
  formatDateTime,
  protocolLabel,
} from '../shared/constants';
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

defineOptions({ name: 'IdpIdpBinding' });

const { ensureLoaded, providerName, reload: reloadLookups } = useIdpLookups();
const lookupReady = ensureLoaded();

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
    rowConfig: { keyField: 'id', isHover: true },
    sortConfig: { trigger: 'cell', remote: true },
    filterConfig: { remote: true },
    pagerConfig: {
      pageSize: 20,
      pageSizes: [10, 20, 50, 100, 500, 1000],
    },
    proxyConfig: {
      sort: true,
      filter: true,
      response: { result: 'data', total: 'total' },
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
          await lookupReady;
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

async function onRefresh() {
  try {
    await reloadLookups();
    const formValues = await gridApi.formApi.getValues();
    await gridApi.query(formValues);
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

function takeCheckedIds(state?: number) {
  const $grid = gridApi.grid;
  if (!$grid) return [];
  const records = $grid.getCheckboxRecords();
  if (records.length <= 0) {
    message.warning('你没有选择任何数据');
    return [];
  }
  const ids: any[] = [];
  records.forEach((item: any) => {
    if (state === undefined || Number(item.state) === state) {
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

function batchRun(
  runner: (ids: any[], cb: () => void) => void,
  state?: number,
) {
  const ids = takeCheckedIds(state);
  if (ids.length <= 0) return;
  runner(ids, () => {
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
          新增绑定
        </VbenButton>
      </template>
      <template #toolbar-tools>
        <VbenButton
          class="ml-2 pg-button-size-small"
          size="sm"
          @click="batchRun(batchSelectEnableIds, 2)"
        >
          批量有效
        </VbenButton>
        <VbenButton
          class="ml-2 pg-button-size-small"
          size="sm"
          @click="batchRun(batchSelectDisableIds, 1)"
        >
          批量停用
        </VbenButton>
        <VbenButton
          class="ml-2 pg-button-size-small"
          size="sm"
          @click="batchRun(batchSelectDeleteIds)"
        >
          批量删除
        </VbenButton>
        <VbenButton
          class="ml-2 pg-button-size-small"
          size="sm"
          @click="batchRun(batchSelectRecoveryIds)"
        >
          删除恢复
        </VbenButton>
        <VbenButton
          class="ml-2 pg-button-size-small"
          size="sm"
          danger
          @click="batchRun(batchSelectPhysicalDeletionIds)"
        >
          物理删除
        </VbenButton>
      </template>
      <template #externalCell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium">{{ row.externalSub || '-' }}</span>
          <span class="text-xs text-gray-400">
            {{ row.nickName || row.description || '-' }}
          </span>
        </div>
      </template>
      <template #bindAnoCell="{ row }">
        <span>{{ row.bindAno || '-' }}</span>
      </template>
      <template #idpCell="{ row }">
        <span>{{ providerName(row.idp) }}</span>
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
                title: `确定删除 [${row.externalSub}] 吗？`,
                confirm: () => onDelete(row),
              },
            },
          ]"
          align="center"
        />
      </template>
      <template #expandContent="{ row }">
        <n-descriptions
          bordered
          class="m-2"
          :column="2"
          label-placement="left"
          size="small"
        >
          <n-descriptions-item label="绑定状态">
            {{ bindStateLabel(row.stateBind) }}
          </n-descriptions-item>
          <n-descriptions-item label="协议">
            {{ protocolLabel(row.protocol) }}
          </n-descriptions-item>
          <n-descriptions-item label="OpenID">
            {{ row.openId || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="UnionID">
            {{ row.unionId || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="应用标识">
            {{ row.appMark || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="手机号">
            {{ row.phone || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="绑定时间">
            {{ formatDateTime(row.bindTime) }}
          </n-descriptions-item>
          <n-descriptions-item label="解绑时间">
            {{ formatDateTime(row.unBindTime) }}
          </n-descriptions-item>
          <n-descriptions-item label="最后登录">
            {{ formatDateTime(row.lastLoginTime) }}
          </n-descriptions-item>
          <n-descriptions-item label="头像">
            <n-avatar
              v-if="row.avatar"
              round
              size="small"
              :src="row.avatar"
              fallback-src=""
            />
            <span v-else>-</span>
          </n-descriptions-item>
        </n-descriptions>
      </template>
    </Grid>
  </Page>
</template>
