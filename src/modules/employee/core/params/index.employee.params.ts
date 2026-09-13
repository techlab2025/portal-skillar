import IndexParams from '@/base/Core/Params/indexParams';
import type { EmployeeStatusEnm } from '../constant/employee.status.enum';
import type { EmployeeTypeEnum } from '../constant/employee.type.enum';

export default class IndexEmployeeParams extends IndexParams {
  public status?: EmployeeStatusEnm | EmployeeStatusEnm[] | null;
  public employeeType?: EmployeeTypeEnum | null;
  public roleId?: number | null;
  public subjectId?: number | null;

  constructor(data: {
    word: string;
    pageNumber: number;
    perPage: number;
    withPage: number;
    status?: EmployeeStatusEnm | EmployeeStatusEnm[] | null;
    employeeType?: EmployeeTypeEnum | null;
    roleId?: number | null;
    subjectId?: number | null;
  }) {
    super(data.word, data.pageNumber, data.perPage, data.withPage);
    this.status = data.status;
    this.employeeType = data.employeeType;
    this.roleId = data.roleId;
    this.subjectId = data.subjectId;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const map = super.toMap();
    if (this.status != null && (!Array.isArray(this.status) || this.status.length > 0)) {
      map['status'] = this.status;
    }
    if (this.employeeType != null) map['type'] = this.employeeType;
    if (this.roleId != null) map['role_id'] = this.roleId;
    if (this.subjectId != null) map['e_c_subject_id'] = this.subjectId;
    map['order_dir'] = 1;
    return map;
  }
}
