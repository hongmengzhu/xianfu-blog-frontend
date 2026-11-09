import {
  batchSelectDelete,
  batchSelectDisable,
  batchSelectEnable,
  batchSelectPhysicalDeletion,
  batchSelectRecovery,
  createIdpApi,
} from '../shared/api';

/** 元数据缓存接口 */
export const metadataApi = createIdpApi('idp-metadata-cache');

export const { List, deleteIds, detail, saveOrUpdate, selectPublic, setState } =
  metadataApi;

/** 批量删除 */
export const batchSelectDeleteIds = (
  ids: Array<number | string>,
  handleSuccess?: () => void,
) => batchSelectDelete(metadataApi, ids, handleSuccess);

/** 批量有效 */
export const batchSelectEnableIds = (
  ids: Array<number | string>,
  handleSuccess?: () => void,
) => batchSelectEnable(metadataApi, ids, handleSuccess);

/** 批量停用 */
export const batchSelectDisableIds = (
  ids: Array<number | string>,
  handleSuccess?: () => void,
) => batchSelectDisable(metadataApi, ids, handleSuccess);

/** 批量恢复 */
export const batchSelectRecoveryIds = (
  ids: Array<number | string>,
  handleSuccess?: () => void,
) => batchSelectRecovery(metadataApi, ids, handleSuccess);

/** 批量物理删除 */
export const batchSelectPhysicalDeletionIds = (
  ids: Array<number | string>,
  handleSuccess?: () => void,
) => batchSelectPhysicalDeletion(metadataApi, ids, handleSuccess);
