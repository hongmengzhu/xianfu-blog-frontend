<script lang="ts" setup>
import { nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { message, usePgForm } from '#/adapter';
import {
  isBooleanValueType,
  isComplexValueType,
  isNumberValueType,
} from '#/viewsBasic/configModel/options';

import { allByModel, modelOptions, updateValues } from '../api';
import { displayConfigValue } from '../data';

const emit = defineEmits(['ok']);

const currentModel = ref('');
const currentItems = ref<any[]>([]);
const modelOptionsRef = ref<any[]>([]);

function buildModelSchema() {
  return {
    fieldName: 'model',
    label: '模型',
    component: 'Select',
    componentProps: {
      options: modelOptionsRef.value,
      filterable: true,
      placeholder: '请选择需要修改值的模型',
      onChange: async (value: string) => {
        await loadModelValues(value);
      },
    },
    rules: 'required',
  };
}

const [Form, formApi] = usePgForm({
  schema: [buildModelSchema()],
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
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
  title: '按模型批量修改配置值',
});

function valueComponent(item: any) {
  const valueType = item.valueType || '';
  if (isBooleanValueType(valueType)) {
    return {
      component: 'Select',
      componentProps: {
        options: [
          { label: 'true', value: 'true' },
          { label: 'false', value: 'false' },
        ],
        clearable: true,
      },
    };
  }
  if (isNumberValueType(valueType)) {
    return {
      component: 'InputNumber',
      componentProps: { style: { width: '100%' } },
    };
  }
  if (isComplexValueType(valueType)) {
    return {
      component: 'Textarea',
      componentProps: {
        type: 'textarea',
        autosize: { minRows: 2, maxRows: 6 },
        placeholder: 'JSON / 数组字符串',
      },
    };
  }
  const formCode = String(item.formCode || '')
    .replace(/^Pg/, '')
    .toLowerCase();
  if (formCode.includes('textarea')) {
    return {
      component: 'Textarea',
      componentProps: {
        type: 'textarea',
        autosize: { minRows: 2, maxRows: 6 },
      },
    };
  }
  if (formCode.includes('number')) {
    return {
      component: 'InputNumber',
      componentProps: { style: { width: '100%' } },
    };
  }
  return {
    component: 'Input',
    componentProps: { placeholder: '请输入配置值' },
  };
}

function buildFieldSchema(item: any) {
  const view = valueComponent(item);
  const rulesDesc = Array.isArray(item.rules) ? item.rules.join(', ') : '';
  return {
    fieldName: item.field,
    label: item.name || item.field,
    component: view.component,
    defaultValue: displayConfigValue(item),
    componentProps: view.componentProps,
    descriptionPg: () =>
      `字段：${item.field}${rulesDesc ? `｜规则：${rulesDesc}` : ''}`,
  };
}

async function loadModelValues(model: string) {
  if (!model) {
    return;
  }
  const res: any = await allByModel({ model });
  const items = Array.isArray(res) ? res : res?.data || [];
  currentModel.value = model;
  currentItems.value = items;
  if (items.length === 0) {
    message.warning('该模型暂无配置行，请先在【模型】设计器保存字段');
  }
  const visibleItems = items.filter((item: any) => Number(item.show) === 1);
  const values: Record<string, any> = { model };
  for (const item of visibleItems) {
    values[item.field] = displayConfigValue(item);
  }
  formApi.setState({
    schema: [buildModelSchema(), ...visibleItems.map(buildFieldSchema)],
  });
  await nextTick();
  formApi.setValues(values);
}

async function initDrawer() {
  drawerApi.setState({
    loading: true,
    confirmLoading: false,
    closeOnClickModal: false,
    destroyOnClose: true,
  });
  const data = drawerApi.getData<Record<string, any>>() || {};
  formApi.reset();
  currentModel.value = '';
  currentItems.value = [];
  try {
    modelOptionsRef.value = await modelOptions().catch(() => []);
    formApi.setState({ schema: [buildModelSchema()] });
    await nextTick();
    const defaultModel = data.model || '';
    if (defaultModel) {
      await loadModelValues(defaultModel);
      await formApi.setValues({ model: defaultModel });
    }
  } finally {
    drawerApi.setState({ loading: false });
  }
}

async function onSubmit() {
  const { valid } = await formApi.validate();
  if (!valid) {
    return false;
  }
  const values: any = await formApi.getValues();
  const data: Record<string, string> = {};
  for (const item of currentItems.value) {
    if (Number(item.show) !== 1) {
      continue;
    }
    const value = values[item.field];
    data[item.field] =
      value === undefined || value === null ? '' : String(value);
  }
  if (Object.keys(data).length === 0) {
    message.warning('没有可保存的配置值');
    return false;
  }
  drawerApi.setState({ confirmLoading: true });
  drawerApi.lock();
  try {
    updateValues({ model: values.model, data }).then(() => {
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
  <Drawer class="w-[900px] max-w-[96vw]">
    <div class="p-2">
      <Form />
      <div v-if="currentModel" class="mt-2 text-xs text-gray-400">
        共
        {{ currentItems.length }} 个配置项，仅保存显示的字段值；二进制字段写入
        value_binary，其余写入 value。
      </div>
    </div>
  </Drawer>
</template>

<style scoped></style>
