<script lang="ts" setup>
import type { DropdownOption, TreeOption } from 'naive-ui';

import type { Recordable } from '@vben-core/typings';

import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  unref,
  watch,
} from 'vue';

import { isFunction } from '@vben/utils';

import { RiMore2Fill } from '@pg/icons';
import { getTreeAll, useNode } from '@pg/utils';
import { NDropdown, NInput, NTree } from 'naive-ui';
import { get } from 'xe-utils';

import { pgTreeSelectProps, pgTreeSelectPropsDefault } from './props';

const props = defineProps({
  ...pgTreeSelectProps,
});

const emit = defineEmits([
  'ok',
  'overload',
  'update:checkedKeys',
  'update:selected-keys',
  'result:data',
  'result:source',
]);

const treeData = ref<Recordable<any>[]>([]);
const treeIds = ref<string[]>([]);
const isFirstLoaded = ref<boolean>(false);
const loading = ref(false);
const checkedAll = ref(false);
const selectedKeys = ref([]);
const rootRef = ref<HTMLElement | null>(null);
const measuredMinHeight = ref('');
let regionResizeObserver: null | ResizeObserver = null;
let visibilityObserver: IntersectionObserver | null = null;

/**
 * 累加从 start（含）到 stop（不含）之间各层元素的底部内边距
 * @param start
 * @param stop
 */
function sumBottomPadding(start: HTMLElement | null, stop: HTMLElement | null) {
  let total = 0;
  let current = start;
  while (current && current !== stop) {
    const style = window.getComputedStyle(current);
    total += Number.parseFloat(style.paddingBottom) || 0;
    current = current.parentElement;
  }
  return total;
}

/**
 * 计算树的最小高度：以最近的 Page 内容区为可用区域，
 * 自动扣除 Page header、内边距等占位，避免固定写死 100vh - 141px
 * 在带 header 的页面里多出滚动条。
 */
function measureMinHeight() {
  if (props.minHeight) {
    return;
  }
  const el = rootRef.value;
  if (!el || typeof window === 'undefined') {
    return;
  }
  const rect = el.getBoundingClientRect();
  // 隐藏状态（display:none）下不计算，等可见后再测量
  if (rect.width === 0 && rect.height === 0) {
    return;
  }
  const region = el.closest(
    '[data-layout-region="page-content"]',
  ) as HTMLElement | null;
  let bottom: number;
  if (region) {
    const regionRect = region.getBoundingClientRect();
    const regionStyle = window.getComputedStyle(region);
    bottom =
      regionRect.bottom - (Number.parseFloat(regionStyle.paddingBottom) || 0);
  } else {
    // 没有 Page 容器（如 Modal、NLayout）时退化为视口底部，
    // 再扣除各层父元素底部内边距，避免多出几个像素的滚动条
    bottom = window.innerHeight;
  }
  const bottomPadding = sumBottomPadding(
    el.parentElement,
    region ?? document.body,
  );
  const available = Math.floor(bottom - rect.top - bottomPadding) - 1;
  measuredMinHeight.value = available > 0 ? `${available}px` : '';
}

const minHeightComputed = computed(() => {
  if (props.minHeight) {
    return props.minHeight;
  }
  return measuredMinHeight.value || undefined;
});
const classComputed = computed(() => props.class);

const pattern = ref('');
const showDropdownRef = ref(false);
const menuOptionsRef = ref<DropdownOption[]>([
  {
    key: '刷新',
    label: '刷新',
    props: {
      onClick: () => {
        handlerReload();
        emit('overload');
      },
    },
  },
  {
    key: '展开/收起',
    label: '展开/收起',
    props: {
      onClick: () => {
        expandAll();
      },
    },
  },
  {
    key: '取消/选择',
    label: '取消/选择',
    props: {
      onClick: () => {
        checkedAllHandle();
      },
    },
  },
]);
const optionsRef = ref<DropdownOption[]>([]);
const xRef = ref(0);
const yRef = ref(0);

const getAttrs = computed(() => {
  Object.keys(pgTreeSelectPropsDefault).forEach((key) => {
    if (!props.props.hasOwnProperty(key)) {
      // eslint-disable-next-line vue/no-mutating-props
      props.props[key] = pgTreeSelectPropsDefault[key];
    }
  });
  return {
    ...(props.api ? { options: unref(treeData) } : {}),
    ...props.props,
  };
});

const handleSelect = () => {
  showDropdownRef.value = false;
};
const handleClickOutside = () => {
  showDropdownRef.value = false;
};
const nodeProps = ({ option }: { option: TreeOption }) => {
  return {
    onClick() {
      emit('ok', option);
    },
    onContextmenu(e: MouseEvent): void {
      // 开启右键菜单
      if (props.rightClickMenu) {
        if (
          props.rightClickMenuOptions &&
          isFunction(props.rightClickMenuOptions)
        ) {
          optionsRef.value = props.rightClickMenuOptions({ e, option });
        }
        showDropdownRef.value = true;
        xRef.value = e.clientX;
        yRef.value = e.clientY;
        // console.log(e.clientX, e.clientY)
        e.preventDefault();
      }
    },
  };
};
// 菜单
if (
  props.hasOwnProperty('menuDropdownOptions') &&
  Object.values(props.menuDropdownOptions).length > 0
) {
  props.menuDropdownOptions.forEach((item) => {
    menuOptionsRef.value.push(item);
  });
}
const afterFetchDefault = (result) => {
  return useNode({
    data: result,
    // key 字段名称
    keyField: 'value',
    // label 字段名称
    labelField: 'label',
    parentField: 'parentNo',
  }).getTreeData;
};
const afterFetchDefaultNodeAll = (result) => {
  return useNode({
    data: result,
    // key 字段名称,值
    keyField: 'value',
    // label 字段名称，键
    labelField: 'label',
    parentField: 'parentNo',
    isNodeAll: true,
  }).getTreeData;
};
/**
 * 读取树
 */
async function fetch() {
  const { afterFetch, api } = props;
  if (!api || !isFunction(api)) return;
  loading.value = true;
  treeData.value = [];
  treeIds.value = [];
  let result;
  try {
    result = await api(props.params);
  } catch (error) {
    console.error(error);
  }
  emit('result:source', result);
  // console.log('result=>',result)
  if (!result) return;
  if (props.isNodeAll) {
    result = await afterFetchDefaultNodeAll(result);
  } else {
    result = await afterFetchDefault(result);
  }
  if (afterFetch && isFunction(afterFetch)) {
    result = await afterFetch(result);
  }
  // console.log('result',result)
  loading.value = false;
  if (!result) return;
  if (!Array.isArray(result)) {
    result = get(result, props.resultField);
  }
  // console.info('result=>', result);
  treeData.value = (result as Recordable<any>[]) || [];

  if (treeData.value && treeData.value.length > 0) {
    treeIds.value = getTreeAll(treeData.value);
  }
  if (!isFirstLoaded.value) {
    props.props.expandedKeys = treeIds.value as [];
  }
  isFirstLoaded.value = true;
  emit('result:data', treeData.value);
}

watch(
  () => props.params,
  () => {
    !unref(isFirstLoaded) && fetch();
  },
  { deep: true },
);
watch(
  () => props.reload,
  (val, old) => {
    console.log('props.reload', val, old);
    if (val != old) {
      handlerReload();
    }
  },
  { deep: true },
);

watch(
  () => props.immediate,
  (v) => {
    v && !isFirstLoaded.value && fetch();
  },
);

onMounted(() => {
  props.immediate && fetch();
  nextTick(measureMinHeight);
  window.addEventListener('resize', measureMinHeight);
  const region = rootRef.value?.closest(
    '[data-layout-region="page-content"]',
  ) as HTMLElement | null;
  if (region && typeof ResizeObserver !== 'undefined') {
    regionResizeObserver = new ResizeObserver(() => measureMinHeight());
    regionResizeObserver.observe(region);
  }
  const el = rootRef.value;
  if (el && typeof IntersectionObserver !== 'undefined') {
    visibilityObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        measureMinHeight();
      }
    });
    visibilityObserver.observe(el);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', measureMinHeight);
  regionResizeObserver?.disconnect();
  regionResizeObserver = null;
  visibilityObserver?.disconnect();
  visibilityObserver = null;
});

/**
 * 刷新
 */
const handlerReload = () => {
  // if (props.props.checkedKeys) {
  //   props.props.checkedKeys = Array.isArray(props.props.checkedKeys)
  //     ? []
  //     : null;
  // }
  props.props.selectedKeys = undefined;
  emit('update:selected-keys', undefined);
  fetch();
};
function OnUpdateCheckedKeys(keys, meta) {
  props.props.checkedKeys = keys;
  emit('update:checkedKeys', {
    keys,
    meta,
  });
}
/**
 * 展开全部
 */
const expandAll = () => {
  props.props.expandedKeys =
    props.props.expandedKeys && props.props.expandedKeys.length > 0
      ? []
      : (treeIds.value as []);
};
/**
 * 取消/全选
 */
function checkedAllHandle() {
  if (checkedAll.value) {
    props.props.checkedKeys = [];
    checkedAll.value = false;
  } else {
    props.props.checkedKeys = treeIds.value as [];
    checkedAll.value = true;
  }
}
const checkedKeysComputed = computed(() => {
  return props.props.checkedKeys;
});
const selectedKeysComputed = computed(() => {
  if (props.props?.selectedKeys) {
    return props.props.selectedKeys;
  }
  return selectedKeys.value;
});
/**
 * 全部
 */
function defaultAllHandle() {
  props.props.checkedKeys = [];
  selectedKeys.value = [];
  checkedAll.value = false;

  handlerReload();
  emit('overload');
}
</script>

<template>
  <div
    ref="rootRef"
    :style="{ minHeight: minHeightComputed }"
    :class="classComputed"
    class="bg-background relative flex h-full flex-col overflow-hidden"
  >
    <div v-if="props.headerShow" class="flex h-[34px] shrink-0 items-center">
      <NInput
        v-model:value="pattern"
        clearable
        placeholder="搜索"
        size="tiny"
      />
      <NDropdown :options="menuOptionsRef" :show-arrow="true">
        <RiMore2Fill :size="29" />
      </NDropdown>
    </div>
    <div
      class="flex h-[34px] shrink-0 cursor-pointer items-center"
      @click="defaultAllHandle"
    >
      全部
    </div>
    <div class="min-h-0 flex-1 overflow-y-auto">
      <NTree
        @update:checked-keys="OnUpdateCheckedKeys"
        v-bind="getAttrs"
        :checked-keys="checkedKeysComputed"
        :data="treeData"
        :node-props="nodeProps"
        :pattern="pattern"
        :selected-keys="selectedKeysComputed"
      >
        <template v-if="props.slotEmpty" #empty>
          <slot name="empty"> </slot>
        </template>
      </NTree>
    </div>
    <NDropdown
      :options="optionsRef"
      :show="showDropdownRef"
      :x="xRef"
      :y="yRef"
      placement="bottom-start"
      trigger="manual"
      @clickoutside="handleClickOutside"
      @select="handleSelect"
    />
  </div>
</template>
