import { dialog, message } from '#/adapter';
import { requestClient } from '#/api/request';

enum Api {
  allByModel = '/xianfu/manage/b72/config/allByModel',
  cacheOverride = '/xianfu/manage/b72/config/cacheOverride',
  createUpdate = '/xianfu/manage/b72/config/createUpdate',
  delete = '/xianfu/manage/b72/config/delete',
  detail = '/xianfu/manage/b72/config/detail/',
  disable = '/xianfu/manage/b72/config/disable',
  enable = '/xianfu/manage/b72/config/enable',
  existName = '/xianfu/manage/b72/config/existName',
  list = '/xianfu/manage/b72/config/query',
  physicalDeletion = '/xianfu/manage/b72/config/physicalDeletion',
  recovery = '/xianfu/manage/b72/config/recovery',
  state = '/xianfu/manage/b72/config/state',
  updateValues = '/xianfu/manage/b72/config/updateValues',
  // 关联接口
  categoryList = '/xianfu/manage/b72/config-category/query',
  modelList = '/xianfu/manage/b72/config-model/query',
}

/**
 * 列表（按租户分页查询配置行）
 * @param data
 */
export async function List(data?: any) {
  return requestClient.post(Api.list, data);
}

/**
 * 详情
 * @param id
 */
export const detail = (id?: any) => {
  return requestClient.get(Api.detail + id);
};

/**
 * 新增/更新单条配置（id 为空为新增）
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
 * 按 model（或 modelNo）读取配置（走缓存）
 * @param data { model } 或 { modelNo }
 */
export const allByModel = (data: any) => {
  return requestClient.post(Api.allByModel, data);
};

/**
 * 按模型批量保存字段值（按字段规则校验）
 * @param data { model, data: { field: value } }
 */
export const updateValues = (data: any) => {
  return requestClient.post(Api.updateValues, data, {
    errorMessageMode: 'message',
    successMessageMode: 'notification',
  });
};

/**
 * 从数据库全量重建配置缓存
 */
export const cacheOverride = () => {
  return requestClient.post(
    Api.cacheOverride,
    {},
    {
      errorMessageMode: 'message',
      successMessageMode: 'notification',
    },
  );
};

/**
 * 模型下拉（当前租户有效模型）
 */
export const modelOptions = async () => {
  const res: any = await requestClient.post(Api.modelList, {
    pageSize: 1000,
    pageNum: 1,
    state: 1,
  });
  const rows = res?.data || res || [];
  return rows.map((item: any) => ({
    label: `${item.name}（${item.model}）`,
    value: item.model,
    name: item.name,
    model: item.model,
    no: item.no,
  }));
};

/**
 * 配置分类下拉
 */
export const categoryOptions = async () => {
  const res: any = await requestClient.post(Api.categoryList, {
    pageSize: 1000,
    pageNum: 1,
  });
  const rows = res?.data || res || [];
  return rows.map((item: any) => ({
    label: item.name,
    value: item.code || item.no,
  }));
};

/**
 * 模型字段下拉（字段已在设计器保存，配置行由设计器自动生成）
 */
export const fieldOptions = async (model: string) => {
  if (!model) {
    return [];
  }
  const res: any = await allByModel({ model });
  const rows = Array.isArray(res) ? res : res?.data || [];
  return rows.map((item: any) => ({
    label: `${item.name}（${item.field}）`,
    value: item.field,
    raw: item,
  }));
};
