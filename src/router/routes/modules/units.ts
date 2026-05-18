import type { RouteRecordRaw } from '@/router/types';

export const unitsRoutes: RouteRecordRaw[] = [
  {
    path: 'units',
    name: 'Units',
    component: () => import('@/views/unit/IndexUnit.vue'),
    meta: {
      breadcrumbKey: 'units',
    },
  },
  {
    path: 'units/add',
    name: 'Add Unit',
    component: () => import('@/views/unit/AddUnit.vue'),
    meta: {
      breadcrumbKey: 'add_unit',
      parent: 'Units',
    },
  },
  {
    path: 'units/edit/:id',
    name: 'Edit Unit',
    component: () => import('@/views/unit/EditUnit.vue'),
    props: true,
    meta: {
      breadcrumbKey: 'edit_unit',
      parent: 'Units',
    },
  },
];
