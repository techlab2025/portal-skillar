import TitleInterface from '@/base/Data/Models/titleInterface';
import RoleTranslationsModel from './role.translations.model';

interface RoleModelData {
  id: number;
  title?: string;
  roleName?: string;
  titleTranslations?: RoleTranslationsModel[];
  translations?: Record<string, string>;
  permissions?: string[];
  permissionsCount?: number;
  usersCount?: number;
  createdBy?: string;
  createdAt?: string;
}

const asRecord = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const toPermissionCode = (value: unknown): string | null => {
  const record = asRecord(value);
  const code =
    typeof value === 'string'
      ? value
      : String(record.permission ?? record.code ?? record.name ?? '');

  return code || null;
};

const toTitleTranslations = (value: unknown): RoleTranslationsModel[] => {
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      const record = asRecord(item);
      const locale = String(record.locale ?? '');
      const displayName = String(record.display_name ?? record.title ?? '');

      return locale && displayName
        ? [new RoleTranslationsModel({ locale, display_name: displayName })]
        : [];
    });
  }

  return Object.entries(asRecord(value)).flatMap(([locale, translatedValue]) => {
    const nestedValue = asRecord(translatedValue);
    const displayName =
      typeof translatedValue === 'string'
        ? translatedValue
        : String(nestedValue.display_name ?? nestedValue.title ?? '');

    return displayName ? [new RoleTranslationsModel({ locale, display_name: displayName })] : [];
  });
};

const creatorName = (value: unknown): string => {
  if (typeof value === 'string') return value;
  const creator = asRecord(value);
  return String(creator.name ?? creator.full_name ?? creator.display_name ?? '');
};

export default class RoleModel {
  public readonly id: number;
  public readonly titleTranslations: RoleTranslationsModel[];
  public readonly title: string;
  public readonly roleName: string;
  public readonly translations: Readonly<Record<string, string>>;
  public readonly permissions: string[];
  public readonly permissionsCount: number;
  public readonly usersCount: number;
  public readonly createdBy: string;
  public readonly createdAt: string;

  constructor(data: RoleModelData) {
    const titleTranslations =
      data.titleTranslations ??
      Object.entries(data.translations ?? {}).map(
        ([locale, displayName]) => new RoleTranslationsModel({ locale, display_name: displayName }),
      );
    const translations = Object.fromEntries(
      titleTranslations.map(({ locale, display_name }) => [locale, display_name]),
    );
    const title =
      data.title ??
      data.roleName ??
      translations.en ??
      translations.ar ??
      Object.values(translations)[0] ??
      '';

    this.id = data.id;
    this.title = title;
    this.roleName = title;
    this.titleTranslations = titleTranslations;
    this.translations = Object.freeze(translations);
    this.permissions = data.permissions ?? [];
    this.permissionsCount = data.permissionsCount ?? this.permissions.length;
    this.usersCount = data.usersCount ?? 0;
    this.createdBy = data.createdBy ?? '';
    this.createdAt = data.createdAt ?? '';

    Object.freeze(this.titleTranslations);
    Object.freeze(this.permissions);
    Object.freeze(this);
  }

  toOption(): TitleInterface<number> {
    return new TitleInterface({ id: this.id, title: this.title });
  }

  static fromJson(data: unknown): RoleModel {
    const root = asRecord(data);
    const nestedRole = asRecord(root.role);
    const record = Object.keys(nestedRole).length > 0 ? nestedRole : root;
    const translationsRecord = asRecord(record.translations);
    const rawTitleTranslations =
      translationsRecord.display_name ??
      translationsRecord.title ??
      record.display_name ??
      record.title;
    const titleTranslations = toTitleTranslations(rawTitleTranslations);
    const explicitTitle = [record.display_name, record.role_name, record.name, record.title].find(
      (value): value is string => typeof value === 'string',
    );
    const rawPermissions = Array.isArray(record.permissions)
      ? record.permissions
      : Array.isArray(record.permission)
        ? record.permission
        : [];
    const permissions = rawPermissions
      .map(toPermissionCode)
      .filter((permission): permission is string => permission !== null);

    return new RoleModel({
      id: Number(record.id ?? record.role_id ?? 0),
      title:
        explicitTitle ??
        titleTranslations.find(({ locale }) => locale === 'en')?.display_name ??
        titleTranslations.find(({ locale }) => locale === 'ar')?.display_name ??
        titleTranslations[0]?.display_name ??
        '',
      titleTranslations,
      permissions,
      permissionsCount: Number(
        record.permissions_count ?? record.permission_count ?? permissions.length,
      ),
      usersCount: Number(
        record.users_count ?? record.employee_count ?? record.employees_count ?? 0,
      ),
      createdBy: creatorName(record.created_by_name ?? record.created_by ?? record.creator),
      createdAt: String(record.created_at ?? record.createdAt ?? ''),
    });
  }

  static get example(): RoleModel {
    return new RoleModel({
      id: 1,
      title: 'Content Manager',
      titleTranslations: [
        new RoleTranslationsModel({ locale: 'en', display_name: 'Content Manager' }),
      ],
      permissions: ['ADM01'],
    });
  }
}
