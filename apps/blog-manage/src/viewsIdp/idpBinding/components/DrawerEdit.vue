<script lang="ts" setup>
import { useVbenDrawer } from '@vben/common-ui';

import { usePgForm } from '#/adapter';

import { selectPublic as providerSelectPublic } from '../../identityProvider/api';
import {
  PROTOCOL_OPTIONS,
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
        triggerFields: ['externalSub'],
      },
    },
    {
      type: 'group',
      name: 'bind',
      title: '绑定关系',
      defaultCollapsed: false,
      children: [
        {
          fieldName: 'externalSub',
          label: '外部唯一标识',
          component: 'Input',
          rules: 'required',
          componentProps: { placeholder: 'IdP 返回的 sub / openid' },
          help: '同一认证源下用于识别用户的外部唯一标识。',
        },
        {
          fieldName: 'idp',
          label: '身份提供商',
          component: 'ApiSelect',
          rules: 'selectRequired',
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
          fieldName: 'bindAno',
          label: '绑定账号编号',
          component: 'Input',
          componentProps: { placeholder: '本地账号编号（ano）' },
        },
        {
          fieldName: 'appMark',
          label: '应用标识',
          component: 'Input',
          componentProps: { placeholder: '多应用区分标识' },
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
          fieldName: 'bindTime',
          label: '绑定时间',
          component: 'DatePicker',
          componentProps: {
            clearable: true,
            type: 'datetime',
          },
        },
        {
          fieldName: 'openId',
          label: 'OpenID',
          component: 'Input',
          componentProps: { placeholder: 'OpenID（可选）' },
        },
        {
          fieldName: 'unionId',
          label: 'UnionID',
          component: 'Input',
          componentProps: { placeholder: 'UnionID（可选）' },
        },
        {
          fieldName: 'description',
          label: '描述',
          component: 'Textarea',
          componentProps: { rows: 2, type: 'textarea' },
        },
      ],
    },
    {
      type: 'group',
      name: 'user',
      title: '用户资料',
      defaultCollapsed: false,
      children: [
        {
          fieldName: 'nickName',
          label: '昵称',
          component: 'Input',
        },
        {
          fieldName: 'mail',
          label: '邮箱',
          component: 'Input',
        },
        {
          fieldName: 'phone',
          label: '手机号',
          component: 'Input',
        },
        {
          fieldName: 'avatar',
          label: '头像地址',
          component: 'Input',
          componentProps: { placeholder: 'https://...' },
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
      title: `身份绑定：${isUpdate ? '编辑' : '新增'}`,
    });
    try {
      if (isUpdate && values?.id) {
        const data: any = await detail(values.id);
        formApi.setValues({
          ...data,
          bindTime: toTimestamp(data.bindTime),
          id: String(data.id),
        });
      } else {
        formApi.setValues({
          bindTime: Date.now(),
          id: '0',
          protocol: 'oauth2',
        });
      }
    } finally {
      drawerApi.setState({ loading: false });
    }
  },
  title: '身份绑定',
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
        bindTime: toIsoString(values.bindTime),
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
