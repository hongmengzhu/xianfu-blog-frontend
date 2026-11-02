import { dialog, message } from '#/adapter';
import { requestClient } from '#/api/request';

enum Api {
  create = '/xianfu/manage/api/dipl-account/create',
  createUpdate = '/xianfu/manage/api/dipl-account/createUpdate',
  createAccount = '/xianfu/manage/api/dipl-account/createAccount',
  createUpdateSimple = '/xianfu/manage/api/dipl-account/createUpdateSimple',
  delete = '/xianfu/manage/api/dipl-account/delete',
  detail = '/xianfu/manage/api/dipl-account/detail/',
  disable = '/xianfu/manage/api/dipl-account/disable',
  enable = '/xianfu/manage/api/dipl-account/enable',
  existAccount = '/xianfu/manage/api/dipl-account/existAccount',
  existMail = '/xianfu/manage/api/dipl-account/existMail',
  existName = '/xianfu/manage/api/dipl-account/existName',
  existPhone = '/xianfu/manage/api/dipl-account/existPhone',
  existCode = '/xianfu/manage/api/dipl-account/existCode',
  exportExcel = '/xianfu/manage/api/dipl-account/exportExcel',
  list = '/xianfu/manage/api/dipl-account/query',
  physicalDeletion = '/xianfu/manage/api/dipl-account/physicalDeletion',
  recovery = '/xianfu/manage/api/dipl-account/recovery',
  selectNodeAllPublic = '/xianfu/manage/api/dipl-account/selectNodeAllPublic',
  selectNodePublic = '/xianfu/manage/api/dipl-account/selectNodePublic',
  selectPublic = '/xianfu/manage/api/dipl-account/selectPublic',
  state = '/xianfu/manage/api/dipl-account/state',
  update = '/xianfu/manage/api/dipl-account/update',
  updateAccount = '/xianfu/manage/api/dipl-account/updateAccount',
  updatePassword = '/xianfu/manage/api/dipl-account/updatePassword',
}

/**
 * 列表
 * @constructor
 * @param data
 */
export async function List(data?: any) {
  return requestClient.post(Api.list, data);
}

/**
 * 公共列表展示
 * @param data
 */
export const selectPublic = (data?: any) => {
  return requestClient.post(Api.selectPublic, data);
};

/**
 * 公共树展示
 * @param data
 */
export const selectNodePublic = (data?: any) => {
  return requestClient.post(Api.selectNodePublic, data);
};

/**
 * 公共树展示
 * @param data
 */
export const selectNodeAllPublic = (data?: any) => {
  return requestClient.post(Api.selectNodeAllPublic, data);
};
/**
 * 详情
 * @param data
 */
export const detail = (data?: any) => {
  return requestClient.get(Api.detail + data);
};

/**
 * 保存或者更新
 * @param data
 * @param isUpdate
 */
export const saveOrUpdate = (data: any, isUpdate: boolean) => {
  return requestClient.post(Api.createUpdate, data, {
    errorMessageMode: 'message',
    successMessageMode: 'notification',
  });
};

/**
 * 保存或者更新
 * @param data
 * @param isUpdate
 */
export const saveOrUpdateAccount = (data: any) => {
  return requestClient.post(Api.createUpdateSimple, data, {
    errorMessageMode: 'message',
    successMessageMode: 'notification',
  });
};

/**
 * 删除
 * @param params
 */
export const deleteId = (params: any) => {
  return requestClient.post(Api.delete, { ids: [params] });
};

/**
 * 删除
 * @param params
 */
export const deleteIds = (params: any) => {
  return requestClient.post(Api.delete, { ids: params });
};

/**
 * 批量选中-删除
 * @param params
 */
export const batchSelectDelete = (params: any, handleSuccess: any) => {
  dialog.warning({
    title: '确认删除',
    content: '是否删除选中数据',
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: () => {
      return requestClient
        .post(
          Api.delete,
          { ids: params },
          { errorMessageMode: 'message', successMessageMode: 'message' },
        )
        .then((item) => {
          handleSuccess(item);
        })
        .catch(() => {
          message.warning('操作失败');
        });
    },
  });
};

/**
 * 批量选中-启用
 * @param params
 */
export const batchSelectEnable = (params: any, handleSuccess: any) => {
  dialog.warning({
    title: '确认设置有效',
    content: '是否[批量有效]选中数据',
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: () => {
      return requestClient
        .post(
          Api.enable,
          { ids: params },
          { errorMessageMode: 'message', successMessageMode: 'message' },
        )
        .then((item) => {
          handleSuccess(item);
        })
        .catch(() => {
          message.warning('操作失败');
        });
    },
  });
};

/**
 * 批量选中-禁用
 * @param params
 */
export const batchSelectDisable = (params: any, handleSuccess: any) => {
  dialog.warning({
    title: '确认设置停用',
    content: '是否[批量停用]选中数据',
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: () => {
      return requestClient
        .post(
          Api.disable,
          { ids: params },
          { errorMessageMode: 'message', successMessageMode: 'message' },
        )
        .then((item) => {
          handleSuccess(item);
        })
        .catch(() => {
          message.warning('操作失败');
        });
    },
  });
};

/**
 * 批量选中-恢复
 * @param params
 */
export const batchSelectRecovery = (params, handleSuccess, dialog) => {
  dialog.warning({
    title: '确认设置恢复',
    content: '是否[批量恢复]选中数据',
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: () => {
      return requestClient
        .post(
          Api.recovery,
          { ids: params },
          { errorMessageMode: 'message', successMessageMode: 'message' },
        )
        .then((item) => {
          handleSuccess(item);
        })
        .catch(() => {
          message.warning('操作失败');
        });
    },
  });
};

/**
 * 批量选中-物理删除
 * @param params
 */
export const batchSelectPhysicalDeletion = (params, handleSuccess) => {
  dialog.warning({
    title: '确认物理删除',
    content: '是否[物理删除]选中数据，操作后数据不可恢复',
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: () => {
      return requestClient
        .post(
          Api.physicalDeletion,
          { ids: params },
          { errorMessageMode: 'message', successMessageMode: 'message' },
        )
        .then((item) => {
          handleSuccess(item);
        })
        .catch(() => {
          message.warning('操作失败');
        });
    },
  });
};

/**
 * 批量-设置状态
 * @param id
 * @param status 1 有效 2 停用
 */
export const setStateEnableDisable = (id: number, status: number) =>
  requestClient.post(
    status === 1 ? Api.enable : Api.disable,
    { ids: [id], state: status },
    { errorMessageMode: 'message', successMessageMode: 'message' },
  );

/**
 * 导出excel url地址
 */
export const exportExcelUrl = Api.exportExcel;

/**
 * 查询名称是否存在
 * @param wd
 * @param id
 */
export const existName = (wd: string, id: number | string = '0') => {
  return requestClient.post(
    Api.existName,
    { wd, id },
    { errorMessageMode: 'message', successMessageMode: 'notification' },
  );
};
/**
 * 查询名称是否存在
 * @param wd
 * @param id
 */
export const existAccount = (wd: string, id: number | string = '0') => {
  return requestClient.post(
    Api.existAccount,
    { wd, id },
    { errorMessageMode: 'message', successMessageMode: 'notification' },
  );
};

/**
 * 查询名称是否存在
 * @param wd
 * @param id
 */
export const existPhone = (wd: string, id: number | string = '0') => {
  return requestClient.post(
    Api.existPhone,
    { wd, id },
    { errorMessageMode: 'message', successMessageMode: 'notification' },
  );
};
/**
 * 查询名称是否存在
 * @param wd
 * @param id
 */
export const existMail = (wd: string, id: number | string = '0') => {
  return requestClient.post(
    Api.existMail,
    { wd, id },
    { errorMessageMode: 'message', successMessageMode: 'notification' },
  );
};
/**
 * 查询名称是否存在
 * @param wd
 * @param id
 */
export const existCode = (wd: string, id: number | string = '0') => {
  return requestClient.post(
    Api.existCode,
    { wd, id },
    { errorMessageMode: 'message', successMessageMode: 'notification' },
  );
};
/**
 * 更新密码
 */
export const updatePassword = (params: any) =>
  requestClient.post(Api.updatePassword, params, {
    errorMessageMode: 'message',
    successMessageMode: 'message',
  });
