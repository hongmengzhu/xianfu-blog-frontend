<script lang="ts" setup>
import { computed, defineComponent, h, reactive, watch } from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';

import { usePgForm } from '#/adapter';

import { selectNodeAllPublic as selectNodeAllPublicCategory } from '../../category/api';
import { existCode, existName, saveOrUpdate } from '../api';

const emit = defineEmits(['ok']);

/** 自定义颜色快捷色板 */
const colorSwatches = [
  '#18a058',
  '#2080f0',
  '#f0a020',
  '#d03050',
  '#722ed1',
  '#909399',
];

type TagColorType =
  | 'default'
  | 'error'
  | 'info'
  | 'primary'
  | 'success'
  | 'warning';
type TagSize = 'large' | 'medium' | 'small';

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
 * 预览用颜色：naive 的 Tag 只接受 { color, textColor, borderColor } 对象
 */
const previewColor = computed(() =>
  parseColorValue(preview.color || undefined),
);

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
          fieldName: 'category',
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
              if (!values.nameShort) {
                formApi.setFieldValue('nameShort', e.target.value);
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
                  existName(values.name, values.category, values.id);
                },
              },
              () => h('span', { class: 'font-normal' }, '查重'),
            ),
        },
        {
          fieldName: 'no',
          label: '标签',
          component: 'Input',
          defaultValue: '',
          rules: 'required',
          componentProps: {
            placeholder: '请输入标签编码',
          },
          suffix: () =>
            h(
              VbenButton,
              {
                class: 'pg-button-size-small',
                onClick: async () => {
                  const values = await formApi.getValues();
                  existCode(values.no, values.category, values.id);
                },
              },
              () => h('span', { class: 'font-normal' }, '查重'),
            ),
        },
        {
          fieldName: 'nameShort',
          label: '简称',
          component: 'Input',
          componentProps: {
            placeholder: '留空则使用名称',
          },
        },
        {
          fieldName: 'typeSys',
          label: '类型',
          component: 'PgRadioGroup',
          defaultValue: 'general',
          componentProps: {
            type: 'button',
            options: [
              { label: '普通', value: 'general' },
              { label: '系统', value: 'system' },
            ],
          },
          rules: 'required',
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
            options: [
              { label: '默认', value: 'default' },
              { label: '蓝色', value: 'info' },
              { label: '绿色', value: 'success' },
              { label: '橘黄', value: 'warning' },
              { label: '红色', value: 'error' },
            ],
          },
          rules: 'required',
        },
        {
          fieldName: 'attributeColor',
          label: '自定义颜色',
          component: 'ColorPicker',
          // naive 的 ColorPicker 使用 value 绑定
          modelPropName: 'value',
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
          component: 'RadioGroup',
          componentProps: {
            options: [
              { label: '是', value: true },
              { label: '否', value: false },
            ],
          },
          rules: 'required',
        },
        {
          fieldName: 'attributeSize',
          label: '尺寸',
          defaultValue: 'medium',
          component: 'RadioGroup',
          componentProps: {
            options: [
              { label: '小', value: 'small' },
              { label: '中', value: 'medium' },
              { label: '大', value: 'large' },
            ],
          },
          rules: 'required',
        },
        {
          fieldName: 'attributeRound',
          label: '圆角',
          defaultValue: false,
          component: 'RadioGroup',
          componentProps: {
            options: [
              { label: '否', value: false },
              { label: '是', value: true },
            ],
          },
          rules: 'required',
        },
        {
          fieldName: 'attributeStrong',
          label: '粗体',
          defaultValue: false,
          component: 'RadioGroup',
          componentProps: {
            options: [
              { label: '否', value: false },
              { label: '是', value: true },
            ],
          },
          rules: 'required',
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
});
/**
 * 同步预览数据：直接订阅表单内部的响应式 values。
 * 不用 handleValuesChange，因为分组 schema 下它取不到分组内字段。
 */
const PreviewSync = defineComponent({
  name: 'TagPreviewSync',
  setup() {
    const actions = formApi.form as undefined | { useValues?: () => any };
    const values = actions?.useValues?.();
    if (values) {
      watch(values, (v: any) => syncPreview(v as Record<string, any>), {
        deep: true,
        immediate: true,
      });
    }
    return () => null;
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
      const { values, isUpdate, parent } =
        drawerApi.getData<Record<string, any>>();
      if (values && Object.keys(values).length > 0) {
        const attributeMap = values.attributeMap || {};
        formApi.setValues({
          ...values,
          category: values.categoryNo || values.category || '',
          module: values.module || '',
          no: values.no || values.code || '',
          attributeType: attributeMap.type || 'default',
          attributeColor: colorToText(attributeMap.color),
          attributeBordered:
            attributeMap.bordered === undefined ? true : attributeMap.bordered,
          attributeSize: attributeMap.size ?? 'medium',
          attributeRound: attributeMap.round ?? false,
          attributeStrong: attributeMap.strong ?? false,
        });
      } else {
        formApi.setValues({});
      }
      if (parent) {
        formApi.setFieldValue('category', parent.no || parent.value);
        if (parent.module) {
          formApi.setFieldValue('module', parent.module);
        }
      }

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
  const values = await formApi.getValues<Omit<Record<string, any>, 'id'>>();
  const {
    attributeType,
    attributeBordered,
    attributeColor,
    attributeSize,
    attributeRound,
    attributeStrong,
    module: _module,
    ...rest
  } = values;
  const payload = {
    ...rest,
    attributeMap: {
      type: attributeType,
      bordered: attributeBordered,
      color: colorToStore(attributeColor),
      size: attributeSize,
      round: attributeRound,
      strong: attributeStrong,
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

/**
 * 解析颜色：兼容纯色值、{ color, textColor } 对象、以及 JSON 字符串三种历史格式
 */
function parseColorValue(color: any): Record<string, any> | undefined {
  if (!color) {
    return undefined;
  }
  let raw = color;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) {
      return undefined;
    }
    if (trimmed.startsWith('{')) {
      try {
        raw = JSON.parse(trimmed);
      } catch {
        return undefined;
      }
    } else {
      return {
        color: trimmed,
        textColor: contrastTextColor(trimmed),
      };
    }
  }
  if (typeof raw === 'object') {
    const background = raw.color;
    if (!background) {
      return undefined;
    }
    return {
      borderColor: raw.borderColor,
      color: background,
      textColor: raw.textColor ?? contrastTextColor(background),
    };
  }
  return undefined;
}

/**
 * 根据背景色计算可读的文本颜色
 */
function contrastTextColor(color: string): string {
  const hex = String(color).replace('#', '');
  if (![3, 4, 6, 8].includes(hex.length)) {
    return '#ffffff';
  }
  const full =
    hex.length <= 4
      ? hex
          .split('')
          .map((c) => c + c)
          .join('')
      : hex;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return '#ffffff';
  }
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.6 ? '#000000' : '#ffffff';
}

/**
 * 取表单中的自定义颜色（纯色值），供 ColorPicker 使用
 */
function colorToText(color: any): string {
  return parseColorValue(color)?.color || '';
}

/**
 * 表单颜色 -> 存储颜色（沿用 relation 标签的约定：JSON 字符串）
 */
function colorToStore(color: string): string {
  if (!color) {
    return '';
  }
  return JSON.stringify({
    color,
    textColor: contrastTextColor(color),
  });
}
</script>
<template>
  <Drawer>
    <Form>
      <template #attributePreview>
        <div class="flex flex-wrap items-center gap-3">
          <PreviewSync />
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
                ? `自定义颜色 ${preview.color} 会覆盖颜色类型`
                : '当前使用颜色类型对应的默认配色'
            }}
          </span>
        </div>
      </template>
    </Form>
  </Drawer>
</template>
