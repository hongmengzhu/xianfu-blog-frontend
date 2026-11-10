<script lang="ts" setup>
import { computed, h, reactive } from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';

import { usePgForm } from '#/adapter';

import { selectNodeAllPublic as selectNodeAllPublicCategory } from '../../category/api';
import { existCode, existName, saveOrUpdate } from '../api';

type TagColorType =
  | 'default'
  | 'error'
  | 'info'
  | 'primary'
  | 'success'
  | 'warning';
type TagSize = 'large' | 'medium' | 'small';

const emit = defineEmits(['ok']);

/** 快速颜色类型选项，对应 naive-ui Tag 的 type */
const colorTypeOptions = [
  { label: '默认', value: 'default' },
  { label: '蓝色', value: 'info' },
  { label: '绿色', value: 'success' },
  { label: '橘黄', value: 'warning' },
  { label: '红色', value: 'error' },
];

/** 自定义颜色快捷色板 */
const colorSwatches = [
  '#18a058',
  '#2080f0',
  '#f0a020',
  '#d03050',
  '#722ed1',
  '#909399',
];

/** 显示效果预览数据（随表单值实时更新） */
const preview = reactive({
  name: '',
  type: 'default' as TagColorType,
  bordered: true,
  color: '',
  size: 'medium' as TagSize,
  strong: false,
  round: false,
});

const previewType = computed<TagColorType>(() => preview.type || 'default');
const previewSize = computed<TagSize>(() => preview.size ?? 'medium');

/**
 * 自定义颜色兼容历史数据：可能是纯色值，也可能是 {"color": "...", "textColor": "..."} 的 JSON 字符串
 */
const previewColor = computed(() => {
  const color: any = preview.color;
  if (!color) {
    return undefined;
  }
  if (typeof color === 'object') {
    return color;
  }
  if (typeof color === 'string' && color.trim().startsWith('{')) {
    try {
      return JSON.parse(color);
    } catch {
      return color;
    }
  }
  return color;
});

/**
 * 取表单中的自定义颜色（字符串形式），供 ColorPicker 使用
 */
function colorToText(color: any): string {
  if (!color) {
    return '';
  }
  if (typeof color === 'string') {
    return color;
  }
  if (typeof color === 'object') {
    return color.color || '';
  }
  return '';
}

/**
 * 表单值 -> 预览数据
 */
function syncPreview(values: Record<string, any> = {}) {
  preview.name = values.name || '';
  preview.type = (values.attributeType || 'default') as TagColorType;
  preview.bordered = values.attributeBordered ?? true;
  preview.color = colorToText(values.attributeColor);
  preview.size = (values.attributeSize || 'medium') as TagSize;
  preview.strong = values.attributeStrong ?? false;
  preview.round = values.attributeRound ?? false;
}

const [Form, formApi] = usePgForm({
  // 通过 schema 的 type: 'group' 把字段组织成可折叠的分组，分组默认展开
  schema: [
    {
      type: 'group',
      name: 'home',
      title: '基本',
      defaultCollapsed: false,
      children: [
        {
          fieldName: 'categoryNo',
          label: '分类',
          component: 'PgTreeSelect',
          componentProps: {
            api: selectNodeAllPublicCategory,
            params: {},
            props: {
              placeholder: '请选择分类',
              filterable: true,
            },
            // 选择分类后，自动带出分类所属的模块
            onOk: (e: any) => {
              const moduleNo =
                e?.option?.data?.extend?.module ??
                e?.option?.data?.module ??
                e?.option?.extend?.module ??
                '';
              formApi.setFieldValue('module', moduleNo);
            },
          },
          rules: 'required',
        },
        {
          fieldName: 'module',
          label: '模块',
          component: 'Input',
          componentProps: {
            disabled: true,
            placeholder: '由分类自动带出',
          },
        },
        {
          fieldName: 'name',
          label: '名称',
          component: 'Input',
          defaultValue: '',
          rules: 'required',
          componentProps: {
            placeholder: '请输入',
            onBlur: async (e) => {
              const values = await formApi.getValues();
              if (!values.nameFull) {
                formApi.setFieldValue('nameFull', e.target.value);
              }
              if (!values.nameFl) {
                formApi.setFieldValue('nameFl', e.target.value);
              }
            },
          },
          suffix: () =>
            h(
              VbenButton,
              {
                class: 'pg-button-size-small',
                onClick: async () => {
                  const values = await formApi.getValues();
                  existName(values.name, values.id);
                },
              },
              () => h('span', { class: 'font-normal' }, '查重'),
            ),
        },
        {
          fieldName: 'code',
          label: '标识',
          defaultValue: '',
          component: 'Input',
          componentProps: {
            placeholder: '留空则系统自动生成',
          },
          suffix: () =>
            h(
              VbenButton,
              {
                class: 'pg-button-size-small',
                onClick: async () => {
                  const values = await formApi.getValues();
                  existCode(values.code, values.id);
                },
              },
              () => h('span', { class: 'font-normal' }, '查重'),
            ),
        },
        {
          fieldName: 'type',
          label: '类型',
          defaultValue: 'default',
          component: 'Input',
          rules: 'required',
          componentProps: {
            placeholder: '请输入类型',
          },
        },
        {
          fieldName: 'description',
          label: '描述',
          component: 'Textarea',
          componentProps: {
            type: 'textarea',
            placeholder: '描述',
          },
        },
      ],
    },
    {
      type: 'group',
      name: 'attribute',
      title: '显示属性',
      defaultCollapsed: false,
      children: [
        {
          // 纯展示行，配合下方 template #attributePreview 插槽渲染标签效果
          fieldName: 'attributePreview',
          label: '显示效果',
          component: 'Divider',
        },
        {
          fieldName: 'attributeType',
          label: '颜色类型',
          defaultValue: 'default',
          component: 'PgRadioGroup',
          componentProps: {
            type: 'button',
            options: colorTypeOptions,
          },
          rules: 'required',
        },
        {
          fieldName: 'attributeColor',
          label: '自定义颜色',
          component: 'ColorPicker',
          componentProps: {
            modes: ['hex'],
            showAlpha: false,
            actions: ['clear'],
            swatches: colorSwatches,
          },
          help: '自定义颜色优先于颜色类型',
          suffix: () =>
            h(
              VbenButton,
              {
                class: 'pg-button-size-small',
                disabled: !preview.color,
                onClick: () => {
                  formApi.setFieldValue('attributeColor', '');
                },
              },
              () => h('span', { class: 'font-normal' }, '清除'),
            ),
        },
        {
          fieldName: 'attributeBordered',
          label: '边框',
          defaultValue: true,
          component: 'Switch',
          componentProps: {
            size: 'small',
          },
        },
        {
          fieldName: 'attributeSize',
          label: '尺寸',
          defaultValue: 'medium',
          component: 'PgRadioGroup',
          componentProps: {
            type: 'button',
            options: [
              { label: '小', value: 'small' },
              { label: '中', value: 'medium' },
              { label: '大', value: 'large' },
            ],
          },
          rules: 'required',
        },
        {
          fieldName: 'attributeStrong',
          label: '粗体',
          defaultValue: false,
          component: 'Switch',
          componentProps: {
            size: 'small',
          },
        },
        {
          fieldName: 'attributeRound',
          label: '圆角',
          defaultValue: false,
          component: 'Switch',
          componentProps: {
            size: 'small',
          },
        },
      ],
    },
    {
      type: 'group',
      name: 'other',
      title: '其他',
      defaultCollapsed: false,
      children: [
        {
          fieldName: 'nameFl',
          label: '名称英文',
          component: 'Input',
          defaultValue: '',
          componentProps: {
            placeholder: '请输入',
          },
        },
        {
          fieldName: 'nameFull',
          label: '全称',
          component: 'Input',
        },
      ],
    },
    {
      fieldName: 'id',
      label: 'id',
      component: 'Input',
      componentProps: {},
      dependencies: {
        show: false,
        // 随意一个字段改变时，都会触发
        triggerFields: ['description'],
      },
    },
  ],
  showDefaultActions: false,
  // 任意字段变化时同步刷新显示效果
  handleValuesChange: (values) => {
    syncPreview(values as Record<string, any>);
  },
});

const [Drawer, drawerApi] = useVbenDrawer({
  onCancel() {
    drawerApi.close();
  },
  onConfirm: onSubmit,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      drawerApi.setState({
        loading: true,
        confirmLoading: false,
        closeOnClickModal: false, // 点击遮罩关闭弹窗
        destroyOnClose: true, // 关闭时销毁
      });
      const { values, isUpdate } = drawerApi.getData<Record<string, any>>();
      const attributeMap = (values?.attributeMap ?? {}) as Record<string, any>;
      const patch =
        values && Object.keys(values).length > 0
          ? {
              ...values,
              attributeType: attributeMap.type ?? 'default',
              attributeBordered: attributeMap.bordered ?? true,
              attributeColor: colorToText(attributeMap.color),
              attributeSize: attributeMap.size ?? 'medium',
              attributeStrong: attributeMap.strong ?? false,
              attributeRound: attributeMap.round ?? false,
            }
          : {};
      // 设置表单值后再刷新一次预览，保证首次打开也能显示效果
      Promise.resolve(formApi.setValues(patch)).then(async () => {
        syncPreview(await formApi.getValues());
      });
      drawerApi.setState({
        title: `标签：${isUpdate ? '编辑' : '新增'}`,
        loading: false,
      });
    }
  },
  title: '：',
});

/**
 * 提交
 */
async function onSubmit() {
  const { valid } = await formApi.validate();
  if (!valid) {
    return false;
  }
  const values = await formApi.getValues<Record<string, any>>();
  const {
    attributeType,
    attributeBordered,
    attributeColor,
    attributeSize,
    attributeStrong,
    attributeRound,
    attributePreview: _preview,
    ...rest
  } = values;
  // 后端 CreateUpdateCt.AttributeMap 为 AttributeVo 结构
  const payload = {
    ...rest,
    attributeMap: {
      type: attributeType || 'default',
      bordered: attributeBordered ?? true,
      color: attributeColor || '',
      size: attributeSize || 'medium',
      strong: attributeStrong ?? false,
      round: attributeRound ?? false,
    },
  };
  drawerApi.lock();
  try {
    drawerApi.setState({ loading: true, confirmLoading: true });
    const { isUpdate } = drawerApi.getData<Record<string, any>>();
    await saveOrUpdate(payload, isUpdate);
    emit('ok', payload);
    drawerApi.close();
  } catch (error) {
    console.error(error);
  } finally {
    drawerApi.unlock();
    drawerApi.setState({ loading: false, confirmLoading: false });
  }
}
</script>
<template>
  <Drawer>
    <Form>
      <template #attributePreview>
        <div class="flex flex-wrap items-center gap-3">
          <n-tag
            :bordered="preview.bordered"
            :color="previewColor"
            :round="preview.round"
            :size="previewSize"
            :strong="preview.strong"
            :type="previewType"
          >
            {{ preview.name || '标签预览' }}
          </n-tag>
          <span class="text-xs text-gray-400">
            {{
              preview.color
                ? '自定义颜色会覆盖颜色类型'
                : '当前使用颜色类型对应的默认配色'
            }}
          </span>
        </div>
      </template>
    </Form>
  </Drawer>
</template>
