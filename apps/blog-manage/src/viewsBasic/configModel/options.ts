import { ref } from 'vue';

export interface OptionItem {
  label: string;
  value: any;
}

const fallbackFormCode: OptionItem[] = [
  { label: '文本框', value: 'PgInput' },
  { label: '多行文本', value: 'PgInputTextarea' },
  { label: '数值框', value: 'PgInputNumber' },
  { label: '开关', value: 'PgSwitch' },
  { label: '下拉选择', value: 'PgSelect' },
  { label: '树下拉选择', value: 'PgTreeSelect' },
  { label: '日期', value: 'PgDatePicker' },
  { label: '时间', value: 'PgTimePicker' },
  { label: '单选组', value: 'PgRadioGroup' },
  { label: '复选组', value: 'PgCheckboxGroup' },
  { label: '评分', value: 'PgRate' },
  { label: 'Markdown', value: 'PgMarkdown' },
  { label: '上传', value: 'PgUpload' },
  { label: '上传组', value: 'PgUploadGroup' },
  { label: '颜色', value: 'PgColorPicker' },
];

const fallbackParameterSource: OptionItem[] = [
  { label: '数据字典', value: 'dataDictionary' },
  { label: '自定义', value: 'custom' },
  { label: '自定义url', value: 'url' },
  { label: '自定义创建', value: 'customCreate' },
];

const fallbackRuleMode: OptionItem[] = [
  { label: '不为空', value: 'required' },
  { label: '长度', value: 'length' },
  { label: '正则', value: 'pattern' },
  { label: '大于0', value: 'greaterThan0' },
  { label: '内置验证', value: 'verifyFunc' },
  { label: '自定义', value: 'custom' },
  { label: '条件', value: 'condition' },
];

const fallbackValueAttr: OptionItem[] = [
  { label: '单个', value: 'single' },
  { label: '对象', value: 'object' },
];

const fallbackValueType: OptionItem[] = [
  { label: '字符', value: 'string' },
  { label: '数值', value: 'number' },
  { label: '小数', value: 'decimal' },
  { label: '整数', value: 'int' },
  { label: '整数字符', value: 'intString' },
  { label: '布尔值', value: 'boolean' },
  { label: 'map对象', value: 'map' },
  { label: '数组', value: 'slice' },
  { label: '数组-字符', value: 'slice|string' },
  { label: '数组-整数', value: 'slice|int' },
  { label: '数组-数值', value: 'slice|number' },
  { label: '数组-布尔值', value: 'slice|boolean' },
  { label: '数组-对象', value: 'slice|map' },
  { label: '日期', value: 'date' },
  { label: '日期时间', value: 'dateTime' },
  { label: '时间', value: 'time' },
  { label: 'json', value: 'json' },
];

export const valueTypeOptions = ref<OptionItem[]>([...fallbackValueType]);
export const formCodeOptions = ref<OptionItem[]>([...fallbackFormCode]);
export const parameterSourceOptions = ref<OptionItem[]>([
  ...fallbackParameterSource,
]);
export const ruleModeOptions = ref<OptionItem[]>([...fallbackRuleMode]);
export const valueAttrOptions = ref<OptionItem[]>([...fallbackValueAttr]);

/** 规则目标（前端 / 后端） */
export const ruleTargetOptions: OptionItem[] = [
  { label: '前端', value: 'frontend' },
  { label: '后端', value: 'backend' },
];

/** 值类型 -> 是否为数值 */
export function isNumberValueType(valueType?: string) {
  if (!valueType) {
    return false;
  }
  return (
    [
      'decimal',
      'greaterThan0',
      'int',
      'integer',
      'intString',
      'number',
      'slice|decimal',
      'slice|int',
      'slice|number',
    ].includes(valueType) || valueType.startsWith('array|')
  );
}

/** 值类型 -> 是否为布尔 */
export function isBooleanValueType(valueType?: string) {
  if (!valueType) {
    return false;
  }
  return ['boolean', 'slice|boolean'].includes(valueType);
}

/** 值类型 -> 是否为日期/时间 */
export function isDateValueType(valueType?: string) {
  if (!valueType) {
    return false;
  }
  return ['date', 'dateTime', 'time'].includes(valueType);
}

/** 值类型 -> 是否为 JSON/对象/数组 */
export function isComplexValueType(valueType?: string) {
  if (!valueType) {
    return false;
  }
  return (
    ['json', 'map', 'slice', 'slice|map', 'slice|slice'].includes(valueType) ||
    valueType.startsWith('slice|') ||
    valueType.startsWith('array|')
  );
}
