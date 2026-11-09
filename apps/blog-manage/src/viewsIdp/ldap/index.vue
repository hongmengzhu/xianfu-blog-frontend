<script lang="ts" setup>
import type { DataTableColumns } from 'naive-ui';

import { computed, h, reactive, ref, watch } from 'vue';

import { Page } from '@vben/common-ui';

import { message } from '#/adapter';

import { parseJsonObject } from '../shared/constants';
import { useIdpLookups } from '../shared/useIdpLookups';
import { ldapLogin, ldapSearch, ldapSync, ldapTest } from './api';

defineOptions({ name: 'IdpLdapTool' });

const { ensureLoaded, findSource, ldapSourceOptions } = useIdpLookups();
const lookupReady = ensureLoaded();

const sourceNo = ref<null | string>(null);
const testResult = ref<any>(null);
const searchFilter = ref('');
const users = ref<any[]>([]);
const syncResult = ref<any>(null);
const loginForm = reactive({ password: '', username: '' });
const loginResult = ref<any>(null);

const loading = reactive({
  login: false,
  search: false,
  sync: false,
  test: false,
});

const currentSource = computed(() => findSource(sourceNo.value ?? ''));

/** 从认证源配置中提取连接信息，便于排障 */
const configPreview = computed(() => {
  const source = currentSource.value;
  if (!source) {
    return null;
  }
  const baseCfg = parseJsonObject(source.baseConfig);
  const syncCfg = parseJsonObject(source.syncStrategyConfig);
  return {
    baseDn: syncCfg.baseDn || '-',
    bindDn: baseCfg.clientId || '-',
    host: baseCfg.hostUrl || '-',
    port:
      Number(syncCfg.port ?? 0) > 0
        ? Number(syncCfg.port)
        : syncCfg.enableSsl
          ? 636
          : 389,
    ssl: Boolean(syncCfg.enableSsl),
  };
});

watch(sourceNo, () => {
  testResult.value = null;
  users.value = [];
  syncResult.value = null;
  loginResult.value = null;
});

async function onTest() {
  if (!sourceNo.value) {
    message.warning('请先选择 LDAP 认证源');
    return;
  }
  loading.test = true;
  try {
    testResult.value = await ldapTest(sourceNo.value);
  } catch {
    testResult.value = null;
  } finally {
    loading.test = false;
  }
}

async function onSearch() {
  if (!sourceNo.value) {
    message.warning('请先选择 LDAP 认证源');
    return;
  }
  loading.search = true;
  try {
    const res: any = await ldapSearch(sourceNo.value, searchFilter.value);
    users.value = Array.isArray(res) ? res : [];
  } catch {
    users.value = [];
  } finally {
    loading.search = false;
  }
}

async function onSync() {
  if (!sourceNo.value) {
    message.warning('请先选择 LDAP 认证源');
    return;
  }
  loading.sync = true;
  try {
    syncResult.value = await ldapSync(sourceNo.value);
  } catch {
    syncResult.value = null;
  } finally {
    loading.sync = false;
  }
}

async function onLogin() {
  if (!sourceNo.value) {
    message.warning('请先选择 LDAP 认证源');
    return;
  }
  if (!loginForm.username || !loginForm.password) {
    message.warning('请输入 LDAP 用户名和密码');
    return;
  }
  loading.login = true;
  loginResult.value = null;
  try {
    loginResult.value = await ldapLogin({
      password: loginForm.password,
      sourceNo: sourceNo.value,
      username: loginForm.username,
    });
  } catch {
    loginResult.value = null;
  } finally {
    loading.login = false;
  }
}

const userColumns: DataTableColumns<any> = [
  { key: 'uid', title: 'UID', width: 150 },
  { key: 'cn', title: 'CN', width: 150 },
  { key: 'displayName', title: '显示名', minWidth: 150 },
  { key: 'email', title: '邮箱', minWidth: 180, ellipsis: { tooltip: true } },
  { key: 'mobile', title: '手机号', width: 140 },
  {
    key: 'memberOf',
    render: (row) => h('span', `${row.memberOf?.length ?? 0} 个`),
    title: '所属组',
    width: 90,
  },
  {
    ellipsis: { tooltip: true },
    key: 'uuid',
    title: 'UUID',
    width: 200,
  },
];

void lookupReady;
</script>

<template>
  <Page auto-content-height content-class="p-2">
    <div class="h-full overflow-auto">
      <n-alert
        v-if="ldapSourceOptions.length === 0"
        class="mb-3"
        type="warning"
      >
        暂无 LDAP 认证源。请先在「认证源」中新增协议为 LDAP 的认证源， 并填写
        HostUrl、ClientId（绑定 DN）、ClientSecret（绑定密码）以及
        BaseDn、端口等同步策略。
      </n-alert>

      <div class="mb-3 flex flex-wrap items-end gap-3">
        <div class="w-80">
          <div class="mb-1 text-xs text-gray-500">LDAP 认证源</div>
          <n-select
            v-model:value="sourceNo"
            clearable
            filterable
            :options="ldapSourceOptions"
            placeholder="请选择认证源"
          />
        </div>
        <n-button
          :disabled="!sourceNo"
          :loading="loading.test"
          type="primary"
          @click="onTest"
        >
          测试连接
        </n-button>
        <n-button
          :disabled="!sourceNo"
          :loading="loading.search"
          @click="onSearch"
        >
          搜索用户
        </n-button>
        <n-button :disabled="!sourceNo" :loading="loading.sync" @click="onSync">
          同步用户
        </n-button>
      </div>

      <div class="grid gap-3 xl:grid-cols-2">
        <n-card size="small" title="连接信息">
          <n-descriptions
            v-if="configPreview"
            bordered
            :column="2"
            size="small"
          >
            <n-descriptions-item label="主机">
              {{ configPreview.host }}
            </n-descriptions-item>
            <n-descriptions-item label="端口">
              {{ configPreview.port }}
            </n-descriptions-item>
            <n-descriptions-item label="BaseDn">
              {{ configPreview.baseDn }}
            </n-descriptions-item>
            <n-descriptions-item label="绑定 DN">
              {{ configPreview.bindDn }}
            </n-descriptions-item>
            <n-descriptions-item label="SSL">
              {{ configPreview.ssl ? '启用' : '关闭' }}
            </n-descriptions-item>
            <n-descriptions-item label="协议">
              {{ currentSource?.protocol || '-' }}
            </n-descriptions-item>
          </n-descriptions>
          <n-empty v-else description="选择认证源后显示连接信息" size="small" />

          <template #footer>
            <n-descriptions
              v-if="testResult"
              bordered
              :column="2"
              label-placement="left"
              size="small"
              title="连接测试结果"
            >
              <n-descriptions-item label="连接">
                <n-tag
                  :type="testResult.connected ? 'success' : 'error'"
                  size="small"
                >
                  {{ testResult.connected ? '成功' : '失败' }}
                </n-tag>
              </n-descriptions-item>
              <n-descriptions-item label="AD 模式">
                {{ testResult.isAd ? '是' : '否' }}
              </n-descriptions-item>
              <n-descriptions-item label="用户数">
                {{ testResult.userCount ?? 0 }}
              </n-descriptions-item>
              <n-descriptions-item label="消息">
                {{ testResult.message || '-' }}
              </n-descriptions-item>
            </n-descriptions>
            <n-empty v-else description="尚未测试连接" size="small" />
          </template>
        </n-card>

        <n-card size="small" title="同步结果">
          <n-descriptions
            v-if="syncResult"
            bordered
            :column="3"
            label-placement="top"
            size="small"
          >
            <n-descriptions-item label="新增">
              {{ syncResult.newUsers ?? 0 }}
            </n-descriptions-item>
            <n-descriptions-item label="更新">
              {{ syncResult.updatedUsers ?? 0 }}
            </n-descriptions-item>
            <n-descriptions-item label="失败">
              {{ syncResult.failedUsers ?? 0 }}
            </n-descriptions-item>
          </n-descriptions>
          <n-empty
            v-else
            description="点击「同步用户」后显示结果"
            size="small"
          />
          <template #footer>
            <div class="text-xs text-gray-500">
              同步会将 LDAP 用户写入本地账号，并按认证源配置建立绑定关系。
            </div>
          </template>
        </n-card>
      </div>

      <n-card class="mt-3" size="small" title="用户目录">
        <template #header-extra>
          <div class="flex items-center gap-2">
            <n-input
              v-model:value="searchFilter"
              clearable
              placeholder="LDAP 过滤条件，如 (uid=test*)"
              style="width: 320px"
            />
            <n-button size="small" @click="onSearch">搜索</n-button>
          </div>
        </template>
        <n-data-table
          :columns="userColumns"
          :data="users"
          :loading="loading.search"
          :max-height="360"
          :row-key="(row: any) => row.uuid || row.uid"
          size="small"
          striped
        />
      </n-card>

      <n-card class="mt-3" size="small" title="LDAP 登录验证">
        <div class="flex flex-wrap items-end gap-3">
          <div class="w-64">
            <div class="mb-1 text-xs text-gray-500">LDAP 用户名</div>
            <n-input
              v-model:value="loginForm.username"
              clearable
              placeholder="uid / sAMAccountName"
            />
          </div>
          <div class="w-64">
            <div class="mb-1 text-xs text-gray-500">密码</div>
            <n-input
              v-model:value="loginForm.password"
              clearable
              placeholder="密码"
              show-password-on="click"
              type="password"
            />
          </div>
          <n-button :loading="loading.login" type="primary" @click="onLogin">
            验证登录
          </n-button>
        </div>
        <n-descriptions
          v-if="loginResult"
          class="mt-3"
          bordered
          :column="2"
          label-placement="left"
          size="small"
        >
          <n-descriptions-item label="认证结果">
            <n-tag type="success" size="small">通过</n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="账号">
            {{ loginResult.info?.account || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="姓名">
            {{ loginResult.info?.name || loginResult.info?.realName || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="Token">
            <span class="break-all">{{
              loginResult.accessToken ? '已签发' : '未签发'
            }}</span>
          </n-descriptions-item>
        </n-descriptions>
      </n-card>
    </div>
  </Page>
</template>
