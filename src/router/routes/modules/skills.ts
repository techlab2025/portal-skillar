import type { RouteRecordRaw } from '@/router/types';

export const SkillsRoutes: RouteRecordRaw[] = [
  {
    path: 'skills',
    name: 'Skills',
    component: () => import('@/views/skills/IndexSkills.vue'),
    meta: {
      breadcrumbKey: 'skills',
    },
  },
  {
    path: 'skills/add',
    name: 'Add Skill',
    component: () => import('@/views/skills/AddSkills.vue'),
    meta: {
      breadcrumbKey: 'add_skill',
      parent: 'Skills',
    },
  },
  {
    path: 'skills/edit/:id',
    name: 'Edit Skill',
    component: () => import('@/views/skills/EditSkills.vue'),
    props: true,
    meta: {
      breadcrumbKey: 'edit_skill',
      parent: 'Skills',
    },
  },
];
