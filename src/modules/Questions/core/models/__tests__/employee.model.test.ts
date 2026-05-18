import { describe, it, expect } from 'vitest';
import questionsModel from '../questions.model';
import { GenderENum } from '../../constant/gender.enum';

describe('questionsModel', () => {
  const mockJson = {
    id: 1,
    first_name: 'Jane',
    last_name: 'Doe',
    email: 'jane@example.com',
    phone: '987654321',
    isSuperadmin: 1,
    employee_id: 'EMP-001',
    status: 1,
    subjects: 'Science',
    image: 'img.jpg',
    gender: GenderENum.male,
  };

  it('should create an instance correctly from constructor', () => {
    const data = {
      id: 1,
      firstname: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      phone: '123456789',
      image: 'img.jpg',
      isSuperadmin: false,
      status: 1,
      subjects: 'Math',
      gender: GenderENum.male,
    };
    const model = new questionsModel(data);

    expect(model.firstname).toBe('John');
    expect(model.lastname).toBe('Doe');
    expect(model.isSuperadmin).toBe(false);
  });

  it('should create an instance correctly from fromJson', () => {
    const model = questionsModel.fromJson(mockJson);

    expect(model.id).toBe(1);
    expect(model.firstname).toBe('Jane');
    expect(model.isSuperadmin).toBe(true);
    expect(model.status).toBe(1);
  });

  it('should throw error if json is null in fromJson', () => {
    expect(() => questionsModel.fromJson(null)).toThrow();
  });

  it('should have a valid example', () => {
    expect(questionsModel.example).toBeInstanceOf(questionsModel);
    expect(questionsModel.example.firstname).toBe('John ');
    expect(questionsModel.example.lastname).toBe('Doe');
  });

  it('should compute name getter from firstname and lastname', () => {
    const model = new questionsModel({
      firstname: 'Alice',
      lastname: 'Smith',
      email: 'alice@example.com',
      phone: '111',
      image: '',
      isSuperadmin: false,
      status: 1,
      subjects: 'Math',
    });
    expect(model.name).toBe('Alice Smith');
  });

  it('should be frozen after construction', () => {
    const model = new questionsModel({
      id: 1,
      firstname: 'A',
      lastname: 'B',
      email: 'a@b.com',
      phone: '123',
      image: '',
      isSuperadmin: false,
      status: 1,
      subjects: '',
    });
    expect(Object.isFrozen(model)).toBe(true);
  });
});
