import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 1000,
      title: '博客',
    },
    name: 'blog',
    path: '/lq2/blog/article',
    children: [
      {
        meta: {
          title: '文章',
          icon: 'mdi:account-multiple',
        },
        name: 'blog-article',
        path: '/lq2/blog/article',
        component: () => import('#/viewsBlog/article/index.vue'),
      },
      {
        meta: {
          title: '文章分类',
          icon: 'mdi:account-multiple',
        },
        name: 'blog-article-cat',
        path: '/lq2/blog/article-category',
        component: () => import('#/viewsBlog/articleCategory/index.vue'),
      },
      {
        meta: {
          title: '主题',
          icon: 'mdi:account-multiple',
        },
        name: 'blog-topic',
        path: '/lq2/blog/topic',
        component: () => import('#/viewsBlog/topic/index.vue'),
      },
      {
        meta: {
          title: '主题分类',
          icon: 'mdi:account-multiple',
        },
        name: 'blog-topic-cat',
        path: '/lq2/blog/topic-cat',
        component: () => import('#/viewsBlog/topicCategory/index.vue'),
      },
      {
        meta: {
          title: '收集',
          icon: 'mdi:account-multiple',
        },
        name: 'blog-collect',
        path: '/lq2/blog/collect',
        component: () => import('#/viewsBlog/collect/index.vue'),
      },
      {
        meta: {
          title: '收集分类',
          icon: 'mdi:account-multiple',
        },
        name: 'blog-collect-cat',
        path: '/lq2/blog/collect-cat',
        component: () => import('#/viewsBlog/collectCategory/index.vue'),
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 1000,
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
        component: () => import('#/viewsBlog/bookmark/index.vue'),
      },
      {
        meta: {
          title: '书签分类',
          icon: 'mdi:account-multiple',
        },
        name: 'blog-cat',
        path: '/lq2/bookmark/bookmark-category',
        component: () => import('#/viewsBlog/bookmarkCategory/index.vue'),
      },
    ],
  },
];

export default routes;
