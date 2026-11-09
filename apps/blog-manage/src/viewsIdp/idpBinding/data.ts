import type { VxeGridPropTypes } from 'vxe-table';

import type { VbenFormSchema } from '#/adapter/form';

import { confirmSwitch } from '#/adapter/vxe-table';

import { selectPublic as providerSelectPublic } from '../identityProvider/api';
import {
  bindStateLabel,
  formatDateTime,
  PROTOCOL_OPTIONS,
  protocolLabel,
  STATE_OPTIONS,
} from '../shared/constants';
import { setState } from './api';

/**
 * 搜索表单
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'wd',
      label: '关键词',
      componentProps: {
        clearable: true,
        placeholder: '外部标识 / 昵称 / 邮箱',
      },
    },
    {
      component: 'Input',
      fieldName: 'externalSub',
      label: '外部标识',
      componentProps: { clearable: true, placeholder: 'externalSub' },
    },
    {
      component: 'Input',
      fieldName: 'mail',
      label: '邮箱',
      componentProps: { clearable: true, placeholder: '邮箱' },
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: providerSelectPublic,
        clearable: true,
        filterable: true,
        labelField: 'name',
        params: {},
        placeholder: '请选择身份提供商',
        valueField: 'no',
      },
      fieldName: 'idp',
      label: '身份提供商',
    },
    {
      component: 'Select',
      componentProps: {
        clearable: true,
        options: PROTOCOL_OPTIONS,
      },
      fieldName: 'protocol',
      label: '协议',
    },
    {
      component: 'Select',
      componentProps: {
        clearable: true,
        options: STATE_OPTIONS,
      },
      fieldName: 'state',
      label: '状态',
    },
  ];
}

/**
 * 表格列
 */
export const columns: VxeGridPropTypes.Columns = [
  {
    type: 'expand',
    slots: { content: 'expandContent' },
    width: 40,
  },
  { type: 'checkbox', width: 44, title: 'ID' },
  {
    field: 'externalSub',
    minWidth: 220,
    slots: { default: 'externalCell' },
    title: '外部身份',
  },
  {
    field: 'bindAno',
    minWidth: 140,
    slots: { default: 'bindAnoCell' },
    title: '绑定账号',
  },
  {
    field: 'idp',
    minWidth: 160,
    slots: { default: 'idpCell' },
    title: '身份提供商',
  },
  { field: 'openId', title: 'OpenID', visible: false, width: 180 },
  { field: 'unionId', title: 'UnionID', visible: false, width: 180 },
  {
    field: 'stateBind',
    formatter: ({ cellValue }) => bindStateLabel(cellValue),
    title: '绑定状态',
    width: 100,
  },
  {
    field: 'protocol',
    formatter: ({ cellValue }) => protocolLabel(cellValue),
    title: '协议',
    width: 100,
  },
  { field: 'mail', title: '邮箱', width: 180 },
  {
    cellRender: {
      attrs: {
        beforeChange: async (newStatus: number, record: any) => {
          try {
            await confirmSwitch(
              record.nickName || record.externalSub || record.id,
              newStatus,
            );
            await setState([record.id], newStatus);
            return true;
          } catch {
            return false;
          }
        },
      },
      name: 'CellSwitchPg',
    },
    field: 'state',
    title: '状态',
    width: 100,
  },
  {
    field: 'bindTime',
    formatter: ({ cellValue }) => formatDateTime(cellValue),
    title: '绑定时间',
    width: 170,
  },
  {
    field: 'right',
    fixed: 'right',
    slots: { default: 'operate' },
    title: '操作',
    width: 140,
  },
];
