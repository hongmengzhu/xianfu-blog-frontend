import { requestClient } from '#/api/request';

enum Api {
  config = '/xianfu/pub/config',
}

/**
 * 详情
 * 系统后台使用 system 域的登录密钥（与 /xianfu/auth/sys/login 解密所用密钥一致）
 * @param data
 */
export const config = () => {
  return requestClient.get(Api.config, {
    params: { typeDomain: 'system' },
  });
};

export const configInitializer = (configPub: any) => {
  config().then((res) => {
    if (res) {
      configPub.setData(res);
    }
  });
};
