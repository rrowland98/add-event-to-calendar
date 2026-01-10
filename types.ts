
export interface EventData {
  title: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endDate: string;   // YYYY-MM-DD
  endTime: string;   // HH:mm
  timezone: string;
  location: string;
  description: string;
  reminderMinutes: number;
  imageUrl: string | null;
  recurrence: RecurrenceSettings | null;
}

// Global default image for all events (can be a company logo or generic pattern)
export const DEFAULT_IMAGE_URL = 'https://i.postimg.cc/WzvQY4mR/Add-To-My-Calendar.png';

// Interface for local storage history
export interface SavedEvent {
  id: string;
  createdAt: number;
  data: EventData;
  link: string;
}

export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface RecurrenceSettings {
  frequency: RecurrenceFrequency;
  interval: number;
  ends: 'never' | 'on' | 'after';
  endDate: string | null; // YYYY-MM-DD
  count: number | null;
  weekDays: string[]; // SU, MO, TU, WE, TH, FR, SA
}

export const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Universal Coordinated Time)' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'Europe/London', label: 'London, Edinburgh' },
  { value: 'Europe/Paris', label: 'Paris, Berlin, Rome' },
  { value: 'Asia/Dubai', label: 'Dubai, Abu Dhabi' },
  { value: 'Asia/Singapore', label: 'Singapore' },
  { value: 'Asia/Tokyo', label: 'Tokyo, Osaka' },
  { value: 'Australia/Sydney', label: 'Sydney, Melbourne' },
];

export const REMINDERS = [
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '24 hours before' },
];

export const WEEK_DAYS = [
  { value: 'MO', label: 'M' },
  { value: 'TU', label: 'T' },
  { value: 'WE', label: 'W' },
  { value: 'TH', label: 'T' },
  { value: 'FR', label: 'F' },
  { value: 'SA', label: 'S' },
  { value: 'SU', label: 'S' },
];

// Helper to safely get local timezone
const getLocalTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    return 'UTC';
  }
};

export const INITIAL_EVENT_DATA: EventData = {
  title: '',
  startDate: new Date().toISOString().split('T')[0],
  startTime: '09:00',
  endDate: new Date().toISOString().split('T')[0],
  endTime: '10:00',
  timezone: getLocalTimezone(),
  location: '',
  description: '',
  reminderMinutes: 30,
  imageUrl: null, // Starts as null to use global default
  recurrence: null,
};
