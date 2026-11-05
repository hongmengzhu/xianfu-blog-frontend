<script lang="ts" setup>
import { h } from 'vue';

import { useVbenModal, VbenButton } from '@vben/common-ui';

import { usePgForm } from '#/adapter';

import { existName, saveOrUpdate, selectNodeAllPublic } from '../api';
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
          defaultValue: '',
          component: 'Input',
          componentProps: {
            api: selectNodeAllPublic,
            params: {},
            props: {
              placeholder: '如果为空,则是一级',
              filterable: true,
            },
          },
          dependencies: {
            show: false,
            // 随意一个字段改变时，都会触发
            triggerFields: ['description'],
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
          label: '编号',
          defaultValue: '系统自动建立',
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
      component: 'Input',
      defaultValue: '',
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
  onCancel() {
    modalApi.close();
  },
  onConfirm: onSubmit,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalApi.setState({
        loading: true,
        confirmLoading: false,
        closeOnClickModal: false,
        destroyOnClose: true,
      });
      const { values, isUpdate } = modalApi.getData<Record<string, any>>();
      if (values) {
        // console.log('values', values);
        formApi.setValues({
          ...values,
        });
      }

      modalApi.setState({
        title: `分类：${isUpdate ? '编辑' : '新增'}`,
        loading: false,
      });
    }
  },
  title: '：',
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
  values.typeSys = 'general';
  // values['typeAttr'] = 'categoryLast';
  modalApi.lock();
  try {
    modalApi.setState({ loading: true, confirmLoading: true });
    const { isUpdate } = modalApi.getData<Record<string, any>>();
    saveOrUpdate(values, isUpdate).then((d) => {
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
