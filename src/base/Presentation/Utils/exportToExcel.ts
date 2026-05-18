export interface ExportColumn {
  key: string;
  label: string;
}

export async function exportToExcel(
  data: Record<string, unknown>[] | unknown[],
  columns: ExportColumn[],
  filename: string,
  sheetName: string = 'Sheet1',
): Promise<void> {
  if (!data || data.length === 0) {
    return;
  }

  const [XLSX, { saveAs }] = await Promise.all([import('xlsx'), import('file-saver')]);

  const worksheetData = data.map((item) => {
    const record = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
    const row: Record<string, unknown> = {};
    columns.forEach((col) => {
      const value = record[col.key];
      row[col.label] = value ?? '';
    });
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `${filename}.xlsx`);
}
