import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'mdi:shield-key-outline',
      keepAlive: true,
      order: 1002,
      title: '身份中心',
    },
    name: 'idp',
    path: '/lq2/idp',
    children: [
      {
        meta: {
          title: '概览',
          icon: 'lucide:layout-dashboard',
        },
        name: 'idp-overview',
        path: '/lq2/idp/overview',
        component: () => import('#/viewsIdp/overview/index.vue'),
      },
      {
        meta: {
          title: '身份提供商',
          icon: 'carbon:security',
        },
        name: 'idp-identity-provider',
        path: '/lq2/idp/identity-provider',
        component: () => import('#/viewsIdp/identityProvider/index.vue'),
      },
      {
        meta: {
          title: '认证源',
          icon: 'mdi:account-key',
        },
        name: 'idp-identity-source',
        path: '/lq2/idp/identity-source',
        component: () => import('#/viewsIdp/identitySource/index.vue'),
      },
      {
        meta: {
          title: '回调白名单',
          icon: 'material-symbols:rule',
        },
        name: 'idp-identity-source-callback',
        path: '/lq2/idp/identity-source-callback',
        component: () => import('#/viewsIdp/identitySourceCallback/index.vue'),
      },
      {
        meta: {
          title: '身份绑定',
          icon: 'lucide:user',
        },
        name: 'idp-idp-binding',
        path: '/lq2/idp/idp-binding',
        component: () => import('#/viewsIdp/idpBinding/index.vue'),
      },
      {
        meta: {
          title: '凭证管理',
          icon: 'mdi:account-settings',
        },
        name: 'idp-credential',
        path: '/lq2/idp/idp-credential',
        component: () => import('#/viewsIdp/idpCredential/index.vue'),
      },
      {
        meta: {
          title: '元数据缓存',
          icon: 'carbon:software-resource',
        },
        name: 'idp-metadata-cache',
        path: '/lq2/idp/idp-metadata-cache',
        component: () => import('#/viewsIdp/idpMetadataCache/index.vue'),
      },
      {
        meta: {
          title: 'LDAP 工具',
          icon: 'carbon:workspace',
        },
        name: 'idp-ldap',
        path: '/lq2/idp/ldap',
        component: () => import('#/viewsIdp/ldap/index.vue'),
      },
    ],
  },
];

export default routes;
