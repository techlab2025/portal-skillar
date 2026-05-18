import type { RouteRecordRaw } from '@/router/types';

export const SupportContactsRoutes: RouteRecordRaw[] = [
  {
    path: 'support',
    name: 'Support',
    component: () => import('@/views/SupportContacts/IndexSupport.vue'),
    meta: {
      breadcrumbKey: 'support',
    },
  },
  {
    path: 'support/add',
    name: 'Add Support',
    component: () => import('@/views/SupportContacts/AddSupport.vue'),
    meta: {
      breadcrumbKey: 'add_support',
      parent: 'Support',
    },
  },
  {
    path: 'support/edit',
    name: 'Edit Support',
    component: () => import('@/views/SupportContacts/EditSupport.vue'),
    meta: {
      breadcrumbKey: 'edit_support',
      parent: 'Support',
    },
  },
];
