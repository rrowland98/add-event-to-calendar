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

// Helper to safely get local timezone
const getLocalTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    return 'UTC';
  }
};

export const INITIAL_EVENT_DATA: EventData = {
  title: 'Strategy Workshop: Q4 Planning',
  startDate: new Date().toISOString().split('T')[0],
  startTime: '09:00',
  endDate: new Date().toISOString().split('T')[0],
  endTime: '10:00',
  timezone: getLocalTimezone(),
  location: 'https://zoom.us/j/123456789',
  description: 'Join us for a deep dive into our Q4 strategy. We will cover marketing goals, product roadmap, and team allocation.\n\nPlease come prepared with your department reports.',
  reminderMinutes: 30,
  imageUrl: null,
};