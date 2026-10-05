<script setup lang="ts">
  import { useRoute, useRouter, type RouteLocationRaw } from 'vue-router';
  import { computed, nextTick, ref, watch, type Component } from 'vue';
  import { useI18n } from 'vue-i18n';
  import SettingIcon from '@/shared/icons/SidebarIcons/SettingIcon.vue';
  import DocumentIcon from '@/shared/icons/BreadcrumbIcons/DocumentIcon.vue';
  import TechlabLogo from '@/assets/images/techlab-new-logo.png';
  import EducationClassificationIcon from '@/shared/icons/SidebarIcons/EducationClassificationIcon.vue';
  import SidebarPrivecy from '@/shared/icons/SidebarPrivecy.vue';
  import SidebarTerms from '@/shared/icons/SidebarTerms.vue';
  import Sidebaremploye from '@/shared/icons/Sidebaremploye.vue';
  import SupportIcon from '@/shared/icons/SidebarIcons/SupportIcon.vue';
  import AboutIcon from '@/shared/icons/SidebarIcons/AboutIcon.vue';
  import FaqsIcon from '@/shared/icons/SidebarIcons/FaqsIcon.vue';
  import { useUserStore } from '@/stores/user';
  import AuthArrowIcon from '@/shared/icons/SidebarIcons/AuthArrowIcon.vue';
  import IconLogout from '@/shared/icons/IconLogout.vue';
  // Legacy rollback imports:
  // import Accordion from 'primevue/accordion';
  // import AccordionPanel from 'primevue/accordionpanel';
  // import AccordionHeader from 'primevue/accordionheader';
  // import AccordionContent from 'primevue/accordioncontent';
  import Question from '@/shared/icons/question.vue';
  import ArticleIcon from '@/shared/icons/ArticleIcon.vue';
  import SearchIcon from '@/shared/icons/SearchIcon.vue';
  import SidebarCollapseIcon from '@/shared/icons/SidebarCollapseIcon.vue';
  import SidebarMobileIcon from '@/shared/icons/SidebarMobileIcon.vue';
  import SidebarPinIcon from '@/shared/icons/SidebarPinIcon.vue';
  import { QuestionStatusEnum } from '@/modules/Questions/core/constant/question.status.enum';
  import { PermissionsEnum, type PermissionCode } from '@/modules/Permission';
  import PermissionBuilder from '@/shared/HelpersComponents/PermissionBuilder.vue';

  const route = useRoute();
  const emit = defineEmits(['clickItem']);
  interface MenuItem {
    link: RouteLocationRaw;
    name: string;
    icon?: Component;
    badge?: string;
    hasArrow?: boolean;
    status?: QuestionStatusEnum;
    children?: MenuItem[];
    pinned?: boolean;
    permissions?: PermissionCode[];
  }
  interface MenuSection {
    group: string;
    items: MenuItem[];
    permissions: PermissionCode[];
  }

  type SidebarWorkspace = 'dashboard' | 'mobile';

  interface SidebarPreferences {
    collapsed: boolean;
    workspace: SidebarWorkspace;
    pinnedItems: string[];
  }

  const SIDEBAR_PREFERENCES_KEY = 'dashboard-sidebar-preferences';
  const DEFAULT_PINNED_ITEMS = ['Documents:/documents'];

  const readSidebarPreferences = (): SidebarPreferences => {
    const fallback: SidebarPreferences = {
      collapsed: false,
      workspace: 'dashboard',
      pinnedItems: DEFAULT_PINNED_ITEMS,
    };

    if (typeof window === 'undefined') return fallback;

    try {
      const storedValue = window.localStorage.getItem(SIDEBAR_PREFERENCES_KEY);
      if (!storedValue) return fallback;

      const candidate = JSON.parse(storedValue) as Partial<SidebarPreferences>;
      const workspace = candidate.workspace === 'mobile' ? 'mobile' : 'dashboard';
      const pinnedItems = Array.isArray(candidate.pinnedItems)
        ? candidate.pinnedItems.filter((item): item is string => typeof item === 'string')
        : DEFAULT_PINNED_ITEMS;

      return {
        collapsed: candidate.collapsed === true,
        workspace,
        pinnedItems,
      };
    } catch {
      return fallback;
    }
  };

  const baseMenu: MenuSection[] = [
    {
      group: 'Overview',
      permissions: [
        PermissionsEnum.EDUCATION_CLASSIFICATION_FETCH,
        PermissionsEnum.EDUCATION_CLASSIFICATION_CREATE,
        PermissionsEnum.EDUCATION_CLASSIFICATION_UPDATE,
        PermissionsEnum.EDUCATION_CLASSIFICATION_DELETE,
        PermissionsEnum.EDUCATION_CLASSIFICATION_TOGGLE_STATUS,
        PermissionsEnum.EMPLOYEE_ALL,
        PermissionsEnum.EMPLOYEE_FETCH,
        PermissionsEnum.EMPLOYEE_CREATE,
        PermissionsEnum.EMPLOYEE_UPDATE,
        PermissionsEnum.EMPLOYEE_DELETE,
        PermissionsEnum.EMPLOYEE_CHANGE_STATUS,
        PermissionsEnum.ROLE_ALL,
        PermissionsEnum.ROLE_FETCH,
        PermissionsEnum.ROLE_CREATE,
        PermissionsEnum.ROLE_UPDATE,
        PermissionsEnum.ROLE_DELETE,
        PermissionsEnum.DOCUMENT_ALL,
        PermissionsEnum.DOCUMENT_FETCH,
        PermissionsEnum.DOCUMENT_CREATE,
        PermissionsEnum.DOCUMENT_UPDATE,
        PermissionsEnum.DOCUMENT_DELETE,
        PermissionsEnum.SKILL_ALL,
        PermissionsEnum.SKILL_FETCH,
        PermissionsEnum.SKILL_CREATE,
        PermissionsEnum.SKILL_UPDATE,
        PermissionsEnum.SKILL_DELETE,
        PermissionsEnum.EDUCATION_CLASSIFICATION_SUBJECT_ALL,
        PermissionsEnum.EDUCATION_CLASSIFICATION_SUBJECT_FETCH,
        PermissionsEnum.EDUCATION_CLASSIFICATION_SUBJECT_CREATE,
        PermissionsEnum.EDUCATION_CLASSIFICATION_SUBJECT_UPDATE,
        PermissionsEnum.EDUCATION_CLASSIFICATION_SUBJECT_DELETE,
        PermissionsEnum.EDUCATION_CLASSIFICATION_SUBJECT_FETCH_FULL,
        PermissionsEnum.PLACEMENT_TEST_ALL,
        PermissionsEnum.PLACEMENT_TEST_FETCH,
        PermissionsEnum.HIGHLIGHT_BADGE_ALL,
        PermissionsEnum.HIGHLIGHT_BADGE_FETCH,
        PermissionsEnum.HIGHLIGHT_BADGE_CREATE,
        PermissionsEnum.HIGHLIGHT_BADGE_UPDATE,
        PermissionsEnum.HIGHLIGHT_BADGE_DELETE,
        PermissionsEnum.ADVICE_ALL,
        PermissionsEnum.ADVICE_FETCH,
        PermissionsEnum.ADVICE_CREATE,
        PermissionsEnum.ADVICE_UPDATE,
        PermissionsEnum.ADVICE_DELETE,
        PermissionsEnum.ADVICE_CATEGORY_ALL,
        PermissionsEnum.ADVICE_CATEGORY_FETCH,
        PermissionsEnum.ADVICE_CATEGORY_DETAILS,
        PermissionsEnum.ADVICE_CATEGORY_CREATE,
        PermissionsEnum.ADVICE_CATEGORY_UPDATE,
        PermissionsEnum.ADVICE_CATEGORY_DELETE,
        PermissionsEnum.DOCUMENT_INDEX_ALL,
        PermissionsEnum.DOCUMENT_INDEX_FETCH,
        PermissionsEnum.DOCUMENT_INDEX_UPDATE,
        PermissionsEnum.DOCUMENT_INDEX_START,
        PermissionsEnum.DOCUMENT_INDEX_STATUS,
        PermissionsEnum.DOCUMENT_INDEX_REFRESH_STATUS,
        PermissionsEnum.DOCUMENT_INDEX_SAVE,
        PermissionsEnum.DOCUMENT_INDEX_FETCH_TRANSACTIONS,
        PermissionsEnum.BLOCK_REASON_ALL,
        PermissionsEnum.BLOCK_REASON_FETCH,
        PermissionsEnum.BLOCK_REASON_CREATE,
        PermissionsEnum.BLOCK_REASON_UPDATE,
        PermissionsEnum.BLOCK_REASON_DELETE,
        PermissionsEnum.GENERATE_QUESTION_ALL,
        PermissionsEnum.SUBSCRIPTION_PLAN_ALL,
        PermissionsEnum.SUBSCRIPTION_PLAN_FETCH,
        PermissionsEnum.SUBSCRIPTION_PLAN_CREATE,
        PermissionsEnum.SUBSCRIPTION_PLAN_UPDATE,
        PermissionsEnum.SUBSCRIPTION_PLAN_DELETE,
        PermissionsEnum.SUBSCRIPTION_PLAN_TOGGLE_FEATURE,
        PermissionsEnum.SUBSCRIPTION_PLAN_TOGGLE_STATUS,
        PermissionsEnum.SUBSCRIPTION_PLAN_CHANGE_STATUS,
        PermissionsEnum.SUBSCRIPTION_ALL,
        PermissionsEnum.SUBSCRIPTION_FETCH,
        PermissionsEnum.SUBSCRIPTION_DELETE,
        PermissionsEnum.SUBSCRIPTION_STATISTICS,
        PermissionsEnum.STUDENT_ALL,
        PermissionsEnum.STUDENT_FETCH,
        PermissionsEnum.STUDENT_STATISTICS,
        PermissionsEnum.STUDENT_CHANGE_STATUS,
        PermissionsEnum.STUDENT_FORCE_LOGOUT,
        PermissionsEnum.STUDENT_ADD_NOTE,
      ],
      items: [
        {
          link: '/education-classifications',
          name: 'Education configuration',
          icon: EducationClassificationIcon,
          permissions: [
            PermissionsEnum.EDUCATION_CLASSIFICATION_ALL,
            PermissionsEnum.EDUCATION_CLASSIFICATION_FETCH,
            PermissionsEnum.EDUCATION_CLASSIFICATION_CREATE,
            PermissionsEnum.EDUCATION_CLASSIFICATION_UPDATE,
            PermissionsEnum.EDUCATION_CLASSIFICATION_DELETE,
            PermissionsEnum.EDUCATION_CLASSIFICATION_TOGGLE_STATUS,
          ],
        },
        {
          link: '/employees',
          name: 'Employees',
          icon: Sidebaremploye,
          permissions: [
            PermissionsEnum.EMPLOYEE_ALL,
            PermissionsEnum.EMPLOYEE_FETCH,
            PermissionsEnum.EMPLOYEE_CREATE,
            PermissionsEnum.EMPLOYEE_UPDATE,
            PermissionsEnum.EMPLOYEE_DELETE,
            PermissionsEnum.EMPLOYEE_CHANGE_STATUS,
          ],
        },
        {
          link: '/roles',
          name: 'role.title_plural',
          icon: SettingIcon,
          permissions: [
            PermissionsEnum.ROLE_ALL,
            PermissionsEnum.ROLE_FETCH,
            PermissionsEnum.ROLE_CREATE,
            PermissionsEnum.ROLE_UPDATE,
            PermissionsEnum.ROLE_DELETE,
          ],
        },
        {
          link: '/documents',
          name: 'Documents',
          icon: DocumentIcon,
          permissions: [
            PermissionsEnum.DOCUMENT_ALL,
            PermissionsEnum.DOCUMENT_FETCH,
            PermissionsEnum.DOCUMENT_CREATE,
            PermissionsEnum.DOCUMENT_UPDATE,
            PermissionsEnum.DOCUMENT_DELETE,
          ],
        },
        {
          link: '/skills',
          name: 'Skills',
          icon: SettingIcon,
          permissions: [
            PermissionsEnum.SKILL_ALL,
            PermissionsEnum.SKILL_FETCH,
            PermissionsEnum.SKILL_CREATE,
            PermissionsEnum.SKILL_UPDATE,
            PermissionsEnum.SKILL_DELETE,
          ],
        },

        {
          link: '/subjects',
          name: 'Subjects',
          icon: SettingIcon,
          permissions: [
            PermissionsEnum.EDUCATION_CLASSIFICATION_SUBJECT_ALL,
            PermissionsEnum.EDUCATION_CLASSIFICATION_SUBJECT_FETCH,
            PermissionsEnum.EDUCATION_CLASSIFICATION_SUBJECT_CREATE,
            PermissionsEnum.EDUCATION_CLASSIFICATION_SUBJECT_UPDATE,
            PermissionsEnum.EDUCATION_CLASSIFICATION_SUBJECT_DELETE,
            PermissionsEnum.EDUCATION_CLASSIFICATION_SUBJECT_FETCH_FULL,
          ],
        },
        {
          link: '/placement-configuration',
          name: 'Placement configuration',
          icon: SettingIcon,
          permissions: [
            PermissionsEnum.PLACEMENT_CONFIG_ALL,
            PermissionsEnum.PLACEMENT_CONFIG_FETCH,
            PermissionsEnum.PLACEMENT_CONFIG_UPDATE,
          ],
        },
        {
          link: '/placement-test',
          name: 'Placement Test',
          icon: SettingIcon,
          permissions: [PermissionsEnum.PLACEMENT_TEST_ALL, PermissionsEnum.PLACEMENT_TEST_FETCH],
        },

        {
          link: '/highlight-badges',
          name: 'highlight_badges',
          icon: SettingIcon,
          permissions: [
            PermissionsEnum.HIGHLIGHT_BADGE_ALL,
            PermissionsEnum.HIGHLIGHT_BADGE_FETCH,
            PermissionsEnum.HIGHLIGHT_BADGE_CREATE,
            PermissionsEnum.HIGHLIGHT_BADGE_UPDATE,
            PermissionsEnum.HIGHLIGHT_BADGE_DELETE,
          ],
        },
        {
          link: '/advices',
          name: 'advices',
          icon: SettingIcon,
          permissions: [
            PermissionsEnum.ADVICE_ALL,
            PermissionsEnum.ADVICE_FETCH,
            PermissionsEnum.ADVICE_CREATE,
            PermissionsEnum.ADVICE_UPDATE,
            PermissionsEnum.ADVICE_DELETE,
            PermissionsEnum.ADVICE_CATEGORY_ALL,
            PermissionsEnum.ADVICE_CATEGORY_FETCH,
            PermissionsEnum.ADVICE_CATEGORY_DETAILS,
            PermissionsEnum.ADVICE_CATEGORY_CREATE,
            PermissionsEnum.ADVICE_CATEGORY_UPDATE,
            PermissionsEnum.ADVICE_CATEGORY_DELETE,
          ],
          children: [
            {
              link: '/advices/categories',
              name: 'advice_categories',
              permissions: [
                PermissionsEnum.ADVICE_CATEGORY_ALL,
                PermissionsEnum.ADVICE_CATEGORY_FETCH,
                PermissionsEnum.ADVICE_CATEGORY_DETAILS,
                PermissionsEnum.ADVICE_CATEGORY_CREATE,
                PermissionsEnum.ADVICE_CATEGORY_UPDATE,
                PermissionsEnum.ADVICE_CATEGORY_DELETE,
              ],
            },
          ],
        },
        {
          link: '/document-index',
          name: 'document_index.title',
          icon: DocumentIcon,
          permissions: [
            PermissionsEnum.DOCUMENT_INDEX_ALL,
            PermissionsEnum.DOCUMENT_INDEX_FETCH,
            PermissionsEnum.DOCUMENT_INDEX_UPDATE,
            PermissionsEnum.DOCUMENT_INDEX_START,
            PermissionsEnum.DOCUMENT_INDEX_STATUS,
            PermissionsEnum.DOCUMENT_INDEX_REFRESH_STATUS,
            PermissionsEnum.DOCUMENT_INDEX_SAVE,
            PermissionsEnum.DOCUMENT_INDEX_FETCH_TRANSACTIONS,
          ],
          children: [
            {
              link: '/fetch-document-index-patch',
              name: 'document_index.transactions_sidebar',
              permissions: [PermissionsEnum.DOCUMENT_INDEX_FETCH_TRANSACTIONS],
            },
          ],
        },
        {
          link: '/block-reasons',
          name: 'block_reasons',
          icon: SettingIcon,
          permissions: [
            PermissionsEnum.BLOCK_REASON_ALL,
            PermissionsEnum.BLOCK_REASON_FETCH,
            PermissionsEnum.BLOCK_REASON_CREATE,
            PermissionsEnum.BLOCK_REASON_UPDATE,
            PermissionsEnum.BLOCK_REASON_DELETE,
          ],
        },
        {
          link: '/question-batches',
          name: 'question_batch.title',
          icon: SettingIcon,
          permissions: [PermissionsEnum.GENERATE_QUESTION_ALL],
          children: [
            {
              link: '/question-batches/generate',
              name: 'question_batch.generate',
              permissions: [PermissionsEnum.GENERATE_QUESTION_ALL],
            },
          ],
        },

        {
          link: '/plans',
          name: 'plans',
          icon: SettingIcon,
          permissions: [
            PermissionsEnum.SUBSCRIPTION_PLAN_ALL,
            PermissionsEnum.SUBSCRIPTION_PLAN_FETCH,
            PermissionsEnum.SUBSCRIPTION_PLAN_CREATE,
            PermissionsEnum.SUBSCRIPTION_PLAN_UPDATE,
            PermissionsEnum.SUBSCRIPTION_PLAN_DELETE,
            PermissionsEnum.SUBSCRIPTION_PLAN_TOGGLE_FEATURE,
            PermissionsEnum.SUBSCRIPTION_PLAN_TOGGLE_STATUS,
            PermissionsEnum.SUBSCRIPTION_PLAN_CHANGE_STATUS,
          ],
          children: [
            {
              link: '/plans/add',
              name: 'add plan',
              permissions: [PermissionsEnum.SUBSCRIPTION_PLAN_CREATE],
            },
          ],
        },
        {
          link: '/subscriptions',
          name: 'subscriptions',
          icon: SettingIcon,
          permissions: [
            PermissionsEnum.SUBSCRIPTION_ALL,
            PermissionsEnum.SUBSCRIPTION_FETCH,
            PermissionsEnum.SUBSCRIPTION_DELETE,
            PermissionsEnum.SUBSCRIPTION_STATISTICS,
          ],
        },
        {
          link: '/notification-plans',
          name: 'notification_plan.title',
          icon: SettingIcon,
          children: [
            {
              link: '/notification-plans/add',
              name: 'notification_plan.add',
            },
          ],
        },
        {
          link: '/students',
          name: 'students',
          icon: SettingIcon,
          permissions: [
            PermissionsEnum.STUDENT_ALL,
            PermissionsEnum.STUDENT_FETCH,
            PermissionsEnum.STUDENT_STATISTICS,
            PermissionsEnum.STUDENT_CHANGE_STATUS,
            PermissionsEnum.STUDENT_FORCE_LOGOUT,
            PermissionsEnum.STUDENT_ADD_NOTE,
          ],
        },
        // {
        //   link: '/placements/show',
        //   name: 'Placement Configuration',
        //   icon: SettingIcon,
        // },
      ],
    },

    {
      group: 'Apps Kits',
      permissions: [
        PermissionsEnum.QUESTION_ALL,
        PermissionsEnum.QUESTION_FETCH,
        PermissionsEnum.QUESTION_CREATE,
        PermissionsEnum.QUESTION_UPDATE,
        PermissionsEnum.QUESTION_DELETE,
        PermissionsEnum.QUESTION_UPDATE_REVIEW_STATUS,
        PermissionsEnum.QUESTION_FETCH_REVIEW_STATUS_HISTORY,
      ],
      items: [
        {
          link: '/questions',
          name: 'Questions',
          icon: Question,
          permissions: [
            PermissionsEnum.QUESTION_ALL,
            PermissionsEnum.QUESTION_FETCH,
            PermissionsEnum.QUESTION_CREATE,
            PermissionsEnum.QUESTION_UPDATE,
            PermissionsEnum.QUESTION_DELETE,
            PermissionsEnum.QUESTION_UPDATE_REVIEW_STATUS,
            PermissionsEnum.QUESTION_FETCH_REVIEW_STATUS_HISTORY,
          ],
          children: [
            {
              link: { path: '/questions', query: { status: QuestionStatusEnum.ARCHIVED } },
              name: 'question_status_menu.archived',
              status: QuestionStatusEnum.ARCHIVED,
              permissions: [PermissionsEnum.QUESTION_ALL, PermissionsEnum.QUESTION_FETCH],
            },
            {
              link: { path: '/questions', query: { status: QuestionStatusEnum.APPROVED } },
              name: 'question_status_menu.approved',
              status: QuestionStatusEnum.APPROVED,
              permissions: [PermissionsEnum.QUESTION_FETCH],
            },
            {
              link: { path: '/questions', query: { status: QuestionStatusEnum.REJECTED } },
              name: 'question_status_menu.rejected',
              status: QuestionStatusEnum.REJECTED,
              permissions: [PermissionsEnum.QUESTION_FETCH],
            },
            {
              link: { path: '/questions', query: { status: QuestionStatusEnum.DRAFT } },
              name: 'question_status_menu.draft',
              status: QuestionStatusEnum.DRAFT,
              permissions: [PermissionsEnum.QUESTION_FETCH],
            },
            {
              link: { path: '/questions', query: { status: QuestionStatusEnum.NOT_REVIEW } },
              name: 'question_status_menu.not_reviewed',
              status: QuestionStatusEnum.NOT_REVIEW,
              permissions: [PermissionsEnum.QUESTION_FETCH],
            },
            {
              link: { path: '/questions', query: { status: QuestionStatusEnum.REVISION } },
              name: 'question_status_menu.revision',
              status: QuestionStatusEnum.REVISION,
              permissions: [PermissionsEnum.QUESTION_FETCH],
            },
          ],
        },
        {
          link: '/articles',
          name: 'Articles',
          icon: ArticleIcon,
          permissions: [
            PermissionsEnum.QUESTION_ALL,
            PermissionsEnum.QUESTION_FETCH,
            PermissionsEnum.QUESTION_CREATE,
            PermissionsEnum.QUESTION_UPDATE,
            PermissionsEnum.QUESTION_DELETE,
          ],
        },
      ],
    },
    {
      group: 'statics',
      permissions: [
        PermissionsEnum.ABOUT_US_ALL,
        PermissionsEnum.ABOUT_US_FETCH,
        PermissionsEnum.ABOUT_US_CREATE,
        PermissionsEnum.ABOUT_US_DELETE,
        PermissionsEnum.SOCIAL_LINK_ALL,
        PermissionsEnum.SOCIAL_LINK_UPDATE,
        PermissionsEnum.SOCIAL_LINK_DELETE,
        PermissionsEnum.SUPPORT_ALL,
        PermissionsEnum.SUPPORT_FETCH,
        PermissionsEnum.SUPPORT_CREATE,
        PermissionsEnum.SUPPORT_UPDATE,
        PermissionsEnum.SUPPORT_DELETE,
        PermissionsEnum.FAQ_ALL,
        PermissionsEnum.FAQ_FETCH,
        PermissionsEnum.FAQ_CREATE,
        PermissionsEnum.FAQ_UPDATE,
        PermissionsEnum.FAQ_DELETE,
        PermissionsEnum.PRIVACY_ALL,
        PermissionsEnum.PRIVACY_FETCH,
        PermissionsEnum.PRIVACY_CREATE,
        PermissionsEnum.PRIVACY_UPDATE,
        PermissionsEnum.PRIVACY_DELETE,
        PermissionsEnum.TERM_ALL,
        PermissionsEnum.TERM_FETCH,
        PermissionsEnum.TERM_CREATE,
        PermissionsEnum.TERM_UPDATE,
        PermissionsEnum.TERM_DELETE,
        PermissionsEnum.DELETE_ACCOUNT_REASON_ALL,
        PermissionsEnum.DELETE_ACCOUNT_REASON_FETCH,
        PermissionsEnum.DELETE_ACCOUNT_REASON_CREATE,
        PermissionsEnum.DELETE_ACCOUNT_REASON_UPDATE,
        PermissionsEnum.DELETE_ACCOUNT_REASON_DELETE,
        PermissionsEnum.APP_STATUS_ALL,
        PermissionsEnum.APP_STATUS_FETCH,
        PermissionsEnum.APP_STATUS_CREATE_OR_UPDATE,
      ],
      items: [
        {
          link: '/about',
          name: 'About',
          icon: AboutIcon,
          permissions: [
            PermissionsEnum.ABOUT_US_ALL,
            PermissionsEnum.ABOUT_US_FETCH,
            PermissionsEnum.ABOUT_US_CREATE,
            PermissionsEnum.ABOUT_US_DELETE,
            PermissionsEnum.SOCIAL_LINK_ALL,
            PermissionsEnum.SOCIAL_LINK_UPDATE,
            PermissionsEnum.SOCIAL_LINK_DELETE,
          ],
        },
        {
          link: '/support',
          name: 'Support',
          icon: SupportIcon,
          permissions: [
            PermissionsEnum.SUPPORT_ALL,
            PermissionsEnum.SUPPORT_FETCH,
            PermissionsEnum.SUPPORT_CREATE,
            PermissionsEnum.SUPPORT_UPDATE,
            PermissionsEnum.SUPPORT_DELETE,
            PermissionsEnum.SUPPORT_CONTACT_ALL,
            PermissionsEnum.SUPPORT_CONTACT_UPDATE,
            PermissionsEnum.SUPPORT_CONTACT_DELETE,
          ],
        },
        {
          link: '/faqs',
          name: 'Faqs',
          icon: FaqsIcon,
          permissions: [
            PermissionsEnum.FAQ_ALL,
            PermissionsEnum.FAQ_FETCH,
            PermissionsEnum.FAQ_CREATE,
            PermissionsEnum.FAQ_UPDATE,
            PermissionsEnum.FAQ_DELETE,
          ],
        },
        {
          link: '/privacy',
          name: 'Privacy and policy',
          icon: SidebarPrivecy,
          permissions: [
            PermissionsEnum.PRIVACY_ALL,
            PermissionsEnum.PRIVACY_FETCH,
            PermissionsEnum.PRIVACY_CREATE,
            PermissionsEnum.PRIVACY_UPDATE,
            PermissionsEnum.PRIVACY_DELETE,
          ],
        },
        {
          link: '/terms-conditions',
          name: 'terms & conditions',
          icon: SidebarTerms,
          permissions: [
            PermissionsEnum.TERM_ALL,
            PermissionsEnum.TERM_FETCH,
            PermissionsEnum.TERM_CREATE,
            PermissionsEnum.TERM_UPDATE,
            PermissionsEnum.TERM_DELETE,
          ],
        },
        // {
        //   link: '/deleted-accounts',
        //   name: 'add logout reasons',
        //   icon: SidebarTerms,
        //   permissions: [
        //     PermissionsEnum.DELETE_ACCOUNT_REASON_ALL,
        //     PermissionsEnum.DELETE_ACCOUNT_REASON_FETCH,
        //     PermissionsEnum.DELETE_ACCOUNT_REASON_CREATE,
        //     PermissionsEnum.DELETE_ACCOUNT_REASON_UPDATE,
        //     PermissionsEnum.DELETE_ACCOUNT_REASON_DELETE,
        //   ],
        // },
        // {
        //   link: '/onboarding',
        //   name: 'onboarding.navigation',
        //   icon: SidebarTerms,
        //   permissions: [
        //     PermissionsEnum.APP_STATUS_ALL,
        //     PermissionsEnum.APP_STATUS_FETCH,
        //     PermissionsEnum.APP_STATUS_CREATE_OR_UPDATE,
        //   ],
        // },
      ],
    },
  ];

  const { t, te } = useI18n();
  const sidebarPreferences = readSidebarPreferences();
  const menu = computed<MenuSection[]>(() => baseMenu);
  const activeWorkspace = ref<SidebarWorkspace>(sidebarPreferences.workspace);
  const searchQuery = ref('');
  const isCollapsed = ref(sidebarPreferences.collapsed);
  const expandedItems = ref<Set<string>>(new Set());
  const pinnedItems = ref<Set<string>>(new Set(sidebarPreferences.pinnedItems));
  const sidebarNav = ref<HTMLElement | null>(null);
  const sidebarSearchInput = ref<HTMLInputElement | null>(null);
  const workspaceSwitch = ref<HTMLElement | null>(null);

  const translateLabel = (label: string) => (te(label) ? t(label) : label);

  const getItemPermissions = (items: MenuItem[]) => [
    ...new Set(items.flatMap((item) => item.permissions ?? [])),
  ];

  const createSection = (
    group: string,
    itemNames: string[],
    itemsByName: Map<string, MenuItem>,
  ): MenuSection | null => {
    const items = itemNames.flatMap((name) => {
      const item = itemsByName.get(name);
      return item ? [item] : [];
    });

    if (!items.length) return null;
    return { group, items, permissions: getItemPermissions(items) };
  };

  const enhanceQuestionHierarchy = (item: MenuItem): MenuItem => {
    if (item.name !== 'Questions') return item;

    return {
      ...item,
      children: [
        {
          link: '/questions/add',
          name: 'sidebar.add_questions',
          permissions: [PermissionsEnum.QUESTION_ALL, PermissionsEnum.QUESTION_CREATE],
        },
        {
          link: '/questions',
          name: 'sidebar.all_questions',
          permissions: [PermissionsEnum.QUESTION_ALL, PermissionsEnum.QUESTION_FETCH],
          children: item.children,
        },
      ],
    };
  };

  const dashboardMenu = computed<MenuSection[]>(() => {
    const dashboardItems = menu.value
      .filter((section) => section.group !== 'statics')
      .flatMap((section) => section.items)
      .map(enhanceQuestionHierarchy);
    const itemsByName = new Map(dashboardItems.map((item) => [item.name, item]));

    return [
      createSection(
        'sidebar.content_management',
        [
          'Questions',
          'Articles',
          'Documents',
          'advices',
          'document_index.title',
          'question_batch.title',
        ],
        itemsByName,
      ),
      createSection(
        'sidebar.education_configuration',
        [
          'Education configuration',
          'Subjects',
          'Skills',
          'Placement configuration',
          'Placement Test',
        ],
        itemsByName,
      ),
      createSection('sidebar.student_configuration', ['students', 'subscriptions'], itemsByName),
      createSection('sidebar.plans_subscriptions', ['plans'], itemsByName),
      createSection(
        'sidebar.administration',
        ['Employees', 'role.title_plural', 'notification_plan.title'],
        itemsByName,
      ),
      createSection(
        'sidebar.system_configuration',
        ['highlight_badges', 'block_reasons'],
        itemsByName,
      ),
    ].filter((section): section is MenuSection => section !== null);
  });

  const mobileMenu = computed<MenuSection[]>(() => {
    const mobileItems = menu.value
      .filter((section) => section.group === 'statics')
      .flatMap((section) => section.items);
    const itemsByName = new Map(mobileItems.map((item) => [item.name, item]));

    return [
      createSection(
        'sidebar.content_information',
        ['About', 'Privacy and policy', 'terms & conditions'],
        itemsByName,
      ),
      createSection('sidebar.account_support', ['Support', 'Faqs'], itemsByName),
    ].filter((section): section is MenuSection => section !== null);
  });

  const activeMenu = computed(() =>
    activeWorkspace.value === 'dashboard' ? dashboardMenu.value : mobileMenu.value,
  );

  const filterItems = (items: MenuItem[], query: string): MenuItem[] =>
    items.reduce<MenuItem[]>((matches, item) => {
      const children = item.children ? filterItems(item.children, query) : undefined;
      const isMatch = translateLabel(item.name).toLocaleLowerCase().includes(query);

      if (isMatch || children?.length) {
        matches.push({ ...item, children: isMatch ? item.children : children });
      }

      return matches;
    }, []);

  const visibleMenu = computed<MenuSection[]>(() => {
    const query = searchQuery.value.trim().toLocaleLowerCase();
    if (!query) return activeMenu.value;

    return activeMenu.value.reduce<MenuSection[]>((matches, section) => {
      const isSectionMatch = translateLabel(section.group).toLocaleLowerCase().includes(query);
      const items = isSectionMatch ? section.items : filterItems(section.items, query);

      if (items.length) matches.push({ ...section, items });
      return matches;
    }, []);
  });

  const { user } = useUserStore();
  const userStore = useUserStore();
  const router = useRouter();

  const logout = () => {
    userStore.logout();
    router.push({ name: 'Choose Country' });
  };

  const isDropMenuOpen = ref(false);

  const toggleDropMenu = () => {
    if (isCollapsed.value) isCollapsed.value = false;
    isDropMenuOpen.value = !isDropMenuOpen.value;
  };

  const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value;
    if (isCollapsed.value) isDropMenuOpen.value = false;
  };

  const activateSearch = () => {
    if (isCollapsed.value) isCollapsed.value = false;
    void nextTick(() => sidebarSearchInput.value?.focus());
  };

  const clearSearch = () => {
    searchQuery.value = '';
  };

  const getMenuPath = (item: MenuItem) => {
    if (typeof item.link === 'string') return item.link;
    if ('path' in item.link) return item.link.path;
    return router.resolve(item.link).path;
  };

  const getMenuKey = (item: MenuItem) => {
    if (typeof item.link === 'string') return `${item.name}:${item.link}`;
    if ('path' in item.link) {
      return `${item.name}:${String(item.link.path)}:${JSON.stringify(item.link.query ?? {})}`;
    }
    return item.name;
  };

  const isItemPinned = (item: MenuItem) =>
    Boolean(item.pinned) || pinnedItems.value.has(getMenuKey(item));

  const pinnedShortcuts = computed(() =>
    activeMenu.value.flatMap((section) => section.items).filter((item) => isItemPinned(item)),
  );

  const togglePinned = (item: MenuItem) => {
    const key = getMenuKey(item);
    const next = new Set(pinnedItems.value);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    pinnedItems.value = next;
  };

  const selectWorkspace = (workspace: SidebarWorkspace) => {
    activeWorkspace.value = workspace;
    searchQuery.value = '';
    sidebarNav.value?.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  const handleWorkspaceKeydown = (event: KeyboardEvent) => {
    let workspace: SidebarWorkspace | null = null;

    if (event.key === 'Home') workspace = 'dashboard';
    else if (event.key === 'End') workspace = 'mobile';
    else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      workspace = activeWorkspace.value === 'dashboard' ? 'mobile' : 'dashboard';
    }

    if (!workspace) return;

    event.preventDefault();
    selectWorkspace(workspace);
    void nextTick(() => {
      workspaceSwitch.value
        ?.querySelector<HTMLButtonElement>('[role="tab"][aria-selected="true"]')
        ?.focus();
    });
  };

  const isMenuItemActive = (item: MenuItem) => {
    if (route.path.toLowerCase() !== String(getMenuPath(item)).toLowerCase()) return false;

    if (item.status !== undefined) {
      return Number(route.query.status) === item.status;
    }

    return !item.children || route.query.status === undefined;
  };

  const isMenuBranchActive = (item: MenuItem): boolean =>
    isMenuItemActive(item) || Boolean(item.children?.some(isMenuBranchActive));

  const collectActiveBranches = (items: MenuItem[], next: Set<string>) => {
    items.forEach((item) => {
      if (!item.children?.length) return;
      if (isMenuBranchActive(item)) next.add(getMenuKey(item));
      collectActiveBranches(item.children, next);
    });
  };

  const openActiveBranches = (items: MenuItem[]) => {
    const next = new Set(expandedItems.value);
    collectActiveBranches(items, next);
    expandedItems.value = next;
  };

  const isMenuOpen = (item: MenuItem) =>
    Boolean(searchQuery.value.trim()) || expandedItems.value.has(getMenuKey(item));

  const toggleMenu = (item: MenuItem) => {
    if (isCollapsed.value) isCollapsed.value = false;

    const key = getMenuKey(item);
    const next = new Set(expandedItems.value);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    expandedItems.value = next;
  };

  const handleNavigation = () => {
    emit('clickItem');
  };

  const closeTransientUi = () => {
    isDropMenuOpen.value = false;
  };

  const revealActiveItem = () => {
    void nextTick(() => {
      const activeItem = sidebarNav.value?.querySelector<HTMLElement>(
        '.menu-item.active, .submenu-item.active',
      );
      const reducedMotion =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      activeItem?.scrollIntoView?.({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
      });
    });
  };

  watch(
    () => [route.path, route.query.status],
    () => {
      const isMobileRoute = mobileMenu.value
        .flatMap((section) => section.items)
        .some((item) => isMenuBranchActive(item));
      activeWorkspace.value = isMobileRoute ? 'mobile' : 'dashboard';
      openActiveBranches(activeMenu.value.flatMap((section) => section.items));
      revealActiveItem();
    },
    { immediate: true },
  );

  watch([isCollapsed, activeWorkspace, pinnedItems], () => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(
        SIDEBAR_PREFERENCES_KEY,
        JSON.stringify({
          collapsed: isCollapsed.value,
          workspace: activeWorkspace.value,
          pinnedItems: [...pinnedItems.value],
        } satisfies SidebarPreferences),
      );
    } catch {
      // The sidebar remains fully functional when browser storage is unavailable.
    }
  });
</script>
<template>
  <aside
    class="sidebar sidebar--redesigned"
    :class="{ 'is-collapsed': isCollapsed }"
    @keydown.esc="closeTransientUi"
  >
    <div class="sidebar-shell">
      <header class="sidebar-header">
        <div class="sidebar-brand">
          <img class="sidebar-logo" :src="TechlabLogo" :alt="t('sidebar.logo_alt')" />
        </div>
        <button
          class="sidebar-toggle"
          type="button"
          :title="t(isCollapsed ? 'sidebar.expand' : 'sidebar.collapse')"
          :aria-label="t(isCollapsed ? 'sidebar.expand' : 'sidebar.collapse')"
          :aria-expanded="!isCollapsed"
          @click="toggleSidebar"
        >
          <SidebarCollapseIcon class="sidebar-collapse-icon" aria-hidden="true" />
        </button>
      </header>

      <label
        class="sidebar-search"
        :title="t('sidebar.search')"
        :role="isCollapsed ? 'button' : undefined"
        :tabindex="isCollapsed ? 0 : -1"
        @click="activateSearch"
        @keydown.enter.prevent="activateSearch"
        @keydown.space.prevent="activateSearch"
      >
        <SearchIcon class="sidebar-search__icon" aria-hidden="true" />
        <input
          ref="sidebarSearchInput"
          v-model="searchQuery"
          class="sidebar-search__input"
          type="search"
          :placeholder="t('sidebar.search')"
          :aria-label="t('sidebar.search')"
          autocomplete="off"
          @keydown.esc.stop="clearSearch"
        />
      </label>

      <div
        ref="workspaceSwitch"
        class="workspace-switch"
        :class="{ 'is-mobile': activeWorkspace === 'mobile' }"
        role="tablist"
        :aria-label="t('sidebar.workspace_switch')"
        @keydown="handleWorkspaceKeydown"
      >
        <button
          class="workspace-switch__tab"
          :class="{ 'is-active': activeWorkspace === 'dashboard' }"
          type="button"
          role="tab"
          :tabindex="activeWorkspace === 'dashboard' ? 0 : -1"
          :aria-selected="activeWorkspace === 'dashboard'"
          @click="selectWorkspace('dashboard')"
        >
          <span class="dashboard-glyph" aria-hidden="true"></span>
          <span>{{ t('sidebar.dashboard') }}</span>
        </button>
        <button
          class="workspace-switch__tab"
          :class="{ 'is-active': activeWorkspace === 'mobile' }"
          type="button"
          role="tab"
          :tabindex="activeWorkspace === 'mobile' ? 0 : -1"
          :aria-selected="activeWorkspace === 'mobile'"
          @click="selectWorkspace('mobile')"
        >
          <SidebarMobileIcon class="workspace-switch__mobile-icon" aria-hidden="true" />
          <span>{{ t('sidebar.mobile_app') }}</span>
        </button>
      </div>

      <nav ref="sidebarNav" class="sidebar-nav" :aria-label="t('sidebar.navigation')">
        <Transition name="workspace-fade" mode="out-in">
          <div :key="activeWorkspace" class="sidebar-nav__content">
            <section
              v-if="!searchQuery.trim() && pinnedShortcuts.length"
              class="sidebar-section sidebar-section--pinned"
            >
              <p class="sidebar-section__title">{{ t('sidebar.pinned') }}</p>
              <div class="sidebar-section__items">
                <PermissionBuilder
                  v-for="item in pinnedShortcuts"
                  :key="`pinned-${getMenuKey(item)}`"
                  :code="item.permissions ?? []"
                >
                  <div class="pinned-item-row" :class="{ 'is-active': isMenuItemActive(item) }">
                    <router-link
                      :to="item.link"
                      class="pinned-item"
                      :aria-current="isMenuItemActive(item) ? 'page' : undefined"
                      :title="isCollapsed ? translateLabel(item.name) : undefined"
                      @click="handleNavigation"
                    >
                      <component :is="item.icon" class="menu-icon" aria-hidden="true" />
                      <span class="menu-label">{{ translateLabel(item.name) }}</span>
                    </router-link>
                    <button
                      class="pin-action is-pinned"
                      type="button"
                      :aria-label="t('sidebar.unpin_item', { item: translateLabel(item.name) })"
                      :title="t('sidebar.unpin_item', { item: translateLabel(item.name) })"
                      :aria-pressed="true"
                      @click="togglePinned(item)"
                    >
                      <SidebarPinIcon unpin class="sidebar-pin-icon" aria-hidden="true" />
                    </button>
                  </div>
                </PermissionBuilder>
              </div>
            </section>

            <template v-for="(group, gIndex) in visibleMenu" :key="`${group.group}-${gIndex}`">
              <PermissionBuilder :code="group.permissions">
                <section class="sidebar-section">
                  <p v-if="group.group" class="sidebar-section__title">
                    {{ translateLabel(group.group) }}
                  </p>

                  <div class="sidebar-section__items">
                    <template v-for="(item, i) in group.items" :key="`${getMenuKey(item)}-${i}`">
                      <PermissionBuilder :code="item.permissions ?? group.permissions">
                        <div
                          class="sidebar-entry"
                          :class="{
                            'is-active': isMenuBranchActive(item),
                            'is-expanded': item.children?.length && isMenuOpen(item),
                            'is-pinned': isItemPinned(item),
                          }"
                        >
                          <div
                            class="menu-item-row"
                            :class="{ 'has-children': item.children?.length }"
                          >
                            <router-link
                              :to="item.link"
                              class="menu-item"
                              :class="{ active: isMenuItemActive(item) }"
                              :title="isCollapsed ? translateLabel(item.name) : undefined"
                              :aria-current="isMenuItemActive(item) ? 'page' : undefined"
                              @click="handleNavigation"
                            >
                              <component :is="item.icon" class="menu-icon" aria-hidden="true" />
                              <span class="menu-label">{{ translateLabel(item.name) }}</span>
                              <span v-if="item.badge" class="menu-badge">{{ item.badge }}</span>
                            </router-link>

                            <button
                              class="pin-action"
                              :class="{ 'is-pinned': isItemPinned(item) }"
                              type="button"
                              :aria-pressed="isItemPinned(item)"
                              :aria-label="
                                t(isItemPinned(item) ? 'sidebar.unpin_item' : 'sidebar.pin_item', {
                                  item: translateLabel(item.name),
                                })
                              "
                              :title="
                                t(isItemPinned(item) ? 'sidebar.unpin_item' : 'sidebar.pin_item', {
                                  item: translateLabel(item.name),
                                })
                              "
                              @click="togglePinned(item)"
                            >
                              <SidebarPinIcon
                                :unpin="isItemPinned(item)"
                                class="sidebar-pin-icon"
                                aria-hidden="true"
                              />
                            </button>

                            <button
                              v-if="item.children?.length"
                              class="submenu-toggle"
                              type="button"
                              :class="{ 'is-open': isMenuOpen(item) }"
                              :aria-label="
                                t(
                                  isMenuOpen(item)
                                    ? 'sidebar.collapse_item'
                                    : 'sidebar.expand_item',
                                  {
                                    item: translateLabel(item.name),
                                  },
                                )
                              "
                              :aria-expanded="isMenuOpen(item)"
                              @click="toggleMenu(item)"
                            >
                              <span class="sidebar-chevron" aria-hidden="true"></span>
                            </button>
                          </div>

                          <div
                            v-if="item.children?.length"
                            class="submenu-collapse"
                            :class="{ 'is-open': isMenuOpen(item) }"
                            :aria-hidden="!isMenuOpen(item)"
                          >
                            <div class="submenu-collapse__inner">
                              <div class="submenu-list submenu-list--level-one">
                                <template v-for="child in item.children" :key="getMenuKey(child)">
                                  <PermissionBuilder
                                    :code="
                                      child.permissions ?? item.permissions ?? group.permissions
                                    "
                                  >
                                    <div
                                      class="submenu-entry"
                                      :class="{
                                        'is-active': isMenuBranchActive(child),
                                        'is-pinned': child.pinned,
                                      }"
                                    >
                                      <div class="submenu-row">
                                        <router-link
                                          :to="child.link"
                                          class="submenu-item"
                                          :class="{ active: isMenuItemActive(child) }"
                                          :aria-current="
                                            isMenuItemActive(child) ? 'page' : undefined
                                          "
                                          @click="handleNavigation"
                                        >
                                          <span class="submenu-marker" aria-hidden="true"></span>
                                          <span class="submenu-label">{{
                                            translateLabel(child.name)
                                          }}</span>
                                          <span v-if="child.badge" class="menu-badge">{{
                                            child.badge
                                          }}</span>
                                          <span
                                            v-if="child.pinned"
                                            class="pin-indicator"
                                            aria-hidden="true"
                                          ></span>
                                        </router-link>

                                        <button
                                          v-if="child.children?.length"
                                          class="submenu-toggle submenu-toggle--nested"
                                          type="button"
                                          :class="{ 'is-open': isMenuOpen(child) }"
                                          :aria-label="
                                            t(
                                              isMenuOpen(child)
                                                ? 'sidebar.collapse_item'
                                                : 'sidebar.expand_item',
                                              { item: translateLabel(child.name) },
                                            )
                                          "
                                          :aria-expanded="isMenuOpen(child)"
                                          @click="toggleMenu(child)"
                                        >
                                          <span class="sidebar-chevron" aria-hidden="true"></span>
                                        </button>
                                      </div>

                                      <div
                                        v-if="child.children?.length"
                                        class="submenu-collapse submenu-collapse--nested"
                                        :class="{ 'is-open': isMenuOpen(child) }"
                                        :aria-hidden="!isMenuOpen(child)"
                                      >
                                        <div class="submenu-collapse__inner">
                                          <div class="submenu-list submenu-list--level-two">
                                            <template
                                              v-for="grandchild in child.children"
                                              :key="getMenuKey(grandchild)"
                                            >
                                              <PermissionBuilder
                                                :code="
                                                  grandchild.permissions ??
                                                  child.permissions ??
                                                  item.permissions ??
                                                  group.permissions
                                                "
                                              >
                                                <router-link
                                                  :to="grandchild.link"
                                                  class="submenu-item submenu-item--nested"
                                                  :class="{
                                                    active: isMenuItemActive(grandchild),
                                                    'is-pinned': grandchild.pinned,
                                                  }"
                                                  :aria-current="
                                                    isMenuItemActive(grandchild)
                                                      ? 'page'
                                                      : undefined
                                                  "
                                                  @click="handleNavigation"
                                                >
                                                  <span
                                                    class="submenu-marker submenu-marker--nested"
                                                    aria-hidden="true"
                                                  ></span>
                                                  <span class="submenu-label">{{
                                                    translateLabel(grandchild.name)
                                                  }}</span>
                                                  <span
                                                    v-if="grandchild.badge"
                                                    class="menu-badge"
                                                    >{{ grandchild.badge }}</span
                                                  >
                                                  <span
                                                    v-if="grandchild.pinned"
                                                    class="pin-indicator"
                                                    aria-hidden="true"
                                                  ></span>
                                                </router-link>
                                              </PermissionBuilder>
                                            </template>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </PermissionBuilder>
                                </template>
                              </div>
                            </div>
                          </div>
                        </div>
                      </PermissionBuilder>
                    </template>
                  </div>
                </section>
              </PermissionBuilder>
            </template>

            <p v-if="!visibleMenu.length" class="sidebar-empty">
              {{ t('sidebar.no_results') }}
            </p>
          </div>
        </Transition>
      </nav>

      <footer class="sidebar-account">
        <div
          class="profile-menu-collapse"
          :class="{ 'is-open': isDropMenuOpen }"
          :aria-hidden="!isDropMenuOpen"
        >
          <div class="profile-menu-collapse__inner">
            <div class="profile-menu">
              <button class="profile-menu__item" type="button" @click="isDropMenuOpen = false">
                <Sidebaremploye aria-hidden="true" />
                <span>{{ t('sidebar.profile') }}</span>
              </button>
              <button
                class="profile-menu__item profile-menu__item--danger"
                type="button"
                @click="logout"
              >
                <IconLogout aria-hidden="true" />
                <span>{{ t('sidebar.log_out') }}</span>
              </button>
            </div>
          </div>
        </div>

        <button
          class="account-summary"
          type="button"
          :title="isCollapsed ? user?.name || t('sidebar.profile') : undefined"
          :aria-label="t('sidebar.user_menu')"
          :aria-expanded="isDropMenuOpen"
          @click="toggleDropMenu"
        >
          <img
            class="account-avatar"
            :src="user?.image || `https://cyber.comolho.com/static/img/avatar.png`"
            :alt="t('sidebar.avatar_alt', { name: user?.name || t('sidebar.user') })"
          />
          <span class="account-copy">
            <strong class="account-name">{{ user?.name || t('sidebar.user') }}</strong>
            <span class="account-role">{{ t('sidebar.admin') }}</span>
          </span>
          <AuthArrowIcon
            class="account-arrow"
            :class="{ 'is-open': isDropMenuOpen }"
            aria-hidden="true"
          />
        </button>
      </footer>
    </div>
  </aside>

  <!--
    Legacy sidebar implementation preserved for rollback.
    <aside class="sidebar">
      <div class="sidebar-wrapper">
        <div class="logo-container">
          <img class="logo" :src="TechlabLogo" alt="Techlab Logo" />
        </div>
        <div class="menu">
          <div v-for="(group, gIndex) in menu" :key="gIndex" class="menu-group">
            <PermissionBuilder :code="group.permissions">
              <p v-if="group.group" class="group-title">{{ group.group }}</p>
              <div v-for="(item, i) in group.items" :key="i" class="menu-entry">
                <PermissionBuilder :code="item.permissions">
                  <router-link
                    :to="item.link"
                    class="menu-item"
                    :class="{ active: isMenuItemActive(item) }"
                    @click="emit('clickItem')"
                  >
                    <component :is="item.icon" class="icon" />
                    <span class="label">{{ $t(item.name) }}</span>
                    <span v-if="item?.badge" class="badge">{{ item?.badge }}</span>
                    <span v-if="item?.hasArrow" class="arrow">›</span>
                  </router-link>
                </PermissionBuilder>
                <div v-if="item.children" class="submenu">
                  <PermissionBuilder :code="item.permissions">
                    <router-link
                      v-for="child in item.children"
                      :key="child.name"
                      :to="child.link"
                      class="submenu-item"
                      :class="{ active: isMenuItemActive(child) }"
                      @click="emit('clickItem')"
                    >
                      <span class="submenu-dot"></span>
                      <span>{{ $t(child.name) }}</span>
                    </router-link>
                  </PermissionBuilder>
                </div>
              </div>
            </PermissionBuilder>
          </div>
        </div>
        <Accordion :value="0">
          <AccordionPanel value="0">
            <AccordionHeader>
              <div class="auth-container" @click="toggleDropMenu">
                <div class="auth-data">
                  <img
                    :src="user?.image || `https://cyber.comolho.com/static/img/avatar.png`"
                    alt="image"
                  />
                  <div class="user-data">
                    <span class="name">{{ user?.name }}</span>
                    <span class="status">Admin</span>
                  </div>
                </div>
                <auth-arrow-icon />
              </div>
            </AccordionHeader>
            <AccordionContent>
              <div class="mega-body">
                <button class="menu-item"><span>{{ $t('my_profile') }}</span></button>
                <button class="menu-item"><span>{{ $t('settings') }}</span></button>
                <button class="menu-item"><span>{{ $t('notifications') }}</span></button>
                <div class="divider"></div>
                <button class="menu-item danger" @click="logout">
                  <icon-logout />
                  <span>{{ $t('logout') }}</span>
                </button>
              </div>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </div>
    </aside>
  -->
</template>

<style scoped lang="scss" src="./SidebarNavigation.scss"></style>
