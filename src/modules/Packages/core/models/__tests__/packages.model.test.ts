import { describe, it, expect } from 'vitest';
import PackageModel from '../packages.model';

describe('PackageModel', () => {
  const mockJson = {
    id: 1,
    package_name: 'Basic Plan',
    education_type: 'secondary',
    type: 'free',
    contant: 10,
    price: 0,
    status: 'active',
    created_by: 'Admin',
  };

  it('should create an instance correctly from constructor', () => {
    const model = new PackageModel({
      id: 1,
      packageName: 'Premium Plan',
      educationType: 'university',
      type: 'paid',
      contant: 20,
      price: 99,
      status: 'active',
      createdBy: 'Admin',
    });
    expect(model.packageName).toBe('Premium Plan');
    expect(model.price).toBe(99);
  });

  it('should create an instance correctly from fromJson', () => {
    const model = PackageModel.fromJson(mockJson);
    expect(model.id).toBe(1);
    expect(model.packageName).toBe('Basic Plan');
    expect(model.educationType).toBe('secondary');
    expect(model.type).toBe('free');
    expect(model.price).toBe(0);
  });

  it('should throw error if json is null in fromJson', () => {
    expect(() => PackageModel.fromJson(null)).toThrow();
  });

  it('should have a valid example', () => {
    expect(PackageModel.example).toBeInstanceOf(PackageModel);
    expect(PackageModel.example.packageName).toBeTruthy();
  });
});
