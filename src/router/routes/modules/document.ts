import type { RouteRecordRaw } from '@/router/types';
import DocumentIcon from '@/shared/icons/BreadcrumbIcons/DocumentIcon.vue';

export const documentRoutes: RouteRecordRaw[] = [
  {
    path: 'documents',
    name: 'Documents',
    component: () => import('@/views/Document/IndexDocument.vue'),
    meta: {
      breadcrumbKey: 'documents',
      icon: DocumentIcon,
    },
  },
  {
    path: 'documents/add',
    name: 'Add Document',
    component: () => import('@/views/Document/AddDocument.vue'),
    meta: {
      breadcrumbKey: 'add_document',
      icon: DocumentIcon,
      parent: 'Documents',
    },
  },
  {
    path: 'documents/edit/:id',
    name: 'Edit Document',
    component: () => import('@/views/Document/EditDocument.vue'),
    props: true,
    meta: {
      breadcrumbKey: 'edit_document',
      icon: DocumentIcon,
      parent: 'Documents',
    },
  },
];
