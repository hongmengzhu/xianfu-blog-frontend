import type { VxeGridPropTypes } from 'vxe-table';

import type { VbenFormSchema } from '#/adapter/form';

import _XEUtils_ from 'xe-utils';

import { confirmSwitch } from '#/adapter/vxe-table';

import { categoryNameMap, moduleNameMap } from '../shared';
import { setStateEnableDisable } from './api';

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
        placeholder: '请输入名称',
        clearable: true,
      },
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: '停用', value: '2' },
          { label: '有效', value: '1' },
          { label: '弃置', value: '12' },
          { label: '取消', value: '11' },
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
    title: '名称',
    minWidth: 200,
    align: 'left',
    slots: { default: 'name' },
  },
  { field: 'no', title: '编号', width: 160 },
  {
    field: 'categoryNo',
    title: '分类',
    width: 160,
    formatter({ cellValue }) {
      return categoryNameMap.value[cellValue] || cellValue;
    },
  },
  {
    field: 'module',
    title: '模块',
    width: 150,
    formatter({ cellValue }) {
      return moduleNameMap.value[cellValue] || cellValue;
    },
  },
  { field: 'type', title: '类型', width: 120 },
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
