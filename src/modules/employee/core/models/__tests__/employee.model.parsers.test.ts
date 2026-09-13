import { describe, expect, it } from 'vitest';
import EmployeeModel from '../employee.model';

describe('EmployeeModel relationship parsing', () => {
  it('normalizes roles, permissions, scope labels and wrapped history', () => {
    const employee = EmployeeModel.fromJson({
      id: 7,
      first_name: 'Nour',
      email: 'nour@example.com',
      phone: '01100000000',
      image: '',
      status: 1,
      roles: [
        {
          role_id: 3,
          display_name: 'Reviewer',
          permissions: [
            { code: 'EMP01', name: 'View employees' },
            { code: 'EMP01', name: 'View employees' },
          ],
        },
      ],
      teacher_scope: {
        education_type: { title: 'National' },
        stage: { name: 'Primary' },
        subject: 'Arabic',
      },
      history_logs: {
        items: [
          {
            id: 5,
            event_name: 'employee_updated',
            actor: { display_name: 'Admin User' },
            timestamp: '2026-09-13T12:00:00Z',
          },
        ],
      },
    });

    expect(employee.roles).toMatchObject([{ id: 3, title: 'Reviewer' }]);
    expect(employee.permissions).toEqual([{ code: 'EMP01', title: 'View employees' }]);
    expect(employee.scopeLabels).toEqual(['National', 'Primary', 'Arabic']);
    expect(employee.history).toMatchObject([
      {
        id: '5',
        action: 'employee_updated',
        actor: 'Admin User',
        occurredAt: '2026-09-13T12:00:00Z',
      },
    ]);
  });
});
