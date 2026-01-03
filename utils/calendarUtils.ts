import { EventData } from '../types';

/**
 * Helper to convert date/time strings into a UTC Date object relative to the selected timezone.
 * Note: A full implementation would use a library like `date-fns-tz`. 
 * For this demo, we assume the user's browser context or simple ISO conversion 
 * suffices for the "universal" logic, or we construct generic UTC strings.
 */
const toDateObj = (date: string, time: string): Date => {
  return new Date(`${date}T${time}:00`);
};

const formatICSDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

/**
 * Constructs a Google Calendar URL
 */
export const generateGoogleLink = (event: EventData): string => {
  const start = formatICSDate(toDateObj(event.startDate, event.startTime));
  const end = formatICSDate(toDateObj(event.endDate, event.endTime));
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description,
    location: event.location,
    ctz: event.timezone, 
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Constructs an Outlook.com (Live) URL
 */
export const generateOutlookLink = (event: EventData): string => {
  const start = toDateObj(event.startDate, event.startTime).toISOString();
  const end = toDateObj(event.endDate, event.endTime).toISOString();

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    startdt: start,
    enddt: end,
    subject: event.title,
    body: event.description,
    location: event.location,
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

/**
 * Constructs a Yahoo Calendar URL
 */
export const generateYahooLink = (event: EventData): string => {
  const start = formatICSDate(toDateObj(event.startDate, event.startTime));
  const end = formatICSDate(toDateObj(event.endDate, event.endTime));

  const params = new URLSearchParams({
    v: '60',
    view: 'd',
    type: '20',
    title: event.title,
    st: start,
    et: end,
    desc: event.description,
    in_loc: event.location,
  });

  return `https://calendar.yahoo.com/?${params.toString()}`;
};

/**
 * Generates ICS file content
 */
export const generateICSFile = (event: EventData): string => {
  const start = formatICSDate(toDateObj(event.startDate, event.startTime));
  const end = formatICSDate(toDateObj(event.endDate, event.endTime));
  const now = formatICSDate(new Date());

  // Calculate VALARM Trigger
  // Format: -PT15M, -PT1H, etc.
  let alarmTrigger = '-PT15M';
  if (event.reminderMinutes % 60 === 0) {
    alarmTrigger = `-PT${event.reminderMinutes / 60}H`;
  } else {
    alarmTrigger = `-PT${event.reminderMinutes}M`;
  }

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Universal Event Link Generator//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${now}-${Math.random().toString(36).substring(2, 9)}@universal-link-gen.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeICS(event.title)}`,
    `DESCRIPTION:${escapeICS(event.description)}`,
    `LOCATION:${escapeICS(event.location)}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    `TRIGGER:${alarmTrigger}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  return icsLines.join('\r\n');
};

const escapeICS = (str: string): string => {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
};

export const downloadICS = (event: EventData) => {
  const content = generateICSFile(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};