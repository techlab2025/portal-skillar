import { describe, expect, it } from 'vitest';
import { EmployeeStatusEnm } from '../../constant/employee.status.enum';
import { EmployeeTypeEnum } from '../../constant/employee.type.enum';
import IndexEmployeeParams from '../index.employee.params';

describe('IndexEmployeeParams', () => {
  it('maps every employee filter to the employees endpoint contract', () => {
    const params = new IndexEmployeeParams({
      word: 'sara',
      pageNumber: 2,
      perPage: 20,
      withPage: 1,
      status: [EmployeeStatusEnm.active, EmployeeStatusEnm.draft],
      employeeType: EmployeeTypeEnum.TEACHER,
      roleId: 7,
      subjectId: 42,
    });

    expect(params.toMap()).toEqual({
      word: 'sara',
      with_pagination: 1,
      page: 2,
      per_page: 20,
      status: [EmployeeStatusEnm.active, EmployeeStatusEnm.draft],
      type: EmployeeTypeEnum.TEACHER,
      role_id: 7,
      e_c_subject_id: 42,
      order_dir: 1,
    });
  });

  it('omits filters that have not been selected', () => {
    const params = new IndexEmployeeParams({
      word: '',
      pageNumber: 1,
      perPage: 10,
      withPage: 1,
      status: [],
    });

    expect(params.toMap()).toEqual({
      with_pagination: 1,
      page: 1,
      per_page: 10,
      order_dir: 1,
    });
  });
});
