import dayjs from 'dayjs';

/**
 * IdP（身份中心）模块公共常量与工具
 */

export interface IdpOption {
  label: string;
  value: number | string;
}

/** 认证协议 */
export const PROTOCOL_OPTIONS: IdpOption[] = [
  { label: 'OAuth2', value: 'oauth2' },
  { label: 'OIDC', value: 'oidc' },
  { label: 'OpenID', value: 'openid' },
  { label: 'OAuth', value: 'oauth' },
  { label: 'SAML2', value: 'saml2' },
  { label: 'CAS', value: 'cas' },
  { label: 'LDAP', value: 'ldap' },
  { label: '自定义', value: 'custom' },
];

const PROTOCOL_LABELS: Record<string, string> = {
  cas: 'CAS',
  custom: '自定义',
  ldap: 'LDAP',
  oauth: 'OAuth',
  oauth2: 'OAuth2',
  oidc: 'OIDC',
  openid: 'OpenID',
  saml2: 'SAML2',
};

export function protocolLabel(value?: string) {
  if (!value) {
    return '-';
  }
  return PROTOCOL_LABELS[value.toLowerCase()] ?? value;
}

/** 平台 */
export const PLATFORM_OPTIONS: IdpOption[] = [
  { label: 'Web', value: 'web' },
  { label: '移动端', value: 'mobile' },
  { label: '桌面端', value: 'desktop' },
  { label: '应用', value: 'app' },
  { label: '小程序', value: 'miniprogram' },
  { label: '服务端', value: 'server' },
];

export function platformLabel(value?: string) {
  if (!value) {
    return '-';
  }
  return PLATFORM_OPTIONS.find((item) => item.value === value)?.label ?? value;
}

/**
 * 身份提供商类型（code）
 *
 * 该值由后端 `pkg/sdk/auth/idpPg/idp` 的 GetIdProvider 解析，
 * 取值为 goth 支持的提供商名称或 Custom 系列。
 */
export const PROVIDER_CODE_OPTIONS: IdpOption[] = [
  { label: 'Custom（自定义 OAuth2）', value: 'Custom' },
  { label: 'GitHub', value: 'GitHub' },
  { label: 'GitLab', value: 'GitLab' },
  { label: 'Gitee', value: 'Gitee' },
  { label: 'Google', value: 'Google' },
  { label: 'Facebook', value: 'Facebook' },
  { label: 'Twitter', value: 'Twitter' },
  { label: 'LinkedIn', value: 'Linkedin' },
  { label: 'Telegram', value: 'Telegram' },
  { label: 'Alipay（支付宝）', value: 'Alipay' },
  { label: 'MetaMask', value: 'MetaMask' },
  { label: 'Web3Onboard', value: 'Web3Onboard' },
  { label: 'Okta', value: 'Okta' },
  { label: 'Casdoor', value: 'Casdoor' },
  { label: 'ADFS', value: 'ADFS' },
  { label: 'AzureAD', value: 'AzureAD' },
  { label: 'AzureADB2C', value: 'AzureADB2C' },
  { label: 'Apple', value: 'Apple' },
  { label: 'Amazon', value: 'Amazon' },
  { label: 'Auth0', value: 'Auth0' },
  { label: 'Bitbucket', value: 'Bitbucket' },
  { label: 'Dropbox', value: 'Dropbox' },
  { label: 'Line', value: 'Line' },
  { label: 'MicrosoftOnline', value: 'MicrosoftOnline' },
  { label: 'Paypal', value: 'Paypal' },
  { label: 'Slack', value: 'Slack' },
  { label: 'Spotify', value: 'Spotify' },
  { label: 'Steam', value: 'Steam' },
  { label: 'Discord', value: 'Discord' },
  { label: 'Zoom', value: 'Zoom' },
];

/** 凭证类型 */
export const CRED_TYPE_OPTIONS: IdpOption[] = [
  { label: 'client_secret（客户端密钥）', value: 'client_secret' },
  { label: 'jwks（JSON Web Key Set）', value: 'jwks' },
  { label: 'sp_cert（SP 证书）', value: 'sp_cert' },
  { label: 'sp_private_key（SP 私钥）', value: 'sp_private_key' },
  { label: 'idp_cert（IdP 证书）', value: 'idp_cert' },
  { label: 'ldap_bind_pwd（LDAP 绑定密码）', value: 'ldap_bind_pwd' },
];

/** 元数据格式 */
export const META_FORMAT_OPTIONS: IdpOption[] = [
  { label: 'JSON（OIDC）', value: 'json' },
  { label: 'XML（SAML2）', value: 'xml' },
];

/** 同步模式 */
export const SYNC_MODE_OPTIONS: IdpOption[] = [
  { label: '手动同步', value: 'manual' },
  { label: '定时同步', value: 'scheduled' },
];

/** 启用状态 */
export const STATE_OPTIONS: IdpOption[] = [
  { label: '有效', value: 1 },
  { label: '停用', value: 2 },
];

/** 绑定状态 */
export const BIND_STATE_OPTIONS: IdpOption[] = [
  { label: '未绑定', value: 1 },
  { label: '已绑定', value: 2 },
];

export function bindStateLabel(value?: number | string) {
  const item = BIND_STATE_OPTIONS.find((opt) => opt.value === Number(value));
  return item?.label ?? '-';
}

/**
 * 可选图标（仅包含应用内已离线注册的图标集，避免运行时请求远程接口）
 */
export const ICON_OPTIONS: string[] = [
  'mdi:shield-key-outline',
  'mdi:account-key',
  'mdi:account-multiple',
  'mdi:account-settings',
  'mdi:account-circle',
  'carbon:security',
  'carbon:user-role',
  'carbon:workspace',
  'carbon:software-resource',
  'lucide:user',
  'lucide:user-plus',
  'lucide:check-circle',
  'material-symbols:rule',
  'material-symbols:task',
  'mdi:github',
  'mdi:store',
];

/** 常用属性映射模板（外部字段 -> 本地字段） */
export const ATTRIBUTE_MAPPING_TEMPLATE: Record<string, string> = {
  account: 'preferred_username',
  avatar: 'picture',
  mail: 'email',
  name: 'name',
  phone: 'phone_number',
};

/** 日期时间格式化 */
export function formatDateTime(
  value?: null | string,
  fmt = 'YYYY-MM-DD HH:mm:ss',
) {
  if (!value) {
    return '-';
  }
  const date = dayjs(value);
  return date.isValid() ? date.format(fmt) : '-';
}

/** 日期格式化（不含时间） */
export function formatDate(value?: null | string) {
  return formatDateTime(value, 'YYYY-MM-DD');
}

/** 字符串转时间戳（DatePicker 使用） */
export function toTimestamp(value?: null | string): null | number {
  if (!value) {
    return null;
  }
  const date = dayjs(value);
  return date.isValid() ? date.valueOf() : null;
}

/** 时间戳转 ISO 字符串（后端 time.Time） */
export function toIsoString(value?: null | number | string) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const date = dayjs(value);
  return date.isValid() ? date.toISOString() : null;
}

/** 安全解析 JSON 对象 */
export function parseJsonObject(text?: any): Record<string, any> {
  if (!text) {
    return {};
  }
  if (typeof text === 'object') {
    return { ...(text as Record<string, any>) };
  }
  try {
    const parsed = JSON.parse(String(text));
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
    return {};
  } catch {
    return {};
  }
}

/** 对象序列化为 JSON 字符串，空对象返回空串 */
export function stringifyJsonObject(obj?: Record<string, any>) {
  if (!obj) {
    return '';
  }
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) {
      continue;
    }
    if (typeof value === 'string' && value.trim() === '') {
      continue;
    }
    if (Array.isArray(value) && value.length === 0) {
      continue;
    }
    cleaned[key] = value;
  }
  return Object.keys(cleaned).length > 0 ? JSON.stringify(cleaned) : '';
}

/** 是否空值 */
export function isBlank(value: any) {
  return value === undefined || value === null || value === '';
}

/** 生成默认值：数字 1/2 与布尔互转 */
export function yesNoToBool(value: any) {
  return Number(value) === 1;
}

export function boolToYesNo(value: any) {
  return value ? 1 : 2;
}
