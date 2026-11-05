import { requestClient } from '#/api/request';

/**
 * 配置列表接口（对应后端 ConfigList.go）
 * 当前页面仅接入 query，其余接口（createUpdate/detail/delete/enable/disable/
 * state/recovery/physicalDeletion/detailForm/configUpdate）待操作接入时再补齐。
 */
enum Api {
  list = '/xianfu/manage/basic/config-list/query',
}

/**
 * 列表（按租户分页查询配置列表）
 * @param data
 */
export async function List(data?: any) {
  return requestClient.post(Api.list, data);
}
