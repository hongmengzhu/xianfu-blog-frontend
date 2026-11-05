import type { VbenFormSchema } from '#/adapter/form';

import _XEUtils_ from 'xe-utils';

import { categoryOptions, modelOptions, setStateEnableDisable } from './api';

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
        placeholder: '名称/字段/描述',
        clearable: true,
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'model',
      label: '模型',
      componentProps: {
        api: modelOptions,
        filterable: true,
        clearable: true,
        placeholder: '请选择模型',
      },
    },
    {
      component: 'Input',
      fieldName: 'field',
      label: '字段标识',
      componentProps: {
        placeholder: '请输入字段标识',
        clearable: true,
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'categoryNo',
      label: '配置分类',
      componentProps: {
        api: categoryOptions,
        filterable: true,
        clearable: true,
        placeholder: '请选择配置分类',
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

/** 配置值：二进制字段取 valueBinary，其余取 value */
export function displayConfigValue(row: any) {
  if (!row) {
    return '';
  }
  if (Number(row.binary) === 1) {
    return row.valueBinary || '';
  }
  return row.value ?? '';
}

export const columns: any[] = [
  { type: 'checkbox', width: 60 },
  { field: 'name', title: '名称', minWidth: 150 },
  { field: 'model', title: '模型', width: 160 },
  { field: 'field', title: '字段标识', width: 150 },
  {
    field: 'value',
    title: '配置值',
    minWidth: 180,
    formatter: ({ row }: any) => displayConfigValue(row),
  },
  { field: 'fieldPath', title: '字段路径', width: 140 },
  { field: 'categoryNo', title: '配置分类', width: 120 },
  {
    field: 'show',
    title: '显示',
    width: 80,
    formatter: ({ cellValue }: any) =>
      Number(cellValue) === 1 ? '显示' : '隐藏',
  },
  { field: 'sort', title: '排序', width: 80 },
  {
    field: 'state',
    title: '状态',
    width: 100,
    cellRender: {
      name: 'PgState',
      events: {
        click: ($table, record, e) => {
          const sourceValue = record.state;
          const newStatus = e.value === 1 ? 1 : 2;
          setStateEnableDisable(record.id, newStatus)
            .then(() => {
              record.state = newStatus;
              if ($table) {
                $table.isUpdateByRow(record);
              }
            })
            .catch(() => {
              record.state = sourceValue;
              if ($table) {
                $table.isUpdateByRow(record);
              }
            });
        },
      },
    },
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
