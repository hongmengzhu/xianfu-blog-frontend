import type { VxeGridPropTypes } from 'vxe-table';

import type { VbenFormSchema } from '#/adapter/form';

import { confirmSwitch } from '#/adapter/vxe-table';

import { selectPublic as providerSelectPublic } from '../identityProvider/api';
import { selectPublic as sourceSelectPublic } from '../identitySource/api';
import {
  CRED_TYPE_OPTIONS,
  formatDateTime,
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
        placeholder: '描述 / 编号',
      },
    },
    {
      component: 'Select',
      componentProps: {
        clearable: true,
        options: CRED_TYPE_OPTIONS,
      },
      fieldName: 'credType',
      label: '凭证类型',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: sourceSelectPublic,
        clearable: true,
        filterable: true,
        labelField: 'name',
        params: {},
        placeholder: '请选择认证源',
        valueField: 'no',
      },
      fieldName: 'sourceNo',
      label: '认证源',
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
  { type: 'checkbox', width: 44, title: 'ID' },
  {
    field: 'description',
    minWidth: 240,
    slots: { default: 'descriptionCell' },
    title: '说明',
  },
  {
    field: 'sourceNo',
    minWidth: 190,
    slots: { default: 'sourceCell' },
    title: '认证源',
  },
  {
    field: 'credType',
    slots: { default: 'credTypeCell' },
    title: '凭证类型',
    width: 170,
  },
  {
    field: 'idp',
    minWidth: 160,
    slots: { default: 'idpCell' },
    title: '身份提供商',
  },
  {
    field: 'expireAt',
    formatter: ({ cellValue }) => formatDateTime(cellValue),
    title: '过期时间',
    width: 170,
  },
  {
    cellRender: {
      attrs: {
        beforeChange: async (newStatus: number, record: any) => {
          try {
            await confirmSwitch(
              record.description || record.credType,
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
    field: 'createAt',
    formatter: ({ cellValue }) => formatDateTime(cellValue),
    title: '创建时间',
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
