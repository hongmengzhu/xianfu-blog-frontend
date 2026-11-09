<script setup lang="ts">
import type { Recordable } from '@vben/types';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { PgTree } from '@pg/components-n';

import { selectNodePublic as categoryTag } from '#/viewsBasic/tags/category/api';

import { All } from '../api';

const emit = defineEmits(['select', 'register', 'ok']);

const titleRef = ref('选择标签');
const currenRecord = ref(false);
const currenData = ref<Recordable<any>>({
  label: '',
});
const tags = ref<Recordable<any>[]>([]);
const tagsSelect = ref<Recordable<any>[]>([]);
const getTitle = computed(() => currenData.value.label);

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  onConfirm: async () => {
    modalApi.setState({ loading: true });
    emit('ok', tagsSelect.value);
    modalApi.setState({ loading: false });
    modalApi.close();
  },
  onOpenChange(isOpen: boolean) {
    currenData.value.label = '选择标签: ';
    titleRef.value = '选择标签: ';
    if (isOpen) {
      modalApi.setState({ title: titleRef.value });
    }
  },
  title: '选择标签',
});

/**
 * 读取分类下的标签
 * @param code 分类编号
 */
function getData(code) {
  if (!code) {
    tags.value = [];
    return;
  }
  All({ categoryNo: code }).then((res) => {
    tags.value = (res as Recordable<any>[]) || [];
  });
}

/**
 * 选择分类
 * @param record
 */
const treeChang = (record: any) => {
  currenRecord.value = true;
  currenData.value = record || {};
  getData(record?.key || record?.data?.value);
};

/**
 * 树重载
 */
const treeOverload = () => {
  tags.value = [];
};

/**
 * 读取标签显示属性，缺省时使用默认值
 * @param item
 * @param key
 * @param defaultValue
 */
function tagAttr(item: any, key: string, defaultValue: any) {
  const map = item?.attributeMap;
  if (map && Object.prototype.hasOwnProperty.call(map, key)) {
    return map[key];
  }
  return defaultValue;
}

/**
 * 选中标签
 * @param row
 */
function selectTag(row: any) {
  if (tagsSelect.value.indexOf(row) === -1) {
    tagsSelect.value.push(row);
  }
}

/**
 * 取消选中标签
 * @param row
 */
function selectTagDel(row: any) {
  const index = tagsSelect.value.indexOf(row);
  if (index !== -1) {
    tagsSelect.value.splice(index, 1);
  }
}
</script>

<template>
  <Modal class="w-[1200px]">
    <NLayout class="h-full p-2 methodFast" has-sider>
      <NLayoutSider class="min-w-[160px]" width="160">
        <PgTree
          :api="categoryTag"
          :right-click-menu="false"
          @ok="treeChang"
          @overload="treeOverload"
        />
      </NLayoutSider>
      <NLayout class="w-[calc(100%-160px)]">
        <NLayoutContent>
          <n-page-header
            v-if="tagsSelect"
            title="选中的"
            class="mb-2 border-b border-b-solid border-b-slate-300 pb-2"
          >
            <template #back></template>
            <div class="flex flex-row flex-wrap">
              <div
                v-for="item in tagsSelect"
                :key="item.id"
                class="mb-2 mr-2 mt-2"
              >
                <n-tag
                  :bordered="tagAttr(item, 'bordered', true)"
                  :type="tagAttr(item, 'type', 'default')"
                  :color="tagAttr(item, 'color', undefined)"
                  :size="tagAttr(item, 'size', 'medium')"
                  :strong="tagAttr(item, 'strong', false)"
                  :round="tagAttr(item, 'round', false)"
                  class="cursor-pointer"
                  @click="selectTagDel(item)"
                >
                  {{ item.name }}
                </n-tag>
              </div>
            </div>
          </n-page-header>
          <n-page-header
            v-if="getTitle"
            :title="getTitle"
            class="mb-2 border-b border-b-solid border-b-slate-300"
          >
            <template #back></template>
          </n-page-header>
          <div v-else style="padding-top: 40px">
            <n-empty description="没有任何数据" />
          </div>
          <div class="flex flex-row">
            <div v-for="item in tags" :key="item.id" class="mb-2 mr-2 mt-2">
              <n-tag
                :bordered="tagAttr(item, 'bordered', true)"
                :type="tagAttr(item, 'type', 'default')"
                :color="tagAttr(item, 'color', undefined)"
                :size="tagAttr(item, 'size', 'medium')"
                :strong="tagAttr(item, 'strong', false)"
                :round="tagAttr(item, 'round', false)"
                @click="selectTag(item)"
              >
                {{ item.name }}
              </n-tag>
            </div>
          </div>
        </NLayoutContent>
      </NLayout>
    </NLayout>
  </Modal>
</template>

<style scoped>
.methodFast {
  .n-card-header {
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .n-tag {
    cursor: pointer;
  }
}
</style>
