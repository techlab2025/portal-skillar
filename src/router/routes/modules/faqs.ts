import type { RouteRecordRaw } from '@/router/types';

export const faqsRoutes: RouteRecordRaw[] = [
  {
    path: 'faqs',
    name: 'Faqs',
    component: () => import('@/views/faqs/IndexFaqs.vue'),
    meta: { breadcrumbKey: 'faqs' },
  },
  {
    path: 'faqs/add',
    name: 'FaqsAdd',
    component: () => import('@/views/faqs/AddFaqs.vue'),
    meta: { breadcrumbKey: 'add_faq', parent: 'Faqs' },
  },
  {
    path: 'faqs/:id/edit',
    name: 'FaqsEdit',
    component: () => import('@/views/faqs/EditFaqs.vue'),
    meta: { breadcrumbKey: 'edit_faq', parent: 'Faqs' },
  },
];
