import type { RouteRecordRaw } from '@/router/types';

export const termsConditionsRoutes: RouteRecordRaw[] = [
  {
    path: 'terms-conditions',
    name: 'TermsConditions',
    component: () => import('@/views/TermsConditions/TermsConditionsIndex.vue'),
    meta: {
      breadcrumbKey: 'terms_conditions',
    },
  },
  {
    path: 'terms-conditions/add',
    name: 'Add TermsConditions',
    component: () => import('@/views/TermsConditions/TermsConditionsAdd.vue'),
    meta: {
      breadcrumbKey: 'add_terms_conditions',
      parent: 'TermsConditions',
    },
  },
];
