import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import SubjectRepository from '../subject.repository';
import SubjectApiService from '../../api/subject.api-service';
import IndexSubjectParams from '../../../core/params/index.subject.params';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

describe('SubjectRepository', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // Reset singleton between tests
    (SubjectRepository as any).instance = undefined;
  });

  it('should be defined', () => {
    expect(SubjectRepository).toBeDefined();
  });

  it('getInstance returns an instance of SubjectRepository', () => {
    const repo = SubjectRepository.getInstance();
    expect(repo).toBeInstanceOf(SubjectRepository);
  });

  it('getInstance returns the same singleton on repeated calls', () => {
    const a = SubjectRepository.getInstance();
    const b = SubjectRepository.getInstance();
    expect(a).toBe(b);
  });

  it('parses both paginated and unpaginated subject lists', () => {
    const repository = SubjectRepository.getInstance() as unknown as {
      parseList: (data: unknown) => { id?: number }[];
    };
    const subjects = [{ id: 1, title: 'Subject', children: [] }];

    expect(repository.parseList(subjects)).toMatchObject([{ id: 1 }]);
    expect(repository.parseList({ data: subjects })).toMatchObject([{ id: 1 }]);
  });

  it('preserves pagination metadata from the subjects endpoint', async () => {
    vi.spyOn(SubjectApiService, 'getInstance').mockReturnValue({
      indexSubjects: vi.fn().mockResolvedValue({
        statusCode: 200,
        data: {
          status: true,
          data: {
            data: [{ id: 11, title: 'Subject 11', children: [] }],
            meta: {
              from: 11,
              to: 11,
              per_page: 10,
              current_page: 2,
              last_page: 3,
              total: 21,
            },
          },
        },
      }),
    } as unknown as ReturnType<typeof SubjectApiService.getInstance>);

    const result = await SubjectRepository.getInstance().indexSubjects(
      new IndexSubjectParams('', 2, 10, 1),
    );

    expect(result).toBeInstanceOf(DataSuccess);
    expect(result.data).toMatchObject([{ id: 11 }]);
    expect(result.pagination?.toJSON()).toMatchObject({
      currentPage: 2,
      lastPage: 3,
      perPage: 10,
      total: 21,
    });
  });
});
