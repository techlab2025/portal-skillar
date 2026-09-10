/* eslint-disable vue/one-component-per-file */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import RoleModel from '../../../core/models/role.model';
import RoleShow from '../RoleShow.vue';

const { deleteRole, fetchOne, itemData, itemState, replace } = vi.hoisted(() => ({
  deleteRole: vi.fn(),
  fetchOne: vi.fn(),
  itemData: { value: null as unknown },
  itemState: { value: null as unknown },
  replace: vi.fn(),
}));

vi.mock('../../controllers/role.controller', () => ({
  default: {
    getInstance: () => ({
      delete: deleteRole,
      fetchOne,
      itemData,
      itemState,
    }),
  },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '7' } }),
  useRouter: () => ({ replace }),
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    locale: { value: 'en' },
    t: (key: string, params?: { id?: string }) =>
      key === 'role.reference' ? `Role_${params?.id}` : key,
  }),
}));

const role = new RoleModel({
  id: 7,
  title: 'Content Manager',
  permissions: ['ADM01', 'ADM02'],
});

const DataStatusBuilderStub = defineComponent({
  name: 'DataStatusBuilder',
  setup(_, { slots }) {
    return () => h('div', slots.success?.());
  },
});

const PermissionSelectorStub = defineComponent({
  name: 'PermissionSelector',
  props: {
    permissions: { type: Array, default: () => [] },
    readOnly: { type: Boolean, default: false },
  },
  template: '<div class="permission-selector-stub" />',
});

const DropListStub = defineComponent({
  name: 'DropList',
  props: {
    actionList: { type: Array, default: () => [] },
  },
  template: '<div class="drop-list-stub" />',
});

const RoleFeedbackDialogStub = defineComponent({
  name: 'RoleFeedbackDialog',
  props: {
    modelValue: { type: Boolean, default: false },
    variant: { type: String, required: true },
    message: { type: String, default: '' },
    loading: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'confirm'],
  template: `
    <div v-if="modelValue" class="role-dialog-stub">
      <button class="confirm-delete" @click="$emit('confirm')" />
    </div>
  `,
});

const mountRoleShow = () =>
  mount(RoleShow, {
    global: {
      mocks: {
        $t: (key: string, params?: { id?: string }) =>
          key === 'role.reference' ? `Role_${params?.id}` : key,
      },
      stubs: {
        DataStatusBuilder: DataStatusBuilderStub,
        PermissionSelector: PermissionSelectorStub,
        DropList: DropListStub,
        RoleFeedbackDialog: RoleFeedbackDialogStub,
      },
    },
  });

describe('RoleShow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    itemData.value = role;
    itemState.value = new DataSuccess({ data: role });
    fetchOne.mockResolvedValue(itemState.value);
    deleteRole.mockResolvedValue(new DataSuccess({}));
  });

  it('loads show_role and renders the role details as read-only', async () => {
    const wrapper = mountRoleShow();
    await flushPromises();

    expect(fetchOne).toHaveBeenCalledOnce();
    expect(fetchOne.mock.calls[0]?.[0].toMap()).toEqual({ role_id: 7 });
    expect(wrapper.get('h1').text()).toBe('Content Manager');
    expect(wrapper.text()).toContain('Role_07');

    const permissionSelector = wrapper.getComponent({ name: 'PermissionSelector' });
    expect(permissionSelector.props('permissions')).toEqual(['ADM01', 'ADM02']);
    expect(permissionSelector.props('readOnly')).toBe(true);

    const actions = wrapper.getComponent({ name: 'DropList' }).props('actionList');
    expect(actions.map(({ text }: { text: string }) => text)).toEqual([
      'role.actions.edit',
      'role.actions.delete',
    ]);
    expect(actions[0].link).toBe('/roles/7/edit');
    expect(actions[1]).toMatchObject({ skipDeleteConfirmation: true, danger: true });
  });

  it('deletes the shown role and returns to the roles list', async () => {
    const wrapper = mountRoleShow();
    const actions = wrapper.getComponent({ name: 'DropList' }).props('actionList');

    actions[1].action();
    await nextTick();
    await wrapper.get('.confirm-delete').trigger('click');
    await flushPromises();

    expect(deleteRole).toHaveBeenCalledOnce();
    expect(deleteRole.mock.calls[0]?.[0].toMap()).toEqual({ role_id: 7 });
    expect(replace).toHaveBeenCalledWith({ name: 'Roles' });
  });
});
