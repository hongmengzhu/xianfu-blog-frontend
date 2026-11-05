import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 2021,
      title: '设计',
    },
    name: 'designer',
    path: '/lq2/designer/area',
    children: [
      {
        meta: {
          title: '配置列表',
          icon: 'mdi:account-multiple',
        },
        name: 'basic-config',
        path: '/lq2/designer/config',
        component: () => import('#/viewsB72/config/list/index.vue'),
      },

      {
        meta: {
          title: '模型',
          icon: 'mdi:account-key',
        },
        name: 'basic-model',
        path: '/lq2/designer/model',
        component: () => import('#/viewsB72/configModel/index.vue'),
      },
      {
        meta: {
          title: '模型事件页面',
          icon: 'mdi:account-key',
        },
        name: 'basic-event',
        path: '/lq2/designer/event',
        component: () => import('#/viewsB72/configEvent/event/index.vue'),
      },
      {
        meta: {
          title: '事件-demo',
          icon: 'mdi:account-key',
        },
        name: 'basic-event-demo',
        path: '/lq2/designer/event-demo',
        component: () => import('#/viewsB72/configEvent/demo/demo.vue'),
      },
    ],
  },
];

export default routes;
