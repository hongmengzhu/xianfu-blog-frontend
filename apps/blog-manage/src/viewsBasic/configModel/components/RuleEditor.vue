<script setup lang="ts">
import { computed } from 'vue';

import { NButton, NInput, NInputNumber, NSelect, NSwitch } from 'naive-ui';

import { ruleModeOptions, ruleTargetOptions } from '../options';

const props = withDefaults(
  defineProps<{
    /** 标题 */
    title?: string;
  }>(),
  { title: '验证规则' },
);

const rules = defineModel<any[]>({ default: () => [] });

const options = computed(() => ruleModeOptions.value);

function addRule() {
  const list = Array.isArray(rules.value) ? rules.value : [];
  rules.value = [
    ...list,
    {
      name: '',
      ruleMode: 'required',
      condition: '',
      errorMessage: '',
      ruleTarget: ['frontend', 'backend'],
      show: 1,
      sort: list.length,
    },
  ];
}

function removeRule(index: number) {
  rules.value = (rules.value || []).filter((_: any, i: number) => i !== index);
}
</script>

<template>
  <div>
    <div class="mb-2 flex items-center justify-between">
      <span class="border-l-4 border-primary pl-2 font-bold">{{
        props.title
      }}</span>
      <NButton size="small" type="primary" @click="addRule">新增规则</NButton>
    </div>
    <div v-if="!rules || rules.length === 0" class="text-xs text-gray-400">
      暂无规则
    </div>
    <div
      v-for="(rule, index) in rules || []"
      :key="index"
      class="mb-2 rounded border border-gray-200 p-2"
    >
      <div class="grid grid-cols-12 items-center gap-2">
        <NSelect
          v-model:value="rule.ruleMode"
          class="col-span-3"
          placeholder="验证模式"
          size="small"
          :options="options"
        />
        <NInput
          v-model:value="rule.name"
          class="col-span-3"
          placeholder="规则名称"
          size="small"
        />
        <NInput
          v-model:value="rule.condition"
          class="col-span-3"
          placeholder="条件，如 1,100"
          size="small"
        />
        <NInputNumber
          v-model:value="rule.sort"
          class="col-span-2"
          placeholder="排序"
          size="small"
        />
        <div class="col-span-1 flex justify-end">
          <NButton size="tiny" text type="error" @click="removeRule(index)">
            删除
          </NButton>
        </div>
        <NInput
          v-model:value="rule.errorMessage"
          class="col-span-6"
          placeholder="错误提示"
          size="small"
        />
        <NSelect
          v-model:value="rule.ruleTarget"
          class="col-span-4"
          multiple
          placeholder="规则目标（前端/后端）"
          size="small"
          :options="ruleTargetOptions"
        />
        <div class="col-span-2 flex items-center gap-2">
          <NSwitch
            v-model:value="rule.show"
            size="small"
            :checked-value="1"
            :unchecked-value="2"
          />
          <span class="text-xs">显示</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
