import { requestClient } from '#/api/request';

import {
  batchSelectDelete,
  batchSelectDisable,
  batchSelectEnable,
  batchSelectPhysicalDeletion,
  batchSelectRecovery,
  createIdpApi,
} from '../shared/api';

/** 身份提供商接口 */
export const providerApi = createIdpApi('identity-provider');

export const {
  List,
  deleteIds,
  detail,
  existName,
  saveOrUpdate,
  selectPublic,
  setState,
} = providerApi;

/** 批量删除 */
export const batchSelectDeleteIds = (
  ids: Array<number | string>,
  handleSuccess?: () => void,
) => batchSelectDelete(providerApi, ids, handleSuccess);

/** 批量有效 */
export const batchSelectEnableIds = (
  ids: Array<number | string>,
  handleSuccess?: () => void,
) => batchSelectEnable(providerApi, ids, handleSuccess);

/** 批量停用 */
export const batchSelectDisableIds = (
  ids: Array<number | string>,
  handleSuccess?: () => void,
) => batchSelectDisable(providerApi, ids, handleSuccess);

/** 批量恢复 */
export const batchSelectRecoveryIds = (
  ids: Array<number | string>,
  handleSuccess?: () => void,
) => batchSelectRecovery(providerApi, ids, handleSuccess);

/** 批量物理删除 */
export const batchSelectPhysicalDeletionIds = (
  ids: Array<number | string>,
  handleSuccess?: () => void,
) => batchSelectPhysicalDeletion(providerApi, ids, handleSuccess);

/** 分页查询（不带分页参数，取全量用于下拉） */
export const selectAll = () =>
  requestClient.post(`${providerApi.base}/query`, {
    pageNum: 1,
    pageSize: 1000,
  });
