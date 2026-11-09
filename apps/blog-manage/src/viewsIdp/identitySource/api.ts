import {
  batchSelectDelete,
  batchSelectDisable,
  batchSelectEnable,
  batchSelectPhysicalDeletion,
  batchSelectRecovery,
  createIdpApi,
} from '../shared/api';

/** 身份认证源接口 */
export const sourceApi = createIdpApi('identity-source');

export const {
  List,
  deleteIds,
  detail,
  existName,
  saveOrUpdate,
  selectPublic,
  setState,
} = sourceApi;

/** 批量删除 */
export const batchSelectDeleteIds = (
  ids: Array<number | string>,
  handleSuccess?: () => void,
) => batchSelectDelete(sourceApi, ids, handleSuccess);

/** 批量有效 */
export const batchSelectEnableIds = (
  ids: Array<number | string>,
  handleSuccess?: () => void,
) => batchSelectEnable(sourceApi, ids, handleSuccess);

/** 批量停用 */
export const batchSelectDisableIds = (
  ids: Array<number | string>,
  handleSuccess?: () => void,
) => batchSelectDisable(sourceApi, ids, handleSuccess);

/** 批量恢复 */
export const batchSelectRecoveryIds = (
  ids: Array<number | string>,
  handleSuccess?: () => void,
) => batchSelectRecovery(sourceApi, ids, handleSuccess);

/** 批量物理删除 */
export const batchSelectPhysicalDeletionIds = (
  ids: Array<number | string>,
  handleSuccess?: () => void,
) => batchSelectPhysicalDeletion(sourceApi, ids, handleSuccess);
