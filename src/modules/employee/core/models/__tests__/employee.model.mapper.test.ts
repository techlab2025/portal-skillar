import { describe, expect, it } from 'vitest';
import EmployeeModel from '../employee.model';

describe('EmployeeModel response mapping', () => {
  it('maps a nested employee response while retaining root audit information', () => {
    const employee = EmployeeModel.fromJson({
      audit: {
        created_by: { first_name: 'Mona', last_name: 'Ali' },
        created_at: '2026-09-13 10:00:00',
      },
      employee: {
        employee_id: 42,
        first_name: 'Omar',
        last_name: 'Hassan',
        email: 'omar@example.com',
        phone: '01000000000',
        image: null,
        status: 1,
      },
    });

    expect(employee).toMatchObject({
      id: 42,
      name: 'Omar Hassan',
      createdBy: 'Mona Ali',
      createdAt: '2026-09-13 10:00:00',
      hasEmployeeType: false,
    });
  });
});
