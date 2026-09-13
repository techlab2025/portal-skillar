import TitleInterface from '@/base/Data/Models/titleInterface';
import { EmployeeTypeEnum } from '../constant/employee.type.enum';
import type { GenderENum } from '../constant/gender.enum';
import {
  asRecord,
  displayName,
  firstText,
  mapHistory,
  mapPermissions,
  mapRoles,
  mapScopeLabels,
  mapSubjects,
  toBoolean,
  type EmployeeHistoryEntry,
  type EmployeePermission,
} from './employee.model.parsers';

export interface EmployeeModelData {
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
  permissions?: EmployeePermission[];
  scopeLabels?: string[];
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  history?: EmployeeHistoryEntry[];
  educationClassificationSubjectIds?: number[];
}

export const mapEmployeeData = (json: unknown): EmployeeModelData => {
  const root = asRecord(json);
  if (Object.keys(root).length === 0) {
    throw new Error('Cannot create EmployeeModel from null or undefined');
  }

  const nestedEmployee = asRecord(root.employee);
  const record = Object.keys(nestedEmployee).length > 0 ? { ...root, ...nestedEmployee } : root;
  const rawSubjects = Array.isArray(record.subjects) ? record.subjects : [];
  const subjects = mapSubjects(rawSubjects);
  const roles = mapRoles(record);
  const singleRole = asRecord(record.role);
  const roleId = roles[0]?.id ?? (Number(record.role_id ?? singleRole.id ?? 0) || undefined);
  const roleName = roles[0]?.title ?? firstText(record.role_name, singleRole.role_name);
  const rawEmployeeType = record.type ?? record.employee_type ?? record.employeeType;
  const audit = asRecord(record.record_information ?? record.audit);
  const historySource =
    record.history_logs ??
    record.history_log ??
    record.activity_logs ??
    record.activities ??
    record.logs ??
    record.history;

  return {
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
    employeeType: Number(rawEmployeeType ?? EmployeeTypeEnum.ADMIN) as EmployeeTypeEnum,
    hasEmployeeType: rawEmployeeType != null,
    roleId,
    roleName,
    roles:
      roles.length > 0 || !roleName
        ? roles
        : [new TitleInterface({ id: roleId ?? 0, title: roleName })],
    permissions: mapPermissions(record),
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
  };
};
