import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import type * as VueRouter from 'vue-router';
import { describe, expect, it, vi } from 'vitest';
import type AddquestionsParams from '@/modules/Questions/core/params/add.question.params';
import BasicQuestionDataForm from '../BasicQuestionDataForm.vue';

vi.mock('vue-router', async (importOriginal) => {
  const vueRouter = await importOriginal<typeof VueRouter>();

  return {
    ...vueRouter,
    useRoute: () => ({ params: {} }),
  };
});

const PassThroughStub = {
  template: '<div><slot /></div>',
};

const AccordionHeaderStub = {
  template: '<div><slot name="toggleicon" /></div>',
};

const HandleFilesUploadStub = {
  name: 'HandleFilesUpload',
  props: {
    file: { type: Array, default: () => [] },
    maxFiles: { type: Number, default: 1 },
    multiple: { type: Boolean, default: false },
  },
  emits: ['change'],
  template: '<div><slot name="label" /><slot name="content" /></div>',
};

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} } });

const mountForm = () =>
  mount(BasicQuestionDataForm, {
    global: {
      plugins: [i18n],
      stubs: {
        Accordion: PassThroughStub,
        AccordionPanel: PassThroughStub,
        AccordionHeader: AccordionHeaderStub,
        AccordionContent: PassThroughStub,
        AccordionToggleIcon: true,
        HandleFilesUpload: HandleFilesUploadStub,
        UplaodImageInput: true,
        SelectionTabs: true,
        QuestionContantTabs: true,
        QuestionSource: true,
      },
    },
  });

describe('BasicQuestionDataForm', () => {
  it('adds every selected image to the question attachments payload', async () => {
    const wrapper = mountForm();
    const uploader = wrapper.getComponent(HandleFilesUploadStub);
    const images = [
      'data:image/png;base64,aGVsbG8=',
      'data:image/jpeg;base64,d29ybGQ=',
      'data:image/png;base64,aW1hZ2U=',
      'data:image/jpeg;base64,Zm91cg==',
      'data:image/png;base64,Zml2ZQ==',
    ];

    expect(uploader.props('multiple')).toBe(true);
    expect(uploader.props('maxFiles')).toBe(10);

    uploader.vm.$emit(
      'change',
      images.map((base64, index) => ({ base64, url: `blob:image-${index}` })),
    );
    await wrapper.vm.$nextTick();

    const updates = wrapper.emitted('updateData');
    const params = updates?.at(-1)?.[0] as AddquestionsParams;

    expect(params.image?.map((image) => image.file)).toEqual(images);
    expect(params.toMap().attachments).toEqual(images.map((file) => ({ alt: '', file })));
  });
});
