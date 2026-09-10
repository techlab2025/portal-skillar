import { flushPromises, shallowMount } from '@vue/test-utils';
import { h } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PlacementTestIndex from '../PlacementTestIndex.vue';

const { fetchListMock, pushMock } = vi.hoisted(() => ({
  fetchListMock: vi.fn(),
  pushMock: vi.fn(),
}));

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();

  return {
    ...actual,
    useRoute: () => ({ query: {} }),
    useRouter: () => ({ push: pushMock }),
  };
});

vi.mock('../../controllers/placement.test.controller', () => ({
  default: {
    getInstance: () => ({
      fetchList: fetchListMock,
      listState: { value: {} },
      pagination: { value: null },
    }),
  },
}));

describe('PlacementTestIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchListMock.mockResolvedValue(undefined);
  });

  it('loads the first page when the route mounts', async () => {
    shallowMount(PlacementTestIndex);
    await flushPromises();

    expect(fetchListMock).toHaveBeenCalledOnce();
    expect(fetchListMock.mock.calls[0]?.[0]).toMatchObject({
      pageNumber: 1,
      perPage: 10,
      withPage: 1,
    });
  });

  it('renders bold, color-coded result values', () => {
    const wrapper = shallowMount(PlacementTestIndex, {
      global: {
        stubs: {
          DataStatusBuilder: {
            setup(_, { slots }) {
              return () =>
                slots.success?.({
                  data: [{ result: 49 }, { result: 50 }, { result: 90 }],
                });
            },
          },
          AppTable: {
            props: ['items'],
            setup(props, { slots }) {
              return () =>
                h(
                  'div',
                  props.items.map((item: { result: number }) =>
                    slots['cell-result']?.({ value: item.result }),
                  ),
                );
            },
          },
        },
      },
    });

    const results = wrapper.findAll('.placement-test-result');

    expect(results).toHaveLength(3);
    expect(results[0]?.classes()).toContain('placement-test-result--low');
    expect(results[1]?.classes()).toContain('placement-test-result--medium');
    expect(results[2]?.classes()).toContain('placement-test-result--high');
  });
});
