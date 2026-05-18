import { describe, it, expect } from 'vitest';
import EducationSubjectConfigurationModel from './education.subject.configuration.model';
describe('EducationSubjectConfigurationModel', () => {
  describe('constructor', () => {
    it('should create a valid model', () => {
      const model = new EducationSubjectConfigurationModel({
        educationClassification: { id: 1, title: 'Test' },
        numberOfBranches: 2,
        SingluarTitle: { en: 'Subject', ar: 'مادة' },
        pluralTitle: { en: 'Subjects', ar: 'مواد' },
        branches: [
          new EducationSubjectConfigurationModel.example.branches[0].constructor({
            id: 1,
            levelNumber: 1,
            singularTitle: { en: 'Part', ar: 'جزء' },
            pluralTitle: { en: 'Parts', ar: 'اجزاء' },
          }),
        ],
      });

      expect(model.educationClassification).toEqual({ id: 1, title: 'Test' });
      expect(model.numberOfBranches).toBe(2);
      expect(model.SingluarTitle.en).toBe('Subject');
      expect(model.branches).toHaveLength(1);
    });
  });

  describe('fromJson', () => {
    it('should parse API JSON correctly', () => {
      const json = {
        education_classification: { id: 2, title: 'Test' },
        number_of_branches: 2,
        singular_title: { en: 'Subject', ar: 'مادة' },
        plural_title: { en: 'Subjects', ar: 'مواد' },
        branches: [
          {
            id: 1,
            level_number: 1,
            singular_title: { en: 'Part', ar: 'جزء' },
            plural_title: { en: 'Parts', ar: 'اجزاء' },
          },
          {
            id: 2,
            level_number: 2,
            singular_title: { en: 'Unit', ar: 'وحدة' },
            plural_title: { en: 'Units', ar: 'وحدات' },
          },
        ],
      };

      const model = EducationSubjectConfigurationModel.fromJson(json);

      expect(model.educationClassification).toEqual({ id: 2, title: 'Test' });
      expect(model.numberOfBranches).toBe(2);
      expect(model.SingluarTitle).toEqual({ en: 'Subject', ar: 'مادة' });
      expect(model.pluralTitle).toEqual({ en: 'Subjects', ar: 'مواد' });
      expect(model.branches).toHaveLength(2);
      expect(model.branches[0].levelNumber).toBe(1);
    });

    it('should default locale fields to empty objects when missing', () => {
      const json = {
        education_classification: { id: 1, title: 'Test' },
        number_of_branches: 0,
      };

      const model = EducationSubjectConfigurationModel.fromJson(json);

      expect(model.SingluarTitle).toEqual({});
      expect(model.pluralTitle).toEqual({});
      expect(model.branches).toEqual([]);
    });

    it('should throw when JSON is null', () => {
      expect(() => EducationSubjectConfigurationModel.fromJson(null)).toThrow(
        'Cannot create EducationSubjectConfigurationModel from null or undefined',
      );
    });
  });

  describe('example', () => {
    it('should be a valid instance with 2 branches', () => {
      const ex = EducationSubjectConfigurationModel.example;

      expect(ex).toBeInstanceOf(EducationSubjectConfigurationModel);
      expect(ex.numberOfBranches).toBe(2);
      expect(ex.branches).toHaveLength(2);
      expect(ex.SingluarTitle.en).toBe('title 1 ');
    });
  });

  describe('immutability', () => {
    it('should be frozen', () => {
      const model = new EducationSubjectConfigurationModel({
        educationClassification: { id: 1, title: 'X' },
        numberOfBranches: 0,
        SingluarTitle: { en: 'X', ar: 'X' },
        pluralTitle: { en: 'Xs', ar: 'Xs' },
        branches: [],
      });

      expect(Object.isFrozen(model)).toBe(true);
    });
  });
});
