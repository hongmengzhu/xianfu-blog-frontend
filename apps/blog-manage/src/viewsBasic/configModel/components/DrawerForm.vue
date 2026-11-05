<script lang="ts" setup>
import { nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { message, usePgForm } from '#/adapter';
import { requestClient } from '#/api/request';
import { typeCodePublic } from '#/viewsBasic/data-dict/dict/api';

import { allByModel, detail as getDetail, updateValues } from '../api';

const emit = defineEmits(['ok']);

interface ModelField {
  binary?: number | string;
  defaultValue?: string;
  description?: string;
  field: string;
  fieldPath?: string;
  formAttr?: any;
  formCode?: string;
  formGroup?: string;
  name?: string;
  parameterContent?: string;
  parameterSource?: string;
  ruleItems?: any[];
  rules?: string[];
  show?: number | string;
  sort?: number | string;
  value?: string;
  valueBinary?: string;
  valueType?: string;
}

interface FieldEntry {
  arrayValue: boolean;
  checkedValue?: any;
  isTime: boolean;
  item: ModelField;
  kind: string;
  schema: any;
  uncheckedValue?: any;
}

const header = ref<any>({});
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
  title: '模型表单',
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

async function loadOptions(item: ModelField): Promise<any[]> {
  const source = String(item.parameterSource || '').trim();
  const content = String(item.parameterContent || '').trim();
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
    console.warn('加载表单选项失败', item.field, error);
  }
  return [];
}

function baseControl(item: ModelField) {
  const code = normalizedCode(item.formCode);
  const label = item.name || item.field;
  const attrProps = parseFormAttr(item.formAttr);
  const props: Record<string, any> = { ...attrProps };
  const inputPlaceholder = `请输入${label}`;
  const selectPlaceholder = `请选择${label}`;
  let component = 'Input';
  let kind = 'text';
  let arrayValue = false;
  let isTime = false;
  let checkedValue: any;
  let uncheckedValue: any;

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
      const valueType = String(item.valueType || '');
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
      component = 'Switch';
      kind = 'boolean';
      props.checkedValue = props.checkedValue ?? 'true';
      props.uncheckedValue = props.uncheckedValue ?? 'false';
      checkedValue = props.checkedValue;
      uncheckedValue = props.uncheckedValue;
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
    checkedValue,
    component,
    isTime,
    kind,
    props,
    uncheckedValue,
  };
}

function buildRules(item: ModelField) {
  const modes = [
    ...(item.ruleItems || []).map((rule) => rule?.ruleMode),
    ...(item.rules || []),
  ].filter(Boolean);
  return modes.includes('required') ? 'required' : undefined;
}

async function buildEntry(item: ModelField): Promise<FieldEntry> {
  const label = item.name || item.field;
  const control = baseControl(item);
  let { arrayValue, component, isTime, kind } = control;
  const props = control.props;
  const { checkedValue, uncheckedValue } = control;

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
      options = await loadOptions(item);
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
    checkedValue,
    isTime,
    item,
    kind,
    schema: {
      component,
      componentProps: props,
      descriptionPg: item.description || undefined,
      fieldName: item.field,
      label,
      rules: buildRules(item),
    },
    uncheckedValue,
  };
}

function buildSchema(fieldEntries: FieldEntry[]) {
  const result: any[] = [];
  const groups = new Map<string, any>();
  for (const entry of fieldEntries) {
    const group = String(entry.item.formGroup || '').trim();
    if (!group) {
      result.push(entry.schema);
      continue;
    }
    let groupSchema = groups.get(group);
    if (!groupSchema) {
      groupSchema = {
        children: [],
        name: group,
        title: group,
        type: 'group',
        wrapperClass: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      };
      groups.set(group, groupSchema);
      result.push(groupSchema);
    }
    groupSchema.children.push(entry.schema);
  }
  return result;
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
    return isTruthyValue(raw)
      ? (entry.checkedValue ?? 'true')
      : (entry.uncheckedValue ?? 'false');
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

function getConfigValue(config: any, field: ModelField) {
  if (config) {
    return Number(config.binary) === 1 ? config.valueBinary : config.value;
  }
  return Number(field.binary) === 1 ? field.valueBinary : field.value;
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
  header.value = {};
  entries.value = [];

  try {
    const data: any = drawerApi.getData() || {};
    const row = data.values || data;
    if (!row?.id) {
      message.warning('缺少模型信息');
      return;
    }
    const detail: any = await getDetail(row.id);
    const modelHeader = detail?.header || row;
    header.value = modelHeader;
    const body: ModelField[] = Array.isArray(detail?.body) ? detail.body : [];
    const visibleFields = body
      .filter((item) => Number(item.show) === 1)
      .toSorted((a, b) => Number(a.sort || 0) - Number(b.sort || 0));

    let configItems: any[] = [];
    if (modelHeader?.model) {
      const res: any = await allByModel({ model: modelHeader.model }).catch(
        () => [],
      );
      configItems = Array.isArray(res) ? res : res?.data || [];
    }
    const configMap = new Map(
      configItems.map((item: any) => [item.field, item]),
    );

    entries.value = await Promise.all(
      visibleFields.map((item) => buildEntry(item)),
    );

    const initial: Record<string, any> = {};
    for (const entry of entries.value) {
      const config = configMap.get(entry.item.field);
      let raw = getConfigValue(config, entry.item);
      if (raw === undefined || raw === null) {
        raw = entry.item.defaultValue;
      }
      initial[entry.item.field] = toFormValue(entry, raw);
    }

    formApi.setState({ schema: buildSchema(entries.value) });
    await nextTick();
    formApi.setValues(initial);

    if (visibleFields.length === 0) {
      message.warning('该模型暂无字段，请先在【设计器】配置字段');
    }
  } catch (error) {
    console.error(error);
    message.error('加载模型表单失败');
  } finally {
    drawerApi.setState({
      loading: false,
      title: `模型表单：${header.value?.name || header.value?.model || ''}`,
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
    data[entry.item.field] = serializeValue(entry, values[entry.item.field]);
  }
  if (Object.keys(data).length === 0) {
    message.warning('没有可保存的字段');
    return false;
  }
  drawerApi.setState({ confirmLoading: true });
  drawerApi.lock();
  try {
    await updateValues({
      data,
      model: header.value?.model,
      modelNo: header.value?.no,
    });
    message.success('保存成功');
    emit('ok');
    drawerApi.setState({ confirmLoading: false });
    drawerApi.close();
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
        <span class="font-bold">{{ header.name || '模型表单' }}</span>
        <span v-if="header.model" class="text-xs text-gray-400">
          {{ header.model }}
        </span>
      </div>
      <Form v-if="entries.length > 0" />
      <div v-else class="py-10 text-center text-gray-400">
        该模型暂无字段，请先在【设计器】配置字段
      </div>
      <div v-if="entries.length > 0" class="mt-2 text-xs text-gray-400">
        共
        {{ entries.length }}
        个字段，仅提交显示的字段；保存后写入该模型的配置值。
      </div>
    </div>
  </Drawer>
</template>

<style scoped></style>
