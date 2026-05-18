import type { RouteRecordRaw } from '@/router/types';
import CountryIcon from '@/shared/icons/BreadcrumbIcons/CountryIcon.vue';

export const countryRoutes: RouteRecordRaw[] = [
  {
    path: 'countries',
    name: 'Countries',
    component: () => import('@/views/Country/IndexCountry.vue'),
    meta: {
      breadcrumbKey: 'countries',
      icon: CountryIcon,
    },
  },
  {
    path: 'countries/add',
    name: 'Add Country',
    component: () => import('@/views/Country/AddCountry.vue'),
    meta: {
      breadcrumbKey: 'add_country',
      icon: CountryIcon,
      parent: 'Countries',
    },
  },
  {
    path: 'countries/edit/:id',
    name: 'Edit Country',
    component: () => import('@/views/Country/EditCountry.vue'),
    props: true,
    meta: {
      breadcrumbKey: 'edit_country',
      icon: CountryIcon,
      parent: 'Countries',
    },
  },
];
