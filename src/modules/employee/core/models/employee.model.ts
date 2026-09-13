import TitleInterface from '@/base/Data/Models/titleInterface';
import { EmployeeTypeEnum } from '../constant/employee.type.enum';
import { GenderENum } from '../constant/gender.enum';
import { mapEmployeeData, type EmployeeModelData } from './employee.model.mapper';
import type { EmployeeHistoryEntry, EmployeePermission } from './employee.model.parsers';

export type { EmployeeHistoryEntry, EmployeePermission } from './employee.model.parsers';

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
  public readonly hasEmployeeType: boolean;
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
    this.hasEmployeeType = data.hasEmployeeType ?? data.employeeType != null;
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
    return new EmployeeModel(mapEmployeeData(json));
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
