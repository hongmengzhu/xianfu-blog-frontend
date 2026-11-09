import type { VxeGridPropTypes } from 'vxe-table';

import type { VbenFormSchema } from '#/adapter/form';

import { YesNoOptionsFormatter } from '@pg/types';

import { confirmSwitch } from '#/adapter/vxe-table';

import { selectPublic as providerSelectPublic } from '../identityProvider/api';
import {
  formatDateTime,
  PLATFORM_OPTIONS,
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
        placeholder: '名称 / 描述 / 配置',
      },
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: '名称',
      componentProps: {
        clearable: true,
        placeholder: '请输入名称',
      },
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
    field: 'name',
    minWidth: 220,
    slots: { default: 'nameCell' },
    title: '认证源',
  },
  {
    field: 'protocol',
    width: 110,
    formatter: ({ cellValue }) => protocolLabel(cellValue),
    title: '协议',
  },
  {
    field: 'idp',
    minWidth: 160,
    slots: { default: 'idpCell' },
    title: '身份提供商',
  },
  {
    field: 'platform',
    width: 110,
    formatter: ({ cellValue }) =>
      PLATFORM_OPTIONS.find((item) => item.value === cellValue)?.label ||
      cellValue ||
      '-',
    title: '平台',
  },
  {
    field: 'configured',
    slots: { default: 'configuredCell' },
    title: '配置状态',
    width: 110,
  },
  {
    field: 'autoCreateUser',
    formatter: YesNoOptionsFormatter,
    title: '自动建号',
    width: 100,
  },
  {
    field: 'enableSlo',
    formatter: YesNoOptionsFormatter,
    title: '单点登出',
    width: 100,
  },
  {
    cellRender: {
      attrs: {
        beforeChange: async (newStatus: number, record: any) => {
          try {
            await confirmSwitch(record.name, newStatus);
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
