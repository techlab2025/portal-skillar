import TitleInterface from '@/base/Data/Models/titleInterface';

export type JsonRecord = Record<string, unknown>;

export interface EmployeePermission {
  code: string;
  title: string;
}

export interface EmployeeHistoryEntry {
  id: string;
  action: string;
  actor: string;
  occurredAt: string;
  date: string;
  time: string;
}

export const asRecord = (value: unknown): JsonRecord =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : {};

export const firstText = (...values: unknown[]): string => {
  const value = values.find((item) => typeof item === 'string' && item.trim().length > 0);
  return typeof value === 'string' ? value.trim() : '';
};

export const displayName = (value: unknown): string => {
  if (typeof value === 'string') return value.trim();

  const record = asRecord(value);
  const fullName = firstText(record.name, record.full_name, record.display_name, record.title);
  if (fullName) return fullName;

  return [firstText(record.first_name), firstText(record.last_name)].filter(Boolean).join(' ');
};

export const toBoolean = (value: unknown): boolean =>
  value === true || value === 1 || value === '1';

const uniqueStrings = (values: string[]): string[] =>
  values.filter((value, index) => value.length > 0 && values.indexOf(value) === index);

const splitScopeLabel = (value: string): string[] =>
  value
    .split(/\s*(?:->|→|›|\/)\s*/u)
    .map((part) => part.trim())
    .filter(Boolean);

const mapSubject = (value: unknown): TitleInterface<number> | null => {
  const subject = asRecord(value);
  const id = Number(subject.e_c_subject_id ?? subject.id ?? 0);
  if (!id) return null;

  return new TitleInterface<number>({
    id,
    title: firstText(
      subject.title,
      subject.name,
      subject.full_title,
      subject.fullTitle,
      String(id),
    ),
  });
};

export const mapSubjects = (values: unknown[]): TitleInterface<number>[] =>
  values.map(mapSubject).filter((subject): subject is TitleInterface<number> => subject !== null);

const mapRole = (value: unknown, index: number): TitleInterface<number> | null => {
  const role = asRecord(value);
  const title = firstText(role.role_name, role.display_name, role.name, role.title);
  if (!title) return null;

  return new TitleInterface<number>({
    id: Number(role.id ?? role.role_id ?? index + 1),
    title,
  });
};

export const mapRoles = (record: JsonRecord): TitleInterface<number>[] => {
  const singleRole = asRecord(record.role);
  const rawRoles = Array.isArray(record.roles)
    ? record.roles
    : Object.keys(singleRole).length > 0
      ? [singleRole]
      : [];

  return rawRoles.map(mapRole).filter((role): role is TitleInterface<number> => role !== null);
};

const mapPermission = (value: unknown): EmployeePermission | null => {
  if (typeof value === 'string') {
    const code = value.trim();
    return code ? { code, title: code } : null;
  }

  const permission = asRecord(value);
  const code = firstText(
    permission.permission,
    permission.code,
    permission.permission_code,
    permission.key,
  );
  const title = firstText(
    permission.display_name,
    permission.permission_name,
    permission.title,
    permission.name,
    permission.label,
  );
  if (!code && !title) return null;

  return { code: code || title, title: title || code };
};

export const mapPermissions = (record: JsonRecord): EmployeePermission[] => {
  const rawRoles = Array.isArray(record.roles) ? record.roles : [record.role];
  const rolePermissions = rawRoles.flatMap((role) => {
    const roleRecord = asRecord(role);
    return Array.isArray(roleRecord.permissions) ? roleRecord.permissions : [];
  });
  const rawPermissions = Array.isArray(record.effective_permissions)
    ? record.effective_permissions
    : Array.isArray(record.permissions)
      ? record.permissions
      : rolePermissions;

  return rawPermissions
    .map(mapPermission)
    .filter((permission): permission is EmployeePermission => permission !== null)
    .filter(
      (permission, index, values) =>
        values.findIndex((item) => item.code === permission.code) === index,
    );
};

export const mapHistory = (value: unknown): EmployeeHistoryEntry[] => {
  const historyContainer = asRecord(value);
  const entries = Array.isArray(value)
    ? value
    : Array.isArray(historyContainer.data)
      ? historyContainer.data
      : Array.isArray(historyContainer.items)
        ? historyContainer.items
        : [];

  return entries.map((entry, index) => {
    const history = asRecord(entry);
    const occurredAt = firstText(
      history.occurred_at,
      history.created_at,
      history.updated_at,
      history.timestamp,
    );

    return {
      id: String(history.id ?? `${occurredAt}-${index}`),
      action: firstText(
        history.action_title,
        history.action,
        history.event_name,
        history.event,
        history.title,
        history.description,
      ),
      actor: displayName(
        history.performed_by ??
          history.created_by ??
          history.updated_by ??
          history.admin ??
          history.user ??
          history.actor ??
          history.by,
      ),
      occurredAt,
      date: firstText(history.date),
      time: firstText(history.time),
    };
  });
};

export const mapScopeLabels = (record: JsonRecord, rawSubjects: unknown[]): string[] => {
  const rawScope =
    record.teacher_scope ?? record.education_scope ?? record.curriculum_scope ?? record.scope;
  const scopeRecord = asRecord(rawScope);
  const orderedScopeValues = [
    scopeRecord.education_type,
    scopeRecord.educationType,
    scopeRecord.education_classification,
    scopeRecord.educationClassification,
    scopeRecord.stage,
    scopeRecord.grade,
    scopeRecord.subject,
  ];
  const rawScopeItems = Array.isArray(rawScope)
    ? rawScope
    : orderedScopeValues.some((value) => value != null)
      ? orderedScopeValues
      : [];
  const scopeLabels = rawScopeItems.flatMap((item) => splitScopeLabel(displayName(item)));

  if (scopeLabels.length > 0) return uniqueStrings(scopeLabels);

  const fullScopePaths = rawSubjects
    .map((subject) => {
      const subjectRecord = asRecord(subject);
      return firstText(subjectRecord.full_title, subjectRecord.fullTitle);
    })
    .filter(Boolean);
  const fallbackSubjectTitles = rawSubjects.map((subject) => {
    const subjectRecord = asRecord(subject);
    return firstText(subjectRecord.title, subjectRecord.name);
  });

  return uniqueStrings(
    (fullScopePaths.length > 0 ? fullScopePaths : fallbackSubjectTitles).flatMap(splitScopeLabel),
  );
};
