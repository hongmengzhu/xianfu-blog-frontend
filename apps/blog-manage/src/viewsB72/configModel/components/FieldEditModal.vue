<script setup lang="ts">
import { nextTick, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message, usePgForm, z } from '#/adapter';

import {
  formCodeOptions,
  parameterSourceOptions,
  valueAttrOptions,
  valueTypeOptions,
} from '../options';
import RuleEditor from './RuleEditor.vue';

const emit = defineEmits(['ok']);

const ruleItems = ref<any[]>([]);
const currentField = ref<any>({});
const isUpdate = ref(false);

const [Form, formApi] = usePgForm({
  schema: [],
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
});

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  onConfirm: onSubmit,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      loadData();
    }
  },
  title: '字段配置',
});

function loadData() {
  const data = modalApi.getData<Record<string, any>>() || {};
  isUpdate.value = !!data.isUpdate;
  currentField.value = data.field ? JSON.parse(JSON.stringify(data.field)) : {};
  const field = currentField.value;
  ruleItems.value = Array.isArray(field.ruleItems) ? [...field.ruleItems] : [];

  modalApi.setState({
    confirmLoading: false,
    closeOnClickModal: false,
    destroyOnClose: true,
    loading: false,
    title: `${isUpdate.value ? '编辑' : '新增'}字段`,
  });

  formApi.setState({ schema: buildSchema() });
  void nextTick(() => {
    formApi.setValues({
      name: field.name,
      field: field.field,
      fieldPath: field.fieldPath,
      valueType: field.valueType || 'string',
      valueAttr: field.valueAttr || 'single',
      formCode: field.formCode || 'PgInput',
      formAttr: field.formAttr ? JSON.stringify(field.formAttr, null, 2) : '',
      formGroup: field.formGroup,
      defaultValue: field.defaultValue,
      value: field.value,
      binary: Number(field.binary) === 1 ? 1 : 2,
      valueBinary: field.valueBinary,
      show: Number(field.show) === 2 ? 2 : 1,
      independent: Number(field.independent) === 1 ? 1 : 2,
      sharedScope: Array.isArray(field.sharedScope) ? field.sharedScope : [],
      parameterSource: field.parameterSource,
      parameterContent: field.parameterContent,
      sort: Number(field.sort || 0),
      description: field.description,
    });
  });
}

function buildSchema() {
  return [
    {
      fieldName: 'name',
      label: '字段名称',
      component: 'Input',
      rules: 'required',
      componentProps: { placeholder: '字段中文名称' },
    },
    {
      fieldName: 'field',
      label: '字段标识',
      component: 'Input',
      rules: z
        .string()
        .min(1, { message: '字段标识必填' })
        .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, {
          message: '字段标识必须以字母开头，只能包含字母、数字、下划线',
        }),
      componentProps: { placeholder: '字段英文标识，如 siteName' },
    },
    {
      fieldName: 'fieldPath',
      label: '字段路径',
      component: 'Input',
      componentProps: { placeholder: '为空时使用字段标识' },
    },
    {
      fieldName: 'valueType',
      label: '值类型',
      component: 'Select',
      defaultValue: 'string',
      componentProps: {
        options: valueTypeOptions.value,
        filterable: true,
      },
    },
    {
      fieldName: 'valueAttr',
      label: '值属性',
      component: 'Select',
      defaultValue: 'single',
      componentProps: { options: valueAttrOptions.value },
    },
    {
      fieldName: 'formCode',
      label: '表单控件',
      component: 'Select',
      defaultValue: 'PgInput',
      componentProps: {
        options: formCodeOptions.value,
        filterable: true,
      },
    },
    {
      fieldName: 'formAttr',
      label: '表单属性(JSON)',
      component: 'Textarea',
      componentProps: {
        type: 'textarea',
        placeholder: '{"maxlength": 100}',
        autosize: { minRows: 2, maxRows: 5 },
      },
    },
    {
      fieldName: 'formGroup',
      label: '表单分组',
      component: 'Input',
      componentProps: { placeholder: '如 basic' },
    },
    {
      fieldName: 'defaultValue',
      label: '默认值',
      component: 'Input',
      componentProps: { placeholder: '新增字段时使用的初始值' },
    },
    {
      fieldName: 'value',
      label: '当前值',
      component: 'Input',
      componentProps: { placeholder: '字段值' },
    },
    {
      fieldName: 'binary',
      label: '二进制值',
      component: 'Switch',
      defaultValue: 2,
      componentProps: {
        checkedValue: 1,
        uncheckedValue: 2,
        checkedLabel: '是',
        uncheckedLabel: '否',
      },
    },
    {
      fieldName: 'valueBinary',
      label: '二进制值内容',
      component: 'Input',
      componentProps: { placeholder: '二进制字段值，如文件地址/JSON' },
    },
    {
      fieldName: 'show',
      label: '显示',
      component: 'Switch',
      defaultValue: 1,
      componentProps: {
        checkedValue: 1,
        uncheckedValue: 2,
        checkedLabel: '显示',
        uncheckedLabel: '隐藏',
      },
    },
    {
      fieldName: 'independent',
      label: '独立字段',
      component: 'Switch',
      defaultValue: 2,
      componentProps: {
        checkedValue: 1,
        uncheckedValue: 2,
        checkedLabel: '是',
        uncheckedLabel: '否',
      },
    },
    {
      fieldName: 'sharedScope',
      label: '共享范围',
      component: 'NDynamicTags',
      defaultValue: [],
      componentProps: {
        defaultValue: [],
      },
    },
    {
      fieldName: 'parameterSource',
      label: '参数源',
      component: 'Select',
      componentProps: {
        options: parameterSourceOptions.value,
        clearable: true,
      },
    },
    {
      fieldName: 'parameterContent',
      label: '参数内容',
      component: 'Textarea',
      componentProps: {
        type: 'textarea',
        autosize: { minRows: 1, maxRows: 4 },
      },
    },
    {
      fieldName: 'sort',
      label: '排序',
      component: 'InputNumber',
      defaultValue: 0,
      componentProps: {},
    },
    {
      fieldName: 'description',
      label: '描述',
      component: 'Textarea',
      componentProps: {
        type: 'textarea',
        autosize: { minRows: 1, maxRows: 4 },
      },
    },
  ];
}

function parseFormAttr(formAttr: any) {
  if (!formAttr) {
    return null;
  }
  if (typeof formAttr === 'object') {
    return formAttr;
  }
  const text = String(formAttr).trim();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function onSubmit() {
  const { valid } = await formApi.validate();
  if (!valid) {
    return false;
  }
  const values: any = await formApi.getValues();
  const formAttrText = String(values.formAttr || '').trim();
  const formAttr = parseFormAttr(formAttrText);
  if (formAttrText && !formAttr) {
    message.error('表单属性必须是合法的 JSON');
    return false;
  }
  const field = {
    ...currentField.value,
    ...values,
    sort: String(values.sort ?? 0),
    show: Number(values.show) === 2 ? 2 : 1,
    binary: Number(values.binary) === 1 ? 1 : 2,
    independent: Number(values.independent) === 1 ? 1 : 2,
    formAttr,
    sharedScope: Array.isArray(values.sharedScope) ? values.sharedScope : [],
    ruleItems: ruleItems.value,
  };
  emit('ok', field);
  modalApi.setState({ loading: false, confirmLoading: false });
  modalApi.close();
}
</script>

<template>
  <Modal class="w-[980px]">
    <div class="p-2">
      <Form />
      <div class="mt-4">
        <RuleEditor v-model="ruleItems" title="字段验证规则" />
      </div>
    </div>
  </Modal>
</template>

<style scoped></style>
