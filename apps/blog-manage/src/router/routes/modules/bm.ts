import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 1001,
      title: '书签',
    },
    name: 'bookmark',
    path: '/lq2/bookmark/index',
    children: [
      {
        meta: {
          title: '书签',
          icon: 'mdi:account-multiple',
        },
        name: 'bookmark-index',
        path: '/lq2/bookmark/index',
        component: () => import('#/viewsBm/bookmark/index.vue'),
      },
      {
        meta: {
          title: '书签分类',
          icon: 'mdi:account-multiple',
        },
        name: 'blog-cat',
        path: '/lq2/bookmark/bookmark-category',
        component: () => import('#/viewsBm/bookmarkCategory/index.vue'),
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 1001,
      title: '工具',
    },
    name: 'tool',
    path: '/lq2/tool/index',
    children: [
      {
        meta: {
          title: '工具',
          icon: 'mdi:account-multiple',
        },
        name: 'tool-index',
        path: '/lq2/tool/index',
        component: () => import('#/viewsBm/tool/index.vue'),
      },
      {
        meta: {
          title: '工具分类',
          icon: 'mdi:account-multiple',
        },
        name: 'tool-cat',
        path: '/lq2/tool/tool-category',
        component: () => import('#/viewsBm/toolCategory/index.vue'),
      },
    ],
  },
];

export default routes;
