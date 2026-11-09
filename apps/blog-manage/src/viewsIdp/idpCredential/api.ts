import {
  batchSelectDelete,
  batchSelectDisable,
  batchSelectEnable,
  batchSelectPhysicalDeletion,
  batchSelectRecovery,
  createIdpApi,
} from '../shared/api';

/** 凭证接口 */
export const credentialApi = createIdpApi('idp-credential');

export const { List, deleteIds, detail, saveOrUpdate, selectPublic, setState } =
  credentialApi;

/** 批量删除 */
export const batchSelectDeleteIds = (
  ids: Array<number | string>,
  handleSuccess?: () => void,
) => batchSelectDelete(credentialApi, ids, handleSuccess);

/** 批量有效 */
export const batchSelectEnableIds = (
  ids: Array<number | string>,
  handleSuccess?: () => void,
) => batchSelectEnable(credentialApi, ids, handleSuccess);

/** 批量停用 */
export const batchSelectDisableIds = (
  ids: Array<number | string>,
  handleSuccess?: () => void,
) => batchSelectDisable(credentialApi, ids, handleSuccess);

/** 批量恢复 */
export const batchSelectRecoveryIds = (
  ids: Array<number | string>,
  handleSuccess?: () => void,
) => batchSelectRecovery(credentialApi, ids, handleSuccess);

/** 批量物理删除 */
export const batchSelectPhysicalDeletionIds = (
  ids: Array<number | string>,
  handleSuccess?: () => void,
) => batchSelectPhysicalDeletion(credentialApi, ids, handleSuccess);
