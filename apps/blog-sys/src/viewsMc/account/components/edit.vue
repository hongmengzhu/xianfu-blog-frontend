<script lang="ts" setup>
import { h } from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';

import { IdentityTypeOptions } from '@pg/types';

import { usePgForm } from '#/adapter';
import { selectNodeAllPublic as departmentNode } from '#/viewsRam/department/api';
import { selectNodeAllPublic as groupNode } from '#/viewsRam/group/api';
import { selectNodeAllPublic as levelNode } from '#/viewsRam/level/api';
import { selectNodeAllPublic as positionNode } from '#/viewsRam/position/api';
import { selectNodeAllPublic as postNode } from '#/viewsRam/post/api';
import { selectNodeAllPublic as roleNode } from '#/viewsRam/role/api';
import { selectNodeAllPublic as teamNode } from '#/viewsRam/team/api';

import { existName, saveOrUpdate } from '../api';

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
          fieldName: 'account',
          label: '账号',
          component: 'Input',
          rules: 'required',
          componentProps: {
            placeholder: '请输入',
          },
        },
        {
          fieldName: 'countryCode',
          label: '国际区号',
          component: 'Input',
          defaultValue: '',
          componentProps: {
            placeholder: '请输入',
          },
        },
        {
          fieldName: 'phone',
          label: '手机号',
          rules: 'required',
          component: 'Input',
          suffix: () =>
            h(
              VbenButton,
              {
                class: 'pg-button-size-small',
                onClick: async (e) => {
                  const values = await formApi.getValues();
                  existName(values.phone, values.id);
                },
              },
              () => h('span', { class: 'font-normal' }, '查重'),
            ),
        },
        {
          fieldName: 'mail',
          label: '邮箱',
          rules: 'required',
          component: 'Input',
        },
        {
          fieldName: 'code',
          label: '编码',
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
          fieldName: 'identityCode',
          label: '身份编号',
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
          fieldName: 'description',
          label: '描述',
          component: 'Textarea',
          componentProps: {
            type: 'textarea',
            placeholder: '描述',
          },
        },
        {
          fieldName: 'departmentId',
          label: '主部门',
          component: 'PgTreeSelect',
          componentProps: {
            api: departmentNode,
            params: {},
            props: {
              placeholder: '请选择',
            },
          },
        },
        {
          fieldName: 'departmentId',
          label: '多部门',
          component: 'PgTreeSelect',
          componentProps: {
            api: departmentNode,
            params: {},
            props: {
              multiple: true,
              placeholder: '请选择',
            },
          },
        },
        {
          fieldName: 'typeIdentity',
          label: '身份类型',
          component: 'Select',
          componentProps: {
            placeholder: '请选择',
            options: IdentityTypeOptions,
          },
        },
        {
          fieldName: 'roleId',
          label: '角色',
          component: 'PgTreeSelect',
          componentProps: {
            api: roleNode,
            params: {},
            props: {
              multiple: true,
              placeholder: '请选择',
            },
          },
        },
        {
          fieldName: 'levelId',
          label: '级别',
          component: 'PgTreeSelect',
          componentProps: {
            api: levelNode,
            convertNode: true,
            params: {},
            props: {
              placeholder: '请选择',
            },
          },
        },
        {
          fieldName: 'groupId',
          label: '分组',
          component: 'PgTreeSelect',
          componentProps: {
            api: groupNode,
            params: {},
            props: {
              placeholder: '请选择',
            },
          },
        },
        {
          fieldName: 'team',
          label: '团队',
          component: 'PgTreeSelect',
          componentProps: {
            api: teamNode,
            params: {},
            props: {
              multiple: true,
              placeholder: '请选择',
            },
          },
        },
        {
          fieldName: 'avatar',
          label: '头像',
          component: 'Input',
        },
      ],
    },
    {
      type: 'group',
      name: 'position',
      title: '职务',
      defaultCollapsed: false,
      children: [
        {
          fieldName: 'position',
          label: '职务',
          component: 'PgTreeSelect',
          componentProps: {
            api: positionNode,
            convertNode: true,
            params: {},
            props: {
              placeholder: '请选择',
            },
          },
        },
        {
          fieldName: 'job',
          label: '职位',
          component: 'PgTreeSelect',
          componentProps: {
            api: postNode,
            convertNode: true,
            params: {},
            props: {
              placeholder: '请选择',
            },
          },
        },
        {
          fieldName: 'jobTitle',
          label: '职衔',
          component: 'Input',
        },
        {
          fieldName: 'jobRank',
          label: '职级',
          component: 'Input',
        },
      ],
    },
    {
      type: 'group',
      name: 'my',
      title: '个人',
      defaultCollapsed: false,
      children: [
        // {
        //   tabGroup: 'my',
        //   fieldName: 'birthday',
        //   label: '生日',
        //   component: 'DatePicker',
        //   componentProps: {
        //     isTimestamp: false,
        //     type: 'date',
        //     format: 'yyyy-MM-dd',
        //     valueFormat: 'yyyy-MM-dd',
        //     // formattedValue:'2022-11-10 11:11:11',
        //     // defaultValue:'2022-11-10 11:11:11',
        //     shortcuts: {
        //       '昨天': () => new Date().getTime() - 24 * 60 * 60 * 1000,
        //     },
        //     // onUpdateValue: (value, formattedValue) => {
        //     //     console.log('OnUpdateValue', value, formattedValue)
        //     // }
        //   },
        // },
        {
          fieldName: 'sex',
          label: '性别',
          component: 'Select',
          componentProps: {
            placeholder: '请选择',
            options: [
              { label: '男', checked: true, value: 'male' },
              { label: '女', checked: true, value: 'female' },
              { label: '未知', checked: true, value: 'unknown' },
            ],
          },
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
  showDefaultActions: false,
});
const [Drawer, drawerApi] = useVbenDrawer({
  onCancel() {
    drawerApi.close();
  },
  onConfirm: async () => {
    await formApi.submitForm();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const { values, isUpdate } = drawerApi.getData<Record<string, any>>();
      if (values) {
        formApi.setValues({
          ...values,
        });
      }

      drawerApi.setState({ title: `账号：${isUpdate ? '编辑' : '新增'}` });
    }
  },
  title: '账号：',
  loading: false,
  confirmLoading: false,
});

/**
 * 提交
 */
function onSubmit(values: Record<string, any>) {
  try {
    const { isUpdate } = drawerApi.getData<Record<string, any>>();
    drawerApi.setState({
      loading: true,
      confirmLoading: true,
    });
    saveOrUpdate(values, isUpdate)
      .then((d) => {
        setTimeout(() => {
          drawerApi.close();

          drawerApi.setState({
            loading: false,
            confirmLoading: false,
          });
        }, 2500);
      })
      .catch((error) => {
        drawerApi.setState({
          loading: false,
          confirmLoading: false,
        });
      });
  } catch (error) {
    console.error(error);
  }
}
</script>
<template>
  <Drawer>
    <Form />
  </Drawer>
</template>
