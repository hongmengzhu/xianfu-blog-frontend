<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import { createIdpApi } from '../shared/api';
import { formatDateTime, protocolLabel } from '../shared/constants';
import { useIdpLookups } from '../shared/useIdpLookups';

defineOptions({ name: 'IdpOverview' });

const router = useRouter();
const { ensureLoaded, providerName, sourceName } = useIdpLookups();

const loading = ref(true);
const counts = ref<Record<string, number>>({});
const sources = ref<any[]>([]);
const recentBindings = ref<any[]>([]);

const apiMap = {
  binding: createIdpApi('idp-binding'),
  callback: createIdpApi('identity-source-callback'),
  credential: createIdpApi('idp-credential'),
  metadata: createIdpApi('idp-metadata-cache'),
  provider: createIdpApi('identity-provider'),
  source: createIdpApi('identity-source'),
};

const stats = computed(() => [
  {
    key: 'identity-provider',
    label: '身份提供商',
    path: '/lq2/idp/identity-provider',
    value: counts.value.provider ?? 0,
  },
  {
    key: 'identity-source',
    label: '认证源',
    path: '/lq2/idp/identity-source',
    value: counts.value.source ?? 0,
  },
  {
    key: 'identity-source-callback',
    label: '回调白名单',
    path: '/lq2/idp/identity-source-callback',
    value: counts.value.callback ?? 0,
  },
  {
    key: 'idp-binding',
    label: '身份绑定',
    path: '/lq2/idp/idp-binding',
    value: counts.value.binding ?? 0,
  },
  {
    key: 'idp-credential',
    label: '凭证',
    path: '/lq2/idp/idp-credential',
    value: counts.value.credential ?? 0,
  },
  {
    key: 'idp-metadata-cache',
    label: '元数据缓存',
    path: '/lq2/idp/idp-metadata-cache',
    value: counts.value.metadata ?? 0,
  },
]);

const protocolStats = computed(() => {
  const map = new Map<string, number>();
  sources.value.forEach((item) => {
    const key = String(item.protocol || 'unknown');
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  const total = sources.value.length || 1;
  return [...map.entries()]
    .map(([key, value]) => ({
      key,
      label: protocolLabel(key === 'unknown' ? '' : key),
      percent: Math.round((value / total) * 100),
      value,
    }))
    .sort((a, b) => b.value - a.value);
});

const enabledSourceCount = computed(
  () => sources.value.filter((item) => Number(item.state) === 1).length,
);

const quickLinks = [
  { label: '新增提供商', path: '/lq2/idp/identity-provider' },
  { label: '新增认证源', path: '/lq2/idp/identity-source' },
  { label: 'LDAP 工具', path: '/lq2/idp/ldap' },
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 串行统计各资源数量。
 * 后端对单客户端有频率限制，并发请求会触发 429，这里逐条请求并留出间隔。
 */
async function loadCounts() {
  const result: Record<string, number> = {};
  for (const [key, api] of Object.entries(apiMap)) {
    try {
      const res: any = await api.List({ pageNum: 1, pageSize: 1 });
      result[key] = Number(res?.total ?? 0);
    } catch {
      result[key] = 0;
    }
    await sleep(260);
  }
  counts.value = result;
}

async function loadSources() {
  try {
    const res: any = await apiMap.source.List({ pageNum: 1, pageSize: 1000 });
    sources.value = res?.data ?? [];
  } catch {
    sources.value = [];
  }
}

async function loadRecentBindings() {
  try {
    const res: any = await apiMap.binding.List({ pageNum: 1, pageSize: 5 });
    recentBindings.value = res?.data ?? [];
  } catch {
    recentBindings.value = [];
  }
}

async function loadAll() {
  loading.value = true;
  try {
    await loadCounts();
    await loadSources();
    await loadRecentBindings();
    await ensureLoaded();
  } finally {
    loading.value = false;
  }
}

function go(path: string) {
  router.push(path);
}

onMounted(loadAll);
</script>

<template>
  <Page auto-content-height content-class="p-3">
    <n-spin :show="loading">
      <div class="flex flex-col gap-3">
        <n-card size="small">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold">身份中心（IdP）</h2>
              <p class="mt-1 text-sm text-gray-500">
                统一管理身份提供商、认证源、回调白名单、身份绑定、凭证与元数据缓存，
                并为 OAuth2 / OIDC / SAML2 / CAS / LDAP 提供配置支撑。
              </p>
            </div>
            <div class="flex gap-2">
              <n-button
                v-for="item in quickLinks"
                :key="item.path"
                size="small"
                type="primary"
                ghost
                @click="go(item.path)"
              >
                {{ item.label }}
              </n-button>
            </div>
          </div>
        </n-card>

        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <n-card
            v-for="item in stats"
            :key="item.key"
            class="cursor-pointer"
            hoverable
            size="small"
            @click="go(item.path)"
          >
            <n-statistic :label="item.label" :value="item.value" />
          </n-card>
        </div>

        <div class="grid gap-3 xl:grid-cols-2">
          <n-card size="small" title="认证源协议分布">
            <div v-if="protocolStats.length > 0" class="flex flex-col gap-3">
              <div v-for="item in protocolStats" :key="item.key">
                <div class="mb-1 flex items-center justify-between text-sm">
                  <span>{{ item.label }}</span>
                  <span class="text-gray-500">{{ item.value }} 个 / {{ item.percent }}%</span>
                </div>
                <n-progress
                  :percentage="item.percent"
                  :show-indicator="false"
                  status="info"
                />
              </div>
              <div class="mt-2 text-xs text-gray-500">
                共 {{ sources.length }} 个认证源，其中启用
                {{ enabledSourceCount }} 个。
              </div>
            </div>
            <n-empty v-else description="暂无认证源数据" size="small" />
          </n-card>

          <n-card size="small" title="最近身份绑定">
            <div
              v-if="recentBindings.length > 0"
              class="flex flex-col divide-y"
            >
              <div
                v-for="item in recentBindings"
                :key="item.id"
                class="flex items-center justify-between gap-2 py-2"
              >
                <div class="flex flex-col">
                  <span class="text-sm font-medium">
                    {{ item.nickName || item.externalSub || '-' }}
                  </span>
                  <span class="text-xs text-gray-500">
                    {{ providerName(item.idp) }}
                    <template v-if="item.sourceNo">
                      · {{ sourceName(item.sourceNo) }}
                    </template>
                  </span>
                </div>
                <span class="text-xs text-gray-400">
                  {{ formatDateTime(item.bindTime) }}
                </span>
              </div>
            </div>
            <n-empty v-else description="暂无绑定记录" size="small" />
          </n-card>
        </div>
      </div>
    </n-spin>
  </Page>
</template>
