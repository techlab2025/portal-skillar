import { describe, it, expect } from 'vitest';
import { buildBreadcrumb } from '../RouteHelper';

const makeRoute = (params: Record<string, string>, matched: any[]) => ({
  params,
  matched,
});

const makeRouter = (routes: any[]) => ({
  getRoutes: () => routes,
});

describe('buildBreadcrumb', () => {
  it('should always include a Home crumb as the first item', () => {
    const route = makeRoute({ country_code: 'eg' }, []);
    const router = makeRouter([]);
    const crumbs = buildBreadcrumb(route as any, router as any);
    expect(crumbs[0]).toEqual({ labelKey: 'home', url: '/eg/' });
  });

  it('should use "/" as the Home url when no country_code param exists', () => {
    const route = makeRoute({}, []);
    const router = makeRouter([]);
    const crumbs = buildBreadcrumb(route as any, router as any);
    expect(crumbs[0]).toEqual({ labelKey: 'home', url: '/' });
  });

  it('should add breadcrumb entries for matched routes that have meta.breadcrumbKey', () => {
    const matchedRoute = {
      name: 'Employees',
      meta: { breadcrumbKey: 'employees' },
      path: '/:country_code/employees',
    };
    const route = makeRoute({ country_code: 'sa' }, [matchedRoute]);
    const router = makeRouter([matchedRoute]);
    const crumbs = buildBreadcrumb(route as any, router as any);

    expect(crumbs).toHaveLength(2);
    expect(crumbs[1].labelKey).toBe('employees');
  });

  it('should skip matched routes without meta.breadcrumbKey', () => {
    const matchedRoute = {
      name: 'Hidden',
      meta: {},
      path: '/:country_code/hidden',
    };
    const route = makeRoute({ country_code: 'kw' }, [matchedRoute]);
    const router = makeRouter([matchedRoute]);
    const crumbs = buildBreadcrumb(route as any, router as any);

    expect(crumbs).toHaveLength(1);
  });

  it('should not add duplicate breadcrumb entries for the same route name', () => {
    const matchedRoute = {
      name: 'Dashboard',
      meta: { breadcrumbKey: 'dashboard' },
      path: '/:country_code/',
    };
    const route = makeRoute({ country_code: 'eg' }, [matchedRoute, matchedRoute]);
    const router = makeRouter([matchedRoute]);
    const crumbs = buildBreadcrumb(route as any, router as any);

    const dashboardCrumbs = crumbs.filter((c) => c.labelKey === 'dashboard');
    expect(dashboardCrumbs).toHaveLength(1);
  });

  it('should resolve parent route and prepend it before the child', () => {
    const parentRoute = {
      name: 'Admin',
      meta: { breadcrumbKey: 'admin' },
      path: '/:country_code/admin',
    };
    const childRoute = {
      name: 'Users',
      meta: { breadcrumbKey: 'users', parent: 'Admin' },
      path: '/:country_code/admin/users',
    };
    const route = makeRoute({ country_code: 'qa' }, [childRoute]);
    const router = makeRouter([parentRoute, childRoute]);
    const crumbs = buildBreadcrumb(route as any, router as any);

    const keys = crumbs.map((c) => c.labelKey);
    expect(keys).toContain('admin');
    expect(keys).toContain('users');
    expect(keys.indexOf('admin')).toBeLessThan(keys.indexOf('users'));
  });

  it('should return labelKey instead of display label', () => {
    const matchedRoute = {
      name: 'Skills',
      meta: { breadcrumbKey: 'skills' },
      path: '/:country_code/skills',
    };
    const route = makeRoute({ country_code: 'eg' }, [matchedRoute]);
    const router = makeRouter([matchedRoute]);
    const crumbs = buildBreadcrumb(route as any, router as any);

    expect(crumbs[1].labelKey).toBe('skills');
  });
});
