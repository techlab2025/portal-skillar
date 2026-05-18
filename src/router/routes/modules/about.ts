import type { RouteRecordRaw } from '@/router/types';

export const AboutRoutes: RouteRecordRaw[] = [
  {
    path: 'about',
    name: 'About',
    component: () => import('@/views/About/IndexAbout.vue'),
    meta: {
      breadcrumbKey: 'about',
    },
  },
  {
    path: 'about/add',
    name: 'Add About',
    component: () => import('@/views/About/AddAbout.vue'),
    meta: {
      breadcrumbKey: 'add_about',
      parent: 'About',
    },
  },
  {
    path: 'about/edit',
    name: 'Edit About',
    component: () => import('@/views/About/EditAbout.vue'),
    props: true,
    meta: {
      breadcrumbKey: 'edit_about',
      parent: 'About',
    },
  },
];
