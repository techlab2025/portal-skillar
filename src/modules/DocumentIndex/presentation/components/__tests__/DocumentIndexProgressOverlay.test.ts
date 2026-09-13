/* eslint-disable vue/one-component-per-file */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

const startIndex = vi.fn();
const cancelGeneration = vi.fn();

vi.mock('../../controllers/document.index.patch.controller', () => ({
  default: {
    getInstance: () => ({ startIndex, cancelGeneration }),
  },
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

import DocumentIndexProgressController from '../../controllers/document.index.progress.controller';
import DocumentIndexProgressOverlay from '../DocumentIndexProgressOverlay.vue';

const DialogStub = defineComponent({
  name: 'PrimeDialogStub',
  props: { visible: { type: Boolean, default: false } },
  emits: ['update:visible'],
  setup(props, { slots }) {
    return () => (props.visible ? h('div', { class: 'dialog-stub' }, slots.default?.()) : null);
  },
});

const mountOverlay = () =>
  mount(DocumentIndexProgressOverlay, {
    global: {
      stubs: {
        Dialog: DialogStub,
      },
    },
  });

describe('DocumentIndexProgressOverlay', () => {
  const controller = DocumentIndexProgressController.getInstance();

  beforeEach(() => {
    vi.clearAllMocks();
    controller.reset();
    cancelGeneration.mockResolvedValue(new DataSuccess<void>({}));
  });

  it('pins minimized progress and keeps it available after start_document_index resolves', async () => {
    let resolveStart: ((result: DataSuccess<number>) => void) | undefined;
    startIndex.mockReturnValueOnce(
      new Promise<DataSuccess<number>>((resolve) => {
        resolveStart = resolve;
      }),
    );
    const request = controller.startIndex(17);
    const wrapper = mountOverlay();

    expect(wrapper.find('.document-index-generation').exists()).toBe(true);
    expect(wrapper.find('.document-index-generation__progress-value').exists()).toBe(false);
    expect(wrapper.find('.document-index-generation').text()).not.toContain('10%');
    expect(wrapper.get('.document-index-generation__progress').attributes()).toMatchObject({
      role: 'progressbar',
      'aria-label': 'document_index.indexing_document',
    });
    expect(wrapper.get('.document-index-generation__progress').attributes('aria-valuenow')).toBe(
      undefined,
    );

    await wrapper.find('.document-index-generation__minimize').trigger('click');

    expect(wrapper.find('.document-index-generation').exists()).toBe(false);
    expect(wrapper.find('.document-index-floating-progress').exists()).toBe(true);
    expect(wrapper.find('.document-index-floating-progress').text()).toContain(
      'document_index.ai_indexing',
    );
    expect(wrapper.get('.document-index-floating-progress__bar').attributes('aria-valuenow')).toBe(
      undefined,
    );

    await wrapper.find('.document-index-floating-progress button').trigger('click');
    expect(wrapper.find('.document-index-generation').exists()).toBe(true);

    resolveStart?.(new DataSuccess({ data: 12 }));
    await request;
    await flushPromises();

    expect(wrapper.find('.document-index-generation').exists()).toBe(true);
    expect(wrapper.find('.document-index-floating-progress').exists()).toBe(false);
    expect(controller.activeQuestionBatchId.value).toBe(12);
  });

  it('cancels the active start progress through the confirmation dialog', async () => {
    startIndex.mockResolvedValueOnce(new DataSuccess({ data: 42 }));
    await controller.startIndex(17);
    const wrapper = mountOverlay();

    await wrapper.find('.document-index-generation__cancel').trigger('click');
    expect(wrapper.find('.document-index-cancel').exists()).toBe(true);

    await wrapper.find('.document-index-cancel__confirm').trigger('click');
    await flushPromises();

    expect(cancelGeneration).toHaveBeenCalledOnce();
    expect(cancelGeneration.mock.calls[0]?.[0].toMap()).toEqual({ question_batch_id: 42 });
    expect(controller.hasActiveIndexing.value).toBe(false);
    expect(wrapper.find('.document-index-generation').exists()).toBe(false);
    expect(wrapper.find('.document-index-floating-progress').exists()).toBe(false);
  });
});
