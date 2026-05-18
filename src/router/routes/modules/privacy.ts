import type { RouteRecordRaw } from '@/router/types';

export const privacyRoutes: RouteRecordRaw[] = [
  {
    path: 'privacy/add',
    name: 'Add Privacy',
    component: () => import('@/views/Privacy/PrivacyAdd.vue'),
    meta: {
      breadcrumbKey: 'add_privacy',
      parent: 'Privacy',
    },
  },
  {
    path: 'privacy',
    name: 'Privacy',
    component: () => import('@/views/Privacy/PrivacyIndex.vue'),
    meta: {
      breadcrumbKey: 'privacy',
    },
  },
];
