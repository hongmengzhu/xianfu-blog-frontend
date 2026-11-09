import type { IdpOption } from './constants';

import { computed, ref } from 'vue';

import { createIdpApi } from './api';
import { protocolLabel } from './constants';

const providerApi = createIdpApi('identity-provider');
const sourceApi = createIdpApi('identity-source');

const providers = ref<any[]>([]);
const sources = ref<any[]>([]);
let loaded = false;
let loadingPromise: null | Promise<void> = null;

async function fetchAll(api: ReturnType<typeof createIdpApi>) {
  const res: any = await api.List({ pageNum: 1, pageSize: 1000 });
  const list = res?.data ?? [];
  return Array.isArray(list) ? list : [];
}

async function load(force = false) {
  if (loadingPromise) {
    return loadingPromise;
  }
  if (loaded && !force) {
    return;
  }
  loadingPromise = (async () => {
    try {
      const [providerList, sourceList] = await Promise.all([
        fetchAll(providerApi),
        fetchAll(sourceApi),
      ]);
      providers.value = providerList;
      sources.value = sourceList;
      loaded = true;
    } catch {
      // 加载失败时保留已有缓存，页面仍可正常使用
    } finally {
      loadingPromise = null;
    }
  })();
  return loadingPromise;
}

/**
 * IdP 关联数据（身份提供商 / 认证源）缓存
 *
 * 认证源、凭证、元数据、绑定等模块保存的是关联编号（no），
 * 列表展示与下拉选择都需要编号与名称的映射。
 */
export function useIdpLookups() {
  const providerOptions = computed<IdpOption[]>(() =>
    providers.value.map((item) => ({
      label: Number(item.state) === 1 ? item.name : `${item.name}（停用）`,
      value: item.no,
    })),
  );

  const sourceOptions = computed<IdpOption[]>(() =>
    sources.value.map((item) => ({
      label: `${item.name}${item.protocol ? `（${protocolLabel(item.protocol)}）` : ''}${
        Number(item.state) === 1 ? '' : '（停用）'
      }`,
      value: item.no,
    })),
  );

  const ldapSourceOptions = computed<IdpOption[]>(() =>
    sourceOptions.value.filter((option) => {
      const source = sources.value.find((item) => item.no === option.value);
      return source?.protocol === 'ldap';
    }),
  );

  function providerName(no?: string) {
    if (!no) {
      return '-';
    }
    return providers.value.find((item) => item.no === no)?.name ?? no;
  }

  function sourceName(no?: string) {
    if (!no) {
      return '-';
    }
    return sources.value.find((item) => item.no === no)?.name ?? no;
  }

  function findSource(no?: string) {
    return sources.value.find((item) => item.no === no);
  }

  function findProvider(no?: string) {
    return providers.value.find((item) => item.no === no);
  }

  /** 刷新缓存（新增/编辑提供商、认证源后调用） */
  function reload() {
    return load(true);
  }

  /** 确保已加载 */
  function ensureLoaded() {
    return load(false);
  }

  return {
    ensureLoaded,
    findProvider,
    findSource,
    ldapSourceOptions,
    providerName,
    providerOptions,
    providers,
    reload,
    sourceName,
    sourceOptions,
    sources,
  };
}
