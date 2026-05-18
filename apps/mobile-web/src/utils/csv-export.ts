/**
 * CSV export — pure browser, no library needed.
 */
export const exportToCsv = <T extends Record<string, unknown>>(
  rows: T[],
  filename: string,
  columns?: (keyof T)[]
): void => {
  if (!rows.length) return;
  const cols = columns || (Object.keys(rows[0]) as (keyof T)[]);
  const escape = (v: unknown) => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return /[,"\n]/.test(s) ? `"${s}"` : s;
  };
  const header = cols.map((c) => escape(c)).join(',');
  const body   = rows.map((r) => cols.map((c) => escape(r[c])).join(',')).join('\n');
  const csv    = `${header}\n${body}`;

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
};
