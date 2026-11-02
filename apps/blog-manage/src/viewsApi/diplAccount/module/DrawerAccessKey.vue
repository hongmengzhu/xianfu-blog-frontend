<script lang="ts" setup>
import { h, ref } from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';

import {
  basicOptionsType,
  HttpMethod,
  RamResourceType,
  RamResourceTypeAttr,
} from '@pg/types';

import { usePgForm, useVbenForm } from '#/adapter';

import { detail, existName, saveOrUpdate, selectNodeAllPublic } from '../api';
import { selectNodeAllPublic as selectNodeAllPublicCategory } from '#/viewsApi/diplAccount/api';
import AccessKeyTableTpl from './AccessKeyTable.vue';
import { getNanoidNo } from '@pg/utils';
const emit = defineEmits(['ok']);
const showTable = ref(false);
const recordData = ref({});
const [Form, formApi] = useVbenForm({
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-2',
  schema: [
    {
      fieldName: 'account',
      label: '账号',
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
      },
      rules: 'required',
    },
    {
      fieldName: 'phone',
      label: '手机号',
      component: 'Input',
      rules: 'required',
    },
    {
      fieldName: 'mail',
      label: '邮箱',
      rules: 'required',
      component: 'Input',
    },
    {
      fieldName: 'code',
      label: '码值',
      rules: 'required',
      component: 'Input',
    },
    {
      fieldName: 'no',
      label: '编号',
      rules: 'required',
      component: 'Input',
    },
    {
      fieldName: 'name',
      label: '名称',
      rules: 'required',
      component: 'Input',
    },
    {
      fieldName: 'realName',
      label: '真实姓名',
      rules: 'required',
      component: 'Input',
    },
    {
      fieldName: 'registerTime',
      label: '注册时间',
      component: 'PgDatePicker',
      special: 'DatePicker',
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
        // onUpdateValue: ( value, formattedValue ) => {
        //   console.log('OnUpdateValue', value, formattedValue)
        //   formApi.setFieldValue('registerTime', dayjs(formattedValue));
        // },
      },
    },
    {
      fieldName: 'createAt',
      label: '创建时间',
      component: 'PgDatePicker',
      special: 'DatePicker',
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
        // onUpdateValue: ( value, formattedValue ) => {
        //   console.log('OnUpdateValue', value, formattedValue)
        //   formApi.setFieldValue('registerTime', dayjs(formattedValue));
        // },
      },
    },
    {
      fieldName: 'id',
      label: 'id',
      component: 'Input',
      defaultValue: '',
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
  onConfirm: () => {},
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      drawerApi.setState({ loading: true });
      let data = {};
      const { values } = drawerApi.getData<Record<string, any>>();
      if (values && Object.keys(values).length > 0) {
        data = {
          ...values,
          categoryNo: '',
        };
        detail(values.id).then((response) => {
          console.log('response', response);
          const data = {
            ...response,
          };
          if (!data.avatar) {
            data.avatar = getNanoidNo(32);
          }
          formApi.setValues(data);

          recordData.value = data;
          showTable.value = true;
          console.log('recordData=>', recordData.value);
        });
      }
      formApi.setState({ commonConfig: { disabled: true } });
      drawerApi.setState({ title: `用户接口：密钥`, loading: false });
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
    saveOrUpdate(values, isUpdate).then((d) => {
      setTimeout(() => {
        emit('ok', values);
        drawerApi.setState({ loading: false });
        drawerApi.close();
      }, 500);
    });
  } catch (error) {
    console.error(error);
  } finally {
    drawerApi.unlock();
    drawerApi.setState({ loading: false, confirmLoading: false });
  }
}
</script>
<template>
  <Drawer class="w-[1200px]">
    <Form />
    <AccessKeyTableTpl
      v-if="showTable"
      :dipl-no="recordData.no"
      :principal-type="'SERVICE'"
      :data="recordData"
    />
  </Drawer>
</template>
