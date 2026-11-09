<script lang="ts" setup>
import { h } from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';

import { usePgForm } from '#/adapter';

import { selectNodeAllPublic as selectNodeAllPublicCategory } from '../../category/api';
import { existCode, existName, saveOrUpdate } from '../api';

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
          fieldName: 'category',
          label: '分类',
          component: 'PgTreeSelect',
          componentProps: {
            api: selectNodeAllPublicCategory,
            params: {},
            props: {
              placeholder: '请选择分类',
              filterable: true,
            },
            // 选择分类后，自动带出分类所属的模块
            onOk: (e: any) => {
              const moduleNo =
                e?.option?.data?.extend?.module ??
                e?.option?.data?.module ??
                e?.option?.extend?.module ??
                '';
              formApi.setFieldValue('module', moduleNo);
            },
          },
          rules: 'required',
        },
        {
          fieldName: 'module',
          label: '模块',
          component: 'Input',
          componentProps: {
            disabled: true,
            placeholder: '由分类自动带出',
          },
        },
        {
          fieldName: 'name',
          label: '名称',
          component: 'Input',
          defaultValue: '',
          rules: 'required',
          componentProps: {
            placeholder: '请输入',
            onBlur: async (e) => {
              const values = await formApi.getValues();
              if (!values.nameFull) {
                formApi.setFieldValue('nameFull', e.target.value);
              }
              if (!values.nameFl) {
                formApi.setFieldValue('nameFl', e.target.value);
              }
              if (!values.nameShort) {
                formApi.setFieldValue('nameShort', e.target.value);
              }
            },
          },
          suffix: () =>
            h(
              VbenButton,
              {
                class: 'pg-button-size-small',
                onClick: async () => {
                  const values = await formApi.getValues();
                  existName(values.name, values.category, values.id);
                },
              },
              () => h('span', { class: 'font-normal' }, '查重'),
            ),
        },
        {
          fieldName: 'no',
          label: '标签',
          component: 'Input',
          defaultValue: '',
          rules: 'required',
          componentProps: {
            placeholder: '请输入标签编码',
          },
          suffix: () =>
            h(
              VbenButton,
              {
                class: 'pg-button-size-small',
                onClick: async () => {
                  const values = await formApi.getValues();
                  existCode(values.no, values.category, values.id);
                },
              },
              () => h('span', { class: 'font-normal' }, '查重'),
            ),
        },
        {
          fieldName: 'nameShort',
          label: '简称',
          component: 'Input',
          componentProps: {
            placeholder: '留空则使用名称',
          },
        },
        {
          fieldName: 'typeSys',
          label: '类型',
          component: 'PgRadioGroup',
          defaultValue: 'general',
          componentProps: {
            type: 'button',
            options: [
              { label: '普通', value: 'general' },
              { label: '系统', value: 'system' },
            ],
          },
          rules: 'required',
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
      name: 'attribute',
      title: '显示属性',
      defaultCollapsed: false,
      children: [
        {
          fieldName: 'attributeType',
          label: '颜色类型',
          defaultValue: 'default',
          component: 'PgRadioGroup',
          componentProps: {
            type: 'button',
            options: [
              { label: '默认', value: 'default' },
              { label: '蓝色', value: 'info' },
              { label: '绿色', value: 'success' },
              { label: '橘黄', value: 'warning' },
              { label: '红色', value: 'error' },
            ],
          },
          rules: 'required',
        },
        {
          fieldName: 'attributeBordered',
          label: '边框',
          defaultValue: true,
          component: 'RadioGroup',
          componentProps: {
            options: [
              { label: '是', value: true },
              { label: '否', value: false },
            ],
          },
          rules: 'required',
        },
        {
          fieldName: 'attributeSize',
          label: '尺寸',
          defaultValue: 'medium',
          component: 'RadioGroup',
          componentProps: {
            options: [
              { label: '小', value: 'small' },
              { label: '中', value: 'medium' },
              { label: '大', value: 'large' },
            ],
          },
          rules: 'required',
        },
        {
          fieldName: 'attributeRound',
          label: '圆角',
          defaultValue: false,
          component: 'RadioGroup',
          componentProps: {
            options: [
              { label: '否', value: false },
              { label: '是', value: true },
            ],
          },
          rules: 'required',
        },
        {
          fieldName: 'attributeStrong',
          label: '粗体',
          defaultValue: false,
          component: 'RadioGroup',
          componentProps: {
            options: [
              { label: '否', value: false },
              { label: '是', value: true },
            ],
          },
          rules: 'required',
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
const [Drawer, drawerApi] = useVbenDrawer({
  onCancel() {
    drawerApi.close();
  },
  onConfirm: onSubmit,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      drawerApi.setState({
        loading: true,
        confirmLoading: false,
        closeOnClickModal: false, // 点击遮罩关闭弹窗
        destroyOnClose: true, // 关闭时销毁
      });
      const { values, isUpdate, parent } =
        drawerApi.getData<Record<string, any>>();
      if (values && Object.keys(values).length > 0) {
        const attributeMap = values.attributeMap || {};
        formApi.setValues({
          ...values,
          category: values.categoryNo || values.category || '',
          module: values.module || '',
          no: values.no || values.code || '',
          attributeType: attributeMap.type || 'default',
          attributeBordered:
            attributeMap.bordered === undefined ? true : attributeMap.bordered,
          attributeSize: attributeMap.size || 'medium',
          attributeRound: attributeMap.round ?? false,
          attributeStrong: attributeMap.strong ?? false,
        });
      } else {
        formApi.setValues({});
      }
      if (parent) {
        formApi.setFieldValue('category', parent.no || parent.value);
        if (parent.module) {
          formApi.setFieldValue('module', parent.module);
        }
      }

      drawerApi.setState({
        title: `标签：${isUpdate ? '编辑' : '新增'}`,
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
  const {
    attributeType,
    attributeBordered,
    attributeSize,
    attributeRound,
    attributeStrong,
    module: _module,
    ...rest
  } = values;
  const payload = {
    ...rest,
    attributeMap: {
      type: attributeType,
      bordered: attributeBordered,
      size: attributeSize,
      round: attributeRound,
      strong: attributeStrong,
    },
  };
  drawerApi.lock();
  try {
    drawerApi.setState({ loading: true, confirmLoading: true });
    const { isUpdate } = drawerApi.getData<Record<string, any>>();
    await saveOrUpdate(payload, isUpdate);
    emit('ok', payload);
    drawerApi.close();
  } catch (error) {
    console.error(error);
  } finally {
    drawerApi.unlock();
    drawerApi.setState({ loading: false, confirmLoading: false });
  }
}
</script>
<template>
  <Drawer>
    <Form />
  </Drawer>
</template>
