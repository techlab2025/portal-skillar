import { describe, expect, it } from 'vitest';
import { EmployeeStatusEnm } from '../../constant/employee.status.enum';
import { EmployeeTypeEnum } from '../../constant/employee.type.enum';
import { GenderENum } from '../../constant/gender.enum';
import AddEmployeeParams from '../add.employee.params';

describe('AddEmployeeParams', () => {
  it('maps employee type, roles, and teacher subject ids to the API payload', () => {
    const params = new AddEmployeeParams({
      firstname: 'Mona',
      lastname: 'Ali',
      email: 'mona@example.com',
      phone: '01000000000',
      image: '',
      EmployeeRef: 'EMP-1',
      gender: GenderENum.female,
      employeeStatus: EmployeeStatusEnm.active,
      password: 'secret',
      employeeType: EmployeeTypeEnum.TEACHER,
      roleIds: [4, 5],
      educationClassificationSubjectIds: [10, 12],
    });

    expect(params.toMap()).toMatchObject({
      type: EmployeeTypeEnum.TEACHER,
      role_id: 4,
      role_ids: [4, 5],
      e_c_subject_ids: [10, 12],
    });
  });
});
