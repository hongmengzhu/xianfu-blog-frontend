import { dialog, message } from '#/adapter';
import { requestClient } from '#/api/request';

enum Api {
  createUpdate = '/xianfu/manage/basic/config-model/createUpdate',
  delete = '/xianfu/manage/basic/config-model/delete',
  detail = '/xianfu/manage/basic/config-model/detail/',
  disable = '/xianfu/manage/basic/config-model/disable',
  enable = '/xianfu/manage/basic/config-model/enable',
  existCode = '/xianfu/manage/basic/config-model/existCode',
  existModel = '/xianfu/manage/basic/config-model/existModel',
  existName = '/xianfu/manage/basic/config-model/existName',
  list = '/xianfu/manage/basic/config-model/query',
  physicalDeletion = '/xianfu/manage/basic/config-model/physicalDeletion',
  recovery = '/xianfu/manage/basic/config-model/recovery',
  selectNodeAllPublic = '/xianfu/manage/basic/config-model/selectNodeAllPublic',
  state = '/xianfu/manage/basic/config-model/state',
  // 配置分类（设计器选择配置分类编号）
  configCategoryList = '/xianfu/manage/basic/config-category/query',
}

/**
 * 列表
 * @param data
 */
export async function List(data?: any) {
  return requestClient.post(Api.list, data);
}

/**
 * 模型选择树
 * @param data
 */
export const selectNodeAllPublic = (data?: any) => {
  return requestClient.post(Api.selectNodeAllPublic, data);
};

/**
 * 详情（含字段与规则）
 * @param id
 */
export const detail = (id?: any) => {
  return requestClient.get(Api.detail + id);
};

/**
 * 设计器保存（新增/更新模型、字段、规则、配置）
 * @param data
 */
export const saveOrUpdate = (data: any) => {
  return requestClient.post(Api.createUpdate, data, {
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
 * @param handleSuccess
 */
export const batchSelectDelete = (params, handleSuccess) => {
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
 * @param handleSuccess
 */
export const batchSelectEnable = (params, handleSuccess) => {
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
 * @param handleSuccess
 */
export const batchSelectDisable = (params, handleSuccess) => {
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
 * @param handleSuccess
 */
export const batchSelectRecovery = (params, handleSuccess) => {
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
 * @param handleSuccess
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
 * 设置有效/停用
 * @param id
 * @param status 1 有效 2 停用
 */
export const setStateEnableDisable = (id: any, status: number) =>
  requestClient.post(
    Api.state,
    { ids: [id], state: status },
    { errorMessageMode: 'message', successMessageMode: 'message' },
  );

/**
 * 名称查重
 * @param wd
 * @param id
 */
export const existName = (wd, id?) => {
  id = id || '0';
  return requestClient.post(
    Api.existName,
    { wd, id },
    { errorMessageMode: 'message', successMessageMode: 'notification' },
  );
};

/**
 * 编码查重
 * @param wd
 * @param id
 */
export const existCode = (wd, id?) => {
  id = id || '0';
  return requestClient.post(
    Api.existCode,
    { wd, id },
    { errorMessageMode: 'message', successMessageMode: 'notification' },
  );
};

/**
 * 模型标识查重
 * @param wd
 * @param id
 */
export const existModel = (wd, id?) => {
  id = id || '0';
  return requestClient.post(
    Api.existModel,
    { wd, id },
    { errorMessageMode: 'message', successMessageMode: 'notification' },
  );
};

/**
 * 配置分类列表（原始分页结果）
 */
export const configCategoryList = (params?: any) => {
  return requestClient.post(Api.configCategoryList, {
    pageSize: 1000,
    pageNum: 1,
    ...params,
  });
};

/**
 * 配置分类树节点（供设计器选择配置分类编号）
 */
export const configCategoryNodes = async (params?: any) => {
  const res: any = await configCategoryList(params);
  const rows = res?.data || res || [];
  return rows.map((item: any) => ({
    value: item.code || item.no,
    label: item.name,
    parentNo: item.parentNo || '',
    code: item.code,
    no: item.no,
    raw: item,
  }));
};
