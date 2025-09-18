// Utility functions for generating ICS calendar files

export interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  uid?: string;
}

const formatDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

const escapeText = (text: string): string => {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
};

export const generateICS = (event: CalendarEvent): string => {
  const uid = event.uid || `${Date.now()}@app.com`;
  const startDate = formatDate(event.startDate);
  const endDate = event.endDate ? formatDate(event.endDate) : formatDate(new Date(event.startDate.getTime() + 60 * 60 * 1000)); // 1 hour default
  const now = formatDate(new Date());

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Your App//Your App//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `DTSTAMP:${now}`,
    `SUMMARY:${escapeText(event.title)}`,
  ];

  if (event.description) {
    icsContent.push(`DESCRIPTION:${escapeText(event.description)}`);
  }

  if (event.location) {
    icsContent.push(`LOCATION:${escapeText(event.location)}`);
  }

  icsContent.push(
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'END:VCALENDAR'
  );

  return icsContent.join('\r\n');
};

export const downloadICS = (event: CalendarEvent, filename?: string): void => {
  const icsContent = generateICS(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};