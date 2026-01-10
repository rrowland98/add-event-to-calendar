import React, { useState, useEffect } from 'react';
import EventForm from './components/EventForm';
import EventPreview from './components/EventPreview';
import EventHistoryModal from './components/EventHistoryModal';
import { EventData, INITIAL_EVENT_DATA, SavedEvent } from './types';
import { encodeEventData, decodeEventData, shortenUrl } from './utils/urlUtils';

const App: React.FC = () => {
  const [eventData, setEventData] = useState<EventData>(INITIAL_EVENT_DATA);
  const [isAttendeeMode, setIsAttendeeMode] = useState(false);
  
  // History State
  const [history, setHistory] = useState<SavedEvent[]>([]);
  const [showHistory, setShowHistory] = useState(false);

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

    // Load history from local storage
    const savedHistory = localStorage.getItem('event_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const addToHistory = (data: EventData, link: string) => {
    // Prevent duplicates if the user clicks generate multiple times on the same data
    const lastEvent = history[0];
    const isDuplicate = lastEvent && JSON.stringify(lastEvent.data) === JSON.stringify(data);

    if (isDuplicate) {
        // If exact same data, just update the link (in case shortening changed) and timestamp
        const updated = [...history];
        updated[0] = { ...updated[0], link, createdAt: Date.now() };
        setHistory(updated);
        localStorage.setItem('event_history', JSON.stringify(updated));
        return;
    }

    const newEvent: SavedEvent = {
      id: Date.now().toString(),
      createdAt: Date.now(),
      data: { ...data }, // store copy
      link
    };
    
    const updatedHistory = [newEvent, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('event_history', JSON.stringify(updatedHistory));
  };

  const deleteFromHistory = (id: string) => {
    const updatedHistory = history.filter(h => h.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('event_history', JSON.stringify(updatedHistory));
  };

  const loadFromHistory = (saved: SavedEvent) => {
    setEventData(saved.data);
    setShowHistory(false);
  };

  const handleGenerateShareLink = async () => {
    const encoded = encodeEventData(eventData);
    // Use window.location.href split by ? to ensure we get the correct base URL
    const baseUrl = window.location.href.split('?')[0];
    const longUrl = `${baseUrl}?data=${encoded}`;
    
    // Attempt to shorten the URL
    const finalUrl = await shortenUrl(longUrl);
    
    // Save to history
    addToHistory(eventData, finalUrl);

    return navigator.clipboard.writeText(finalUrl);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header - Only show in Admin mode */}
        {!isAttendeeMode && (
          <div className="mb-10 text-center relative">
            {/* History Toggle Button */}
            <div className="absolute right-0 top-0 hidden sm:block">
              <button 
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 rounded-lg border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm text-sm font-medium"
              >
                <i className="fas fa-history"></i>
                <span>My Events</span>
              </button>
            </div>
            {/* Mobile History Button */}
            <div className="sm:hidden flex justify-end mb-4">
               <button 
                onClick={() => setShowHistory(true)}
                className="text-slate-500 hover:text-blue-600 transition-colors"
              >
                <i className="fas fa-history text-xl"></i>
              </button>
            </div>

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
                <EventPreview eventData={eventData} isAttendeeMode={true} />
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
                <EventPreview eventData={eventData} />
              </div>
            </div>

          </div>
        )}
      </div>

      {/* History Modal */}
      {showHistory && (
        <EventHistoryModal 
          history={history} 
          onClose={() => setShowHistory(false)}
          onLoad={loadFromHistory}
          onDelete={deleteFromHistory}
        />
      )}
    </div>
  );
};

export default App;