
import { EventData, RecurrenceSettings } from '../types';

/**
 * Formats a date string and time string into a format suitable for Google/ICS/Yahoo.
 * Note: We do NOT convert to UTC here because we want to preserve the "wall clock" 
 * time the user entered, and then tell the calendar service which timezone that clock belongs to.
 */
const formatCalendarDateTime = (date: string, time: string): string => {
  return `${date.replace(/-/g, '')}T${time.replace(/:/g, '')}00`;
};

const formatICSDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

/**
 * Calculates duration in HHmm format for Yahoo
 */
const calculateDuration = (event: EventData): string => {
  const start = new Date(`${event.startDate}T${event.startTime}`);
  const end = new Date(`${event.endDate}T${event.endTime}`);
  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${String(hours).padStart(2, '0')}${String(mins).padStart(2, '0')}`;
};

const buildRRule = (settings: RecurrenceSettings): string => {
  const parts = [`FREQ=${settings.frequency}`];
  if (settings.interval > 1) parts.push(`INTERVAL=${settings.interval}`);
  if (settings.frequency === 'WEEKLY' && settings.weekDays.length > 0) {
    parts.push(`BYDAY=${settings.weekDays.join(',')}`);
  }
  if (settings.ends === 'after' && settings.count) {
    parts.push(`COUNT=${settings.count}`);
  } else if (settings.ends === 'on' && settings.endDate) {
    const untilDate = settings.endDate.replace(/-/g, '') + 'T235959Z';
    parts.push(`UNTIL=${untilDate}`);
  }
  return parts.join(';');
};

export const generateGoogleCalendarUrl = (event: EventData): string => {
  const start = formatCalendarDateTime(event.startDate, event.startTime);
  const end = formatCalendarDateTime(event.endDate, event.endTime);
  
  const params = [
    'action=TEMPLATE',
    `text=${encodeURIComponent(event.title)}`,
    `dates=${start}/${end}`,
    `details=${encodeURIComponent(event.description)}`,
    `location=${encodeURIComponent(event.location)}`,
    `ctz=${encodeURIComponent(event.timezone)}`
  ];

  if (event.recurrence) {
    params.push(`recur=${encodeURIComponent('RRULE:' + buildRRule(event.recurrence))}`);
  }

  return `https://calendar.google.com/calendar/render?${params.join('&')}`;
};

export const generateYahooCalendarUrl = (event: EventData): string => {
  const start = formatCalendarDateTime(event.startDate, event.startTime);
  const duration = calculateDuration(event);

  const params = [
    'v=60',
    'view=d',
    'type=20',
    `title=${encodeURIComponent(event.title)}`,
    `st=${start}`,
    `dur=${duration}`,
    `desc=${encodeURIComponent(event.description)}`,
    `in_loc=${encodeURIComponent(event.location)}`
  ];

  if (event.recurrence) {
    // Yahoo accepts the rrule parameter in the v=60 template
    params.push(`rrule=${encodeURIComponent(buildRRule(event.recurrence))}`);
  }

  return `https://calendar.yahoo.com/?${params.join('&')}`;
};

export const generateICSFile = (event: EventData): string => {
  const start = formatCalendarDateTime(event.startDate, event.startTime);
  const end = formatCalendarDateTime(event.endDate, event.endTime);
  const now = formatICSDate(new Date());

  let alarmTrigger = `-PT${event.reminderMinutes}M`;
  if (event.reminderMinutes >= 60 && event.reminderMinutes % 60 === 0) {
    alarmTrigger = `-PT${event.reminderMinutes / 60}H`;
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
    `DTSTART;TZID=${event.timezone}:${start}`,
    `DTEND;TZID=${event.timezone}:${end}`,
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

export const downloadICSFile = (event: EventData) => {
  const content = generateICSFile(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${(event.title || 'event').replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
