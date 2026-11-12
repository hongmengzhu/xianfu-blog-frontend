<script lang="ts" setup>
import { h } from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';

import { usePgForm } from '#/adapter';
import { selectNodeAllPublic as selectNodeAllPublicModule } from '#/viewsBasic/module/api';

import { existName, saveOrUpdate, selectNodeAll } from '../api';

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
          fieldName: 'module',
          label: '模块',
          component: 'PgTreeSelect',
          componentProps: {
            api: selectNodeAllPublicModule,
            params: {},
            props: {
              placeholder: '请选择所属模块',
              filterable: true,
            },
          },
          rules: 'required',
        },
        {
          fieldName: 'parentNo',
          label: '上级',
          component: 'PgTreeSelect',
          componentProps: {
            api: selectNodeAll,
            params: { by: 'no' },
            filterQueryAsync: true,
            props: {
              filterable: true,
              placeholder: '请选择',
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
          label: '编码',
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
        closeOnClickModal: false,
        destroyOnClose: true,
      });
      const { values, isUpdate, parent } =
        drawerApi.getData<Record<string, any>>();
      if (values) {
        formApi.setValues({
          ...values,
        });
        // 历史数据的默认模块值 no 视为未设置，需重新选择
        if (!values.module || values.module === 'no') {
          formApi.setFieldValue('module', '');
        }
      } else {
        formApi.setValues({});
      }
      if (parent) {
        formApi.setFieldValue('parentNo', parent.no);
        // 子分类默认继承上级分类的模块
        if (parent.module && parent.module !== 'no') {
          formApi.setFieldValue('module', parent.module);
        }
      }
      // console.log('values', values);
      drawerApi.setState({
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
  drawerApi.lock();
  try {
    drawerApi.setState({ loading: true, confirmLoading: true });
    const { isUpdate } = drawerApi.getData<Record<string, any>>();
    saveOrUpdate(values, isUpdate).then((d) => {
      setTimeout(() => {
        emit('ok', values);
        drawerApi.setState({ loading: false });
        drawerApi.close();
      }, 900);
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
