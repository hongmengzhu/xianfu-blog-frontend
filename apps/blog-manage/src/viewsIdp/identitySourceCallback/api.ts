import {
  batchSelectDelete,
  batchSelectDisable,
  batchSelectEnable,
  batchSelectPhysicalDeletion,
  batchSelectRecovery,
  createIdpApi,
} from '../shared/api';

/** 回调白名单接口 */
export const callbackApi = createIdpApi('identity-source-callback');

export const {
  List,
  deleteIds,
  detail,
  existName,
  saveOrUpdate,
  selectPublic,
  setState,
} = callbackApi;

/** 批量删除 */
export const batchSelectDeleteIds = (
  ids: Array<number | string>,
  handleSuccess?: () => void,
) => batchSelectDelete(callbackApi, ids, handleSuccess);

/** 批量有效 */
export const batchSelectEnableIds = (
  ids: Array<number | string>,
  handleSuccess?: () => void,
) => batchSelectEnable(callbackApi, ids, handleSuccess);

/** 批量停用 */
export const batchSelectDisableIds = (
  ids: Array<number | string>,
  handleSuccess?: () => void,
) => batchSelectDisable(callbackApi, ids, handleSuccess);

/** 批量恢复 */
export const batchSelectRecoveryIds = (
  ids: Array<number | string>,
  handleSuccess?: () => void,
) => batchSelectRecovery(callbackApi, ids, handleSuccess);

/** 批量物理删除 */
export const batchSelectPhysicalDeletionIds = (
  ids: Array<number | string>,
  handleSuccess?: () => void,
) => batchSelectPhysicalDeletion(callbackApi, ids, handleSuccess);
