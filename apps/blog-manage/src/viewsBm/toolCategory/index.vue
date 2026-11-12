<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

import { Page, useVbenDrawer, VbenButton } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { selectNodeAllPublic as selectNodeAllPublicModule } from '#/viewsBasic/module/api';

import { deleteIds, queryAll } from './api';
import DrawerEdit from './components/DrawerEdit.vue';
import { columns } from './data';

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: DrawerEdit,
  destroyOnClose: true,
});

/** 模块 tab 的“全部”哨兵值 */
const ALL_MODULE = '__all__';
const moduleTab = ref<string>(ALL_MODULE);
/** 当前模块编号，空字符串表示不过滤 */
const moduleNo = computed(() =>
  moduleTab.value === ALL_MODULE ? '' : moduleTab.value,
);
const moduleOptions = ref<Array<{ label: string; value: string }>>([]);

/**
 * 加载模块（数据来自 basic_module），用于模块 tab
 */
async function loadModules() {
  try {
    const list: any[] = (await selectNodeAllPublicModule({})) || [];
    moduleOptions.value = list
      .filter((item: any) => {
        const state = Number(item?.extend?.state ?? 1);
        return state === 1 && item?.value;
      })
      .map((item: any) => ({ label: item.label, value: item.value }));
  } catch (error) {
    console.error('加载模块失败：', error);
  }
}

onMounted(() => {
  loadModules();
});

/**
 * 切换模块：按模块重新查询
 * @param value
 */
function onModuleChange(value: number | string) {
  moduleTab.value = String(value);
  onRefresh();
}

const [Grid, gridApi] = useVbenVxeGrid({
  gridEvents: {},
  gridOptions: {
    columns,
    height: 'auto',
    keepSource: true,
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    pagerConfig: {
      enabled: false,
    },
    proxyConfig: {
      ajax: {
        query: async (_params) => {
          return await queryAll({ module: moduleNo.value });
        },
      },
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      zoom: true,
    },
    treeConfig: {
      parentField: 'parentNo',
      rowField: 'no',
      transform: true,
      expandAll: true,
      showLine: true,
      showRootLine: true,
    },
  } as any,
});

/**
 * 编辑
 * @param row
 */
function onEdit(row: any) {
  drawerApi.setData({ values: row, isUpdate: true }).open();
}

/**
 * 添加下级
 * @param row
 */
function onAppend(row: any) {
  drawerApi
    .setData({
      values: null,
      isUpdate: false,
      parent: row,
    })
    .open();
}

/**
 * 创建
 */
function onCreate() {
  drawerApi
    .setData({
      values: null,
      isUpdate: false,
    })
    .open();
}

/**
 * 删除
 * @param row
 */
function onDelete(row: any) {
  deleteIds([row.id])
    .then(() => {
      onRefresh();
    })
    .catch(() => {
      onRefresh();
    });
}
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
    setTimeout(() => {
      gridApi.grid.setAllTreeExpand(true);
    }, 900);
  } catch (error) {
    console.error('Error occurred while reloading:', error);
  }
}
</script>
<template>
  <Page
    auto-content-height
    content-class="p-2"
    header-class="border-b-0 px-2 py-0"
  >
    <template #title>
      <n-tabs
        v-model:value="moduleTab"
        type="line"
        size="small"
        @update:value="onModuleChange"
      >
        <n-tab :name="ALL_MODULE">全部</n-tab>
        <n-tab
          v-for="item in moduleOptions"
          :key="item.value"
          :name="item.value"
        >
          {{ item.label }}
        </n-tab>
      </n-tabs>
    </template>
    <Grid>
      <template #toolbar-actions>
        <VbenButton type="primary" size="sm" @click="onCreate">
          <Plus class="size-5" />
          新增
        </VbenButton>
      </template>
      <template #operate="{ row }">
        <VbenTableAction
          :actions="[
            {
              tooltip: {
                content: '添加下级',
              },
              text: '添加下级',
              onClick: () => onAppend(row),
            },
            {
              tooltip: {
                content: '编辑',
              },
              icon: 'lucide:edit',
              onClick: () => onEdit(row),
            },
            {
              tooltip: {
                content: '删除',
              },
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
    <Drawer @ok="onRefresh" />
  </Page>
</template>
