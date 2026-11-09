import type { VxeGridPropTypes } from 'vxe-table';

import type { VbenFormSchema } from '#/adapter/form';

import { confirmSwitch } from '#/adapter/vxe-table';

import {
  formatDateTime,
  platformLabel,
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
        placeholder: '名称 / 全称 / 描述',
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
      component: 'Input',
      fieldName: 'code',
      label: '类型标志',
      componentProps: {
        clearable: true,
        placeholder: '如 GitHub / Custom',
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
    title: '身份提供商',
  },
  { field: 'code', minWidth: 130, title: '类型标志' },
  {
    field: 'protocol',
    width: 120,
    formatter: ({ cellValue }) => protocolLabel(cellValue),
    title: '协议',
  },
  {
    field: 'platform',
    width: 110,
    formatter: ({ cellValue }) => platformLabel(cellValue),
    title: '平台',
  },
  { field: 'sort', width: 80, title: '排序' },
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
