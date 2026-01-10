import React, { useState } from 'react';
import { EventData, DEFAULT_IMAGE_URL } from '../types';
import { 
  generateGoogleCalendarUrl, 
  generateYahooCalendarUrl, 
  downloadICSFile 
} from '../utils/calendarUtils';

interface EventPreviewProps {
  eventData: EventData;
  isAttendeeMode?: boolean;
}

const EventPreview: React.FC<EventPreviewProps> = ({ eventData, isAttendeeMode = false }) => {
  const [showCalendarOptions, setShowCalendarOptions] = useState(false);

  // Helper to format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00'); // Ensure it treats as local midnight
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Helper to format time
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  const currentImageUrl = eventData.imageUrl || DEFAULT_IMAGE_URL;

  return (
    <div className={`max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 ${isAttendeeMode ? 'mt-6' : 'mt-0'} transition-all duration-300`}>
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
        <span className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
          Live Preview
        </span>
        <div className="flex items-center space-x-1">
          <span className="text-xs font-bold text-gray-400">
            {eventData.startDate ? new Date(eventData.startDate + 'T00:00:00').toLocaleString('en-US', { month: 'short' }).toUpperCase() : 'JAN'}
          </span>
          <span className="text-lg font-bold text-gray-800">
            {eventData.startDate ? new Date(eventData.startDate + 'T00:00:00').getDate() : '9'}
          </span>
        </div>
      </div>

      <div className="w-full h-48 bg-gray-100 relative group overflow-hidden">
           <img 
             src={currentImageUrl} 
             alt="Event Header" 
             className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
             onError={(e) => {
               (e.target as HTMLImageElement).src = 'https://placehold.co/1200x480/e2e8f0/64748b?text=Event+Image';
             }}
           />
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
          {eventData.title || 'Untitled Event'}
        </h2>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-start text-gray-600">
            <i className="far fa-clock mt-1 mr-3 text-blue-500 w-4"></i>
            <div>
              <p className="font-medium text-sm">
                {eventData.startDate ? formatDate(eventData.startDate) : 'Sat, Jan 10'} • {eventData.startTime ? formatTime(eventData.startTime) : '9:00 AM'}
              </p>
              <div className="text-xs text-gray-400 mt-0.5">
                ({eventData.timezone})
                {eventData.recurrence && (
                  <span className="block text-blue-600 font-medium mt-1">
                     <i className="fas fa-redo-alt mr-1 text-[10px]"></i>
                     Repeats every {eventData.recurrence.interval} {eventData.recurrence.frequency.toLowerCase()}(s)
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-start text-gray-600">
             <i className="fas fa-map-marker-alt mt-1 mr-3 text-blue-500 w-4"></i>
             <p className="text-sm break-all">
               {eventData.location || 'No location added'}
             </p>
          </div>
        </div>

        {!showCalendarOptions ? (
          <button 
            onClick={() => setShowCalendarOptions(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center shadow-sm"
          >
            <i className="far fa-calendar-plus mr-2"></i>
            Add to Calendar
          </button>
        ) : (
          <div className="space-y-2 animate-fade-in-up">
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => downloadICSFile(eventData)}
                className="flex items-center justify-center w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded shadow-sm transition-all"
              >
                <div className="flex items-center gap-1.5 mr-2">
                  <i className="fab fa-apple text-gray-800"></i>
                  <i className="fab fa-microsoft text-blue-500"></i>
                </div>
                Apple / Outlook / Outlook.com (.ics file)
                <span className="ml-2 text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">Best for Reminders</span>
              </button>

              <a 
                href={generateGoogleCalendarUrl(eventData)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded shadow-sm transition-all"
              >
                <i className="fab fa-google mr-2 text-red-500"></i>
                Google Calendar
                <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full uppercase">Web</span>
              </a>

              <a 
                href={generateYahooCalendarUrl(eventData)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded shadow-sm transition-all"
              >
                <i className="fab fa-yahoo mr-2 text-purple-500"></i>
                Yahoo
                <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full uppercase">Web</span>
              </a>
            </div>
            
            <p className="text-[10px] text-center text-gray-400 mt-2 px-4">
              Note: Web links use your account's default reminder settings. Use the file option for custom alerts.
            </p>

            <button 
              onClick={() => setShowCalendarOptions(false)}
              className="w-full text-center text-gray-400 text-sm hover:text-gray-600 mt-2"
            >
              Cancel
            </button>
          </div>
        )}

        {eventData.description && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
              {eventData.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventPreview;