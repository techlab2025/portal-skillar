<script setup lang="ts">
  import Breadcrumb from 'primevue/breadcrumb';
  import { computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { buildBreadcrumb } from './RouteHelper';

  const route = useRoute();
  const router = useRouter();

  const items = computed(() => buildBreadcrumb(route, router));
</script>

<template>
  <div class="breadcrump-container">
    <div class="breadcrump">
      <Breadcrumb :model="items">
        <template #item="{ item }">
          <router-link :to="item.url!" class="breadcrumb-link">
            {{ $t(item.labelKey) }}
          </router-link>
        </template>
      </Breadcrumb>
    </div>
  </div>
</template>
