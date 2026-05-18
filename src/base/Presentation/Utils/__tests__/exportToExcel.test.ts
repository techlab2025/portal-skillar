import { describe, it, expect, vi } from 'vitest';
import { exportToExcel, type ExportColumn } from '../exportToExcel';

vi.mock('xlsx', () => ({
  utils: {
    json_to_sheet: vi.fn(() => ({ '!ref': 'A1:C1' })),
    book_new: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
    decode_range: vi.fn(() => ({ s: { c: 0, r: 0 }, e: { c: 2, r: 0 } })),
  },
  write: vi.fn(() => new ArrayBuffer(8)),
}));

vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

describe('exportToExcel', () => {
  const columns: ExportColumn[] = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
  ];

  const data = [
    { name: 'Alice', email: 'alice@example.com' },
    { name: 'Bob', email: 'bob@example.com' },
  ];

  it('calls saveAs when data is provided', async () => {
    const { saveAs } = await import('file-saver');
    vi.clearAllMocks();
    exportToExcel(data, columns, 'TestExport');
    expect(saveAs).toHaveBeenCalled();
  });

  it('does nothing when data is empty', async () => {
    const { saveAs } = await import('file-saver');
    vi.clearAllMocks();
    exportToExcel([], columns, 'Empty');
    expect(saveAs).not.toHaveBeenCalled();
  });

  it('does nothing when data is null', async () => {
    const { saveAs } = await import('file-saver');
    vi.clearAllMocks();
    exportToExcel(null as any, columns, 'Null');
    expect(saveAs).not.toHaveBeenCalled();
  });

  it('maps data columns according to ExportColumn config', async () => {
    const XLSX = await import('xlsx');
    vi.clearAllMocks();
    exportToExcel(data, columns, 'Mapped');
    const callArgs = vi.mocked(XLSX.utils.json_to_sheet).mock.calls[0][0];
    expect(callArgs[0]).toHaveProperty('Name');
    expect(callArgs[0]).toHaveProperty('Email');
  });
});
