<script setup lang="ts">
  import { onMounted, computed } from 'vue';
  import EditIcon from '@/shared/icons/Privacy/EditIcon.vue';
  import TermsConditionsController from '../controllers/terms-conditions.controller';
  import EmptyTermsIcon from '@/shared/icons/EmptyTermsIcon.vue';
  import ShowTermsParams from '../../core/params/show.term.params';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import TermSkellaton from '../subComponent/TermSkellaton.vue';

  const termsConditionsController = TermsConditionsController.getInstance();
  const status = computed(() => termsConditionsController.itemState.value);

  const ShowTermsConditions = async () => {
    const showTermsConditionsParams = new ShowTermsParams({
      id: 1,
      allLocales: false,
    });
    await termsConditionsController.fetchOne(showTermsConditionsParams);
  };

  onMounted(() => {
    ShowTermsConditions();
  });
</script>

<template>
  <DataStatusBuilder :controller="status">
    <template #success>
      <div class="terms-container">
        <div class="header-container">
          <div class="terms-header">
            <h3>{{ $t('terms_conditions') }}</h3>
            <p>{{ $t('terms_conditions_description') }}</p>
          </div>
          <router-link :to="{ name: 'Add TermsConditions' }" class="btn btn-primary">
            <EditIcon />
            {{ $t('edit') }}
          </router-link>
        </div>

        <div v-if="status.data" class="terms-content">
          <h2>{{ status.data?.title }}</h2>
          <p>{{ status.data?.description }}</p>
        </div>
      </div>
    </template>
    <template #empty>
      <div class="terms-container">
        <div class="empty-data">
          <EmptyTermsIcon />
          <h5>{{ $t('no_terms_added') }}</h5>
          <p>
            {{ $t('add_terms_conditions_description') }}
          </p>
          <router-link :to="{ name: 'Add TermsConditions' }" class="btn btn-primary">
            {{ $t('add_terms_conditions') }}
          </router-link>
        </div>
      </div>
    </template>
    <template #loader>
      <TermSkellaton />
    </template>
    <template #default>
      <div class="terms-container">
        <div class="empty-data">
          <EmptyTermsIcon />
          <h5>{{ $t('no_terms_added') }}</h5>
          <p>
            {{ $t('add_terms_conditions_description') }}
          </p>
          <router-link :to="{ name: 'Add TermsConditions' }" class="btn btn-primary">
            {{ $t('add_terms_conditions') }}
          </router-link>
        </div>
      </div>
    </template>
  </DataStatusBuilder>
</template>
