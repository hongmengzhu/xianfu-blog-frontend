<script lang="ts" setup>
import { h, nextTick, ref } from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';

import { message, usePgForm } from '#/adapter';
import {
  formCodeOptions,
  valueTypeOptions,
} from '#/viewsBasic/configModel/options';

import {
  categoryOptions,
  existName,
  fieldOptions,
  detail as getConfigDetail,
  modelOptions,
  saveOrUpdate,
} from '../api';

const emit = defineEmits(['ok']);

const currentId = ref<any>(null);
const modelOptionsRef = ref<any[]>([]);
const categoryOptionsRef = ref<any[]>([]);
const fieldOptionsRef = ref<any[]>([]);

const [Form, formApi] = usePgForm({
  schema: [],
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
  title: '配置',
});

function buildSchema() {
  return [
    {
      fieldName: 'model',
      label: '所属模型',
      component: 'Select',
      componentProps: {
        options: modelOptionsRef.value,
        filterable: true,
        placeholder: '请选择模型',
        onChange: async (value: string) => {
          await onModelChange(value, false);
        },
      },
      rules: 'required',
    },
    {
      fieldName: 'field',
      label: '字段标识',
      component: 'Select',
      componentProps: {
        options: fieldOptionsRef.value,
        filterable: true,
        placeholder: '请选择模型字段',
        onChange: async (value: string) => {
          await onFieldChange(value);
        },
      },
      rules: 'required',
      descriptionPg: () =>
        '字段必须已存在于该模型；新增字段请先在【模型】设计器保存',
    },
    {
      fieldName: 'name',
      label: '名称',
      component: 'Input',
      componentProps: {
        placeholder: '为空时使用模型字段名称',
      },
      suffix: () =>
        h(
          VbenButton,
          {
            class: 'pg-button-size-small',
            onClick: async () => {
              const values = await formApi.getValues();
              existName(values.name, values.id);
            },
          },
          () => h('span', { class: 'font-normal' }, '查重'),
        ),
    },
    {
      fieldName: 'fieldPath',
      label: '字段路径',
      component: 'Input',
      componentProps: {
        placeholder: '为空时使用字段标识',
      },
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
      fieldName: 'defaultValue',
      label: '默认值',
      component: 'Input',
      componentProps: { placeholder: '默认值' },
    },
    {
      fieldName: 'value',
      label: '配置值',
      component: 'Textarea',
      componentProps: {
        type: 'textarea',
        autosize: { minRows: 1, maxRows: 4 },
        placeholder: '配置值',
      },
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
      component: 'Textarea',
      componentProps: {
        type: 'textarea',
        autosize: { minRows: 1, maxRows: 4 },
        placeholder: '二进制字段值，如文件地址/JSON',
      },
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
      fieldName: 'categoryNo',
      label: '配置分类',
      component: 'Select',
      componentProps: {
        options: categoryOptionsRef.value,
        filterable: true,
        clearable: true,
        placeholder: '为空时取模型分类',
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
        autosize: { minRows: 1, maxRows: 3 },
      },
    },
    {
      fieldName: 'id',
      label: 'ID',
      defaultValue: '',
      component: 'Input',
      dependencies: {
        show: false,
        triggerFields: ['description'],
      },
    },
  ];
}

/**
 * 选择字段后，用模型字段的属性补全空值
 * @param field 字段标识
 */
async function onFieldChange(field: string) {
  const option: any = fieldOptionsRef.value.find(
    (item: any) => item.value === field,
  );
  const raw = option?.raw;
  if (!raw) {
    return;
  }
  const values: any = await formApi.getValues();
  const patch: Record<string, any> = {};
  if (!values.name) {
    patch.name = raw.name;
  }
  if (!values.fieldPath) {
    patch.fieldPath = raw.fieldPath || raw.field;
  }
  if (!values.description) {
    patch.description = raw.description;
  }
  if (!values.defaultValue) {
    patch.defaultValue = raw.defaultValue;
  }
  if (raw.valueType) {
    patch.valueType = raw.valueType;
  }
  if (raw.formCode) {
    patch.formCode = raw.formCode;
  }
  if (raw.categoryNo) {
    patch.categoryNo = raw.categoryNo;
  }
  formApi.setValues(patch);
}

/**
 * 模型变化时重新加载字段下拉
 * @param model 模型标识
 * @param keepField 编辑回显时保留原字段
 */
async function onModelChange(model: string, keepField: boolean) {
  fieldOptionsRef.value = await fieldOptions(model).catch(() => []);
  const values: any = await formApi.getValues();
  formApi.setState({ schema: buildSchema() });
  await nextTick();
  await formApi.setValues({
    ...values,
    model,
    field: keepField ? values.field || '' : '',
  });
}

async function loadOptions() {
  const [models, categories] = await Promise.all([
    modelOptions().catch(() => []),
    categoryOptions().catch(() => []),
  ]);
  modelOptionsRef.value = models;
  categoryOptionsRef.value = categories;
}

async function initDrawer() {
  drawerApi.setState({
    loading: true,
    confirmLoading: false,
    closeOnClickModal: false,
    destroyOnClose: true,
  });
  const { values, isUpdate } = drawerApi.getData<Record<string, any>>() || {};
  currentId.value = values?.id ?? null;
  fieldOptionsRef.value = [];
  try {
    await loadOptions();
    formApi.setState({ schema: buildSchema() });
    await nextTick();
    formApi.reset();
    if (isUpdate && values?.id) {
      const res: any = await getConfigDetail(values.id);
      if (res) {
        fieldOptionsRef.value = await fieldOptions(res.model).catch(() => []);
        formApi.setState({ schema: buildSchema() });
        await nextTick();
        formApi.setValues({
          ...res,
          id: res.id ?? values.id,
          sort: Number(res.sort || 0),
          show: Number(res.show) === 1 ? 1 : 2,
          binary: Number(res.binary) === 1 ? 1 : 2,
        });
      }
    }
  } finally {
    drawerApi.setState({
      title: `配置：${isUpdate ? '编辑' : '新增'}`,
      loading: false,
    });
  }
}

async function onSubmit() {
  const { valid } = await formApi.validate();
  if (!valid) {
    return false;
  }
  const values: any = await formApi.getValues();
  drawerApi.setState({ confirmLoading: true });
  drawerApi.lock();
  try {
    const postData = {
      ...values,
      id: values.id || currentId.value || '',
      sort: String(values.sort ?? 0),
      show: Number(values.show) === 2 ? 2 : 1,
      binary: Number(values.binary) === 1 ? 1 : 2,
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
  <Drawer class="w-[820px] max-w-[96vw]">
    <div class="p-2">
      <Form />
    </div>
  </Drawer>
</template>

<style scoped></style>
