import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import SidebarNavigation from '../SidebarNavigation.vue';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('vue-router', () => ({
  useRoute: () => ({
    path: '/eg/employees',
    params: { country_code: 'eg' },
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/assets/images/TechlabLogo.png', () => ({
  default: 'mock-logo.png',
}));

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({
    user: { name: 'Admin', image: '' },
    logout: vi.fn(),
  }),
}));

vi.mock('primevue/accordion', () => ({
  default: {
    name: 'Accordion',
    template: '<div class="mock-accordion"><slot /></div>',
    props: ['value'],
  },
}));
vi.mock('primevue/accordionpanel', () => ({
  default: { name: 'AccordionPanel', template: '<div><slot /></div>', props: ['value'] },
}));
vi.mock('primevue/accordionheader', () => ({
  default: {
    name: 'AccordionHeader',
    template: '<div class="mock-accordion-header"><slot /></div>',
  },
}));
vi.mock('primevue/accordioncontent', () => ({
  default: {
    name: 'AccordionContent',
    template: '<div class="mock-accordion-content"><slot /></div>',
  },
}));

describe('SidebarNavigation.vue', () => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const mountOptions = {
    global: {
      plugins: [pinia],
      stubs: {
        'router-link': {
          template:
            '<a class="menu-item" :class="{ active: $attrs.class?.includes?.(\'active\') }"><slot /></a>',
          props: ['to'],
        },
      },
      mocks: {
        $t: (msg: string) => msg,
      },
    },
  };

  it('renders the logo', () => {
    const wrapper = mount(SidebarNavigation, mountOptions);
    const logo = wrapper.find('img.logo');
    expect(logo.exists()).toBe(true);
  });

  it('renders menu groups and items', () => {
    const wrapper = mount(SidebarNavigation, mountOptions);

    expect(wrapper.text()).toContain('Overview');
    expect(wrapper.text()).toContain('Employees');
    expect(wrapper.text()).toContain('Documents');
    expect(wrapper.text()).toContain('Skills');
  });

  it('renders the Apps Kits group', () => {
    const wrapper = mount(SidebarNavigation, mountOptions);
    expect(wrapper.text()).toContain('Questions');
  });

  it('renders the statics group', () => {
    const wrapper = mount(SidebarNavigation, mountOptions);
    expect(wrapper.text()).toContain('About');
    expect(wrapper.text()).toContain('Support');
  });
});
