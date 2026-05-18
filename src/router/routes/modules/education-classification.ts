import type { RouteRecordRaw } from '@/router/types';
import CountryIcon from '@/shared/icons/BreadcrumbIcons/CountryIcon.vue';

export const educationClassificationRoutes: RouteRecordRaw[] = [
  {
    path: 'education-classifications',
    name: 'EducationClassifications',
    component: () => import('@/views/EducationClassification/IndexEducationClassification.vue'),
    meta: {
      breadcrumbKey: 'education_tree_configuration',
      icon: CountryIcon,
    },
  },
  {
    path: 'education-classifications-configuration/:id',
    name: 'Education Classifications Configuration',
    component: () =>
      import('@/views/EducationClassification/IndexEducationClassificationConfiguration.vue'),
    props: true,
    meta: {
      breadcrumbKey: 'education_classifications_configuration',
      icon: CountryIcon,
      parent: 'EducationClassifications',
    },
  },
  {
    path: 'education-classifications-tree/:id',
    name: 'Education Classifications Tree',
    component: () => import('@/views/EducationClassification/IndexEducationClassificationTree.vue'),
    props: true,
    meta: {
      breadcrumbKey: 'education_classifications_tree',
      icon: CountryIcon,
      parent: 'EducationClassifications',
    },
  },
];
