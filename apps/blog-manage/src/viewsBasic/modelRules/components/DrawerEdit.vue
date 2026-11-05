<script lang="ts" setup>
import { h, ref } from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';

import { usePgForm } from '#/adapter';
import { codeValueAllPublic } from '#/viewsBasic/data-dict/dict/api';

import { existName, saveOrUpdate } from '../api';
const emit = defineEmits(['ok']);
const fieldData = ref(null);
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
          fieldName: 'ruleMode',
          label: '验证模式类型',
          component: 'PgTreeSelect',
          componentProps: {
            api: codeValueAllPublic,
            params: { typeCode: 'basicModel:ruleMode' },
            props: {
              placeholder: '请选择',
            },
            onOk: async (e) => {
              const values = await formApi.getValues();
              if (values.ruleMode === 'required') {
                formApi.setFieldValue('name', '不为空');
              }
            },
          },
          rules: 'required',
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
          fieldName: 'coding',
          label: '代码',
          component: 'Textarea',
          componentProps: {
            type: 'textarea',
            placeholder: '代码',
          },
        },
        {
          fieldName: 'condition',
          label: '条件',
          component: 'Textarea',
          componentProps: {
            type: 'textarea',
            placeholder: '条件',
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
          fieldName: 'sharedRuleNo',
          label: '共享规则编号',
          component: 'Input',
          defaultValue: '',
          componentProps: {
            placeholder: '请输入',
          },
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
      const { values, isUpdate, field } =
        drawerApi.getData<Record<string, any>>();
      if (field) {
        fieldData.value = field;
        console.log('field', field);
      }
      if (values) {
        formApi.setValues(values);
      }
      let title = `字段规则：${isUpdate ? '编辑' : '新增'}`;
      if (fieldData.value) {
        title = `${title} [所属字段：${fieldData.value.name}(${fieldData.value.field})]`;
      }
      drawerApi.setState({
        title,
        loading: false,
      });
    }
  },
  title: '',
});

/**
 * 提交
 */
async function onSubmit() {
  const { valid } = await formApi.validate();
  if (!valid) {
    return false;
  }
  const values = await formApi.getValues<Record<string, any>>();
  drawerApi.lock();
  try {
    drawerApi.setState({ loading: true, confirmLoading: true });
    const { isUpdate } = drawerApi.getData<Record<string, any>>();
    let data = {
      ...values,
    };
    if (fieldData.value) {
      data.fieldNo = fieldData.value.no;
    }
    saveOrUpdate(data, isUpdate).then((d) => {
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
