<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

import { Page, useVbenDrawer, VbenButton } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { PgTree } from '@pg/components-n';

import { message } from '#/adapter';
import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';

import { selectNodePublic as selectNodePublicCategory } from '../category/api';
import { fillCategoryNames, loadModules, moduleOptions } from '../shared';
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

const categoryNo = ref('');
const categoryName = ref('');
const categoryModule = ref('');
const moduleNo = ref('');
const reloadTreeState = ref(0);
const reloadTreeComputed = computed(() => reloadTreeState.value);

onMounted(() => {
  loadModules();
});

/**
 * 分类树加载完成：建立 分类编号 -> 分类名称 映射
 */
function onTreeSource(result: any[]) {
  fillCategoryNames(result);
}

const treeChang = (record: any) => {
  const extend = record?.data?.extend || record?.data || {};
  categoryNo.value = record?.key || '';
  categoryName.value = record?.label || '';
  categoryModule.value = extend.module || '';
  onRefresh();
};

const treeOverload = () => {
  categoryNo.value = '';
  categoryName.value = '';
  categoryModule.value = '';
  onRefresh();
};

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
            categoryNo: categoryNo.value,
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
  if (!categoryNo.value) {
    message.warning('请先在左侧选择分类');
    return;
  }
  drawerApi
    .setData({
      values: {},
      isUpdate: false,
      parent: {
        no: categoryNo.value,
        name: categoryName.value,
        module: categoryModule.value,
      },
    })
    .open();
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

/**
 * 读取标签显示属性
 * @param row
 * @param key
 * @param defaultValue
 */
function tagAttr(row: any, key: string, defaultValue: any) {
  const map = row?.attributeMap;
  if (map && Object.prototype.hasOwnProperty.call(map, key)) {
    return map[key];
  }
  return defaultValue;
}

/**
 * 自定义颜色：字符串或对象，空对象不使用
 * @param row
 */
function tagColor(row: any) {
  const color = row?.attributeMap?.color;
  if (!color) {
    return undefined;
  }
  if (typeof color === 'string') {
    // 只接受 css 颜色值，避免把 json 字符串传给组件
    return /^#|rgb|hsl/i.test(color) ? color : undefined;
  }
  if (typeof color === 'object' && Object.keys(color).length > 0) {
    return color;
  }
  return undefined;
}

/**
 * 当前选中的分类名称，用于列表标题
 */
const categoryTitle = computed(() =>
  categoryNo.value
    ? `分类：${categoryName.value || categoryNo.value}`
    : '全部标签',
);
</script>

<template>
  <Page auto-content-height content-class="p-2">
    <NLayout class="h-full" has-sider>
      <NLayoutSider class="min-w-[180px]" width="180">
        <PgTree
          :api="selectNodePublicCategory"
          :reload="reloadTreeComputed"
          :right-click-menu="false"
          @ok="treeChang"
          @overload="treeOverload"
          @result:source="onTreeSource"
        />
      </NLayoutSider>
      <NLayout class="w-[calc(100%-180px)]">
        <NLayoutContent>
          <Drawer @ok="onRefresh" />
          <Grid>
            <template #toolbar-actions>
              <n-select
                v-model:value="moduleNo"
                :options="moduleOptions"
                clearable
                placeholder="全部模块"
                size="small"
                class="mr-2 w-[160px]"
                @update:value="onRefresh"
              />
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
              <span class="mr-2 text-sm text-gray-500">
                {{ categoryTitle }}
              </span>
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
            <template #tags="{ row }">
              <n-tag
                :bordered="tagAttr(row, 'bordered', true)"
                :type="tagAttr(row, 'type', 'default')"
                :color="tagColor(row)"
                :size="tagAttr(row, 'size', 'medium')"
                :strong="tagAttr(row, 'strong', false)"
                :round="tagAttr(row, 'round', false)"
              >
                {{ row.name }}
              </n-tag>
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
        </NLayoutContent>
      </NLayout>
    </NLayout>
  </Page>
</template>

<style scoped></style>
