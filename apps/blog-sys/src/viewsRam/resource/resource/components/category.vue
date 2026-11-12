<script lang="ts" setup>
import { h } from 'vue';

import { useVbenModal, VbenButton } from '@vben/common-ui';

import { usePgForm } from '#/adapter';
import { typeCodePublic } from '#/viewsBasic/data-dict/dict/api';

import { createUpdateByCategory, existName, selectCategory } from '../api';
const emit = defineEmits(['ok']);
const [Form, formApi] = usePgForm({
  // 通过 schema 的 type: 'group' 把字段组织成可折叠的分组，分组默认展开
  schema: [
    {
      type: 'group',
      name: 'home',
      title: '基本',
      defaultCollapsed: false,
      children: [
        {
          fieldName: 'terminalCode',
          label: '终端类型',
          component: 'ApiRadioGroup',
          componentProps: {
            api: typeCodePublic,
            params: { typeCode: 'terminalCode' },
            autoSelect: 'first',
            optionType: 'button',
            buttonStyle: 'solid',
          },
          rules: 'required',
        },
        {
          fieldName: 'parentNo',
          label: '上级',
          defaultValue: '',
          component: 'PgTreeSelect',
          componentProps: {
            api: selectCategory,
            params: {},
            props: {
              placeholder: '如果为空,则是一级',
              filterable: true,
            },
          },
        },
        {
          fieldName: 'typeSys',
          label: '类型',
          defaultValue: 'general',
          component: 'Input',
          componentProps: {
            type: 'button',
            options: [
              { label: '普通', value: 'general' },
              { label: '系统', value: 'system' },
              { label: 'api', value: 'api' },
            ],
          },
          rules: 'required',
          dependencies: {
            show: false,
            // 随意一个字段改变时，都会触发
            triggerFields: ['description'],
          },
        },
        {
          fieldName: 'typeAttr',
          label: '属性',
          defaultValue: 'menu',
          component: 'Input',
          componentProps: {
            placeholder: '请选择',
            type: 'button',
            options: [
              { label: '菜单', value: 'menu' },
              { label: '资源', value: 'resource' },
            ],
          },
          dependencies: {
            show: false,
            // 随意一个字段改变时，都会触发
            triggerFields: ['description'],
          },
        },
        {
          fieldName: 'name',
          label: '名称',
          component: 'Input',
          defaultValue: '',
          componentProps: {
            placeholder: '请输入',
            onBlur: async (e) => {
              const values = await formApi.getValues();
              if (!values.nameFull) {
                formApi.setFieldValue('nameFull', e.target.value);
              }
            },
          },
          rules: 'required',
          suffix: () =>
            h(
              VbenButton,
              {
                class: 'pg-button-size-small',
                onClick: async (e) => {
                  const values = await formApi.getValues();
                  existName(values.name, values.id);
                },
              },
              () => h('span', { class: 'font-normal' }, '查重'),
            ),
        },
        {
          fieldName: 'code',
          label: '资源标识',
          component: 'Input',
          componentProps: {
            placeholder: '请输入',
            onBlur: async (e) => {
              const values = await formApi.getValues();
              if (!values.nameFl) {
                formApi.setFieldValue('nameFl', e.target.value);
              }
              if (!values.path) {
                formApi.setFieldValue('path', e.target.value);
              }
            },
          },
          dependencies: {
            show: false,
            // 随意一个字段改变时，都会触发
            triggerFields: ['description'],
          },
        },
        {
          fieldName: 'path',
          label: '路径',
          component: 'Input',
          dependencies: {
            show: false,
            // 随意一个字段改变时，都会触发
            triggerFields: ['description'],
          },
        },
        {
          fieldName: 'method',
          label: '方法',
          defaultValue: 'POST',
          component: 'Input',
          componentProps: {
            placeholder: '请选择',
            type: 'button',
            options: [
              { label: 'GET', value: 'GET' },
              { label: 'POST', value: 'POST' },
              { label: 'DELETE', value: 'DELETE' },
              { label: 'PUT', value: 'PUT' },
              { label: 'ALL', value: 'ALL' },
            ],
          },
          dependencies: {
            show: false,
            // 随意一个字段改变时，都会触发
            triggerFields: ['description'],
          },
        },
        {
          fieldName: 'description',
          label: '描述',
          component: 'Textarea',
          componentProps: {
            type: 'textarea',
            placeholder: '描述',
          },
        },
      ],
    },
    {
      type: 'group',
      name: 'other',
      title: '其他',
      defaultCollapsed: false,
      children: [
        {
          fieldName: 'nameFl',
          label: '名称英文',
          component: 'Input',
          componentProps: {
            placeholder: '请输入',
          },
        },
        {
          fieldName: 'nameFull',
          label: '全称',
          component: 'Input',
        },
      ],
    },
    {
      fieldName: 'id',
      label: 'id',
      defaultValue: '0',
      component: 'Input',
      componentProps: {},
      dependencies: {
        show: false,
        // 随意一个字段改变时，都会触发
        triggerFields: ['description'],
      },
    },
  ],
  handleSubmit: onSubmit,
  showDefaultActions: false,
});
const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  onConfirm: async () => {
    await formApi.submit();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const { values, isUpdate, parent } =
        modalApi.getData<Record<string, any>>();
      if (values) {
        formApi.setValues({
          ...values,
        });
      }
      if (parent) {
        formApi.setFieldValue('parentNo', parent.no);
      }

      modalApi.setState({ title: `分类：${isUpdate ? '编辑' : '新增'}` });
    }
  },
  title: '：',
});

/**
 * 提交
 */
function onSubmit(values: Record<string, any>) {
  try {
    // console.log('values',values)
    const { isUpdate } = modalApi.getData<Record<string, any>>();
    values.typeSys = 'general';
    values.typeAttr = 'categoryLast';
    values.method = 'POST';
    createUpdateByCategory(values).then((d) => {
      setTimeout(() => {
        modalApi.close();
        emit('ok', values);
      }, 500);
    });
  } catch (error) {
    console.error(error);
  }
}
</script>
<template>
  <Modal>
    <Form />
  </Modal>
</template>
