<script lang="ts" setup>
import { h } from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';

import { usePgForm } from '#/adapter';

import { checkExistName } from '../../shared/api';
import {
  ICON_OPTIONS,
  PLATFORM_OPTIONS,
  PROTOCOL_OPTIONS,
  PROVIDER_CODE_OPTIONS,
} from '../../shared/constants';
import { detail, existName, saveOrUpdate } from '../api';

const emit = defineEmits(['ok']);

const [Form, formApi] = usePgForm({
  schema: [
    {
      fieldName: 'id',
      label: 'id',
      defaultValue: '0',
      component: 'Input',
      dependencies: {
        show: false,
        triggerFields: ['name'],
      },
    },
    {
      type: 'group',
      name: 'basic',
      title: '基本信息',
      defaultCollapsed: false,
      children: [
        {
          fieldName: 'name',
          label: '名称',
          component: 'Input',
          rules: 'required',
          componentProps: {
            placeholder: '如：企业 GitHub 登录',
          },
          suffix: () =>
            h(
              VbenButton,
              {
                class: 'pg-button-size-small',
                onClick: async () => {
                  const values = await formApi.getValues();
                  checkExistName(existName, values.name, values.id);
                },
              },
              () => h('span', { class: 'font-normal' }, '查重'),
            ),
        },
        {
          fieldName: 'nameFl',
          label: '外文名称',
          component: 'Input',
          componentProps: {
            placeholder: '如：GitHub Login',
          },
        },
        {
          fieldName: 'nameFull',
          label: '全称',
          component: 'Input',
          componentProps: {
            placeholder: '身份提供商全称',
          },
        },
        {
          fieldName: 'code',
          label: '类型标志',
          component: 'Select',
          rules: 'required',
          componentProps: {
            filterable: true,
            options: PROVIDER_CODE_OPTIONS,
            tag: true,
            placeholder: '选择或输入提供商类型',
          },
          help: '后端按该标志实例化对应的 OAuth 提供商实现，如 GitHub、Custom。',
        },
        {
          fieldName: 'protocol',
          label: '协议',
          component: 'Select',
          rules: 'selectRequired',
          componentProps: {
            options: PROTOCOL_OPTIONS,
            placeholder: '请选择协议',
          },
        },
        {
          fieldName: 'platform',
          label: '平台',
          component: 'Select',
          componentProps: {
            options: PLATFORM_OPTIONS,
            tag: true,
            placeholder: '请选择平台',
          },
        },
      ],
    },
    {
      type: 'group',
      name: 'display',
      title: '展示配置',
      defaultCollapsed: false,
      children: [
        {
          fieldName: 'icon',
          label: '图标',
          component: 'IconPicker',
          componentProps: {
            autoFetchApi: false,
            icons: ICON_OPTIONS,
            placeholder: '选择图标',
            prefix: '',
          },
        },
        {
          fieldName: 'sort',
          label: '排序',
          component: 'InputNumber',
          defaultValue: 0,
          componentProps: {
            min: 0,
            placeholder: '数字越小越靠前',
          },
        },
        {
          fieldName: 'description',
          label: '描述',
          component: 'Textarea',
          componentProps: {
            rows: 3,
            type: 'textarea',
            placeholder: '用途说明',
          },
        },
      ],
    },
  ],
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  onCancel() {
    drawerApi.close();
  },
  onConfirm: onSubmit,
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      return;
    }
    const drawerData: any = drawerApi.getData();
    const { isUpdate, values } = drawerData ?? {};
    drawerApi.setState({
      loading: true,
      closeOnClickModal: false,
      destroyOnClose: true,
      title: `身份提供商：${isUpdate ? '编辑' : '新增'}`,
    });
    try {
      if (isUpdate && values?.id) {
        const data: any = await detail(values.id);
        formApi.setValues({ ...data, id: String(data.id) });
      } else {
        formApi.setValues({ id: '0', sort: 0, protocol: 'oauth2' });
      }
    } finally {
      drawerApi.setState({ loading: false });
    }
  },
  title: '身份提供商',
});

async function onSubmit() {
  const { valid } = await formApi.validate();
  if (!valid) {
    return false;
  }
  const values = await formApi.getValues<any>();
  const { isUpdate } = (drawerApi.getData() as any) ?? {};
  drawerApi.lock();
  try {
    await saveOrUpdate(
      {
        ...values,
        id: values.id ?? '0',
        sort: Number(values.sort ?? 0),
      },
      isUpdate,
    );
    emit('ok');
    drawerApi.close();
  } finally {
    drawerApi.unlock();
  }
}
</script>

<template>
  <Drawer>
    <Form />
  </Drawer>
</template>
