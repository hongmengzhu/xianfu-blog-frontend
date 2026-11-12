<script lang="ts" setup>
import { h } from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';

import { usePgForm } from '#/adapter';

import { existName, saveOrUpdate, selectNodeAllPublic } from '../api';

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
          fieldName: 'parentId',
          label: '上级',
          component: 'PgTreeSelect',
          componentProps: {
            api: selectNodeAllPublic,
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
          component: 'PgRadioGroup',
          componentProps: {
            type: 'button',
            options: [
              { label: '普通', value: 'general' },
              { label: '系统', value: 'system' },
              { label: 'api', value: 'api' },
            ],
          },
          rules: 'required',
        },
        {
          fieldName: 'typeAttr',
          label: '属性',
          defaultValue: 'resource',
          component: 'PgRadioGroup',
          componentProps: {
            placeholder: '请选择',
            type: 'button',
            options: [
              { label: '菜单', value: 'menu' },
              { label: '资源', value: 'resource' },
            ],
          },
          rules: 'required',
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
          rules: 'required',
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
        },
        {
          fieldName: 'path',
          label: '路径',
          component: 'Input',
        },
        {
          fieldName: 'method',
          label: '方法',
          defaultValue: 'POST',
          rules: 'required',
          component: 'PgRadioGroup',
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
const [Drawer, drawerApi] = useVbenDrawer({
  onCancel() {
    drawerApi.close();
  },
  onConfirm: async () => {
    await formApi.submit();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const { values, isUpdate, parent } =
        drawerApi.getData<Record<string, any>>();
      if (values) {
        if (parent) {
          values.parentId = parent.id;
        }
        formApi.setValues(values);
      }

      drawerApi.setState({ title: `账号：${isUpdate ? '编辑' : '新增'}` });
    }
  },
  title: '角色：',
});

/**
 * 提交
 */
function onSubmit(values: Record<string, any>) {
  try {
    console.log('values', values);
    const { isUpdate } = drawerApi.getData<Record<string, any>>();
    saveOrUpdate(values, isUpdate).then((d) => {
      setTimeout(() => {
        drawerApi.close();
      }, 500);
    });
  } catch (error) {
    console.error(error);
  }
}
</script>
<template>
  <Drawer>
    <Form />
  </Drawer>
</template>
