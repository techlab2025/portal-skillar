<script setup lang="ts">
  import Breadcrumb from 'primevue/breadcrumb';
  import { computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { buildBreadcrumb } from '../LayoutComponents/SubComponents/RouteHelper';
  import FeatureHeader from '@/assets/images/FeatureHeader.jpg';
  const route = useRoute();
  const router = useRouter();

  const items = computed(() => buildBreadcrumb(route, router));
</script>

<template>
  <div class="feature-header-container">
    <img class="header-img" :src="FeatureHeader" alt="header" />
    <div class="content">
      <p class="title">
        {{ $t(items[items.length - 1]?.labelKey ?? 'home') }}
      </p>
      <div class="breadcrump">
        <Breadcrumb :model="items">
          <template #item="{ item }">
            <router-link :to="item.url!">
              {{ $t(item.labelKey) }}
            </router-link>
          </template>
          <template #separator> / </template>
        </Breadcrumb>
      </div>
    </div>
    <div class="actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>
