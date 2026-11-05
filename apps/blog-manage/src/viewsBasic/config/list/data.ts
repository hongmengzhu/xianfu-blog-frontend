import type { VbenFormSchema } from '#/adapter/form';

import _XEUtils_ from 'xe-utils';

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
      component: 'Input',
      fieldName: 'code',
      label: '码值',
      componentProps: {
        placeholder: '请输入码值',
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

export const columns: any[] = [
  { type: 'checkbox', width: 60 },
  { field: 'no', title: '编号', width: 170 },
  { field: 'name', title: '名称', minWidth: 160 },
  { field: 'code', title: '码值', width: 150 },
  { field: 'nameFl', title: '名称外文', width: 150, visible: false },
  { field: 'nameFull', title: '全称', width: 160, visible: false },
  { field: 'eventNo', title: '事件编号', width: 180 },
  { field: 'field', title: '字段名称', width: 150 },
  { field: 'fieldPath', title: '路径字段', width: 150, visible: false },
  { field: 'typeDomain', title: '域类型', width: 110 },
  {
    field: 'show',
    title: '显示',
    width: 90,
    formatter: ({ cellValue }: any) =>
      Number(cellValue) === 1 ? '显示' : '隐藏',
  },
  {
    field: 'content',
    title: '内容',
    minWidth: 200,
    visible: false,
  },
  {
    field: 'state',
    title: '状态',
    width: 90,
    formatter: ({ cellValue }: any) =>
      Number(cellValue) === 1 ? '有效' : '停用',
  },
  {
    field: 'createAt',
    title: '创建时间',
    width: 170,
    visible: false,
    formatter({ cellValue }: any) {
      return _XEUtils_.toDateString(cellValue, 'yyyy-MM-dd HH:mm:ss');
    },
  },
  {
    title: '操作',
    width: 150,
    fixed: 'right',
    slots: { default: 'operate' },
  },
];
