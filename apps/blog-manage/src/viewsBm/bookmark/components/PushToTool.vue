<script lang="ts" setup>
import { h, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { FluentWindowNew20Filled } from '@pg/icons';
import { NTag } from 'naive-ui';

import { dialog, message, usePgForm } from '#/adapter';
import { selectNodeAllPublic as selectNodeAllPublicModule } from '#/viewsBasic/module/api';
import ModalTagTpl from '#/viewsBasic/tags/relation/invoke/ModalTag.vue';
import { selectNodeAllPublic as selectNodeAllPublicToolCategory } from '#/viewsBm/toolCategory/api';

import { pushToTool } from '../api';

const emit = defineEmits(['ok']);

/** 已选标签的显示数据 */
const tagOptions = ref<Record<string, any>[]>([]);

/** 标签选择弹窗 */
const [ModalTag, modalTagApi] = useVbenModal({
  connectedComponent: ModalTagTpl,
  destroyOnClose: true,
});

/**
 * 颜色兼容对象 / JSON 字符串 / 纯色值
 */
function tagColorValue(color: any) {
  if (!color) {
    return undefined;
  }
  if (typeof color === 'string') {
    const trimmed = color.trim();
    if (!trimmed) {
      return undefined;
    }
    if (trimmed.startsWith('{')) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return undefined;
      }
    }
    return { color: trimmed };
  }
  if (typeof color === 'object' && Object.keys(color).length > 0) {
    return color;
  }
  return undefined;
}

/**
 * 标签渲染：已选标签按标签自身的显示属性渲染
 */
function renderTag({ option, handleClose }: any) {
  const attributeMap = option?.data?.attributeMap || {};
  return h(
    NTag,
    {
      bordered: attributeMap.bordered ?? true,
      closable: true,
      color: tagColorValue(attributeMap.color),
      round: attributeMap.round ?? false,
      size: attributeMap.size ?? 'medium',
      strong: attributeMap.strong ?? false,
      type: attributeMap.type || 'default',
      onClose: handleClose,
    },
    { default: () => option?.label },
  );
}

/**
 * 标签弹窗选择结果 -> 表单标签
 */
async function modalOkTags(result: any[]) {
  if (!result || result.length === 0) {
    return;
  }
  const values = await formApi.getValues();
  const tags: string[] = [...(values.tags || [])];
  result.forEach((item: any) => {
    const code = item?.tagNo || item?.code || item?.no;
    if (!code) {
      return;
    }
    if (!tags.includes(code)) {
      tags.push(code);
    }
    if (!tagOptions.value.some((opt) => opt.value === code)) {
      tagOptions.value.push({
        data: item,
        label: item.name || code,
        value: code,
      });
    }
  });
  formApi.setFieldValue('tags', tags);
}

const [Form, formApi] = usePgForm({
  schema: [
    {
      fieldName: 'module',
      label: '模块',
      component: 'ApiSelect',
      componentProps: {
        api: selectNodeAllPublicModule,
        params: {},
        labelField: 'label',
        valueField: 'value',
        clearable: true,
        filterable: true,
        placeholder: '默认取分类所属模块',
      },
    },
    {
      fieldName: 'categoryNo',
      label: '目的分类',
      component: 'PgTreeSelect',
      componentProps: {
        api: selectNodeAllPublicToolCategory,
        params: { by: 'no' },
        filterQueryAsync: true,
        props: {
          placeholder: '请选择目的分类',
          filterable: true,
        },
      },
      rules: 'required',
    },
    {
      fieldName: 'tags',
      label: '目的标签',
      defaultValue: [],
      component: '',
    },
  ],
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  onConfirm: onSubmit,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = (modalApi.getData() || {}) as Record<string, any>;
      const ids = data.ids || [];
      modalApi.setState({
        loading: false,
        confirmLoading: false,
        closeOnClickModal: false,
        destroyOnClose: true,
        title: `推送到工具模块（${ids.length} 条）`,
      });
      tagOptions.value = [];
      formApi.setValues({});
    }
  },
  title: '推送到工具模块',
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
  const data = (modalApi.getData() || {}) as Record<string, any>;
  const ids: any[] = data.ids || [];
  if (ids.length === 0) {
    message.warning('你没有选择任何数据');
    return false;
  }
  modalApi.lock();
  try {
    modalApi.setState({ loading: true, confirmLoading: true });
    const result: any = await pushToTool({
      ids: ids.map(String),
      module: values.module || '',
      categoryNo: values.categoryNo,
      tags: values.tags || [],
    });
    const success = result?.success ?? 0;
    const skipped = result?.skipped ?? 0;
    const failed = result?.failed ?? 0;
    const errors: string[] = result?.errors || [];
    if (failed > 0) {
      dialog.warning({
        title: '推送结果',
        content: `成功 ${success} 条，跳过 ${skipped} 条，失败 ${failed} 条。${
          errors.length > 0 ? errors.slice(0, 5).join('；') : ''
        }`,
        positiveText: '知道了',
      });
    } else if (success === 0 && skipped > 0) {
      message.warning(`没有新增数据，${skipped} 条书签已存在于工具模块`);
    } else {
      message.success(
        `推送成功 ${success} 条${skipped > 0 ? `，跳过 ${skipped} 条` : ''}`,
      );
    }
    emit('ok', result);
    modalApi.close();
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.unlock();
    modalApi.setState({ loading: false, confirmLoading: false });
  }
}
</script>
<template>
  <Modal class="w-[560px]">
    <Form>
      <template #tags="{ modelValue }">
        <n-select
          multiple
          filterable
          tag
          clearable
          :show="false"
          :options="tagOptions"
          :render-tag="renderTag"
          :value="modelValue ?? []"
          placeholder="点击右侧图标选择标签，也可直接输入"
          @update:value="(value: any[]) => formApi.setFieldValue('tags', value)"
        >
          <template #arrow>
            <FluentWindowNew20Filled
              class="cursor-pointer"
              style="width: 20px; height: 20px"
              @click.stop="modalTagApi.open()"
            />
          </template>
        </n-select>
      </template>
    </Form>
    <ModalTag @ok="modalOkTags" />
  </Modal>
</template>
