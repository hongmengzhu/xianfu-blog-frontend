<script lang="ts" setup>
import { defineComponent, h, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { NSwitch } from 'naive-ui';

import { message, usePgForm } from '#/adapter';
import { requestClient } from '#/api/request';
import { typeCodePublic } from '#/viewsBasic/data-dict/dict/api';

import { configUpdate, detailForm } from '../api';

const emit = defineEmits(['ok']);

interface ConfigFormField {
  binary?: number | string;
  defaultValue?: string;
  field: string;
  formAttr?: string;
  formCode?: string;
  formGroup?: string;
  name?: string;
  parameterContent?: string;
  parameterSource?: string;
  rules?: string[];
  show?: number | string;
  sort?: number | string;
  valueType?: string;
}

interface FieldEntry {
  arrayValue: boolean;
  field: ConfigFormField;
  isTime: boolean;
  kind: string;
  offToken?: string;
  onToken?: string;
  schema: any;
}

/**
 * 开关组件：表单把 Switch 的模型属性映射成 checked，而 naive 的 NSwitch 只认
 * value/checkedValue/uncheckedValue，字符串 'false' 会被当成真值导致「显示开启、
 * 值却是 false」。这里包一层，统一按真值语义渲染，并回传配置的开启/关闭 token。
 */
const BoolSwitch = defineComponent({
  name: 'BoolSwitch',
  props: {
    checked: {
      default: undefined,
    },
    checkedValue: {
      default: 'true',
    },
    modelValue: {
      default: undefined,
    },
    uncheckedValue: {
      default: 'false',
    },
  },
  emits: ['update:checked', 'update:modelValue'],
  setup(props, { emit }) {
    return () => {
      const raw =
        props.checked === undefined ? props.modelValue : props.checked;
      const onToken = props.checkedValue ?? 'true';
      const offToken = props.uncheckedValue ?? 'false';
      const isOn =
        raw === onToken ? true : raw === offToken ? false : isTruthyValue(raw);
      return h(NSwitch, {
        checkedValue: onToken,
        uncheckedValue: offToken,
        value: isOn ? onToken : offToken,
        'onUpdate:value': (value: any) => {
          emit('update:checked', value);
          emit('update:modelValue', value);
        },
      });
    };
  },
});

const header = ref<any>({});
const eventNo = ref('');
const entries = ref<FieldEntry[]>([]);

const [Form, formApi] = usePgForm({
  schema: [],
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
});

const [Drawer, drawerApi] = useVbenDrawer({
  onCancel() {
    drawerApi.close();
  },
  onConfirm: onSubmit,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      initDrawer();
    }
  },
  title: '配置',
});

function parseFormAttr(value: any): Record<string, any> {
  if (!value) {
    return {};
  }
  if (typeof value === 'object') {
    return { ...value };
  }
  try {
    const parsed = JSON.parse(String(value));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function normalizedCode(formCode?: string) {
  return String(formCode || 'PgInput')
    .replace(/^Pg/, '')
    .toLowerCase();
}

function normalizeOptions(rows: any[]): any[] {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows
    .map((row: any) => {
      if (row === null || row === undefined) {
        return null;
      }
      if (typeof row !== 'object') {
        return { label: String(row), value: String(row) };
      }
      const label = row.label ?? row.name ?? row.title ?? row.key ?? row.value;
      const value = row.value ?? row.code ?? row.key ?? row.id ?? label;
      return {
        ...row,
        label: String(label ?? ''),
        value:
          typeof value === 'object' && value !== null
            ? value
            : String(value ?? ''),
      };
    })
    .filter(Boolean);
}

function parseCustomOptions(content: string): any[] {
  const text = content.trim();
  if (!text) {
    return [];
  }
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return normalizeOptions(parsed);
    }
    if (parsed && typeof parsed === 'object') {
      return Object.entries(parsed).map(([value, label]) => ({
        label: String(label),
        value,
      }));
    }
  } catch {
    // 不是 JSON，继续按普通文本解析
  }
  return text
    .split(/\r?\n/)
    .flatMap((line) => line.split(/[,，]/))
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      const parts = segment.split(/\s*[=:|：]\s*/).filter(Boolean);
      if (parts.length >= 2) {
        return { label: parts[0], value: parts[1] };
      }
      return { label: segment, value: segment };
    });
}

async function loadOptions(field: ConfigFormField): Promise<any[]> {
  const source = String(field.parameterSource || '').trim();
  const content = String(field.parameterContent || '').trim();
  try {
    if (source === 'dataDictionary' && content) {
      const res: any = await typeCodePublic(content);
      return normalizeOptions(Array.isArray(res) ? res : res?.data || []);
    }
    if (source === 'url' && content) {
      const res: any = await requestClient.get(content);
      return normalizeOptions(Array.isArray(res) ? res : res?.data || []);
    }
    if (source === 'custom' || source === 'customCreate') {
      return parseCustomOptions(content);
    }
  } catch (error) {
    console.warn('加载配置表单选项失败', field.field, error);
  }
  return [];
}

function baseControl(field: ConfigFormField) {
  const code = normalizedCode(field.formCode);
  const label = field.name || field.field;
  const attrProps = parseFormAttr(field.formAttr);
  const props: Record<string, any> = { ...attrProps };
  const inputPlaceholder = `请输入${label}`;
  const selectPlaceholder = `请选择${label}`;
  let component: any = 'Input';
  let kind = 'text';
  let arrayValue = false;
  let isTime = false;
  let offToken: any;
  let onToken: any;
  const valueType = String(field.valueType || '');

  switch (code) {
    case 'checkboxgroup': {
      component = 'CheckboxGroup';
      kind = 'select';
      arrayValue = true;
      break;
    }
    case 'colorpicker': {
      component = 'ColorPicker';
      break;
    }
    case 'datepicker': {
      component = 'PgDatePicker';
      kind = 'date';
      props.isTimestamp = false;
      props.type = valueType === 'date' ? 'date' : 'datetime';
      props.valueFormat =
        valueType === 'date' ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm:ss';
      props.style = props.style || { width: '100%' };
      break;
    }
    case 'input': {
      props.placeholder = props.placeholder || inputPlaceholder;
      break;
    }
    case 'inputnumber':
    case 'number': {
      component = 'InputNumber';
      kind = 'number';
      props.style = props.style || { width: '100%' };
      break;
    }
    case 'inputtextarea':
    case 'textarea': {
      component = 'Textarea';
      props.type = 'textarea';
      props.autosize = props.autosize || { minRows: 2, maxRows: 6 };
      props.placeholder = props.placeholder || inputPlaceholder;
      break;
    }
    case 'markdown': {
      component = 'PgMarkdown';
      break;
    }
    case 'nselect':
    case 'select': {
      component = 'Select';
      kind = 'select';
      props.clearable = props.clearable ?? true;
      props.placeholder = props.placeholder || selectPlaceholder;
      if (props.multiple) {
        arrayValue = true;
      }
      break;
    }
    case 'radiogroup': {
      component = 'RadioGroup';
      kind = 'select';
      break;
    }
    case 'rate': {
      component = 'Rate';
      kind = 'number';
      break;
    }
    case 'switch': {
      // 自定义开关组件：naive 的 NSwitch 只认 value，且字符串 'false' 会被当成真值，
      // 直接绑 checked 会出现「显示开启但值是 false」
      component = BoolSwitch;
      kind = 'boolean';
      onToken =
        props.checkedValue ?? props.checked_value ?? props.onValue ?? 'true';
      offToken =
        props.uncheckedValue ??
        props.unchecked_value ??
        props.offValue ??
        'false';
      props.checkedValue = onToken;
      props.uncheckedValue = offToken;
      delete props.checked_value;
      delete props.unchecked_value;
      delete props.onValue;
      delete props.offValue;
      break;
    }
    case 'timepicker': {
      component = 'TimePicker';
      kind = 'time';
      isTime = true;
      props.format = props.format || 'HH:mm:ss';
      props.style = props.style || { width: '100%' };
      break;
    }
    case 'treeselect': {
      component = 'TreeSelect';
      kind = 'select';
      props.placeholder = props.placeholder || selectPlaceholder;
      break;
    }
    case 'upload':
    case 'uploadgroup': {
      props.placeholder = `请输入${label}（文件地址或 JSON）`;
      break;
    }
    default: {
      props.placeholder = props.placeholder || inputPlaceholder;
      break;
    }
  }

  return {
    arrayValue,
    component,
    isTime,
    kind,
    offToken,
    onToken,
    props,
  };
}

function buildRules(field: ConfigFormField) {
  const rules = Array.isArray(field.rules) ? field.rules : [];
  return rules.includes('required') ? 'required' : undefined;
}

async function buildEntry(field: ConfigFormField): Promise<FieldEntry> {
  const label = field.name || field.field;
  const control = baseControl(field);
  let { arrayValue, component, isTime, kind } = control;
  const props = control.props;
  const { offToken, onToken } = control;

  const optionComponents = [
    'CheckboxGroup',
    'RadioGroup',
    'Select',
    'TreeSelect',
  ];
  if (optionComponents.includes(component)) {
    let options = Array.isArray(props.options)
      ? normalizeOptions(props.options)
      : [];
    if (options.length === 0) {
      options = await loadOptions(field);
    }
    if (options.length > 0) {
      props.options = options;
    } else {
      // 下拉类控件没有可选项时降级为文本输入，避免出现无法使用的空下拉框
      component = 'Input';
      kind = 'text';
      arrayValue = false;
      isTime = false;
      delete props.multiple;
      delete props.options;
      props.placeholder = `请输入${label}（未配置可选项）`;
    }
  }

  return {
    arrayValue,
    field,
    isTime,
    kind,
    offToken,
    onToken,
    schema: {
      component,
      componentProps: props,
      fieldName: field.field,
      label,
      rules: buildRules(field),
    },
  };
}

function buildSchema(fieldEntries: FieldEntry[]) {
  return fieldEntries.map((entry) => entry.schema);
}

function toArrayValue(raw: any): any[] {
  if (Array.isArray(raw)) {
    return raw;
  }
  if (raw === undefined || raw === null || raw === '') {
    return [];
  }
  const text = String(raw).trim();
  if (text.startsWith('[')) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // 不是合法 JSON，按逗号分隔
    }
  }
  return text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function isTruthyValue(raw: any) {
  const text = String(raw ?? '')
    .trim()
    .toLowerCase();
  return ['1', 'on', 'true', 'yes', '是'].includes(text);
}

function toTimestamp(raw: any) {
  const text = String(raw ?? '').trim();
  if (!text) {
    return null;
  }
  if (/^\d+$/.test(text) && text.length >= 10) {
    return Number(text);
  }
  const match = text.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
  if (!match) {
    return null;
  }
  return new Date(
    1970,
    0,
    1,
    Number(match[1]),
    Number(match[2]),
    Number(match[3] || 0),
  ).getTime();
}

function formatTime(value: number) {
  const date = new Date(value);
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
}

function toFormValue(entry: FieldEntry, raw: any) {
  if (entry.kind === 'boolean') {
    // 保留后端原始 token（true/false、1/2、yes/no 等），由 BoolSwitch 按 token 判定开关状态
    if (raw === undefined || raw === null || raw === '') {
      return entry.offToken ?? 'false';
    }
    return String(raw);
  }
  if (entry.arrayValue) {
    return toArrayValue(raw);
  }
  if (entry.kind === 'number') {
    if (raw === undefined || raw === null || raw === '') {
      return null;
    }
    const num = Number(raw);
    return Number.isNaN(num) ? null : num;
  }
  if (entry.isTime) {
    return toTimestamp(raw);
  }
  return raw === undefined || raw === null ? '' : String(raw);
}

function serializeValue(entry: FieldEntry, value: any) {
  if (entry.kind === 'boolean') {
    const onToken = String(entry.onToken ?? 'true');
    const offToken = String(entry.offToken ?? 'false');
    if (value === entry.onToken || value === onToken || value === true) {
      return onToken;
    }
    if (value === entry.offToken || value === offToken || value === false) {
      return offToken;
    }
    return isTruthyValue(value) ? onToken : offToken;
  }
  if (entry.isTime) {
    return typeof value === 'number' ? formatTime(value) : String(value ?? '');
  }
  if (entry.arrayValue) {
    return Array.isArray(value) ? value.join(',') : String(value ?? '');
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

async function initDrawer() {
  drawerApi.setState({
    confirmLoading: false,
    closeOnClickModal: false,
    destroyOnClose: true,
    loading: true,
  });
  formApi.setState({ schema: [] });
  formApi.reset();
  entries.value = [];
  header.value = {};
  eventNo.value = '';

  try {
    const data: any = drawerApi.getData() || {};
    const row = data.row || data.values || data;
    if (!row?.eventNo) {
      message.warning('缺少事件编号，无法加载配置表单');
      return;
    }
    header.value = row;
    eventNo.value = row.eventNo;

    const res: any = await detailForm({ eventNo: row.eventNo });
    const items: ConfigFormField[] = Array.isArray(res?.form?.item)
      ? res.form.item
      : [];
    const visibleFields = items.filter((item) => Number(item.show ?? 1) !== 2);
    entries.value = await Promise.all(
      visibleFields.map((item) => buildEntry(item)),
    );

    const values = res?.data || {};
    const initial: Record<string, any> = {};
    for (const entry of entries.value) {
      let raw = values[entry.field.field];
      if (raw === undefined || raw === null || raw === '') {
        raw = entry.field.defaultValue;
      }
      initial[entry.field.field] = toFormValue(entry, raw);
    }

    formApi.setState({ schema: buildSchema(entries.value) });
    await nextTick();
    formApi.setValues(initial);

    if (visibleFields.length === 0) {
      message.warning('该配置模型暂无字段，请先在【模型】设计器配置字段');
    }
  } catch (error) {
    console.error(error);
    message.error('加载配置表单失败');
  } finally {
    drawerApi.setState({
      loading: false,
      title: `配置：${header.value?.name || header.value?.field || ''}`,
    });
  }
}

async function onSubmit() {
  const { valid } = await formApi.validate();
  if (!valid) {
    return false;
  }
  const values: any = await formApi.getValues();
  const data: Record<string, string> = {};
  for (const entry of entries.value) {
    data[entry.field.field] = serializeValue(entry, values[entry.field.field]);
  }
  if (Object.keys(data).length === 0) {
    message.warning('没有可保存的字段');
    return false;
  }
  drawerApi.setState({ loading: true, confirmLoading: true });
  drawerApi.lock();
  try {
    await configUpdate({ data, eventNo: eventNo.value }).then((d) => {
      setTimeout(() => {
        emit('ok', d);
        drawerApi.setState({ loading: false });
        drawerApi.close();
      }, 500);
    });
    message.success('保存成功');
  } catch (error) {
    console.error(error);
  } finally {
    drawerApi.unlock();
    drawerApi.setState({ confirmLoading: false, loading: false });
  }
}
</script>

<template>
  <Drawer class="w-[1100px] max-w-[96vw]">
    <div class="p-2">
      <div
        class="mb-4 flex items-center justify-between border-l-4 border-primary pl-2"
      >
        <span class="font-bold">{{ header.name || '配置' }}</span>
        <span v-if="header.eventNo" class="text-xs text-gray-400">
          {{ header.eventNo }}
        </span>
      </div>
      <Form v-if="entries.length > 0" />
      <div v-else class="py-10 text-center text-gray-400">
        该配置模型暂无字段，请先在【模型】设计器配置字段
      </div>
      <div v-if="entries.length > 0" class="mt-2 text-xs text-gray-400">
        共
        {{ entries.length }}
        个字段；保存时后端按模型字段规则校验，并写入配置值与配置列表 content。
      </div>
    </div>
  </Drawer>
</template>

<style scoped></style>
