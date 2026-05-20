<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import AddplacementParams from '../../core/params/add.placement.params';
  import placementController from '../controllers/placement.controller';
  import HeaderForm from '@/shared/icons/Placements/HeaderForm.vue';
  const controller = placementController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;

  const params = ref<AddplacementParams | null>(null);
  const saveEmployee = async () => {
    try {
      if (!params.value) {
        console.error('No employee parameters to save');
        return;
      }

      await controller.create(params.value, undefined, formKey);
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  const updateData = (updatedParams: AddplacementParams) => {
    params.value = updatedParams;
  };

  onMounted(() => {
    updateData(new AddplacementParams({ title: '' }));
  });

  const title = ref<string>('');
  const numberOfQuestions = ref<number | null>(null);
</script>

<template>
  <div class="placement-form-card">
    <div class="form-header">
      <HeaderForm />
      <h2 class="title">{{ $t(`placement test configuration`) }}</h2>
    </div>

    <div class="form-fields">
      <div class="input-wrap">
        <label for="title">{{ $t(`placement test title`) }}</label>
        <input
          id="title"
          v-model="title"
          type="number"
          placeholder="Enter placement title"
          class="field-input"
        />
      </div>
      <div class="input-wrap">
        <label for="minutes">{{ $t(`placement test time (minutes)`) }}</label>
        <input
          id="numberOfQuestions"
          v-model="numberOfQuestions"
          type="number"
          placeholder="Enter number of questions"
          class="field-input"
        />
      </div>
    </div>
    <div class="difficulty-selection">
      <div class="difficulty-option-row">
        <div class="input">
          <label class="field-label" for="name">{{ $t(`easy questions`) }}</label>
          <input
            class="field-input"
            placeholder="enter percentage of easy questions like 20%"
            type="number"
            name=""
            id=""
          />
        </div>
        <div class="percentage">
          <p>equel</p>
          <h6><span>0</span> questions</h6>
        </div>
      </div>

      <div class="difficulty-option-row">
        <div class="input">
          <label class="field-label" for="name">{{ $t(`easy questions`) }}</label>
          <input
            placeholder="enter percentage of medium questions like 20%"
            class="field-input"
            type="number"
            name=""
            id=""
          />
        </div>
        <div class="percentage">
          <p>equel</p>
          <h6><span>0</span> questions</h6>
        </div>
      </div>

      <div class="difficulty-option-row">
        <div class="input">
          <label class="field-label" for="name">{{ $t(`easy questions`) }}</label>
          <input
            placeholder="enter percentage of medium questions like 20%"
            class="field-input"
            type="number"
            name=""
            id=""
          />
        </div>
        <div class="percentage">
          <p>equel</p>
          <h6><span>0</span> questions</h6>
        </div>
      </div>
    </div>
  </div>
</template>
