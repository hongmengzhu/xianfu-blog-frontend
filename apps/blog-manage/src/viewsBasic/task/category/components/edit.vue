<script lang="ts" setup>
import { h } from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';

import { PgTreeSelect } from '@pg/components-n';

import { usePgForm } from '#/adapter';

import {
  existName,
  saveOrUpdate,
  selectNodeAllPublic,
  selectPublic,
} from '../api';

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
          label: '代号',
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
    await formApi.submitForm();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const { values, isUpdate, parent } =
        drawerApi.getData<Record<string, any>>();
      if (values) {
        formApi.setValues(values);
      }
      if (parent) {
        formApi.setValues({ parentId: parent.id });
      }

      drawerApi.setState({ title: `角色：${isUpdate ? '编辑' : '新增'}` });
    }
  },
  title: '角色：',
});

/**
 * 提交
 */
function onSubmit(values: Record<string, any>) {
  try {
    drawerApi.setState({ loading: true });
    const { isUpdate } = drawerApi.getData<Record<string, any>>();
    console.log('values', values);
    saveOrUpdate(values, isUpdate).then((d) => {
      setTimeout(() => {
        emit('ok', values);
        drawerApi.setState({ loading: false });
        drawerApi.close();
      }, 900);
    });
  } catch (error) {
    drawerApi.setState({ loading: false });
    console.error(error);
  }
}
</script>
<template>
  <Drawer>
    <Form>
      <template #parentId="slotProps">
        <PgTreeSelect :api="selectPublic" v-bind="slotProps.componentProps" />
      </template>
    </Form>
  </Drawer>
</template>
