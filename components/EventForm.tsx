import React, { ChangeEvent, useRef, useState, useEffect } from 'react';
import { EventData, TIMEZONES, REMINDERS, WEEK_DAYS, RecurrenceSettings } from '../types';
import { generateTimeOptions, formatTimeDisplay, getEndDateTime } from '../utils/timeUtils';

interface EventFormProps {
  data: EventData;
  onChange: (newData: EventData) => void;
  onGenerateShareLink: () => Promise<void>;
}

const EventForm: React.FC<EventFormProps> = ({ data, onChange, onGenerateShareLink }) => {
  const timeOptions = generateTimeOptions();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Sync default recurrence day with start date
  useEffect(() => {
    if (data.recurrence && data.recurrence.frequency === 'WEEKLY' && data.recurrence.weekDays.length === 0) {
      const date = new Date(data.startDate);
      const dayCode = WEEK_DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1].value;
      const updatedRecurrence = { ...data.recurrence, weekDays: [dayCode] };
      onChange({ ...data, recurrence: updatedRecurrence });
    }
  }, [data.startDate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'startDate') {
      onChange({ ...data, startDate: value, endDate: value });
    } else if (name === 'startTime') {
      const { endDate, endTime } = getEndDateTime(data.startDate, value);
      onChange({ ...data, startTime: value, endDate, endTime });
    } else {
      onChange({ ...data, [name]: value });
    }
  };

  const handleRecurrenceToggle = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // Initialize recurrence
      const date = new Date(data.startDate);
      // JS getDay(): 0=Sun, 1=Mon... We map to our array where MO is first but lookup is by index
      // WEEK_DAYS is [MO, TU, WE...]
      // Simple map: Sun=6, Mon=0, Tue=1 ... in our array index
      const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
      
      const defaultRecurrence: RecurrenceSettings = {
        frequency: 'WEEKLY',
        interval: 1,
        ends: 'never',
        endDate: null,
        count: 13,
        weekDays: [WEEK_DAYS[dayIndex]?.value || 'MO'],
      };
      onChange({ ...data, recurrence: defaultRecurrence });
    } else {
      onChange({ ...data, recurrence: null });
    }
  };

  const updateRecurrence = (updates: Partial<RecurrenceSettings>) => {
    if (!data.recurrence) return;
    onChange({ ...data, recurrence: { ...data.recurrence, ...updates } });
  };

  const toggleWeekDay = (day: string) => {
    if (!data.recurrence) return;
    const currentDays = data.recurrence.weekDays;
    let newDays = [];
    if (currentDays.includes(day)) {
      newDays = currentDays.filter(d => d !== day);
    } else {
      newDays = [...currentDays, day];
    }
    updateRecurrence({ weekDays: newDays });
  };

  const handleReminderChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...data, reminderMinutes: parseInt(e.target.value, 10) });
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...data, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShareClick = async () => {
    setCopyStatus('loading');
    try {
      await onGenerateShareLink();
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 3000);
    } catch (e) {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 3000);
    }
  }

  const inputClass = "w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow placeholder-gray-400";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col h-full">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-800">Event Details</h2>
        <p className="text-sm text-slate-500">Configure your event information</p>
      </div>

      <div className="space-y-6 flex-grow">
        {/* Date & Time Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">Start</label>
            <div className="flex gap-2">
              <input
                type="date"
                name="startDate"
                value={data.startDate}
                onChange={handleChange}
                className={inputClass}
                style={{ colorScheme: 'light' }}
              />
              <select
                name="startTime"
                value={data.startTime}
                onChange={handleChange}
                className={`${inputClass} w-32`}
              >
                {timeOptions.map((t) => (
                  <option key={`start-${t}`} value={t}>
                    {formatTimeDisplay(t)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* End */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">End</label>
            <div className="flex gap-2">
              <input
                type="date"
                name="endDate"
                value={data.endDate}
                onChange={handleChange}
                className={inputClass}
                style={{ colorScheme: 'light' }}
              />
              <select
                name="endTime"
                value={data.endTime}
                onChange={handleChange}
                className={`${inputClass} w-32`}
              >
                {timeOptions.map((t) => (
                  <option key={`end-${t}`} value={t}>
                    {formatTimeDisplay(t)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Recurrence Toggle */}
        <div className="flex items-center gap-3 py-2">
           <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
            <input 
              type="checkbox" 
              name="isRecurring" 
              id="recur-toggle"
              checked={!!data.recurrence}
              onChange={handleRecurrenceToggle}
              className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer left-1 top-1 peer-checked:right-1 peer-checked:left-auto" 
              style={{ transition: 'all 0.3s' }}
            />
            <label 
              htmlFor="recur-toggle" 
              className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${data.recurrence ? 'bg-blue-600' : 'bg-gray-300'}`}
            ></label>
          </div>
          <label htmlFor="recur-toggle" className="text-sm font-semibold text-slate-700 cursor-pointer">
            Repeat event
          </label>
        </div>

        {/* Recurrence UI */}
        {data.recurrence && (
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4 animate-fade-in-up">
            {/* Frequency */}
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <span>Repeat every</span>
              <input 
                type="number" 
                min="1" 
                max="99" 
                value={data.recurrence.interval}
                onChange={(e) => updateRecurrence({ interval: parseInt(e.target.value) || 1 })}
                className="w-16 px-2 py-1 border border-slate-300 rounded text-center bg-white text-slate-900"
              />
              <select 
                value={data.recurrence.frequency}
                onChange={(e) => updateRecurrence({ frequency: e.target.value as any })}
                className="px-2 py-1 border border-slate-300 rounded bg-white text-slate-900"
              >
                <option value="DAILY">day</option>
                <option value="WEEKLY">week</option>
                <option value="MONTHLY">month</option>
                <option value="YEARLY">year</option>
              </select>
            </div>

            {/* Weekly Days Selector */}
            {data.recurrence.frequency === 'WEEKLY' && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Repeat on</span>
                <div className="flex gap-2 flex-wrap">
                  {WEEK_DAYS.map(day => {
                    const isSelected = data.recurrence?.weekDays.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleWeekDay(day.value)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                          isSelected 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm transform scale-105' 
                            : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ends */}
            <div className="space-y-2">
               <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ends</span>
               <div className="space-y-2 text-sm text-slate-700">
                 <label className="flex items-center gap-2 cursor-pointer">
                   <input 
                      type="radio" 
                      name="recur-end" 
                      checked={data.recurrence.ends === 'never'} 
                      onChange={() => updateRecurrence({ ends: 'never' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                   <span>Never</span>
                 </label>
                 
                 <label className="flex items-center gap-2 cursor-pointer">
                   <input 
                      type="radio" 
                      name="recur-end" 
                      checked={data.recurrence.ends === 'on'} 
                      onChange={() => updateRecurrence({ ends: 'on' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                   <span>On</span>
                   <input 
                      type="date" 
                      value={data.recurrence.endDate || ''} 
                      onChange={(e) => updateRecurrence({ ends: 'on', endDate: e.target.value })}
                      disabled={data.recurrence.ends !== 'on'}
                      className="ml-1 px-2 py-1 border border-slate-300 rounded text-xs disabled:opacity-50 bg-white text-slate-900"
                   />
                 </label>

                 <label className="flex items-center gap-2 cursor-pointer">
                   <input 
                      type="radio" 
                      name="recur-end" 
                      checked={data.recurrence.ends === 'after'} 
                      onChange={() => updateRecurrence({ ends: 'after' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                   <span>After</span>
                   <input 
                      type="number" 
                      value={data.recurrence.count || ''} 
                      onChange={(e) => updateRecurrence({ ends: 'after', count: parseInt(e.target.value) })}
                      disabled={data.recurrence.ends !== 'after'}
                      className="ml-1 w-16 px-2 py-1 border border-slate-300 rounded text-xs text-center disabled:opacity-50 bg-white text-slate-900"
                   />
                   <span>occurrences</span>
                 </label>
               </div>
            </div>
          </div>
        )}

        {/* Timezone & Reminder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Timezone</label>
            <select
              name="timezone"
              value={data.timezone}
              onChange={handleChange}
              className={inputClass}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Reminder (Push Notification)</label>
            <select
              name="reminderMinutes"
              value={data.reminderMinutes}
              onChange={handleReminderChange}
              className={inputClass}
            >
              {REMINDERS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Event Title</label>
          <input
            type="text"
            name="title"
            value={data.title}
            onChange={handleChange}
            placeholder="Add the title of your event"
            className={inputClass}
          />
        </div>

        {/* Location / Link */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Location / Video Link</label>
          <div className="relative">
             <span className="absolute left-3 top-2.5 text-slate-400">
               <i className="fas fa-link"></i>
             </span>
            <input
              type="text"
              name="location"
              value={data.location}
              onChange={handleChange}
              placeholder="Add the address or Zoom link for your event"
              className={`${inputClass} pl-9`}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea
            name="description"
            value={data.description}
            onChange={handleChange}
            rows={4}
            placeholder="Add a brief description of your event"
            className={`${inputClass} resize-y`}
          />
        </div>

        {/* Image Upload / URL */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Header Image</label>
          <div className="flex gap-2">
            <input
              type="text"
              name="imageUrl"
              value={data.imageUrl || ''}
              onChange={handleChange}
              placeholder="Paste public image URL (https://...)"
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md border border-slate-300 transition-colors shrink-0"
              title="Upload Local Preview"
            >
              <i className="fas fa-upload"></i>
            </button>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          {data.imageUrl && data.imageUrl.startsWith('data:') ? (
            <div className="flex items-start gap-2 p-3 bg-amber-50 text-amber-800 rounded-md text-xs border border-amber-200">
               <i className="fas fa-exclamation-triangle mt-0.5 shrink-0"></i>
               <span>
                 <strong>Local upload detected.</strong> This image will show in your preview here but 
                 <span className="underline decoration-amber-500/50 mx-1">cannot be saved to the shareable link</span> 
                 because it is too large. For sharing, please paste a public URL (e.g. from your website, Imgur) above.
               </span>
            </div>
          ) : (
            <p className="text-xs text-slate-400 leading-relaxed">
              Use a direct link ending in <code>.jpg</code> or <code>.png</code> (e.g. Imgur, your website).
              <br/>
              <span className="text-slate-400">Note: Google Photos or Drive sharing links usually do not work.</span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100">
        <button
          onClick={handleShareClick}
          disabled={copyStatus === 'loading'}
          className={`w-full py-4 text-white font-bold text-lg rounded-xl transition-all shadow-md flex items-center justify-center gap-2 
            ${copyStatus === 'success' ? 'bg-green-600 hover:bg-green-700' : 
              copyStatus === 'error' ? 'bg-red-600 hover:bg-red-700' :
              copyStatus === 'loading' ? 'bg-slate-600 cursor-wait' : 'bg-slate-900 hover:bg-slate-800'}`}
        >
          {copyStatus === 'loading' && <i className="fas fa-spinner fa-spin"></i>}
          {copyStatus === 'success' && <><i className="fas fa-check"></i> Link Copied!</>}
          {copyStatus === 'error' && <><i className="fas fa-exclamation-triangle"></i> Retry</>}
          {copyStatus === 'idle' && <><i className="fas fa-link"></i> Generate Shareable Link</>}
        </button>
        <p className="text-center text-xs text-slate-400 mt-3">
          Creates a permanent link containing all event details.
        </p>
      </div>
    </div>
  );
};

export default EventForm;