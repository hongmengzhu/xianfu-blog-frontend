<script lang="ts" setup>
import { h } from 'vue';

import { useVbenModal, VbenButton } from '@vben/common-ui';

import { usePgForm } from '#/adapter';

import {
  existAccount,
  existMail,
  existPhone,
  saveOrUpdateAccount,
} from '../api';
const emit = defineEmits(['ok']);
const [Form, formApi] = usePgForm({
  schema: [
    {
      fieldName: 'account',
      label: '账号',
      component: 'Input',
      rules: 'required',
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
              existAccount(values.account, values.id);
            },
          },
          () => h('span', { class: 'font-normal' }, '查重'),
        ),
    },
    {
      fieldName: 'countryCode',
      label: '国际区号',
      component: 'Input',
      defaultValue: '',
      componentProps: {
        placeholder: '请输入',
      },
    },
    {
      fieldName: 'phone',
      label: '手机号',
      rules: 'required',
      component: 'Input',
      suffix: () =>
        h(
          VbenButton,
          {
            class: 'pg-button-size-small',
            onClick: async (e) => {
              const values = await formApi.getValues();
              existPhone(values.phone, values.id);
            },
          },
          () => h('span', { class: 'font-normal' }, '查重'),
        ),
    },
    {
      fieldName: 'mail',
      label: '邮箱',
      rules: 'required',
      component: 'Input',
      suffix: () =>
        h(
          VbenButton,
          {
            class: 'pg-button-size-small',
            onClick: async (e) => {
              const values = await formApi.getValues();
              existMail(values.mail, values.id);
            },
          },
          () => h('span', { class: 'font-normal' }, '查重'),
        ),
    },
    {
      fieldName: 'code',
      label: '编号',
      rules: 'required',
      component: 'Input',
    },
    {
      fieldName: 'registerTime',
      label: '注册时间',
      component: 'PgDatePicker',
      componentProps: {
        isTimestamp: false,
        type: 'datetime',
        format: 'yyyy-MM-dd HH:mm:ss',
        valueFormat: 'yyyy-MM-dd HH:mm:ss',
        shortcuts: {
          昨天: () => Date.now() - 24 * 60 * 60 * 1000,
        },
      },
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
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  closeOnClickModal: false,
  draggable: true,
  fullscreenButton: false,
  onCancel() {
    modalApi.close();
  },
  onConfirm: onSubmit,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalApi.setState({
        loading: true,
        confirmLoading: false,
        destroyOnClose: true,
      });
      const { values, isUpdate } = modalApi.getData<Record<string, any>>();
      if (values) {
        formApi.setValues(values);
      }

      modalApi.setState({
        title: `账号：${isUpdate ? '编辑' : '新增'}`,
        loading: false,
      });
    }
  },
});
/**
 * 提交
 */
async function onSubmit() {
  const { valid } = await formApi.validate();
  if (!valid) {
    return false;
  }
  const values = await formApi.getValues<Omit<Record<string, any>, 'id'>>();
  modalApi.lock();
  try {
    modalApi.setState({ loading: true, confirmLoading: true });
    const { isUpdate } = modalApi.getData<Record<string, any>>();
    saveOrUpdateAccount(values, isUpdate).then((d) => {
      setTimeout(() => {
        emit('ok', values);
        modalApi.setState({ loading: false });
        modalApi.close();
      }, 500);
    });
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.unlock();
    modalApi.setState({ loading: false, confirmLoading: false });
  }
}
</script>
<template>
  <Modal>
    <Form />
  </Modal>
</template>
