<script setup lang="ts">

import { useVbenModal, z } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useUserStore } from '@vben/stores';

import { usePgForm } from '#/adapter';
import { useConfigPubStore } from '#/store';
import { SmUtil } from '#/tools/smUtil';

import { updatePassword } from './api';
const emit = defineEmits(['ok']);
const userStore = useUserStore();
const configPubStore = useConfigPubStore();
const sm = new SmUtil();
const [Form, formApi] = usePgForm({
  schema: [
    {
      fieldName: 'passwordNew',
      label: '新密码',
      component: 'VbenInputPassword',
      rules: z.string().min(8, { message: $t('authentication.passwordTip') }),
      componentProps: {
        passwordStrength: true,
        placeholder: '请输入',
      },
    },
    {
      fieldName: 'confirmPassword',
      label: '确认密码',
      component: 'VbenInputPassword',
      rules: z.string().min(8, { message: $t('authentication.passwordTip') }),
      componentProps: {
        placeholder: '请输入',
      },
      dependencies: {
        rules(values) {
          const { passwordNew } = values;
          return z
            .string()
            .min(8, { message: $t('authentication.passwordTip') })
            .refine((value) => value === passwordNew, {
              message: $t('authentication.confirmPasswordTip'),
            });
        },
        triggerFields: ['passwordNew'],
      },
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

const [Modal, modalApi] = useVbenModal({
  closeOnClickModal: false,
  draggable: true,
  fullscreenButton: false,
  onCancel() {
    modalApi.close();
  },
  onConfirm: async () => {
    await formApi.submitForm();
    // modalApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      console.log('userStore=', userStore);
      modalApi.setState({
        title: `修改密码：${userStore.userInfo.account} (${userStore.userInfo.phone})  ${userStore.userInfo.realName}`,
        destroyOnClose: true,
        description: '对当前登录用户修改密码',
      });
    }
  },
});
/**
 * 提交
 */
function onSubmit(values: Record<string, any>) {
  try {
    modalApi.setState({ loading: true, confirmLoading: true });
    const data = {
      ...values,
    };
    if (
      configPubStore.isLoginEncrypt() &&
      configPubStore.getLoginPub() &&
      data.passwordNew
    ) {
      sm.setPublicKey(configPubStore.getLoginPub());
      data.passwordNew = sm.encryptHex(data.passwordNew);
      data.encrypt = 'encrypt';
    }
    updatePassword(data)
      .then((d) => {
        setTimeout(() => {
          modalApi.setState({ loading: false, confirmLoading: false });
          emit('ok', values);
          modalApi.close();
        }, 1500);
      })
      .catch(() => {
        modalApi.setState({ loading: false, confirmLoading: false });
      });
  } catch (error) {
    modalApi.setState({ loading: false, confirmLoading: false });
    console.error(error);
  }
}
</script>

<template>
  <Modal>
    <Form />
  </Modal>
</template>

<style scoped></style>
