import { GenderENum } from '../constant/gender.enum';
import { EmployeeTypeEnum } from '../constant/employee.type.enum';
import TitleInterface from '@/base/Data/Models/titleInterface';

export interface EmployeeHistoryEntry {
  id: string;
  action: string;
  actor: string;
  createdAt: string;
}

const asRecord = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const personName = (value: unknown): string => {
  if (typeof value === 'string') return value;
  const person = asRecord(value);
  return String(person.name ?? person.full_name ?? person.display_name ?? '');
};

const mapHistory = (value: unknown): EmployeeHistoryEntry[] => {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item, index) => {
    const record = asRecord(item);
    const action = String(
      record.action ?? record.description ?? record.event ?? record.status ?? record.title ?? '',
    );
    const createdAt = String(record.created_at ?? record.createdAt ?? record.date ?? '');
    if (!action && !createdAt) return [];

    return [
      {
        id: String(record.id ?? `${createdAt}-${index}`),
        action,
        actor: personName(record.actor ?? record.user ?? record.created_by),
        createdAt,
      },
    ];
  });
};

/**
 * Employee model representing an employee entity
 */
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
  public readonly gender: GenderENum;
  public readonly employeeType: EmployeeTypeEnum;
  public readonly hasEmployeeType: boolean;
  public readonly roleId?: number;
  public readonly roleName: string;
  public readonly roles: TitleInterface<number>[];
  public readonly educationClassificationSubjectIds: number[];
  public readonly createdBy: string;
  public readonly createdAt: string;
  public readonly updatedBy: string;
  public readonly updatedAt: string;
  public readonly history: EmployeeHistoryEntry[];

  get name(): string {
    return `${this.firstname.trim()} ${this.lastname.trim()}`.trim();
  }

  constructor(data: {
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
    hasEmployeeType?: boolean;
    roleId?: number;
    roleName?: string;
    roles?: TitleInterface<number>[];
    educationClassificationSubjectIds?: number[];
    createdBy?: string;
    createdAt?: string;
    updatedBy?: string;
    updatedAt?: string;
    history?: EmployeeHistoryEntry[];
  }) {
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
    this.gender = data.gender as GenderENum;
    this.employeeType = data.employeeType ?? EmployeeTypeEnum.ADMIN;
    this.hasEmployeeType = data.hasEmployeeType ?? data.employeeType != null;
    this.roleId = data.roleId ?? data.roles?.[0]?.id;
    this.roleName = data.roleName ?? data.roles?.[0]?.title ?? '';
    this.roles =
      data.roles ??
      (this.roleId ? [new TitleInterface<number>({ id: this.roleId, title: this.roleName })] : []);
    this.educationClassificationSubjectIds =
      data.educationClassificationSubjectIds ?? this.subjects.map((subject) => subject.id);
    this.createdBy = data.createdBy ?? '';
    this.createdAt = data.createdAt ?? '';
    this.updatedBy = data.updatedBy ?? '';
    this.updatedAt = data.updatedAt ?? '';
    this.history = data.history ?? [];

    Object.freeze(this.roles);
    Object.freeze(this);
  }

  /**
   * Create EmployeeModel from API response
   * @param json - Raw JSON data from API
   * @returns EmployeeModel instance
   */
  static fromJson(json: unknown): EmployeeModel {
    if (!json) {
      throw new Error('Cannot create EmployeeModel from null or undefined');
    }

    const record = asRecord(json);
    const name = typeof record.name === 'string' ? record.name : '';
    const subjects: TitleInterface<number>[] = Array.isArray(record.subjects)
      ? record.subjects
          .map((item) => {
            const subject = asRecord(item);
            const id = Number(subject.e_c_subject_id ?? subject.id);
            if (!id) return null;
            return new TitleInterface<number>({
              id,
              title: String(subject.full_title ?? subject.title ?? id),
            });
          })
          .filter((subject: TitleInterface<number> | null): subject is TitleInterface<number> =>
            Boolean(subject),
          )
      : [];

    const role = asRecord(record.role);
    const roles = (Array.isArray(record.roles) ? record.roles : [record.role]).flatMap((item) => {
      const roleItem = asRecord(item);
      const id = Number(roleItem.id ?? roleItem.role_id ?? 0);
      if (!id) return [];
      return [
        new TitleInterface<number>({
          id,
          title: String(
            roleItem.role_name ?? roleItem.display_name ?? roleItem.name ?? roleItem.title ?? id,
          ),
        }),
      ];
    });

    const rawEmployeeType = record.type ?? record.employee_type ?? record.employeeType;

    return new EmployeeModel({
      id: Number(record.id ?? record.employee_id ?? 0) || undefined,
      firstname: String(record.first_name ?? name.split(' ')[0] ?? ''),
      lastname: String(record.last_name ?? name.split(' ').slice(1).join(' ') ?? ''),
      email: String(record.email ?? ''),
      phone: String(record.phone ?? ''),
      password: typeof record.password === 'string' ? record.password : undefined,
      image: String(record.image ?? ''),
      isSuperadmin: Boolean(record.isSuperadmin),
      employeeId: String(record.employee_ref ?? ''),
      status: Number(record.status ?? 0),
      subjects,
      gender: record.gender as GenderENum,
      employeeType: Number(rawEmployeeType ?? EmployeeTypeEnum.ADMIN) as EmployeeTypeEnum,
      hasEmployeeType: rawEmployeeType != null,
      roleId: Number(record.role_id ?? role.id ?? roles[0]?.id ?? 0) || undefined,
      roleName: String(
        record.role_name ??
          role.role_name ??
          role.display_name ??
          role.name ??
          roles[0]?.title ??
          '',
      ),
      roles,
      educationClassificationSubjectIds: Array.isArray(record.e_c_subject_ids)
        ? record.e_c_subject_ids.map(Number)
        : Array.isArray(record.subjects)
          ? subjects.map((subject) => subject.id)
          : [],
      createdBy: personName(record.created_by_name ?? record.created_by ?? record.creator),
      createdAt: String(record.created_at ?? record.createdAt ?? ''),
      updatedBy: personName(record.updated_by_name ?? record.updated_by ?? record.last_updated_by),
      updatedAt: String(record.updated_at ?? record.updatedAt ?? ''),
      history: mapHistory(
        record.history_log ??
          record.history_logs ??
          record.logs ??
          record.history ??
          record.activity_log,
      ),
    });
  }

  static example: EmployeeModel = new EmployeeModel({
    id: 1,
    firstname: 'John ',
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
    educationClassificationSubjectIds: [],
  });
}
