<script lang="ts" setup>
import { h } from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';

import { TypeAttr } from '@pg/types';

import { usePgForm } from '#/adapter';
import { typeCodePublic } from '#/viewsBasic/data-dict/dict/api';
import {
  createUpdateByCategory,
  existName,
  selectCategory,
} from '#/viewsRam/resource/group/api';
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
          defaultValue: 'categoryLast',
          component: 'Input',
          componentProps: {
            placeholder: '请选择',
            type: 'button',
            options: TypeAttr,
          },
          dependencies: {
            show: false,
            // 随意一个字段改变时，都会触发
            triggerFields: ['description'],
          },
        },
        {
          fieldName: 'parentNo',
          label: '上级',
          defaultValue: '',
          component: 'PgTreeSelect',
          componentProps: {
            api: selectCategory,
            params: { by: 'no' },
            filterQueryAsync: true,
            props: {
              filterable: true,
              placeholder: '如果为空,则是一级',
            },
          },
          // rules: 'required',
        },
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
          label: '码值',
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
      const { values, isUpdate, parent, copy } =
        drawerApi.getData<Record<string, any>>();
      if (values && Object.keys(values).length > 0) {
        formApi.setValues({
          ...values,
        });
      } else if (copy && Object.keys(copy).length > 0) {
        formApi.setValues({
          ...copy,
          id: '0',
        });
      }
      if (parent) {
        formApi.setValues({
          parentNo: parent.no,
          terminalCode: parent.terminalCode,
        });
      }

      drawerApi.setState({
        title: `资源组分类：${isUpdate ? '编辑' : '新增'}`,
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
  drawerApi.lock();
  try {
    drawerApi.setState({ loading: true, confirmLoading: true });
    const { isUpdate } = drawerApi.getData<Record<string, any>>();
    createUpdateByCategory(values).then((d) => {
      setTimeout(() => {
        emit('ok', values);
        drawerApi.setState({ loading: false });
        drawerApi.close();
      }, 500);
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
  <Drawer>
    <Form />
  </Drawer>
</template>
