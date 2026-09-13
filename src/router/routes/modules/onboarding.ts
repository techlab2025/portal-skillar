import type { RouteRecordRaw } from '@/router/types';

export const onboardingRoutes: RouteRecordRaw[] = [
  {
    path: 'onboarding',
    name: 'Add Onboarding',
    component: () => import('@/views/Onboarding/AddOnboarding.vue'),
    meta: {
      breadcrumb: 'onboarding.title',
    },
  },
];
