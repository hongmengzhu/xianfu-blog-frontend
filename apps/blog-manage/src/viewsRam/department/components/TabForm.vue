<script lang="ts" setup>
import { computed, h, onMounted, watch } from 'vue';

import { VbenButton } from '@vben/common-ui';

import { PgTreeSelect } from '@pg/components-n';

import { usePgForm } from '#/adapter';

import { existName, saveOrUpdate, selectNodeAllPublic } from '../api';

const props = defineProps({
  data: {
    type: Object as PropType<Recordable<any>>,
    // eslint-disable-next-line vue/require-valid-default-prop
    default: {},
  },
  isUpdate: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['ok']);

const getValue = computed(() => {
  return props.data.data;
});

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
          fieldName: 'parentId',
          label: '上级',
          component: 'TreeSelect',
          defaultValue: '3',
        },
        {
          fieldName: 'name',
          label: '名称',
          component: 'Input',
          rules: 'required',
          componentProps: {
            placeholder: '请输入',
            onBlur: async (e) => {
              const values = await formApi.getValues();
              if (!values.nameFull) {
                formApi.setFieldValue('nameFull', e.target.value);
              }
            },
          },
          suffix: () =>
            h(
              VbenButton,
              {
                onClick: async (e) => {
                  const values = await formApi.getValues();
                  existName(values.name, values.id);
                },
              },
              () => h('span', { class: 'font-normal' }, '查重'),
            ),
        },
        {
          fieldName: 'code',
          label: '编码',
          component: 'Input',
          componentProps: {
            placeholder: '请输入',
            onBlur: async (e) => {
              const values = await formApi.getValues();
              if (!values.nameFl) {
                formApi.setFieldValue('nameFl', e.target.value);
              }
            },
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
  handleSubmit: onSubmit,
  showDefaultActions: true,
});

// 解决第一次 赋值
setTimeout(() => {
  formApi.setValues({
    ...getValue.value,
  });
}, 500);

watch(
  () => props.data,
  () => {
    formApi.setValues({
      ...getValue.value,
    });
  },
  { deep: true },
);
/**
 * 提交
 */
function onSubmit(values: Record<string, any>) {
  try {
    // console.log('values', values);
    saveOrUpdate(values, props.isUpdate).then((d) => {
      setTimeout(() => {
        emit('ok', values);
      }, 500);
    });
  } catch (error) {
    console.error(error);
  }
}

onMounted(() => {
  formApi.setValues(getValue.value);
  // formApi.setValues({name:"sssss"});
  // console.log('getValues',formApi.getValues())
  // console.log('ddd',getValue.value)
});
</script>
<template>
  <Form>
    <template #parentId="slotProps">
      <PgTreeSelect
        :api="selectNodeAllPublic"
        :convert-node="true"
        v-bind="slotProps.componentProps"
        class="w-full"
      />
    </template>
  </Form>
</template>
