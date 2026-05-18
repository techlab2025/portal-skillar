import type { RouteRecordRaw } from 'vue-router';
import type { Component } from 'vue';

declare module 'vue-router' {
  interface RouteMeta {
    breadcrumbKey?: string;
    parent?: string;
    icon?: Component;
  }
}

export interface WebsiteModule {
  path: string;
  name: string;
  singular?: string;
  plural?: string;
}

export interface RouteConfig {
  path: string;
  name: string;
  basePath: string;
}

export type { RouteRecordRaw };
