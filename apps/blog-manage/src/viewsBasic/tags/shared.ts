import { ref } from 'vue';

import { selectNodeAllPublic } from '#/viewsBasic/module/api';

/**
 * 模块编号 -> 模块名称
 */
export const moduleNameMap = ref<Record<string, string>>({});

/**
 * 模块下拉选项
 */
export const moduleOptions = ref<Array<{ label: string; value: string }>>([]);

/**
 * 加载模块（公共树），用于下拉/名称映射
 */
export async function loadModules() {
  const list: any[] = (await selectNodeAllPublic({})) || [];
  const map: Record<string, string> = {};
  const options: Array<{ label: string; value: string }> = [];
  list.forEach((item: any) => {
    if (item?.value) {
      map[item.value] = item.label;
      options.push({ label: item.label, value: item.value });
    }
  });
  moduleNameMap.value = map;
  moduleOptions.value = options;
}

/**
 * 分类编号 -> 分类名称
 */
export const categoryNameMap = ref<Record<string, string>>({});

/**
 * 用分类树节点（value/label）回填分类名称映射
 * @param list
 */
export function fillCategoryNames(list: any[]) {
  const map: Record<string, string> = {};
  (list || []).forEach((item: any) => {
    if (item?.value) {
      map[item.value] = item.label;
    }
  });
  categoryNameMap.value = map;
}
