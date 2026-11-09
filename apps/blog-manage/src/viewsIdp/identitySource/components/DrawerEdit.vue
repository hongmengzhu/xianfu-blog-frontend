<script lang="ts" setup>
import { h, ref } from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';

import { message, usePgForm } from '#/adapter';

import { selectPublic as providerSelectPublic } from '../../identityProvider/api';
import { checkExistName } from '../../shared/api';
import {
  ATTRIBUTE_MAPPING_TEMPLATE,
  ICON_OPTIONS,
  parseJsonObject,
  PLATFORM_OPTIONS,
  PROTOCOL_OPTIONS,
  SYNC_MODE_OPTIONS,
} from '../../shared/constants';
import { useIdpLookups } from '../../shared/useIdpLookups';
import { detail, existName, saveOrUpdate } from '../api';

const emit = defineEmits(['ok']);
const { ensureLoaded } = useIdpLookups();

/** 原始基础配置对象，保留未在表单中声明的扩展键 */
const baseConfigObj = ref<Record<string, any>>({});
/** 原始同步策略对象 */
const syncConfigObj = ref<Record<string, any>>({});

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
          label: '认证源名称',
          component: 'Input',
          rules: 'required',
          componentProps: {
            placeholder: '如：企业 GitHub 认证源',
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
          componentProps: { placeholder: '如：GitHub Source' },
        },
        {
          fieldName: 'code',
          label: '标志',
          component: 'Input',
          componentProps: { placeholder: '可选，如 GITHUB-SRC' },
        },
        {
          fieldName: 'nameFull',
          label: '全称',
          component: 'Input',
          componentProps: { placeholder: '认证源全称' },
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
          componentProps: { min: 0 },
        },
        {
          fieldName: 'enableSlo',
          label: '单点登出',
          component: 'Select',
          defaultValue: 2,
          componentProps: {
            options: [
              { label: '启用', value: 1 },
              { label: '关闭', value: 2 },
            ],
          },
        },
        {
          fieldName: 'autoCreateUser',
          label: '自动建号',
          component: 'Select',
          defaultValue: 2,
          componentProps: {
            options: [
              { label: '开启', value: 1 },
              { label: '关闭', value: 2 },
            ],
          },
          help: '外部用户首次登录且本地无账号时，是否自动创建本地账号。',
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
      name: 'baseConfig',
      title: '基础配置（baseConfig）',
      defaultCollapsed: false,
      children: [
        {
          fieldName: 'clientId',
          label: 'ClientId / 绑定账号',
          component: 'Input',
          componentProps: { placeholder: 'OAuth 客户端 ID；LDAP 为绑定 DN' },
          help: 'LDAP 认证源的绑定账号填写在该字段。',
        },
        {
          fieldName: 'clientSecret',
          label: 'ClientSecret / 绑定密码',
          component: 'Input',
          componentProps: {
            placeholder: '留空则保留原值',
            type: 'password',
            showPasswordOn: 'click',
          },
        },
        {
          fieldName: 'clientId2',
          label: 'ClientId2',
          component: 'Input',
          componentProps: { placeholder: '第二客户端 ID（可选）' },
        },
        {
          fieldName: 'clientSecret2',
          label: 'ClientSecret2',
          component: 'Input',
          componentProps: {
            placeholder: '留空则保留原值',
            type: 'password',
            showPasswordOn: 'click',
          },
        },
        {
          fieldName: 'appId',
          label: 'AppId',
          component: 'Input',
          componentProps: { placeholder: '部分提供商需要' },
        },
        {
          fieldName: 'hostUrl',
          label: 'HostUrl / LDAP 主机',
          component: 'Input',
          componentProps: { placeholder: '如 https://ldap.example.com' },
        },
        {
          fieldName: 'redirectUrl',
          label: '回调地址',
          component: 'Input',
          componentProps: { placeholder: 'https://your-app/callback' },
        },
        {
          fieldName: 'authURL',
          label: '授权地址',
          component: 'Input',
          componentProps: { placeholder: 'OAuth 授权端点' },
        },
        {
          fieldName: 'tokenURL',
          label: 'Token 地址',
          component: 'Input',
          componentProps: { placeholder: 'OAuth Token 端点' },
        },
        {
          fieldName: 'userInfoURL',
          label: '用户信息地址',
          component: 'Input',
          componentProps: { placeholder: 'OIDC UserInfo 端点' },
        },
        {
          fieldName: 'disableSsl',
          label: '跳过 SSL 校验',
          component: 'Select',
          defaultValue: 2,
          componentProps: {
            options: [
              { label: '是', value: 1 },
              { label: '否', value: 2 },
            ],
          },
        },
        {
          fieldName: 'appCertificate',
          label: '应用证书',
          component: 'Textarea',
          componentProps: {
            rows: 3,
            type: 'textarea',
            placeholder: '支付宝等需要应用证书，PEM 内容',
          },
          dependencies: {
            triggerFields: ['protocol'],
            show: (values) =>
              values.protocol === 'oauth2' || values.protocol === 'oauth',
          },
        },
        {
          fieldName: 'rootCertificate',
          label: '根证书',
          component: 'Textarea',
          componentProps: {
            rows: 3,
            type: 'textarea',
            placeholder: 'PEM 根证书内容',
          },
          dependencies: {
            triggerFields: ['protocol'],
            show: (values) =>
              values.protocol === 'oauth2' || values.protocol === 'oauth',
          },
        },
      ],
    },
    {
      type: 'group',
      name: 'syncStrategy',
      title: '同步策略（syncStrategyConfig）',
      defaultCollapsed: false,
      children: [
        {
          fieldName: 'syncMode',
          label: '同步方式',
          component: 'Select',
          defaultValue: 'manual',
          componentProps: { options: SYNC_MODE_OPTIONS },
        },
        {
          fieldName: 'ldapBaseDn',
          label: 'LDAP BaseDn',
          component: 'Input',
          componentProps: { placeholder: '如 ou=users,dc=example,dc=com' },
        },
        {
          fieldName: 'ldapPort',
          label: 'LDAP 端口',
          component: 'InputNumber',
          componentProps: { min: 1, max: 65_535, placeholder: '默认 389/636' },
        },
        {
          fieldName: 'ldapEnableSsl',
          label: 'LDAP SSL',
          component: 'Select',
          defaultValue: 2,
          componentProps: {
            options: [
              { label: '启用', value: 1 },
              { label: '关闭', value: 2 },
            ],
          },
        },
        {
          fieldName: 'ldapAllowSelfSigned',
          label: '允许自签证书',
          component: 'Select',
          defaultValue: 2,
          componentProps: {
            options: [
              { label: '是', value: 1 },
              { label: '否', value: 2 },
            ],
          },
        },
        {
          fieldName: 'ldapFilter',
          label: 'LDAP 过滤条件',
          component: 'Input',
          componentProps: { placeholder: '如 (objectClass=person)' },
        },
        {
          fieldName: 'ldapFilterFields',
          label: '同步字段',
          component: 'Input',
          componentProps: {
            placeholder: '如 uid,cn,mail,mobile（逗号分隔）',
          },
        },
      ],
    },
    {
      type: 'group',
      name: 'attributeMapping',
      title: '属性映射（attributeMapping）',
      defaultCollapsed: false,
      children: [
        {
          fieldName: 'attributeMapping',
          label: '映射规则（JSON）',
          component: 'Textarea',
          componentProps: {
            rows: 6,
            type: 'textarea',
            placeholder: '{"account":"preferred_username","mail":"email"}',
          },
          help: '键为本地账号字段，值为外部身份字段（支持点号路径）。',
          suffix: () =>
            h(
              VbenButton,
              {
                class: 'pg-button-size-small',
                onClick: () => {
                  formApi.setFieldValue(
                    'attributeMapping',
                    JSON.stringify(ATTRIBUTE_MAPPING_TEMPLATE, null, 2),
                  );
                },
              },
              () => h('span', { class: 'font-normal' }, '常用模板'),
            ),
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
      title: `认证源：${isUpdate ? '编辑' : '新增'}`,
    });
    baseConfigObj.value = {};
    syncConfigObj.value = {};
    try {
      await ensureLoaded();
      if (isUpdate && values?.id) {
        const data: any = await detail(values.id);
        baseConfigObj.value = parseJsonObject(data.baseConfig);
        syncConfigObj.value = parseJsonObject(data.syncStrategyConfig);
        const cfg = baseConfigObj.value;
        const sync = syncConfigObj.value;
        formApi.setValues({
          ...data,
          id: String(data.id),
          attributeMapping: data.attributeMapping || '',
          authURL: cfg.authURL ?? '',
          autoCreateUser: Number(data.autoCreateUser ?? 2),
          clientId: cfg.clientId ?? '',
          clientId2: cfg.clientId2 ?? '',
          clientSecret: cfg.clientSecret ?? '',
          clientSecret2: cfg.clientSecret2 ?? '',
          appCertificate: cfg.appCertificate ?? '',
          appId: cfg.appId ?? '',
          disableSsl: cfg.disableSsl ? 1 : 2,
          enableSlo: Number(data.enableSlo ?? 2),
          hostUrl: cfg.hostUrl ?? '',
          ldapAllowSelfSigned: sync.allowSelfSignedCert ? 1 : 2,
          ldapBaseDn: sync.baseDn ?? '',
          ldapEnableSsl: sync.enableSsl ? 1 : 2,
          ldapFilter: sync.filter ?? '',
          ldapFilterFields: Array.isArray(sync.filterFields)
            ? sync.filterFields.join(',')
            : '',
          ldapPort: Number(sync.port ?? 0) || null,
          redirectUrl: cfg.redirectUrl ?? '',
          rootCertificate: cfg.rootCertificate ?? '',
          sort: Number(data.sort ?? 0),
          syncMode: sync.mode ?? 'manual',
          tokenURL: cfg.tokenURL ?? '',
          userInfoURL: cfg.userInfoURL ?? '',
        });
      } else {
        formApi.setValues({
          attributeMapping: '',
          autoCreateUser: 2,
          disableSsl: 2,
          enableSlo: 2,
          id: '0',
          ldapAllowSelfSigned: 2,
          ldapEnableSsl: 2,
          ldapFilterFields: '',
          ldapPort: null,
          protocol: 'oauth2',
          sort: 0,
          syncMode: 'manual',
        });
      }
    } finally {
      drawerApi.setState({ loading: false });
    }
  },
  title: '认证源',
});

async function onSubmit() {
  const { valid } = await formApi.validate();
  if (!valid) {
    return false;
  }
  const values = await formApi.getValues<any>();
  const { isUpdate } = (drawerApi.getData() as any) ?? {};

  // 属性映射必须是合法 JSON
  const mappingText = (values.attributeMapping ?? '').trim();
  if (mappingText) {
    try {
      const parsed = JSON.parse(mappingText);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        message.error('属性映射必须是 JSON 对象');
        return false;
      }
    } catch {
      message.error('属性映射不是合法的 JSON');
      return false;
    }
  }

  // 组装基础配置，保留未知扩展键
  const baseConfig: Record<string, any> = { ...baseConfigObj.value };
  const textKeys: Array<[string, string]> = [
    ['appId', 'appId'],
    ['appCertificate', 'appCertificate'],
    ['authURL', 'authURL'],
    ['clientId', 'clientId'],
    ['clientId2', 'clientId2'],
    ['hostUrl', 'hostUrl'],
    ['redirectUrl', 'redirectUrl'],
    ['rootCertificate', 'rootCertificate'],
    ['tokenURL', 'tokenURL'],
    ['userInfoURL', 'userInfoURL'],
  ];
  for (const [formKey, jsonKey] of textKeys) {
    const value = values[formKey];
    if (value === undefined || value === null || String(value).trim() === '') {
      delete baseConfig[jsonKey];
    } else {
      baseConfig[jsonKey] = value;
    }
  }
  // 密钥类字段：编辑时留空保留原值
  const keepIfBlank = ['clientSecret', 'clientSecret2'];
  for (const key of keepIfBlank) {
    const value = values[key];
    if (value === undefined || value === null || String(value).trim() === '') {
      if (!isUpdate) {
        delete baseConfig[key];
      }
    } else {
      baseConfig[key] = value;
    }
  }
  if (Number(values.disableSsl) === 1) {
    baseConfig.disableSsl = true;
  } else {
    delete baseConfig.disableSsl;
  }

  // 组装同步策略
  const syncConfig: Record<string, any> = { ...syncConfigObj.value };
  const syncTextKeys: Array<[string, string]> = [
    ['ldapBaseDn', 'baseDn'],
    ['ldapFilter', 'filter'],
  ];
  for (const [formKey, jsonKey] of syncTextKeys) {
    const value = values[formKey];
    if (value === undefined || value === null || String(value).trim() === '') {
      delete syncConfig[jsonKey];
    } else {
      syncConfig[jsonKey] = value;
    }
  }
  const port = Number(values.ldapPort ?? 0);
  if (port > 0) {
    syncConfig.port = port;
  } else {
    delete syncConfig.port;
  }
  if (Number(values.ldapEnableSsl) === 1) {
    syncConfig.enableSsl = true;
  } else {
    delete syncConfig.enableSsl;
  }
  if (Number(values.ldapAllowSelfSigned) === 1) {
    syncConfig.allowSelfSignedCert = true;
  } else {
    delete syncConfig.allowSelfSignedCert;
  }
  if (values.syncMode) {
    syncConfig.mode = values.syncMode;
  }
  const fields = String(values.ldapFilterFields ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  if (fields.length > 0) {
    syncConfig.filterFields = fields;
  } else {
    delete syncConfig.filterFields;
  }

  const payload: Record<string, any> = {
    id: values.id ?? '0',
    attributeMapping: mappingText,
    autoCreateUser: Number(values.autoCreateUser ?? 2),
    baseConfig:
      Object.keys(baseConfig).length > 0 ? JSON.stringify(baseConfig) : '',
    code: values.code ?? '',
    description: values.description ?? '',
    enableSlo: Number(values.enableSlo ?? 2),
    icon: values.icon ?? '',
    idp: values.idp ?? '',
    name: values.name,
    nameFl: values.nameFl ?? '',
    nameFull: values.nameFull ?? '',
    platform: values.platform ?? '',
    protocol: values.protocol ?? '',
    sort: Number(values.sort ?? 0),
    syncStrategyConfig:
      Object.keys(syncConfig).length > 0 ? JSON.stringify(syncConfig) : '',
  };

  drawerApi.lock();
  try {
    await saveOrUpdate(payload, isUpdate);
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
