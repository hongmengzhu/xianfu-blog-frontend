<script setup lang="ts">
import { useVbenModal, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { usePgForm } from '#/adapter';

import { updatePassword } from '../api';

const emit = defineEmits(['ok']);
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
    await formApi.submit();
    // modalApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const { values } = modalApi.getData<Record<string, any>>();
      modalApi.setState({
        title: `修改密码：${values.account} (${values.phone})  ${values.id}`,
      });
    }
  },
});
/**
 * 提交
 */
function onSubmit(values: Record<string, any>) {
  try {
    updatePassword(values).then((d) => {
      setTimeout(() => {
        emit('ok', values);
        modalApi.close();
      }, 1500);
    });
  } catch (error) {
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
