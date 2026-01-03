import React, { useState, useEffect } from 'react';
import EventForm from './components/EventForm';
import EventPreview from './components/EventPreview';
import { EventData, INITIAL_EVENT_DATA } from './types';
import { encodeEventData, decodeEventData, shortenUrl } from './utils/urlUtils';

const App: React.FC = () => {
  const [eventData, setEventData] = useState<EventData>(INITIAL_EVENT_DATA);
  const [isAttendeeMode, setIsAttendeeMode] = useState(false);

  useEffect(() => {
    // Check for data param in URL on load
    const params = new URLSearchParams(window.location.search);
    const dataStr = params.get('data');
    if (dataStr) {
      const decoded = decodeEventData(dataStr);
      if (decoded) {
        setEventData(decoded);
        setIsAttendeeMode(true);
      }
    }
  }, []);

  const handleGenerateShareLink = async () => {
    const encoded = encodeEventData(eventData);
    // Use window.location.href split by ? to ensure we get the correct base URL
    // without duplicating protocols or missing paths in various hosting environments.
    const baseUrl = window.location.href.split('?')[0];
    const longUrl = `${baseUrl}?data=${encoded}`;
    
    // Attempt to shorten the URL
    const finalUrl = await shortenUrl(longUrl);
    
    return navigator.clipboard.writeText(finalUrl);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header - Only show in Admin mode or if requested, 
            but usually attendee view is cleaner without branding overload */}
        {!isAttendeeMode && (
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
              Add to My Calendar
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Add this event to your calendar to ensure you don’t miss it!
            </p>
          </div>
        )}

        {/* Content Layout */}
        {isAttendeeMode ? (
          // ATTENDEE MODE: Centered Card Only
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
             <div className="w-full max-w-lg">
                <EventPreview data={eventData} isAttendeeMode={true} />
             </div>
          </div>
        ) : (
          // ADMIN MODE: Split Screen
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Section 1: Dashboard (Left/Top) */}
            <div className="lg:col-span-7 h-full">
              <EventForm 
                data={eventData} 
                onChange={setEventData} 
                onGenerateShareLink={handleGenerateShareLink}
              />
            </div>

            {/* Section 2: Preview (Right/Bottom) */}
            <div className="lg:col-span-5 relative">
              <div className="sticky top-8">
                <div className="mb-4 flex items-center justify-between lg:hidden">
                   <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Live Preview</span>
                </div>
                <EventPreview data={eventData} />
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default App;