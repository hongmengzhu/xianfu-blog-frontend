<script lang="ts" setup>
import { h } from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';

import { usePgForm } from '#/adapter';

import { selectPublic as providerSelectPublic } from '../../identityProvider/api';
import { checkExistName } from '../../shared/api';
import { PLATFORM_OPTIONS, PROTOCOL_OPTIONS } from '../../shared/constants';
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
      title: '回调白名单',
      defaultCollapsed: false,
      children: [
        {
          fieldName: 'name',
          label: '名称',
          component: 'Input',
          rules: 'required',
          componentProps: { placeholder: '如：门户站点回调' },
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
          fieldName: 'callback',
          label: '回调地址',
          component: 'Input',
          rules: 'required',
          componentProps: {
            placeholder: 'https://app.example.com/idp/callback',
          },
          help: '认证源完成登录后允许跳转的地址，未授权地址会被拒绝。',
        },
        {
          fieldName: 'protocol',
          label: '协议',
          component: 'Select',
          componentProps: {
            options: PROTOCOL_OPTIONS,
            placeholder: '请选择协议',
          },
        },
        {
          fieldName: 'idp',
          label: '身份提供商',
          component: 'ApiSelect',
          componentProps: {
            api: providerSelectPublic,
            filterable: true,
            labelField: 'name',
            params: {},
            placeholder: '请选择身份提供商',
            valueField: 'no',
          },
        },
        {
          fieldName: 'platform',
          label: '平台',
          component: 'Select',
          componentProps: {
            options: PLATFORM_OPTIONS,
            placeholder: '请选择平台',
            tag: true,
          },
        },
        {
          fieldName: 'description',
          label: '描述',
          component: 'Textarea',
          componentProps: { rows: 3, type: 'textarea' },
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
      title: `回调白名单：${isUpdate ? '编辑' : '新增'}`,
    });
    try {
      if (isUpdate && values?.id) {
        const data: any = await detail(values.id);
        formApi.setValues({ ...data, id: String(data.id) });
      } else {
        formApi.setValues({ id: '0', protocol: 'oauth2' });
      }
    } finally {
      drawerApi.setState({ loading: false });
    }
  },
  title: '回调白名单',
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
