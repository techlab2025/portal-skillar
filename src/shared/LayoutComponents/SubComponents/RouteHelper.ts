import type { RouteLocationNormalizedLoaded, Router, RouteRecordRaw } from 'vue-router';

export type BreadCrumbItem = {
  labelKey: string;
  url?: string;
};

export const buildBreadcrumb = (
  route: RouteLocationNormalizedLoaded,
  router: Router,
): BreadCrumbItem[] => {
  const result: BreadCrumbItem[] = [];

  const countryCode = route.params?.country_code as string | undefined;

  result.push({
    labelKey: 'home',
    url: countryCode ? `/${countryCode}/` : '/',
  });

  const added = new Set<string>();
  const allRoutes = router.getRoutes();

  const addRoute = (r: RouteRecordRaw | RouteLocationNormalizedLoaded['matched'][number]) => {
    const routeName = String(r.name);
    const breadcrumbKey = r.meta?.breadcrumbKey;
    const parent = r.meta?.parent;

    if (!breadcrumbKey || added.has(routeName)) return;

    if (parent) {
      const parentRoute = allRoutes.find((pr) => pr.name === parent);
      if (parentRoute) addRoute(parentRoute);
    }

    result.push({
      labelKey: breadcrumbKey,
      url: r.path.replace(/\/:([^/?]+)(\?)?/g, (match, paramName: string, optional) => {
        if (optional) return '';
        const paramValue = route.params[paramName];
        const normalizedValue = Array.isArray(paramValue) ? paramValue[0] : paramValue;
        return normalizedValue ? `/${String(normalizedValue)}` : match;
      }),
    });

    added.add(routeName);
  };

  route.matched.forEach(addRoute);

  return result;
};
