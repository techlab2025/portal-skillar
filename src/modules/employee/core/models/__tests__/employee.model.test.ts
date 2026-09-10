import { describe, it, expect } from 'vitest';
import EmployeeModel from '../employee.model';
import { EmployeeTypeEnum } from '../../constant/employee.type.enum';

describe('EmployeeModel', () => {
  const mockJson = {
    id: 1,
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '987654321',
    isSuperadmin: 1,
    role_id: 2,
    status: 1,
    subjects: [],
    image: 'img.jpg',
  };

  it('should create an instance correctly from constructor', () => {
    const data = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123456789',
      image: 'img.jpg',
      isSuperadmin: false,
      role_id: 1,
      status: 1,
      subjects: [],
    };
    const model = new EmployeeModel(data);

    expect(model.name).toBe('John Doe');
    expect(model.isSuperadmin).toBe(false);
  });

  it('should create an instance correctly from fromJson', () => {
    const model = EmployeeModel.fromJson(mockJson);

    expect(model.id).toBe(1);
    expect(model.name).toBe('Jane Doe');
    expect(model.isSuperadmin).toBe(true);
    expect(model.status).toBe(1);
    expect(model.roleId).toBe(2);
  });

  it('should throw error if json is null in fromJson', () => {
    expect(() => EmployeeModel.fromJson(null)).toThrow();
  });

  it('should have a valid example', () => {
    expect(EmployeeModel.example).toBeInstanceOf(EmployeeModel);
    expect(EmployeeModel.example.name).toBe('John Doe');
  });

  it('maps employee type and education classification subject ids', () => {
    const model = EmployeeModel.fromJson({
      ...mockJson,
      employee_type: EmployeeTypeEnum.TEACHER,
      subjects: [{ e_c_subject_id: 4 }, { id: 8 }],
    });

    expect(model.employeeType).toBe(EmployeeTypeEnum.TEACHER);
    expect(model.educationClassificationSubjectIds).toEqual([4, 8]);
  });

  it('maps the complete show_employee response for edit mode', () => {
    const model = EmployeeModel.fromJson({
      id: 30,
      employee_ref: '',
      name: '',
      first_name: 'Employee ID1',
      last_name: 'Employee ID2',
      image: null,
      gender: 1,
      status: 2,
      type: 2,
      role: {
        id: 4,
        role_name: 'Content Manager',
        permissions: [
          { permission: 'EMP01', display_name: 'View Employees' },
          { permission: 'EMP02', display_name: 'Edit Employees' },
        ],
      },
      subjects: [
        {
          id: 308,
          e_c_subject_id: 308,
          title: 'mostafaf 2.1',
          full_title: 'Governmental -> Primary -> First -> Arabic',
        },
        { id: 285, e_c_subject_id: 285, title: 'mostafa 3' },
      ],
      email: 'Employeeid@gmail.com',
      phone: '0101546452312',
      created_by: { name: 'Ibrahim El Refay' },
      created_at: '2026-05-20T10:30:00Z',
      updated_by: { first_name: 'Sara', last_name: 'Ahmed' },
      updated_at: '2026-08-25T16:10:00Z',
      history_logs: [
        {
          id: 10,
          action: 'profile_updated',
          performed_by: { name: 'Sara Ahmed' },
          created_at: '2026-10-06T17:15:00Z',
        },
      ],
    });

    expect(model).toMatchObject({
      id: 30,
      employeeId: '',
      firstname: 'Employee ID1',
      lastname: 'Employee ID2',
      image: '',
      gender: 1,
      status: 2,
      employeeType: EmployeeTypeEnum.TEACHER,
      roleId: 4,
      roleName: 'Content Manager',
      email: 'Employeeid@gmail.com',
      phone: '0101546452312',
      educationClassificationSubjectIds: [308, 285],
      createdBy: 'Ibrahim El Refay',
      updatedBy: 'Sara Ahmed',
    });
    expect(model.subjects).toMatchObject([
      { id: 308, title: 'mostafaf 2.1' },
      { id: 285, title: 'mostafa 3' },
    ]);
    expect(model.roles).toMatchObject([{ id: 4, title: 'Content Manager' }]);
    expect(model.permissions).toEqual([
      { code: 'EMP01', title: 'View Employees' },
      { code: 'EMP02', title: 'Edit Employees' },
    ]);
    expect(model.scopeLabels).toEqual(['Governmental', 'Primary', 'First', 'Arabic']);
    expect(model.history).toMatchObject([
      {
        id: '10',
        action: 'profile_updated',
        actor: 'Sara Ahmed',
        occurredAt: '2026-10-06T17:15:00Z',
      },
    ]);
  });

  it('maps the actual show_employee response used by the details page', () => {
    const response = {
      status: true,
      message: 'Employee retrieved successfully',
      data: {
        id: 61,
        employee_ref: '+1 (586) 959-5549',
        name: '',
        first_name: 'Naomi',
        last_name: 'Shelley',
        image: null,
        gender: 1,
        status: 1,
        role: { id: 16, display_name: 'aaaaaaaaaa' },
        permissions: ['DI01', 'DI04', 'DI06', 'DI07', 'DI08', 'DI09', 'DI10'],
        type: 1,
        subjects: [],
        email: 'tejolyp@mailinator.com',
        phone: '01141519222',
        token: '',
        created_at: '2026-09-10 12:09:07',
      },
    };

    const model = EmployeeModel.fromJson(response.data);

    expect(model).toMatchObject({
      id: 61,
      employeeId: '+1 (586) 959-5549',
      firstname: 'Naomi',
      lastname: 'Shelley',
      image: '',
      gender: 1,
      status: 1,
      employeeType: EmployeeTypeEnum.ADMIN,
      roleId: 16,
      roleName: 'aaaaaaaaaa',
      email: 'tejolyp@mailinator.com',
      phone: '01141519222',
      createdAt: '2026-09-10 12:09:07',
      createdBy: '',
      updatedBy: '',
      updatedAt: '',
      history: [],
      scopeLabels: [],
    });
    expect(model.name).toBe('Naomi Shelley');
    expect(model.roles).toMatchObject([{ id: 16, title: 'aaaaaaaaaa' }]);
    expect(model.permissions).toEqual(
      response.data.permissions.map((code) => ({ code, title: code })),
    );
  });
});
