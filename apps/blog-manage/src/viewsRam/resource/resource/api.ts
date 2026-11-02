import { dialog, message } from '#/adapter';
import { requestClient } from '#/api/request';

enum Api {
  create = '/xianfu/manage/ram/resource/create',
  createUpdate = '/xianfu/manage/ram/resource/createUpdate',
  createUpdateByCategory = '/xianfu/manage/ram/resource/createUpdateByCategory',
  delete = '/xianfu/manage/ram/resource/delete',
  detail = '/xianfu/manage/ram/resource/detail/',
  disable = '/xianfu/manage/ram/resource/disable',
  enable = '/xianfu/manage/ram/resource/enable',
  existName = '/xianfu/manage/ram/resource/existName',
  exportExcel = '/xianfu/manage/ram/resource/exportExcel',
  list = '/xianfu/manage/ram/resource/query',
  physicalDeletion = '/xianfu/manage/ram/resource/physicalDeletion',
  recovery = '/xianfu/manage/ram/resource/recovery',
  selectCategory = '/xianfu/manage/ram/resource/selectCategory',
  selectCategoryPublic = '/xianfu/manage/ram/resource/selectCategoryPublic',
  selectNodeAll = '/xianfu/manage/ram/resource/selectNodeAll',
  selectNodeAllPublic = '/xianfu/manage/ram/resource/selectNodeAllPublic',
  selectNodePublic = '/xianfu/manage/ram/resource/selectNodePublic',
  selectPublic = '/xianfu/manage/ram/resource/selectPublic',
  state = '/xianfu/manage/ram/resource/state',
  update = '/xianfu/manage/ram/resource/update',
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
 * 公共分类
 * @param data
 */
export const selectCategory = (data?: any) => {
  return requestClient.post(Api.selectCategory, data);
};

/**
 * 公共分类
 * @param data
 */
export const selectCategoryPublic = (data?: any) => {
  return requestClient.post(Api.selectCategoryPublic, data);
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
 * 公共树展示
 * @param data
 */
export const selectNodeAll = (data?: any) => {
  return requestClient.post(Api.selectNodeAll, data);
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
export const createUpdateByCategory = (data: any) => {
  return requestClient.post(Api.createUpdateByCategory, data, {
    errorMessageMode: 'message',
    successMessageMode: 'notification',
  });
};

/**
 * 删除
 * @param params
 */
export const deleteId = (params: any) => {
  return requestClient.post(Api.physicalDeletion, { ids: [params] });
};

/**
 * 删除
 * @param params
 */
export const deleteIds = (params: any) => {
  return requestClient.post(Api.physicalDeletion, { ids: params });
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
export const batchSelectRecovery = (params: any, handleSuccess: any) => {
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
export const batchSelectPhysicalDeletion = (
  params: any,
  handleSuccess: any,
) => {
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
