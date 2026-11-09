<script lang="ts" setup>
import { useVbenDrawer } from '@vben/common-ui';

import { usePgForm } from '#/adapter';

import { selectPublic as providerSelectPublic } from '../../identityProvider/api';
import { selectPublic as sourceSelectPublic } from '../../identitySource/api';
import { META_FORMAT_OPTIONS, PROTOCOL_OPTIONS } from '../../shared/constants';
import { detail, saveOrUpdate } from '../api';

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
        triggerFields: ['entityId'],
      },
    },
    {
      type: 'group',
      name: 'basic',
      title: '元数据配置',
      defaultCollapsed: false,
      children: [
        {
          fieldName: 'sourceNo',
          label: '认证源',
          component: 'ApiSelect',
          rules: 'selectRequired',
          componentProps: {
            api: sourceSelectPublic,
            filterable: true,
            labelField: 'name',
            params: {},
            placeholder: '请选择认证源',
            valueField: 'no',
          },
        },
        {
          fieldName: 'idpNo',
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
          fieldName: 'entityId',
          label: 'EntityID / Issuer',
          component: 'Input',
          rules: 'required',
          componentProps: {
            placeholder: 'SAML EntityID 或 OIDC Issuer 地址',
          },
        },
        {
          fieldName: 'metadataUrl',
          label: '元数据地址',
          component: 'Input',
          componentProps: {
            placeholder: '远程拉取地址，如 /.well-known/openid-configuration',
          },
        },
        {
          fieldName: 'metaFormat',
          label: '元数据格式',
          component: 'Select',
          defaultValue: 'json',
          componentProps: { options: META_FORMAT_OPTIONS },
        },
        {
          fieldName: 'cacheTtl',
          label: '缓存 TTL（秒）',
          component: 'InputNumber',
          defaultValue: 3600,
          componentProps: { min: 0, placeholder: '默认 3600' },
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
      title: `元数据缓存：${isUpdate ? '编辑' : '新增'}`,
    });
    try {
      if (isUpdate && values?.id) {
        const data: any = await detail(values.id);
        formApi.setValues({
          ...data,
          cacheTtl: Number(data.cacheTtl ?? 3600),
          id: String(data.id),
        });
      } else {
        formApi.setValues({
          cacheTtl: 3600,
          id: '0',
          metaFormat: 'json',
          protocol: 'oidc',
        });
      }
    } finally {
      drawerApi.setState({ loading: false });
    }
  },
  title: '元数据缓存',
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
        cacheTtl: Number(values.cacheTtl ?? 3600),
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
