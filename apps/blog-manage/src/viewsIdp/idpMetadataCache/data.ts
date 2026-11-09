import type { VxeGridPropTypes } from 'vxe-table';

import type { VbenFormSchema } from '#/adapter/form';

import { confirmSwitch } from '#/adapter/vxe-table';

import { selectPublic as providerSelectPublic } from '../identityProvider/api';
import { selectPublic as sourceSelectPublic } from '../identitySource/api';
import {
  formatDateTime,
  META_FORMAT_OPTIONS,
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
        placeholder: 'EntityID / 元数据地址',
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
      fieldName: 'idpNo',
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
    field: 'entityId',
    minWidth: 300,
    slots: { default: 'entityCell' },
    title: 'EntityID / Issuer',
  },
  {
    field: 'protocol',
    formatter: ({ cellValue }) => protocolLabel(cellValue),
    title: '协议',
    width: 100,
  },
  {
    field: 'sourceNo',
    minWidth: 180,
    slots: { default: 'sourceCell' },
    title: '认证源',
  },
  {
    field: 'idpNo',
    minWidth: 160,
    slots: { default: 'idpCell' },
    title: '身份提供商',
  },
  {
    field: 'metaFormat',
    formatter: ({ cellValue }) =>
      META_FORMAT_OPTIONS.find((item) => item.value === cellValue)?.label ??
      cellValue ??
      '-',
    title: '格式',
    width: 120,
  },
  {
    field: 'cacheTtl',
    formatter: ({ cellValue }) => `${cellValue ?? 0} 秒`,
    title: '缓存TTL',
    width: 110,
  },
  {
    field: 'lastFetchAt',
    formatter: ({ cellValue }) => formatDateTime(cellValue),
    title: '上次拉取',
    width: 170,
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
            await confirmSwitch(record.entityId || record.id, newStatus);
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
    field: 'right',
    fixed: 'right',
    slots: { default: 'operate' },
    title: '操作',
    width: 140,
  },
];
