<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenDrawer, useVbenModal } from '@vben/common-ui';

import { message, usePgForm } from '#/adapter';

import {
  existModel,
  existName,
  detail as getDetail,
  saveOrUpdate,
} from '../api';
import { buildHeaderFormSchema, fieldColumns } from '../data';
import FieldEditModal from './FieldEditModal.vue';
import RuleEditor from './RuleEditor.vue';

const emit = defineEmits(['ok']);

const tableData = ref<any[]>([]);
const bodyDelIds = ref<string[]>([]);
const modelRuleItems = ref<any[]>([]);
const editingIndex = ref<number>(-1);

const [Form, formApi] = usePgForm({
  schema: buildHeaderFormSchema({
    onExistName: async () => {
      const values = await formApi.getValues();
      await existName(values.name, values.id);
    },
    onExistModel: async () => {
      const values = await formApi.getValues();
      await existModel(values.model, values.id);
    },
  }),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
});

const [FieldModal, fieldModalApi] = useVbenModal({
  connectedComponent: FieldEditModal,
  destroyOnClose: true,
});

const [Drawer, drawerApi] = useVbenDrawer({
  onCancel() {
    drawerApi.close();
  },
  onConfirm: onSubmit,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      initDrawer();
    }
  },
  title: '模型设计器',
});

async function initDrawer() {
  drawerApi.setState({
    loading: true,
    confirmLoading: false,
    closeOnClickModal: false,
    destroyOnClose: true,
  });
  const { values, isUpdate } = drawerApi.getData<Record<string, any>>() || {};
  bodyDelIds.value = [];
  tableData.value = [];
  modelRuleItems.value = [];
  editingIndex.value = -1;
  formApi.reset();

  try {
    if (isUpdate && values?.id) {
      const res: any = await getDetail(values.id);
      if (res) {
        formApi.setValues({
          ...res.header,
          tags: Array.isArray(res.header?.tags) ? res.header.tags : [],
        });
        tableData.value = res.body || [];
        modelRuleItems.value = [...(res.header?.ruleItems || [])];
      }
    }
  } finally {
    drawerApi.setState({
      title: `模型设计器：${isUpdate ? '编辑' : '新增'}`,
      loading: false,
    });
  }
}

/**
 * 新增字段
 */
function onAddField() {
  editingIndex.value = -1;
  fieldModalApi
    .setData({
      field: {
        show: 1,
        binary: 2,
        independent: 2,
        valueAttr: 'single',
        valueType: 'string',
        formCode: 'PgInput',
        sort: tableData.value.length,
      },
      isUpdate: false,
    })
    .open();
}

/**
 * 编辑字段
 */
function onEditField(row: any, index: number) {
  editingIndex.value = index;
  fieldModalApi.setData({ field: row, isUpdate: true }).open();
}

/**
 * 字段弹窗保存后回写表格
 */
function onFieldSaved(field: any) {
  if (editingIndex.value >= 0 && editingIndex.value < tableData.value.length) {
    tableData.value.splice(editingIndex.value, 1, field);
  } else {
    tableData.value.push(field);
  }
  editingIndex.value = -1;
}

/**
 * 删除字段
 */
function onDeleteField(row: any, index: number) {
  tableData.value.splice(index, 1);
  if (row?.id && Number(row.id) > 0) {
    bodyDelIds.value.push(String(row.id));
  }
}

function normalizeRule(rule: any) {
  return {
    id: rule.id ?? 0,
    name: rule.name ?? '',
    ruleMode: rule.ruleMode,
    coding: rule.coding ?? '',
    condition: rule.condition ?? '',
    errorMessage: rule.errorMessage ?? '',
    structure: rule.structure ?? '',
    ruleTarget: rule.ruleTarget || [],
    show: Number(rule.show) === 2 ? 2 : 1,
    sort: String(rule.sort ?? 0),
    extraData: rule.extraData ?? null,
  };
}

function normalizeField(field: any, index: number) {
  const ruleItems = (field.ruleItems || []).map(normalizeRule);
  return {
    id: field.id ?? 0,
    no: field.no ?? '',
    name: field.name,
    field: field.field,
    fieldPath: field.fieldPath || field.field,
    description: field.description ?? '',
    show: Number(field.show) === 2 ? 2 : 1,
    independent: Number(field.independent) === 1 ? 1 : 2,
    binary: Number(field.binary) === 1 ? 1 : 2,
    defaultValue: field.defaultValue ?? '',
    value: field.value ?? '',
    valueBinary: field.valueBinary ?? '',
    valueType: field.valueType || 'string',
    valueAttr: field.valueAttr || 'single',
    formCode: field.formCode || 'PgInput',
    formAttr: field.formAttr ?? null,
    formGroup: field.formGroup ?? '',
    sharedScope: field.sharedScope || [],
    sharedFieldNo: field.sharedFieldNo ?? '',
    parameterSource: field.parameterSource ?? '',
    parameterContent: field.parameterContent ?? '',
    parameterConfig: field.parameterConfig ?? '',
    sort: String(field.sort ?? index),
    rules: ruleItems.map((rule: any) => rule.ruleMode),
    ruleItems,
  };
}

/**
 * 提交：保存模型头 + 字段 + 规则，并自动生成/同步配置行
 */
async function onSubmit() {
  const { valid } = await formApi.validate();
  if (!valid) {
    return false;
  }
  const fieldMap = new Map<string, number>();
  for (const field of tableData.value) {
    const key = String(field.field || '').trim();
    if (!key) {
      message.error('字段标识不能为空');
      return false;
    }
    if (fieldMap.has(key)) {
      message.error(`字段标识重复：${key}`);
      return false;
    }
    fieldMap.set(key, 1);
  }

  drawerApi.setState({ confirmLoading: true });
  drawerApi.lock();
  try {
    const values: any = await formApi.getValues();
    const postData = {
      header: {
        ...values,
        tags: Array.isArray(values.tags) ? values.tags : [],
        rules: modelRuleItems.value.map((rule: any) => rule.ruleMode),
        ruleItems: modelRuleItems.value.map(normalizeRule),
      },
      body: tableData.value.map((field: any, index: number) =>
        normalizeField(field, index),
      ),
      bodyDelIds: bodyDelIds.value,
    };
    saveOrUpdate(postData).then(() => {
      message.success('保存成功');
      emit('ok');
      drawerApi.setState({ confirmLoading: false });
      drawerApi.close();
    });
  } catch (error) {
    console.error(error);
  } finally {
    drawerApi.unlock();
    drawerApi.setState({ loading: false, confirmLoading: false });
  }
}
</script>

<template>
  <Drawer class="w-[1200px] max-w-[96vw]">
    <div class="p-4">
      <div class="mb-4 border-l-4 border-primary pl-2 font-bold">模型信息</div>
      <Form />

      <div class="mt-6">
        <RuleEditor v-model="modelRuleItems" title="模型验证规则" />
      </div>

      <div
        class="mt-6 mb-4 flex items-center justify-between border-l-4 border-primary pl-2"
      >
        <span class="font-bold">字段配置</span>
        <vxe-button status="primary" @click="onAddField">新增字段</vxe-button>
      </div>

      <vxe-table
        border
        show-overflow
        keep-source
        max-height="520"
        empty-text="暂无字段，请点击【新增字段】"
        :data="tableData"
      >
        <vxe-column
          v-for="col in fieldColumns"
          :key="col.field || col.type"
          v-bind="col"
        >
          <template #default="{ row, $rowIndex }">
            <template v-if="col.slots?.default === 'operate'">
              <vxe-button
                mode="text"
                status="primary"
                @click="onEditField(row, $rowIndex)"
              >
                编辑
              </vxe-button>
              <vxe-button
                mode="text"
                status="danger"
                @click="onDeleteField(row, $rowIndex)"
              >
                删除
              </vxe-button>
            </template>
            <template v-else-if="col.type === 'seq'">
              {{ $rowIndex + 1 }}
            </template>
            <template v-else-if="col.formatter">
              {{
                col.formatter({
                  row,
                  cellValue: row[col.field],
                  $rowIndex,
                })
              }}
            </template>
            <template v-else>{{ row[col.field] }}</template>
          </template>
        </vxe-column>
      </vxe-table>
    </div>
  </Drawer>
  <FieldModal @ok="onFieldSaved" />
</template>

<style scoped></style>
