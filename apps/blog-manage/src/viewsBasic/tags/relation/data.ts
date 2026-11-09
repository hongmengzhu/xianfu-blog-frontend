import type { VxeGridPropTypes } from 'vxe-table';

import type { VbenFormSchema } from '#/adapter/form';

import _XEUtils_ from 'xe-utils';

import { confirmSwitch } from '#/adapter/vxe-table';

import { categoryNameMap, moduleNameMap } from '../shared';
import { setStateEnableDisable } from './api';

/**
 * 类型：普通 / 系统 / api
 */
export const typeSysOptions = [
  { label: '普通', value: 'general' },
  { label: '系统', value: 'system' },
  { label: 'api', value: 'api' },
];

/**
 * 搜索表单 Schema
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'wd',
      label: '关键词',
      componentProps: {
        placeholder: '名称 / 编码 / 简称 / 全称',
        clearable: true,
      },
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: '有效', value: '1' },
          { label: '停用', value: '2' },
          { label: '取消', value: '11' },
          { label: '弃置', value: '12' },
        ],
      },
      fieldName: 'state',
      label: '状态',
    },
  ];
}

/**
 * 表格列配置
 */
export const columns: VxeGridPropTypes.Columns = [
  { type: 'checkbox', width: 34 },
  {
    field: 'name',
    title: '标签',
    minWidth: 180,
    align: 'left',
    slots: { default: 'tags' },
  },
  { field: 'code', title: '编码', width: 160 },
  { field: 'nameFull', title: '全称', minWidth: 160, visible: false },
  { field: 'nameShort', title: '简称', width: 120, visible: false },
  {
    field: 'module',
    title: '模块',
    width: 150,
    formatter({ cellValue }) {
      return moduleNameMap.value[cellValue] || cellValue;
    },
  },
  {
    field: 'categoryNo',
    title: '分类',
    width: 160,
    formatter({ cellValue }) {
      return categoryNameMap.value[cellValue] || cellValue;
    },
  },
  {
    field: 'typeSys',
    title: '类型',
    width: 90,
    formatter({ cellValue }) {
      return (
        typeSysOptions.find((item) => item.value === cellValue)?.label ||
        cellValue
      );
    },
  },
  {
    field: 'state',
    title: '状态',
    width: 90,
    cellRender: {
      name: 'CellSwitchPg',
      attrs: {
        beforeChange: async (newStatus: number, record: any) => {
          try {
            await confirmSwitch(record.name, newStatus);
            await setStateEnableDisable(record.id, newStatus);
            return true;
          } catch {
            return false;
          }
        },
      },
    },
  },
  {
    field: 'createAt',
    title: '创建时间',
    width: 160,
    visible: false,
    formatter({ cellValue }) {
      return _XEUtils_.toDateString(cellValue, 'yyyy-MM-dd HH:mm');
    },
  },
  { title: '操作', width: 160, field: 'right', slots: { default: 'operate' } },
];
