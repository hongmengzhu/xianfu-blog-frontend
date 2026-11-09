import { dialog, message } from '#/adapter';
import { requestClient } from '#/api/request';

/** 请求配置（errorMessageMode / successMessageMode 由响应拦截器读取） */
const MSG_NOTIFY: any = {
  errorMessageMode: 'message',
  successMessageMode: 'notification',
};
const MSG_TIP: any = {
  errorMessageMode: 'message',
  successMessageMode: 'message',
};

/**
 * IdP 管理端 CRUD 接口工厂
 *
 * 六个资源（身份提供商/认证源/回调白名单/身份绑定/凭证/元数据缓存）
 * 后端路由结构一致，统一通过该工厂生成请求方法。
 */
export function createIdpApi(resource: string) {
  const base = `/xianfu/manage/ram-idp/${resource}`;

  /** 列表分页查询 */
  const List = (data?: any) => requestClient.post(`${base}/query`, data);

  /** 公共列表（仅启用项） */
  const selectPublic = (data?: any) =>
    requestClient.post(`${base}/selectPublic`, data ?? {});

  /** 详情 */
  const detail = (id: number | string) =>
    requestClient.get(`${base}/detail/${id}`);

  /** 保存或更新 */
  const saveOrUpdate = (data: any, isUpdate: boolean) =>
    requestClient.post(
      `${base}/${isUpdate ? 'update' : 'create'}`,
      data,
      MSG_NOTIFY,
    );

  /** 删除（逻辑/物理由后端配置决定） */
  const deleteIds = (ids: Array<number | string>) =>
    requestClient.post(`${base}/delete`, { ids });

  /** 设置状态：1 有效；2 停用 */
  const setState = (ids: Array<number | string>, state: number) =>
    requestClient.post(`${base}/state`, { ids, state }, MSG_TIP);

  /** 启用 */
  const setEnable = (ids: Array<number | string>) =>
    requestClient.post(`${base}/enable`, { ids }, MSG_TIP);

  /** 停用 */
  const setDisable = (ids: Array<number | string>) =>
    requestClient.post(`${base}/disable`, { ids }, MSG_TIP);

  /** 查重（仅 provider/source/callback 提供） */
  const existName = (wd: string, id: number | string = '0') =>
    requestClient.post(`${base}/existName`, { wd, id }, MSG_NOTIFY);

  return {
    base,
    List,
    deleteIds,
    detail,
    existName,
    saveOrUpdate,
    selectPublic,
    setDisable,
    setEnable,
    setState,
  };
}

type IdpApi = ReturnType<typeof createIdpApi>;

function batchConfirm(
  api: IdpApi,
  ids: Array<number | string>,
  action: 'delete' | 'disable' | 'enable' | 'physicalDeletion' | 'recovery',
  title: string,
  content: string,
  handleSuccess?: () => void,
) {
  const pathMap = {
    delete: `${api.base}/delete`,
    disable: `${api.base}/disable`,
    enable: `${api.base}/enable`,
    physicalDeletion: `${api.base}/physicalDeletion`,
    recovery: `${api.base}/recovery`,
  } as const;

  dialog.warning({
    title,
    content,
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: () => {
      return requestClient
        .post(pathMap[action], { ids }, MSG_TIP)
        .then(() => {
          handleSuccess?.();
        })
        .catch(() => {
          message.warning('操作失败');
        });
    },
  });
}

/** 批量启用 */
export function batchSelectEnable(
  api: IdpApi,
  ids: Array<number | string>,
  handleSuccess?: () => void,
) {
  batchConfirm(
    api,
    ids,
    'enable',
    '确认设置有效',
    '是否[批量有效]选中数据',
    handleSuccess,
  );
}

/** 批量停用 */
export function batchSelectDisable(
  api: IdpApi,
  ids: Array<number | string>,
  handleSuccess?: () => void,
) {
  batchConfirm(
    api,
    ids,
    'disable',
    '确认设置停用',
    '是否[批量停用]选中数据',
    handleSuccess,
  );
}

/** 批量删除 */
export function batchSelectDelete(
  api: IdpApi,
  ids: Array<number | string>,
  handleSuccess?: () => void,
) {
  batchConfirm(
    api,
    ids,
    'delete',
    '确认删除',
    '是否删除选中数据',
    handleSuccess,
  );
}

/** 批量恢复 */
export function batchSelectRecovery(
  api: IdpApi,
  ids: Array<number | string>,
  handleSuccess?: () => void,
) {
  batchConfirm(
    api,
    ids,
    'recovery',
    '确认设置恢复',
    '是否[批量恢复]选中数据',
    handleSuccess,
  );
}

/** 批量物理删除 */
export function batchSelectPhysicalDeletion(
  api: IdpApi,
  ids: Array<number | string>,
  handleSuccess?: () => void,
) {
  batchConfirm(
    api,
    ids,
    'physicalDeletion',
    '确认物理删除',
    '是否[物理删除]选中数据，操作后数据不可恢复',
    handleSuccess,
  );
}

/** 表单查重：重复时后端返回错误提示，未重复返回“可以使用” */
export function checkExistName(
  existName: (wd: string, id?: number | string) => Promise<any>,
  name: string,
  id?: number | string,
) {
  if (!name) {
    message.warning('请先填写名称');
    return;
  }
  existName(name, id).catch(() => {
    // 重复提示由请求拦截器统一展示
  });
}
