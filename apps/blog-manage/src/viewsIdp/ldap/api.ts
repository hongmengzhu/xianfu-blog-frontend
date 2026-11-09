import { requestClient } from '#/api/request';

const MSG_TIP: any = {
  errorMessageMode: 'message',
  successMessageMode: 'message',
};

const base = '/xianfu/manage/ram-idp/ldap';

/** 测试 LDAP 连接 */
export const ldapTest = (sourceNo: string) =>
  requestClient.post(`${base}/test`, { sourceNo }, MSG_TIP);

/** 搜索 LDAP 用户 */
export const ldapSearch = (sourceNo: string, filter?: string) =>
  requestClient.post(`${base}/search`, { filter, sourceNo }, MSG_TIP);

/** 同步 LDAP 用户 */
export const ldapSync = (sourceNo: string) =>
  requestClient.post(`${base}/sync`, { sourceNo }, MSG_TIP);

/** LDAP 用户登录验证 */
export const ldapLogin = (params: {
  password: string;
  sourceNo: string;
  username: string;
}) =>
  requestClient.post(`${base}/login`, params, {
    errorMessageMode: 'message',
  } as any);
