import React, { useState, useEffect } from 'react';
import { EventData, WEEK_DAYS } from '../types';
import { formatDateTimeForDisplay } from '../utils/timeUtils';
import { 
  generateGoogleLink, 
  generateOutlookLink, 
  generateYahooLink, 
  downloadICS 
} from '../utils/calendarUtils';

interface EventPreviewProps {
  data: EventData;
  isAttendeeMode?: boolean;
}

const EventPreview: React.FC<EventPreviewProps> = ({ data, isAttendeeMode = false }) => {
  const [showModal, setShowModal] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Reset error state when url changes
  useEffect(() => {
    setImgError(false);
  }, [data.imageUrl]);

  const getGoogleUrl = () => generateGoogleLink(data);
  const getOutlookUrl = () => generateOutlookLink(data);
  const getYahooUrl = () => generateYahooLink(data);

  // Generate recurrence string for display
  const getRecurrenceText = () => {
    if (!data.recurrence) return null;
    const { frequency, interval, weekDays } = data.recurrence;
    
    let text = `Every ${interval > 1 ? interval + ' ' : ''}`;
    
    switch (frequency) {
      case 'DAILY': text += interval > 1 ? 'days' : 'day'; break;
      case 'WEEKLY': text += interval > 1 ? 'weeks' : 'week'; break;
      case 'MONTHLY': text += interval > 1 ? 'months' : 'month'; break;
      case 'YEARLY': text += interval > 1 ? 'years' : 'year'; break;
    }

    if (frequency === 'WEEKLY' && weekDays.length > 0) {
      const days = weekDays.map(d => WEEK_DAYS.find(wd => wd.value === d)?.label).join(', ');
      text += ` on ${days}`;
    }

    return text;
  };

  const recurrenceText = getRecurrenceText();

  return (
    <>
      <div className={`flex flex-col gap-6 sticky top-8 transition-all ${isAttendeeMode ? 'w-full max-w-md mx-auto' : ''}`}>
        
        {/* Visual Card Preview */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform transition-all duration-300">
          {/* Header Image Area */}
          <div className="h-48 bg-slate-100 relative flex items-center justify-center overflow-hidden">
            {data.imageUrl && !imgError ? (
              <img 
                src={data.imageUrl} 
                alt="Event Header" 
                className="w-full h-full object-cover" 
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="text-slate-300 flex flex-col items-center">
                <i className="fas fa-calendar-alt text-4xl mb-2"></i>
                <span className="text-sm font-medium">Event Invitation</span>
                {data.imageUrl && imgError && !isAttendeeMode && (
                   <span className="text-xs text-red-400 mt-1 font-medium px-2 text-center">
                     Image failed to load. Check URL.
                   </span>
                )}
              </div>
            )}
            
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md p-2 rounded-lg shadow-sm text-center min-w-[64px] border border-slate-100">
              <div className="text-xs font-bold text-red-600 uppercase tracking-wider">
                {data.startDate ? new Date(data.startDate).toLocaleString('default', { month: 'short' }) : 'OCT'}
              </div>
              <div className="text-2xl font-extrabold text-slate-800 leading-none mt-1">
                 {data.startDate ? new Date(data.startDate).getDate() : '24'}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight mb-3">
              {data.title || 'Untitled Event'}
            </h1>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center text-slate-600 text-sm font-medium">
                <div className="w-8 flex justify-center">
                  <i className="far fa-clock text-blue-500 text-lg"></i>
                </div>
                <div>
                   <div>{formatDateTimeForDisplay(data.startDate, data.startTime, data.timezone)}</div>
                   {recurrenceText && (
                     <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1 flex items-center gap-1">
                       <i className="fas fa-redo-alt text-[10px]"></i> {recurrenceText}
                     </div>
                   )}
                </div>
              </div>

              <div className="flex items-start text-slate-600 text-sm font-medium">
                 <div className="w-8 flex justify-center mt-0.5">
                  <i className="fas fa-map-marker-alt text-red-500 text-lg"></i>
                </div>
                {data.location?.startsWith('http') ? (
                  <a href={data.location} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">
                    {data.location}
                  </a>
                ) : (
                   <span className="truncate">{data.location || 'No location added'}</span>
                )}
              </div>
            </div>

            <button 
              onClick={() => setShowModal(true)}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
            >
              <i className="fas fa-calendar-plus"></i> Add to Calendar
            </button>

            {data.description && (
              <div className="border-t border-slate-100 pt-6 mt-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Details</h3>
                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {data.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Calendar Options */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowModal(false)}
          ></div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Choose Calendar</h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              {data.recurrence && (
                <div className="mb-4 p-3 bg-blue-50 text-blue-800 text-xs rounded-lg border border-blue-100 flex gap-2">
                  <i className="fas fa-info-circle mt-0.5"></i>
                  <span>For recurring events, <strong>Google Calendar</strong> and <strong>Apple/Outlook (.ics)</strong> provide the best support.</span>
                </div>
              )}

              <div className="space-y-3">
                <a
                  href={getGoogleUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full p-4 bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700 font-semibold rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <i className="fab fa-google text-xl text-slate-600 group-hover:text-blue-600"></i>
                    <span>Google Calendar</span>
                  </div>
                  <i className="fas fa-chevron-right text-slate-300 group-hover:text-blue-500"></i>
                </a>
                
                <button
                  onClick={() => downloadICS(data)}
                  className="flex items-center justify-between w-full p-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <i className="fas fa-file-download text-xl text-slate-600 group-hover:text-slate-900"></i>
                    <span>Apple / Outlook (.ics)</span>
                  </div>
                   <div className="flex items-center gap-2">
                     {data.recurrence && <span className="text-[10px] uppercase font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">Best</span>}
                     <i className="fas fa-download text-slate-400 group-hover:text-slate-600"></i>
                   </div>
                </button>

                <a
                  href={getOutlookUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full p-4 bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700 font-semibold rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <i className="fab fa-microsoft text-xl text-slate-600 group-hover:text-blue-600"></i>
                    <span>Outlook.com Web</span>
                  </div>
                  <i className="fas fa-chevron-right text-slate-300 group-hover:text-blue-500"></i>
                </a>

                <a
                  href={getYahooUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full p-4 bg-white border border-slate-200 hover:border-purple-500 hover:bg-purple-50 text-slate-700 font-semibold rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <i className="fab fa-yahoo text-xl text-slate-600 group-hover:text-purple-600"></i>
                    <span>Yahoo Calendar</span>
                  </div>
                   <i className="fas fa-chevron-right text-slate-300 group-hover:text-purple-500"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventPreview;