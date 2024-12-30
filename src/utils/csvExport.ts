import { saveAs } from 'file-saver';

interface ChangeRecord {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  impact: string;
  requestedBy: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  plannedStart?: string | null;
  plannedEnd?: string | null;
}

const formatDate = (date: string | null | undefined): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

const escapeCSV = (str: string): string => {
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
};

export const exportToCSV = (data: ChangeRecord[], filename: string) => {
  // Define CSV headers
  const headers = [
    'Title',
    'Description',
    'Status',
    'Priority',
    'Type',
    'Impact',
    'Requested By',
    'Requester Email',
    'Created Date',
    'Last Updated',
    'Planned Start',
    'Planned End'
  ];

  // Convert data to CSV rows
  const rows = data.map(record => [
    escapeCSV(record.title),
    escapeCSV(record.description),
    record.status,
    record.priority,
    record.type,
    record.impact,
    escapeCSV(record.requestedBy.name),
    record.requestedBy.email,
    formatDate(record.createdAt),
    formatDate(record.updatedAt),
    formatDate(record.plannedStart),
    formatDate(record.plannedEnd)
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Add BOM for Excel compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
};
