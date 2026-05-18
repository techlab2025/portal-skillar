import type { RouteRecordRaw } from '@/router/types';

export const stagesRoutes: RouteRecordRaw[] = [
  {
    path: 'stages',
    name: 'Stages',
    component: () => import('@/views/Stages/IndexStage.vue'),
    meta: {
      breadcrumbKey: 'stages',
    },
  },
  {
    path: 'stages/add',
    name: 'Add Stage',
    component: () => import('@/views/Stages/AddStage.vue'),
    meta: {
      breadcrumbKey: 'add_stage',
      parent: 'Stages',
    },
  },
  {
    path: 'stages/edit/:id',
    name: 'Edit Stage',
    component: () => import('@/views/Stages/EditStage.vue'),
    props: true,
    meta: {
      breadcrumbKey: 'edit_stage',
      parent: 'Stages',
    },
  },
];
