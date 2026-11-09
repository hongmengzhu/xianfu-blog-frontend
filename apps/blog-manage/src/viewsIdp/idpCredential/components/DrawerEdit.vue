<script lang="ts" setup>
import { useVbenDrawer } from '@vben/common-ui';

import { usePgForm } from '#/adapter';

import { selectPublic as providerSelectPublic } from '../../identityProvider/api';
import { selectPublic as sourceSelectPublic } from '../../identitySource/api';
import {
  CRED_TYPE_OPTIONS,
  toIsoString,
  toTimestamp,
} from '../../shared/constants';
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
        triggerFields: ['credType'],
      },
    },
    {
      type: 'group',
      name: 'basic',
      title: '凭证信息',
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
          help: '凭证按认证源编号匹配，身份提供商为辅助归属信息。',
        },
        {
          fieldName: 'credType',
          label: '凭证类型',
          component: 'Select',
          rules: 'selectRequired',
          componentProps: {
            filterable: true,
            options: CRED_TYPE_OPTIONS,
            placeholder: '请选择或输入凭证类型',
            tag: true,
          },
        },
        {
          fieldName: 'value',
          label: '凭证值',
          component: 'Textarea',
          componentProps: {
            rows: 5,
            type: 'textarea',
            placeholder: '密钥 / 证书 / JWKS 内容；编辑时留空则保留原值',
          },
          help: '凭证值不会在详情中返回，仅在保存时写入。',
        },
        {
          fieldName: 'expireAt',
          label: '过期时间',
          component: 'DatePicker',
          componentProps: {
            clearable: true,
            type: 'datetime',
          },
        },
        {
          fieldName: 'description',
          label: '说明',
          component: 'Input',
          componentProps: { placeholder: '用途说明' },
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
      title: `凭证：${isUpdate ? '编辑' : '新增'}`,
    });
    try {
      if (isUpdate && values?.id) {
        const data: any = await detail(values.id);
        formApi.setValues({
          ...data,
          expireAt: toTimestamp(data.expireAt),
          id: String(data.id),
          value: '',
        });
      } else {
        formApi.setValues({
          credType: 'client_secret',
          expireAt: null,
          id: '0',
          value: '',
        });
      }
    } finally {
      drawerApi.setState({ loading: false });
    }
  },
  title: '凭证',
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
        expireAt: toIsoString(values.expireAt),
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
