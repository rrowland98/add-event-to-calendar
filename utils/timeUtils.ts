export const generateTimeOptions = (): string[] => {
  const times: string[] = [];
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 15) {
      const hour = i.toString().padStart(2, '0');
      const minute = j.toString().padStart(2, '0');
      times.push(`${hour}:${minute}`);
    }
  }
  return times;
};

export const formatTimeDisplay = (time24: string): string => {
  if (!time24) return '';
  const [hourStr, minuteStr] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12; // the hour '0' should be '12'
  return `${hour}:${minuteStr} ${ampm}`;
};

export const formatDateTimeForDisplay = (date: string, time: string, timezone: string): string => {
  if (!date || !time) return 'Select Date & Time';
  const d = new Date(`${date}T${time}`);
  
  // Basic formatting
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  };
  
  // Note: We are treating the input date/time as if it belongs to the selected timezone conceptually.
  // For visual display, we just show the string components to avoid browser timezone confusion.
  const datePart = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const timePart = formatTimeDisplay(time);
  
  return `${datePart} • ${timePart} (${timezone})`;
};

/**
 * Calculates a new end date and time given a start date and time.
 * Adds 1 hour to the start time. Handles day rollovers.
 */
export const getEndDateTime = (startDate: string, startTime: string): { endDate: string, endTime: string } => {
  if (!startDate || !startTime) return { endDate: startDate, endTime: startTime };
  
  const d = new Date(`${startDate}T${startTime}`);
  // Add 1 hour
  d.setHours(d.getHours() + 1);
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return {
    endDate: `${year}-${month}-${day}`,
    endTime: `${hours}:${minutes}`
  };
};