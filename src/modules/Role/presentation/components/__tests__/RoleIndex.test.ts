import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import {
  DataFailed,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import RoleModel from '../../../core/models/role.model';
import RoleIndex from '../RoleIndex.vue';

const { fetchList, deleteRole } = vi.hoisted(() => ({
  fetchList: vi.fn(),
  deleteRole: vi.fn(),
}));

vi.mock('../../controllers/role.controller', () => ({
  default: {
    getInstance: () => ({
      fetchList,
      delete: deleteRole,
      listState: { value: new DataSuccess({ data: [] }) },
      pagination: { value: null },
    }),
  },
}));

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ replace: vi.fn() }),
}));

const role = new RoleModel({ id: 7, title: 'Content Manager', permissions: [] });
const StatusStub = defineComponent({
  setup(_, { slots }) {
    return () => h('div', slots.success?.({ data: [role] }));
  },
});

const global = {
  mocks: { $t: (key: string) => key },
  stubs: {
    DataStatusBuilder: StatusStub,
    Pagination: true,
    TableSkelaton: true,
    ShowIcon: true,
    EditIcon: true,
    DeleteIcon: true,
    IndexSearchIcon: true,
    IndexPluseIcon: true,
    RoleFeedbackDialog: {
      name: 'RoleFeedbackDialog',
      props: ['modelValue', 'variant', 'message', 'count', 'loading'],
      emits: ['update:modelValue', 'confirm'],
      template: `
        <div v-if="modelValue" class="role-dialog-stub">
          <span class="variant">{{ variant }}</span>
          <span class="message">{{ message }}</span>
          <button v-if="variant === 'delete-confirm'" class="confirm" @click="$emit('confirm')" />
        </div>
      `,
    },
    RouterLink: { props: ['to'], template: '<a><slot /></a>' },
  },
};

describe('RoleIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchList.mockResolvedValue(new DataSuccess({ data: [role] }));
  });

  it('loads roles and provides view, edit, and delete actions through the shared menu', async () => {
    const wrapper = mount(RoleIndex, { global });
    await flushPromises();

    expect(fetchList).toHaveBeenCalledOnce();
    expect(wrapper.text()).toContain('Content Manager');
    const actions = wrapper.getComponent({ name: 'DropList' }).props('actionList');

    expect(actions.map((action: { text: string }) => action.text)).toEqual([
      'role.actions.view',
      'role.actions.edit',
      'role.actions.delete',
    ]);
    expect(actions[0].link).toBe('/roles/7');
    expect(actions[1].link).toBe('/roles/7/edit');
    expect(actions[2].skipDeleteConfirmation).toBe(true);
    expect(actions[2].danger).toBe(true);
  });

  it('shows the exact backend message when deletion fails', async () => {
    const backendMessage = 'Cannot delete role because it is assigned to one or more employees.';
    deleteRole.mockResolvedValue(
      new DataFailed({ error: new ErrorModel(backendMessage, ErrorType.serviceSide) }),
    );
    const wrapper = mount(RoleIndex, { global });
    await flushPromises();

    const deleteAction = wrapper.getComponent({ name: 'DropList' }).props('actionList')[2];
    deleteAction.action();
    await wrapper.vm.$nextTick();
    expect(wrapper.get('.variant').text()).toBe('delete-confirm');

    await wrapper.get('.confirm').trigger('click');
    await flushPromises();

    expect(deleteRole).toHaveBeenCalledOnce();
    expect(deleteRole.mock.calls[0]?.[0].toMap()).toEqual({ role_id: 7 });
    expect(wrapper.get('.variant').text()).toBe('delete-error');
    expect(wrapper.get('.message').text()).toBe(backendMessage);
  });
});
