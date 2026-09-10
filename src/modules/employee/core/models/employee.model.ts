import TitleInterface from '@/base/Data/Models/titleInterface';
import { EmployeeTypeEnum } from '../constant/employee.type.enum';
import { GenderENum } from '../constant/gender.enum';

type JsonRecord = Record<string, unknown>;

export interface EmployeePermission {
  code: string;
  title: string;
}

export interface EmployeeHistoryEntry {
  id: string;
  action: string;
  actor: string;
  occurredAt: string;
  date: string;
  time: string;
}

interface EmployeeModelData {
  id?: number;
  name?: string;
  firstname?: string;
  lastname?: string;
  email: string;
  phone: string;
  password?: string;
  image: string;
  isSuperadmin: boolean;
  employeeId?: string;
  status: number;
  subjects?: TitleInterface<number>[];
  gender?: GenderENum;
  employeeType?: EmployeeTypeEnum;
  roleId?: number;
  roleName?: string;
  roles?: TitleInterface<number>[];
  permissions?: EmployeePermission[];
  scopeLabels?: string[];
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  history?: EmployeeHistoryEntry[];
  educationClassificationSubjectIds?: number[];
}

const asRecord = (value: unknown): JsonRecord =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : {};

const firstText = (...values: unknown[]): string => {
  const value = values.find((item) => typeof item === 'string' && item.trim().length > 0);
  return typeof value === 'string' ? value.trim() : '';
};

const displayName = (value: unknown): string => {
  if (typeof value === 'string') return value.trim();
  const record = asRecord(value);
  const fullName = firstText(record.name, record.full_name, record.display_name, record.title);
  if (fullName) return fullName;
  return [firstText(record.first_name), firstText(record.last_name)].filter(Boolean).join(' ');
};

const uniqueStrings = (values: string[]): string[] =>
  values.filter((value, index) => value.length > 0 && values.indexOf(value) === index);

const toBoolean = (value: unknown): boolean => value === true || value === 1 || value === '1';

const splitScopeLabel = (value: string): string[] =>
  value
    .split(/\s*(?:->|→|›|\/)\s*/u)
    .map((part) => part.trim())
    .filter(Boolean);

const mapSubject = (value: unknown): TitleInterface<number> | null => {
  const subject = asRecord(value);
  const id = Number(subject.e_c_subject_id ?? subject.id ?? 0);
  if (!id) return null;

  return new TitleInterface<number>({
    id,
    title: firstText(
      subject.title,
      subject.name,
      subject.full_title,
      subject.fullTitle,
      String(id),
    ),
  });
};

const mapRole = (value: unknown, index: number): TitleInterface<number> | null => {
  const role = asRecord(value);
  const title = firstText(role.role_name, role.display_name, role.name, role.title);
  if (!title) return null;

  return new TitleInterface<number>({
    id: Number(role.id ?? role.role_id ?? index + 1),
    title,
  });
};

const mapPermission = (value: unknown): EmployeePermission | null => {
  if (typeof value === 'string') {
    const code = value.trim();
    return code ? { code, title: code } : null;
  }

  const permission = asRecord(value);
  const code = firstText(
    permission.permission,
    permission.code,
    permission.permission_code,
    permission.key,
  );
  const title = firstText(
    permission.display_name,
    permission.permission_name,
    permission.title,
    permission.name,
    permission.label,
  );
  if (!code && !title) return null;

  return { code: code || title, title: title || code };
};

const mapHistory = (value: unknown): EmployeeHistoryEntry[] => {
  const historyContainer = asRecord(value);
  const entries = Array.isArray(value)
    ? value
    : Array.isArray(historyContainer.data)
      ? historyContainer.data
      : Array.isArray(historyContainer.items)
        ? historyContainer.items
        : [];

  return entries.map((entry, index) => {
    const history = asRecord(entry);
    const occurredAt = firstText(
      history.occurred_at,
      history.created_at,
      history.updated_at,
      history.timestamp,
    );

    return {
      id: String(history.id ?? `${occurredAt}-${index}`),
      action: firstText(
        history.action_title,
        history.action,
        history.event_name,
        history.event,
        history.title,
        history.description,
      ),
      actor: displayName(
        history.performed_by ??
          history.created_by ??
          history.updated_by ??
          history.admin ??
          history.user ??
          history.actor ??
          history.by,
      ),
      occurredAt,
      date: firstText(history.date),
      time: firstText(history.time),
    };
  });
};

const mapScopeLabels = (record: JsonRecord, rawSubjects: unknown[]): string[] => {
  const rawScope =
    record.teacher_scope ?? record.education_scope ?? record.curriculum_scope ?? record.scope;
  const scopeRecord = asRecord(rawScope);
  const orderedScopeValues = [
    scopeRecord.education_type,
    scopeRecord.educationType,
    scopeRecord.education_classification,
    scopeRecord.educationClassification,
    scopeRecord.stage,
    scopeRecord.grade,
    scopeRecord.subject,
  ];
  const rawScopeItems = Array.isArray(rawScope)
    ? rawScope
    : orderedScopeValues.some((value) => value != null)
      ? orderedScopeValues
      : [];
  const scopeLabels = rawScopeItems.flatMap((item) => splitScopeLabel(displayName(item)));

  if (scopeLabels.length > 0) return uniqueStrings(scopeLabels);

  const fullScopePaths = rawSubjects
    .map((subject) => {
      const subjectRecord = asRecord(subject);
      return firstText(subjectRecord.full_title, subjectRecord.fullTitle);
    })
    .filter(Boolean);
  const fallbackSubjectTitles = rawSubjects.map((subject) => {
    const subjectRecord = asRecord(subject);
    return firstText(subjectRecord.title, subjectRecord.name);
  });

  return uniqueStrings(
    (fullScopePaths.length > 0 ? fullScopePaths : fallbackSubjectTitles).flatMap(splitScopeLabel),
  );
};

/** Employee data used by the list, edit and details screens. */
export default class EmployeeModel {
  public readonly id?: number;
  public readonly firstname: string;
  public readonly lastname: string;
  public readonly email: string;
  public readonly phone: string;
  public readonly password?: string;
  public readonly image: string;
  public readonly isSuperadmin: boolean;
  public readonly employeeId: string;
  public readonly status: number;
  public readonly subjects: TitleInterface<number>[];
  public readonly gender?: GenderENum;
  public readonly employeeType: EmployeeTypeEnum;
  public readonly roleId?: number;
  public readonly roleName: string;
  public readonly roles: TitleInterface<number>[];
  public readonly permissions: EmployeePermission[];
  public readonly scopeLabels: string[];
  public readonly createdBy: string;
  public readonly createdAt: string;
  public readonly updatedBy: string;
  public readonly updatedAt: string;
  public readonly history: EmployeeHistoryEntry[];
  public readonly educationClassificationSubjectIds: number[];

  get name(): string {
    return `${this.firstname.trim()} ${this.lastname.trim()}`.trim();
  }

  constructor(data: EmployeeModelData) {
    this.id = data.id;
    this.firstname = data.firstname || data.name?.split(' ')[0] || '';
    this.lastname = data.lastname || data.name?.split(' ').slice(1).join(' ') || '';
    this.email = data.email;
    this.phone = data.phone;
    this.password = data.password;
    this.image = data.image;
    this.isSuperadmin = data.isSuperadmin;
    this.employeeId = data.employeeId || '';
    this.status = data.status;
    this.subjects = data.subjects ?? [];
    this.gender = data.gender;
    this.employeeType = data.employeeType ?? EmployeeTypeEnum.ADMIN;
    this.roleId = data.roleId;
    this.roleName = data.roleName ?? '';
    this.roles = data.roles ?? [];
    this.permissions = data.permissions ?? [];
    this.scopeLabels = data.scopeLabels ?? [];
    this.createdBy = data.createdBy ?? '';
    this.createdAt = data.createdAt ?? '';
    this.updatedBy = data.updatedBy ?? '';
    this.updatedAt = data.updatedAt ?? '';
    this.history = data.history ?? [];
    this.educationClassificationSubjectIds =
      data.educationClassificationSubjectIds ?? this.subjects.map((subject) => subject.id);

    Object.freeze(this.subjects);
    Object.freeze(this.roles);
    Object.freeze(this.permissions);
    Object.freeze(this.scopeLabels);
    Object.freeze(this.history);
    Object.freeze(this.educationClassificationSubjectIds);
    Object.freeze(this);
  }

  static fromJson(json: unknown): EmployeeModel {
    const root = asRecord(json);
    if (Object.keys(root).length === 0) {
      throw new Error('Cannot create EmployeeModel from null or undefined');
    }

    const nestedEmployee = asRecord(root.employee);
    const record = Object.keys(nestedEmployee).length > 0 ? { ...root, ...nestedEmployee } : root;
    const rawSubjects = Array.isArray(record.subjects) ? record.subjects : [];
    const subjects = rawSubjects
      .map(mapSubject)
      .filter((subject): subject is TitleInterface<number> => subject !== null);
    const singleRole = asRecord(record.role);
    const rawRoles = Array.isArray(record.roles)
      ? record.roles
      : Object.keys(singleRole).length > 0
        ? [singleRole]
        : [];
    const roles = rawRoles
      .map(mapRole)
      .filter((role): role is TitleInterface<number> => role !== null);
    const rolePermissionValues = rawRoles.flatMap((role) => {
      const roleRecord = asRecord(role);
      return Array.isArray(roleRecord.permissions) ? roleRecord.permissions : [];
    });
    const rawPermissions = Array.isArray(record.effective_permissions)
      ? record.effective_permissions
      : Array.isArray(record.permissions)
        ? record.permissions
        : rolePermissionValues;
    const permissions = rawPermissions
      .map(mapPermission)
      .filter((permission): permission is EmployeePermission => permission !== null)
      .filter(
        (permission, index, values) =>
          values.findIndex((item) => item.code === permission.code) === index,
      );
    const audit = asRecord(record.record_information ?? record.audit);
    const roleId = roles[0]?.id ?? (Number(record.role_id ?? singleRole.id ?? 0) || undefined);
    const roleName = roles[0]?.title ?? firstText(record.role_name, singleRole.role_name);
    const historySource =
      record.history_logs ??
      record.history_log ??
      record.activity_logs ??
      record.activities ??
      record.logs ??
      record.history;

    return new EmployeeModel({
      id: Number(record.id ?? record.employee_id ?? 0) || undefined,
      firstname:
        firstText(record.first_name, record.firstname) || firstText(record.name).split(' ')[0],
      lastname:
        firstText(record.last_name, record.lastname) ||
        firstText(record.name).split(' ').slice(1).join(' '),
      email: firstText(record.email),
      phone: firstText(record.phone),
      password: firstText(record.password) || undefined,
      image: firstText(record.image, record.avatar, record.photo),
      isSuperadmin: toBoolean(record.isSuperadmin ?? record.is_superadmin),
      employeeId: firstText(record.employee_ref, record.employee_reference, record.reference),
      status: Number(record.status ?? 0),
      subjects,
      gender:
        record.gender === null || record.gender === undefined
          ? undefined
          : (Number(record.gender) as GenderENum),
      employeeType: Number(
        record.type ?? record.employee_type ?? record.employeeType ?? EmployeeTypeEnum.ADMIN,
      ) as EmployeeTypeEnum,
      roleId,
      roleName,
      roles:
        roles.length > 0 || !roleName
          ? roles
          : [new TitleInterface({ id: roleId ?? 0, title: roleName })],
      permissions,
      scopeLabels: mapScopeLabels(record, rawSubjects),
      createdBy: displayName(
        record.created_by ?? record.creator ?? record.created_by_name ?? audit.created_by,
      ),
      createdAt: firstText(record.created_at, record.createdAt, audit.created_at),
      updatedBy: displayName(
        record.updated_by ?? record.updater ?? record.updated_by_name ?? audit.updated_by,
      ),
      updatedAt: firstText(record.updated_at, record.updatedAt, audit.updated_at),
      history: mapHistory(historySource),
      educationClassificationSubjectIds: Array.isArray(record.e_c_subject_ids)
        ? record.e_c_subject_ids.map(Number)
        : subjects.map((subject) => subject.id),
    });
  }

  static readonly example = new EmployeeModel({
    id: 1,
    firstname: 'John',
    lastname: 'Doe',
    email: 'john@example.com',
    phone: '123456789',
    image: 'https://cyber.comolho.com/static/img/avatar.png',
    isSuperadmin: false,
    employeeId: 'EMP-545',
    status: 2,
    subjects: [],
    gender: GenderENum.male,
    employeeType: EmployeeTypeEnum.ADMIN,
    roleId: 1,
    roleName: 'Content Manager',
    roles: [new TitleInterface({ id: 1, title: 'Content Manager' })],
    educationClassificationSubjectIds: [],
  });
}
