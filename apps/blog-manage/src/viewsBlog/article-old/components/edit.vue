<script lang="ts" setup>
import { h, ref } from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';

import {
  PgMarkdown,
  PgUploadGroup,
} from '@pg/components-n';

import { usePgForm } from '#/adapter';
const emit = defineEmits(['ok']);
const { uploadUrl } = useAppConfig(import.meta.env, import.meta.env.PROD);
const accessStore = useAccessStore();
import { useAppConfig } from '@vben/hooks';
import { useAccessStore } from '@vben/stores';

import { stateYesNoOption } from '@pg/types';
import {
  TypeContentOptions,
  TypeDataSourceOptions,
  TypeReadingOptions,
  TypeSourceOptions,
} from '@pg/types/src/blog/type';

import { existCode, existName, saveOrUpdate } from '../api';

const contentData = ref({
  value: '',
  valueHtml: '',
  valueMarkdown: '',
});
const [Form, formApi] = usePgForm({
  // 通过 schema 的 type: 'group' 把字段组织成可折叠的分组，分组默认展开
  schema: [
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
            class: 'pg-button-size-small',
            onClick: async (e) => {
              const values = await formApi.getValues();
              existName(values.name, values.id);
            },
          },
          () => h('span', { class: 'font-normal' }, '查重'),
        ),
    },
    {
      fieldName: 'tag',
      label: '标签',
      component: 'Select',
      componentProps: {
        filterable: true,
        multiple: true,
        tag: true,
      },
    },
    {
      type: 'group',
      name: 'home',
      title: '基本',
      defaultCollapsed: false,
      children: [
        {
          fieldName: 'code',
          label: '编码',
          rules: 'required',
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
          suffix: () =>
            h(
              VbenButton,
              {
                class: 'pg-button-size-small',
                onClick: async (e) => {
                  const values = await formApi.getValues();
                  existCode(values.code, values.id);
                },
              },
              () => h('span', { class: 'font-normal' }, '查重'),
            ),
        },
        {
          fieldName: 'typeContent',
          label: '内容类型',
          defaultValue: 'original',
          component: 'PgRadioGroup',
          componentProps: {
            type: 'button',
            options: TypeContentOptions,
          },
          rules: 'required',
        },
        {
          fieldName: 'typeSource',
          label: '源类型',
          defaultValue: 'handwritten',
          component: 'PgRadioGroup',
          componentProps: {
            type: 'button',
            options: TypeSourceOptions,
          },
          rules: 'required',
        },
        {
          fieldName: 'typeReading',
          label: '阅读',
          defaultValue: 'unread',
          component: 'PgRadioGroup',
          componentProps: {
            type: 'button',
            options: TypeReadingOptions,
          },
          rules: 'required',
        },
        {
          fieldName: 'state',
          label: '状态',
          defaultValue: 1,
          component: 'PgRadioGroup',
          componentProps: {
            type: 'button',
            options: stateYesNoOption,
          },
          rules: 'required',
        },
        {
          fieldName: 'typeComment',
          label: '允许评论',
          defaultValue: 'yes',
          component: 'Switch',
          componentProps: {
            class: 'w-auto',
            checkedValue: 'yes',
            uncheckedValue: 'no',
          },
        },
        {
          fieldName: 'operationTime',
          label: '操作时间',
          component: 'PgDatePicker',
          componentProps: {
            isTimestamp: false,
            type: 'datetime',
            format: 'yyyy-MM-dd HH:mm:ss',
            valueFormat: 'yyyy-MM-dd HH:mm:ss',
            // formattedValue:'2022-11-10 11:11:11',
            // defaultValue:'2022-11-10 11:11:11',
            shortcuts: {
              昨天: () => Date.now() - 24 * 60 * 60 * 1000,
            },
            // onUpdateValue: (value, formattedValue) => {
            //     console.log('OnUpdateValue', value, formattedValue)
            // }
          },
          rules: 'required',
        },
        {
          fieldName: 'attachment',
          label: '商品图集',
          defaultValue: {},
          component: '',
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
        {
          fieldName: 'content',
          label: '内容',
          component: 'Input',
        },
      ],
    },
    {
      type: 'group',
      name: 'source',
      title: '来源',
      defaultCollapsed: false,
      children: [
        {
          fieldName: 'typeDataSource',
          label: '数据源类型',
          defaultValue: 'platform',
          component: 'PgRadioGroup',
          componentProps: {
            type: 'button',
            options: TypeDataSourceOptions,
          },
          rules: 'required',
        },
        {
          fieldName: 'author',
          label: '作者',
          component: 'Input',
          defaultValue: '风.foxwho',
          componentProps: {
            placeholder: '请输入',
          },
          rules: 'required',
        },
        {
          fieldName: 'source',
          label: '来源平台',
          component: 'Input',
          defaultValue: '',
          componentProps: {
            placeholder: '请输入',
          },
        },
        {
          fieldName: 'url_source',
          label: '来源地址',
          component: 'Input',
          defaultValue: '',
          componentProps: {
            placeholder: '请输入',
          },
        },
        {
          fieldName: 'jump',
          label: '跳转',
          defaultValue: 2,
          component: 'Switch',
          componentProps: {
            class: 'w-auto',
            checkedValue: 1,
            uncheckedValue: 2,
          },
        },
        {
          fieldName: 'url_rewriting',
          label: '自定义伪静态',
          component: 'Input',
          defaultValue: '',
          componentProps: {
            placeholder: '请输入',
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
        {
          fieldName: 'pageTitle',
          label: 'seo网页标题',
          component: 'Input',
          componentProps: {},
        },
        {
          fieldName: 'seoKeywords',
          label: 'seo关键词',
          component: 'Input',
          componentProps: {},
        },
        {
          fieldName: 'seoDescription',
          label: 'seo网站说明',
          component: 'Textarea',
          componentProps: {
            type: 'textarea',
            placeholder: '描述',
          },
        },
      ],
    },
    {
      fieldName: 'id',
      label: 'id',
      defaultValue: '0',
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
        closeOnClickModal: false,
        destroyOnClose: true,
      });
      const { values, isUpdate } = drawerApi.getData<Record<string, any>>();
      if (values) {
        formApi.setValues(values);
      }

      drawerApi.setState({
        title: `币制：${isUpdate ? '编辑' : '新增'}`,
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
  drawerApi.lock();
  try {
    drawerApi.setState({ loading: true, confirmLoading: true });
    const { isUpdate } = drawerApi.getData<Record<string, any>>();
    let data = {
      ...values,
    };
    data.content = contentData.value.valueMarkdown;
    //
    saveOrUpdate(data, isUpdate).then((d) => {
      setTimeout(() => {
        emit('ok', data);
        drawerApi.setState({ loading: false });
        drawerApi.close();
      }, 900);
    });
  } catch (error) {
    console.error(error);
  } finally {
    drawerApi.unlock();
    drawerApi.setState({ loading: false, confirmLoading: false });
  }
}
const attachmentGroup = ref([
  {
    name: '主图',
    key: 'main',
    description: '其他说明 图片大小：宽 500px ,高 400px',
    headerExtra: ',图片大小：宽 500px ,高 400px',
    width: '500px',
    height: '400px',
    maxNumber: 1,
    maxSize: 30,
  },
  {
    name: '列表图',
    key: 'list',
    description: '其他说明 图片大小：宽 500px ,高 400px',
    headerExtra: ',图片大小：宽 500px ,高 400px',
    width: '500px',
    height: '400px',
    maxNumber: 1,
    maxSize: 30,
  },
  {
    name: '轮播图',
    key: 'carousel',
    description: '其他说明 图片大小：宽 500px ,高 400px',
    descriptionIsHtml: false,
    headerExtra: ',图片大小：宽 500px ,高 400px',
    width: '500px',
    height: '400px',
    maxNumber: 21,
    maxSize: 30,
  },
]);
const uploadSettingFetch = ref({
  params: {},
  header: {
    Authorization: `Bearer ${accessStore.accessToken}`,
  },
  // url
  url: uploadUrl,
  // 链接
  urlLink: `${uploadUrl}-link`,
  // 列表
  urlList: `${uploadUrl}-list`,
  // 二维码url
  urlQr: `${uploadUrl}-qr`,
});
const upload = ref({
  accept: 'image/*,.mp3,.mp4 .wav, .rar,.zip,.7z,.tar',
  headers: {
    Authorization: `Bearer ${accessStore.accessToken}`,
  },
  url: `${uploadUrl}-more`,
  fieldName: 'file',
  filename(e) {
    return e
      .replaceAll(/[^(a-zA-Z0-9\u4E00-\u9FA5\.)]/g, '')
      .replaceAll(/[?\\/:|<>*\[\](\)$%{\}@~]/g, '')
      .replace(String.raw`/\s/g`, '');
  },
  format(files, responseText) {
    // console.log('files',files)
    // console.log('files',files[0])
    // console.log('responseText',responseText)
    const succMap = {};
    try {
      // var json = (new Function("return " + responseText))();//第三种
      const json = JSON.parse(responseText);
      // console.log('responseText',json.data)
      for (const jsonKey in json.data) {
        const item = json.data[jsonKey];
        succMap[item.sourceName ? item.sourceName : jsonKey] = item.url;
      }
    } catch (error) {
      console.log('eeee', error);
    }

    return JSON.stringify({
      msg: '',
      code: 0,
      data: {
        succMap,
      },
    });
  },
  // success(editor: HTMLPreElement, msg: string){
  //   console.log('editor',editor)
  //   console.log('msg',msg)
  // }
  // filename (name) {
  //   console.log('xxxxxx',name)
  //   return name.replace(/[^(a-zA-Z0-9\u4e00-\u9fa5\.)]/g, '').
  //   replace(/[\?\\/:|<>\*\[\]\(\)\$%\{\}@~]/g, '').
  //   replace('/\\s/g', '')
  // },
});
/**
 * markdown 保存
 * @param opt
 */
function updateMarkdownChange(opt) {
  console.log('updateMarkdownChange', opt);
  contentData.value = opt;
}
function PgUploadOk(data) {
  console.log('PgUploadOk', data);
}
</script>
<template>
  <Drawer class="w-[1200px]">
    <Form>
      <template #attachment="tpl">
        <PgUploadGroup
          key="main"
          v-model="tpl.modelValue"
          :fetch-setting="uploadSettingFetch"
          :group="attachmentGroup"
          @ok="PgUploadOk"
        />
      </template>
      <template #content="tpl">
        <PgMarkdown
          v-model="tpl.modelValue"
          :upload="upload"
          style="width: 100%"
          width="100%"
          @change="updateMarkdownChange"
        />
      </template>
    </Form>
  </Drawer>
</template>
