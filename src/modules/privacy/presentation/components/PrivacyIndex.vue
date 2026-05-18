<script setup lang="ts">
  import { onMounted, computed } from 'vue';
  import PrivacyController from '../controllers/privacy.controller';
  import ShowPrivacyParams from '../../core/params/show.privacy.params';
  import EmptyPrivacy from '@/shared/icons/Privacy/EmptyPrivacy.vue';
  import EditIcon from '@/shared/icons/Privacy/EditIcon.vue';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import PrivacySkeleton from '../subComponent/PrivacySkeleton.vue';

  const privacyController = PrivacyController.getInstance();
  const status = computed(() => privacyController.itemState.value);

  const ShowPrivacy = async () => {
    const showPrivacyParams = new ShowPrivacyParams({
      id: 5,
      allLocales: false,
    });
    await privacyController.fetchOne(showPrivacyParams);
  };

  onMounted(() => {
    ShowPrivacy();
  });
</script>

<template>
  <DataStatusBuilder :controller="status">
    <template #success>
      <div class="privacy-container">
        <div class="header-container">
          <div class="privacy-header">
            <h3>{{ $t('privacy_policy') }}</h3>
            <p>{{ $t('privacy_policy_description') }}</p>
          </div>
          <router-link :to="{ name: 'Add Privacy' }" class="btn btn-primary">
            <EditIcon />
            {{ $t('edit') }}
          </router-link>
        </div>

        <div v-if="status.data" class="privacy-content">
          <h2>{{ status.data?.title }}</h2>
          <p>{{ status.data?.description }}</p>
        </div>
      </div>
    </template>
    <template #loader>
      <PrivacySkeleton />
    </template>
    <template #empty>
      <div class="privacy-container">
        <div class="empty-data">
          <EmptyPrivacy />
          <h5>{{ $t('no_privacy_yet') }}</h5>
          <p>
            {{ $t('add_privacy_policy_information_description') }}
          </p>
          <router-link :to="{ name: 'Add Privacy' }" class="btn btn-primary">
            {{ $t('add_privacy') }}
          </router-link>
        </div>
      </div>
    </template>
    <template #default>
      <div class="privacy-container">
        <div class="empty-data">
          <EmptyPrivacy />
          <h5>{{ $t('no_privacy_yet') }}</h5>
          <p>
            {{ $t('add_privacy_policy_information_description') }}
          </p>
          <router-link :to="{ name: 'Add Privacy' }" class="btn btn-primary">
            {{ $t('add_privacy') }}
          </router-link>
        </div>
      </div>
    </template>
  </DataStatusBuilder>
</template>

<style scoped lang="scss"></style>
