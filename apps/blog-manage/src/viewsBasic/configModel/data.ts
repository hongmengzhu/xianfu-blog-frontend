import type { VbenFormSchema as FormSchema } from '#/adapter/form';

import { h } from 'vue';

import { VbenButton } from '@vben/common-ui';

import { NTag } from 'naive-ui';
import _XEUtils_ from 'xe-utils';

import { z } from '#/adapter/form';
import { selectNodeAllPublic as selectNodeAllPublicModule } from '#/viewsBasic/module/api';

import { configCategoryNodes, setStateEnableDisable } from './api';

/**
 * 搜索表单 Schema
 */
export function useGridFormSchema(): FormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'wd',
      label: '关键词',
      componentProps: {
        placeholder: '模型名称',
        clearable: true,
      },
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: '普通', value: 'general' },
          { label: '系统', value: 'system' },
        ],
      },
      fieldName: 'typeSys',
      label: '系统类型',
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
  { field: 'name', title: '名称', minWidth: 160 },
  { field: 'model', title: '模型标识', width: 180 },
  {
    field: 'typeSys',
    title: '系统类型',
    width: 110,
    formatter: ({ cellValue }: any) => {
      return cellValue === 'system' ? '系统' : '普通';
    },
  },
  { field: 'moduleSub', title: '子模块编号', width: 150 },
  { field: 'description', title: '描述', minWidth: 200 },
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
    formatter({ cellValue }: any) {
      return _XEUtils_.toDateString(cellValue, 'yyyy-MM-dd HH:mm:ss');
    },
  },
  {
    title: '操作',
    width: 180,
    fixed: 'right',
    slots: { default: 'operate' },
  },
];

interface HeaderFormActions {
  onExistModel?: () => void;
  onExistName?: () => void;
  onReload?: () => void;
}

/**
 * 设计器表头表单（模型头）
 */
export function buildHeaderFormSchema(
  actions: HeaderFormActions = {},
): FormSchema[] {
  const suffixButton = (label: string, onClick: () => void) =>
    h(
      VbenButton,
      {
        class: 'pg-button-size-small',
        onClick,
      },
      () => h('span', { class: 'font-normal' }, label),
    );

  return [
    {
      fieldName: 'name',
      label: '模型名称',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入模型中文名称',
      },
      suffix: () => suffixButton('查重', () => actions.onExistName?.()),
    },
    {
      fieldName: 'model',
      label: '模型标识',
      component: 'Input',
      componentProps: {
        placeholder: '租户内唯一英文标识',
      },
      rules: z
        .string()
        .min(1, { message: '模型标识必填' })
        .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, {
          message: '仅包含大小写字母、下划线、数字，首字符必须是英文字母',
        }),
      descriptionPg: () =>
        h(
          NTag,
          { type: 'info', size: 'small', bordered: false },
          '租户内唯一；仅字母/数字/下划线，首字符为字母',
        ),
      suffix: () => suffixButton('查重', () => actions.onExistModel?.()),
    },
    {
      fieldName: 'table',
      label: '数据库表',
      component: 'Input',
      componentProps: {
        placeholder: '对应数据库表名',
      },
      rules: z
        .string()
        .min(1, { message: '表名必填' })
        .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, {
          message: '表名仅包含字母、下划线、数字，首字符必须是英文字母',
        }),
    },
    {
      fieldName: 'typeSys',
      label: '系统类型',
      component: 'Select',
      defaultValue: 'general',
      componentProps: {
        options: [
          { label: '普通', value: 'general' },
          { label: '系统', value: 'system' },
        ],
      },
      rules: 'required',
    },
    {
      fieldName: 'modelCategory',
      label: '模型种类',
      component: 'Select',
      defaultValue: 'config',
      componentProps: {
        options: [
          { label: '库表模型', value: 'table' },
          { label: '配置模型', value: 'config' },
        ],
      },
      rules: 'required',
      descriptionPg: () =>
        h(
          NTag,
          { type: 'info', size: 'small', bordered: false },
          'config=配置模型（自动生成配置行）；table=库表模型',
        ),
    },
    {
      fieldName: 'moduleSub',
      label: '子模块',
      component: 'PgTreeSelect',
      componentProps: {
        api: selectNodeAllPublicModule,
        params: {},
        props: {
          filterable: true,
          placeholder: '请选择所属子模块',
        },
      },
      rules: 'required',
    },
    {
      fieldName: 'category',
      label: '配置分类',
      component: 'PgTreeSelect',
      defaultValue: 'config',
      componentProps: {
        api: configCategoryNodes,
        params: {},
        props: {
          filterable: true,
          clearable: true,
          placeholder: '为空时默认 config',
        },
      },
      descriptionPg: () =>
        h(
          NTag,
          { type: 'info', size: 'small', bordered: false },
          '写入自动生成的配置行 category_no，为空时默认 config',
        ),
    },
    {
      fieldName: 'categoryTab',
      label: '分类选项卡',
      component: 'Input',
      componentProps: {
        placeholder: '配置页面选项卡标识，如 basic',
      },
    },
    {
      fieldName: 'tags',
      label: '标签',
      component: 'NDynamicTags',
      defaultValue: [],
      componentProps: {
        defaultValue: [],
      },
    },
    {
      fieldName: 'description',
      label: '描述',
      component: 'Textarea',
      componentProps: {
        type: 'textarea',
        placeholder: '请输入描述',
        autosize: { minRows: 2, maxRows: 4 },
      },
    },
    {
      fieldName: 'id',
      label: 'ID',
      defaultValue: '0',
      component: 'Input',
      dependencies: {
        show: false,
        triggerFields: ['description'],
      },
    },
  ];
}

/** 设计器字段表格列（只读展示，编辑通过弹窗） */
export const fieldColumns: any[] = [
  { type: 'seq', title: '序号', width: 60 },
  { field: 'name', title: '字段名称', minWidth: 140 },
  { field: 'field', title: '字段标识', minWidth: 140 },
  { field: 'fieldPath', title: '字段路径', minWidth: 130 },
  { field: 'valueType', title: '值类型', width: 110 },
  { field: 'formCode', title: '表单控件', width: 140 },
  { field: 'defaultValue', title: '默认值', minWidth: 110 },
  {
    field: 'show',
    title: '显示',
    width: 80,
    formatter: ({ cellValue }: any) =>
      Number(cellValue) === 1 ? '显示' : '隐藏',
  },
  {
    field: 'binary',
    title: '二进制',
    width: 80,
    formatter: ({ cellValue }: any) => (Number(cellValue) === 1 ? '是' : '否'),
  },
  { field: 'sort', title: '排序', width: 80 },
  {
    field: 'ruleItems',
    title: '规则数',
    width: 90,
    formatter: ({ row }: any) => `${(row?.ruleItems || []).length} 条`,
  },
  {
    title: '操作',
    width: 170,
    fixed: 'right',
    slots: { default: 'operate' },
  },
];
