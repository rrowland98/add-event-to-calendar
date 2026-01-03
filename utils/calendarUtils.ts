import { EventData, RecurrenceSettings } from '../types';

/**
 * Helper to convert date/time strings into a UTC Date object relative to the selected timezone.
 */
const toDateObj = (date: string, time: string): Date => {
  return new Date(`${date}T${time}:00`);
};

const formatICSDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

/**
 * Builds the RFC 5545 RRULE string
 */
const buildRRule = (settings: RecurrenceSettings): string => {
  const parts = [`FREQ=${settings.frequency}`];
  
  if (settings.interval > 1) {
    parts.push(`INTERVAL=${settings.interval}`);
  }

  if (settings.frequency === 'WEEKLY' && settings.weekDays.length > 0) {
    parts.push(`BYDAY=${settings.weekDays.join(',')}`);
  }

  if (settings.ends === 'after' && settings.count) {
    parts.push(`COUNT=${settings.count}`);
  } else if (settings.ends === 'on' && settings.endDate) {
    // UNTIL must be in UTC YYYYMMDDTHHMMSSZ format
    // We'll set it to end of that day
    const untilDate = new Date(`${settings.endDate}T23:59:59`);
    parts.push(`UNTIL=${formatICSDate(untilDate)}`);
  }

  return parts.join(';');
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

  if (event.recurrence) {
    const rrule = buildRRule(event.recurrence);
    params.append('recur', `RRULE:${rrule}`);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Constructs an Outlook.com (Live) URL
 * Note: Outlook Web Link (compose) has limited support for Recurrence via URL params.
 * Users should rely on ICS for complex recurrence.
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

  // Yahoo supports DUR (duration) and REPEAT, but it's very brittle via URL.
  // We strictly output single event for Yahoo web link to avoid errors.

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
    'SEQUENCE:0'
  ];

  if (event.recurrence) {
    icsLines.push(`RRULE:${buildRRule(event.recurrence)}`);
  }

  icsLines.push(
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    `TRIGGER:${alarmTrigger}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  );

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