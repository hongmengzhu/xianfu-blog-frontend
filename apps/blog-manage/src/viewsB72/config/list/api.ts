import { requestClient } from '#/api/request';

/**
 * 配置列表接口（对应后端 ConfigList.go）
 * 当前接入 query / detailForm / configUpdate；其余接口
 * （createUpdate/detail/delete/enable/disable/state/recovery/physicalDeletion）
 * 待操作接入时再补齐。
 */
enum Api {
  list = '/xianfu/manage/b72/config-list/query',
  detailForm = '/xianfu/manage/b72/config-list/detailForm',
  configUpdate = '/xianfu/manage/b72/config-list/configUpdate',
}

/**
 * 列表（按租户分页查询配置列表）
 * @param data
 */
export async function List(data?: any) {
  return requestClient.post(Api.list, data);
}

/**
 * 配置表单详情：返回模型表单字段（含规则）与当前配置值
 * @param data { eventNo }
 */
export const detailForm = (data: any) => {
  return requestClient.post(Api.detailForm, data);
};

/**
 * 保存配置：后端按模型字段规则校验，写入配置值并保存结构体到配置列表 content
 * @param data { eventNo, data: { field: value } }
 */
export const configUpdate = (data: any) => {
  return requestClient.post(Api.configUpdate, data);
};
