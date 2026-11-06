<script lang="ts" setup>
import { computed, unref, useAttrs } from 'vue';

import { pgDatePickerPropsDefault } from './props';

const props = defineProps({
  ...pgDatePickerPropsDefault,
});

const emit = defineEmits(['update:formattedValue', 'update:value']);

const attrs = useAttrs();

const getAttrs = computed(() => {
  return {
    ...unref(attrs),
    ...props,
    value: null,
  };
});
/**
 * naive-ui 的 formatted-value 只有传 null 才会渲染成空输入框；
 * 传空字符串 '' 会走到 format('')，直接抛 RangeError: Invalid time value，
 * 并把组件更新打断（后续抽屉卸载时报 vnode 为 null 的 TypeError）。
 * 这里统一把 ''.undefined 归一成 null。
 */
const formattedValue = computed(() => {
  const value = props.value;
  if (value === undefined || value === '') {
    return null;
  }
  if (Array.isArray(value)) {
    return value.map((item) =>
      item === undefined || item === '' ? null : item,
    );
  }
  return value;
});
const getValue = computed(() => props.value);
function onUpdateFormattedValue(value: any) {
  emit('update:formattedValue', value);
  emit('update:value', value);
}
function onUpdateValue(value: any) {
  emit('update:value', value);
}
</script>
<template>
  <n-date-picker
    v-if="!props.isTimestamp"
    v-bind="getAttrs"
    v-model:formatted-value="formattedValue"
    :value-format="props.valueFormat"
    @update:formatted-value="onUpdateFormattedValue"
  >
    <template v-for="item in Object.keys($slots)" :key="item" #[item]="data">
      <slot :name="item" v-bind="data || {}"></slot>
    </template>
  </n-date-picker>
  <n-date-picker
    v-else
    v-bind="getAttrs"
    v-model:value="getValue"
    @update:value="onUpdateValue"
  >
    <template v-for="item in Object.keys($slots)" :key="item" #[item]="data">
      <slot :name="item" v-bind="data || {}"></slot>
    </template>
  </n-date-picker>
</template>

<style scoped></style>
