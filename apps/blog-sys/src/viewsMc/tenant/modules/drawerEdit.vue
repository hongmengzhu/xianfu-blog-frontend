<script lang="ts" setup>
import { h } from 'vue';

import { useVbenDrawer, useVbenModal, VbenButton } from '@vben/common-ui';

import { usePgForm } from '#/adapter';
import AccountModalTpl from '#/viewsRam/account/invoke/index.vue';

import { existCode, existName, saveOrUpdate } from '../api';

const emit = defineEmits(['ok']);
const [Modal, modalApi] = useVbenModal({
  connectedComponent: AccountModalTpl,
});
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
          fieldName: 'name',
          label: '名称',
          component: 'Input',
          rules: 'required',
          componentProps: {
            placeholder: '请输入',
            onBlur: async (e) => {
              const values = await formApi.getValues();
              if (!values.nameFull) {
                formApi.setFieldValue('nameFull', e.target.value);
              }
            },
          },
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
          label: '标志',
          defaultValue: '系统自动建立',
          rules: 'required',
          component: 'Input',
          componentProps: {
            placeholder: '请输入',
            onBlur: async (e) => {
              const values = await formApi.getValues();
              if (!values.nameFl) {
                formApi.setFieldValue('nameFl', e.target.value);
              }
            },
          },
          suffix: () =>
            h(
              VbenButton,
              {
                class: 'pg-button-size-small',
                onClick: async (e) => {
                  const values = await formApi.getValues();
                  existCode(values.code, values.id);
                },
              },
              () => h('span', { class: 'font-normal' }, '查重'),
            ),
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
        {
          fieldName: 'founderName',
          label: '账号名称',
          defaultValue: '',
          component: 'Input',
          componentProps: {
            placeholder: '请输入',
          },
          suffix: () =>
            h(
              VbenButton,
              {
                class: 'pg-button-size-small',
                onClick: async (e) => {
                  const values = await formApi.getValues();
                  modalApi.setData({
                    // 表单值
                    values,
                    isUpdate: true,
                    number: 1,
                  });
                  modalApi.open();
                },
              },
              () => h('span', { class: 'font-normal' }, '绑定'),
            ),
        },
        {
          fieldName: 'founder',
          label: '账号',
          component: 'Input',
          componentProps: {
            readonly: true,
          },
          // dependencies: {
          //   show: false,
          //   // 随意一个字段改变时，都会触发
          //   triggerFields: ['description'],
          // },
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
          defaultValue: '',
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
const [Drawer, drawerApi] = useVbenDrawer({
  onCancel() {
    drawerApi.close();
  },
  onConfirm: async () => {
    await formApi.submit();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      drawerApi.setState({
        loading: true,
        confirmLoading: false,
        closeOnClickModal: false, // 点击遮罩关闭弹窗
        destroyOnClose: true, // 关闭时销毁
      });
      const { values, isUpdate } = drawerApi.getData<Record<string, any>>();
      if (values) {
        formApi.setValues(values);
      }

      drawerApi.setState({
        title: `租户：${isUpdate ? '编辑' : '新增'}`,
        loading: false,
      });
    }
  },
  title: '',
});

/**
 * 提交
 */
function onSubmit(values: Record<string, any>) {
  try {
    drawerApi.setState({ loading: true, confirmLoading: true });
    const { isUpdate } = drawerApi.getData<Record<string, any>>();
    saveOrUpdate(
      {
        ...values,
      },
      isUpdate,
    )
      .then((d) => {
        setTimeout(() => {
          emit('ok', values);
          drawerApi.setState({ loading: false });
          drawerApi.close();
        }, 500);
      })
      .catch(() => {
        drawerApi.setState({ loading: false, confirmLoading: false });
      });
  } catch (error) {
    drawerApi.setState({ loading: false, confirmLoading: false });
    console.error(error);
  }
}
function modalOk(opt) {
  if (opt && opt.length > 0) {
    const record = opt[0];
    formApi.setValues({ founder: record.id, founderName: record.name });
  }
}
</script>
<template>
  <div>
    <Drawer>
      <Form />
    </Drawer>
    <Modal @ok="modalOk" />
  </div>
</template>
