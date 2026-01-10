
import React, { ChangeEvent, useRef, useState, useEffect } from 'react';
import { EventData, TIMEZONES, REMINDERS, WEEK_DAYS, RecurrenceSettings, INITIAL_EVENT_DATA } from '../types';
import { generateTimeOptions, formatTimeDisplay, getEndDateTime } from '../utils/timeUtils';

interface EventFormProps {
  data: EventData;
  onChange: (newData: EventData) => void;
  onGenerateShareLink: () => Promise<void>;
}

const EventForm: React.FC<EventFormProps> = ({ data, onChange, onGenerateShareLink }) => {
  const timeOptions = generateTimeOptions();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'invalid'>('idle');

  useEffect(() => {
    if (data.recurrence && data.recurrence.frequency === 'WEEKLY' && data.recurrence.weekDays.length === 0) {
      const date = new Date(data.startDate + 'T00:00:00');
      const dayCode = WEEK_DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1].value;
      const updatedRecurrence = { ...data.recurrence, weekDays: [dayCode] };
      onChange({ ...data, recurrence: updatedRecurrence });
    }
  }, [data.startDate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (copyStatus === 'invalid' && name === 'title' && value.trim()) setCopyStatus('idle');

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
      const date = new Date(data.startDate + 'T00:00:00');
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
    const newDays = currentDays.includes(day) ? currentDays.filter(d => d !== day) : [...currentDays, day];
    updateRecurrence({ weekDays: newDays });
  };

  const resetImage = () => onChange({ ...data, imageUrl: null });
  const clearForm = () => {
    if (window.confirm("Are you sure you want to clear all fields?")) {
      onChange(INITIAL_EVENT_DATA);
    }
  };

  const handleShareClick = async () => {
    if (!data.title.trim()) {
      setCopyStatus('invalid');
      setTimeout(() => setCopyStatus('idle'), 3000);
      return;
    }

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

  const inputClass = "w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400";
  const smallInputClass = "px-2 py-1 border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col h-full">
      <div className="mb-6 border-b border-slate-100 pb-4 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Event Details</h2>
          <p className="text-sm text-slate-500">Configure your event information</p>
        </div>
        <button 
          onClick={clearForm}
          className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
          title="Reset form to defaults"
        >
          <i className="fas fa-redo-alt mr-1"></i> Clear
        </button>
      </div>

      <div className="space-y-6 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">Start</label>
            <div className="flex gap-2">
              <input type="date" name="startDate" value={data.startDate} onChange={handleChange} className={inputClass} style={{ colorScheme: 'light' }} />
              <select name="startTime" value={data.startTime} onChange={handleChange} className={`${inputClass} w-32`}>
                {timeOptions.map((t) => <option key={`start-${t}`} value={t}>{formatTimeDisplay(t)}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">End</label>
            <div className="flex gap-2">
              <input type="date" name="endDate" value={data.endDate} onChange={handleChange} className={inputClass} style={{ colorScheme: 'light' }} />
              <select name="endTime" value={data.endTime} onChange={handleChange} className={`${inputClass} w-32`}>
                {timeOptions.map((t) => <option key={`end-${t}`} value={t}>{formatTimeDisplay(t)}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 py-2">
          <div className="relative inline-block w-10 h-6 align-middle select-none">
            <input type="checkbox" id="recur-toggle" checked={!!data.recurrence} onChange={handleRecurrenceToggle} className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer left-1 top-1 peer-checked:right-1 peer-checked:left-auto" style={{ transition: 'all 0.3s' }} />
            <label htmlFor="recur-toggle" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${data.recurrence ? 'bg-blue-600' : 'bg-gray-300'}`}></label>
          </div>
          <label htmlFor="recur-toggle" className="text-sm font-semibold text-slate-700 cursor-pointer">Repeat event</label>
        </div>

        {data.recurrence && (
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4 animate-fade-in-up">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <span>Repeat every</span>
              <input 
                type="number" 
                min="1" 
                max="99" 
                value={data.recurrence.interval} 
                onChange={(e) => updateRecurrence({ interval: Math.max(1, parseInt(e.target.value) || 1) })} 
                className={`${smallInputClass} w-16 text-center`}
              />
              <select 
                value={data.recurrence.frequency} 
                onChange={(e) => updateRecurrence({ frequency: e.target.value as any })} 
                className={`${smallInputClass}`}
              >
                <option value="DAILY">day</option>
                <option value="WEEKLY">week</option>
                <option value="MONTHLY">month</option>
                <option value="YEARLY">year</option>
              </select>
            </div>
            {data.recurrence.frequency === 'WEEKLY' && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">Repeat on</span>
                <div className="flex gap-2 flex-wrap">
                  {WEEK_DAYS.map(day => (
                    <button key={day.value} type="button" onClick={() => toggleWeekDay(day.value)} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${data.recurrence?.weekDays.includes(day.value) ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'}`}>{day.label}</button>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Ends</span>
              <div className="space-y-2 text-sm text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={data.recurrence.ends === 'never'} onChange={() => updateRecurrence({ ends: 'never' })} className="accent-blue-600" /> Never
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={data.recurrence.ends === 'on'} onChange={() => updateRecurrence({ ends: 'on' })} className="accent-blue-600" /> On 
                  <input 
                    type="date" 
                    value={data.recurrence.endDate || ''} 
                    onChange={(e) => updateRecurrence({ ends: 'on', endDate: e.target.value })} 
                    disabled={data.recurrence.ends !== 'on'} 
                    className={`${smallInputClass} ml-1 text-xs ${data.recurrence.ends !== 'on' ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
                    style={{ colorScheme: 'light' }}
                  />
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={data.recurrence.ends === 'after'} onChange={() => updateRecurrence({ ends: 'after' })} className="accent-blue-600" /> After 
                  <input 
                    type="number" 
                    value={data.recurrence.count || ''} 
                    onChange={(e) => updateRecurrence({ ends: 'after', count: parseInt(e.target.value) })} 
                    disabled={data.recurrence.ends !== 'after'} 
                    className={`${smallInputClass} ml-1 w-16 text-xs text-center ${data.recurrence.ends !== 'after' ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
                  /> occurrences
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Timezone</label>
            <select name="timezone" value={data.timezone} onChange={handleChange} className={inputClass}>
              {TIMEZONES.map((tz) => (<option key={tz.value} value={tz.value}>{tz.label}</option>))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Reminder</label>
            <select name="reminderMinutes" value={data.reminderMinutes} onChange={(e) => onChange({...data, reminderMinutes: parseInt(e.target.value)})} className={inputClass}>
              {REMINDERS.map((r) => (<option key={r.value} value={r.value}>{r.label}</option>))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Event Title <span className="text-red-500">*</span></label>
          <input type="text" name="title" value={data.title} onChange={handleChange} placeholder="Add a title" className={`${inputClass} ${copyStatus === 'invalid' ? 'border-red-500 ring-1 ring-red-500' : ''}`} aria-required="true" />
          {copyStatus === 'invalid' && <p className="text-xs text-red-500 font-medium">A title is required to generate a link.</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Location / Video Link</label>
          <div className="relative"><span className="absolute left-3 top-2.5 text-slate-400"><i className="fas fa-link"></i></span><input type="text" name="location" value={data.location} onChange={handleChange} placeholder="Address or Zoom link" className={`${inputClass} pl-9`} /></div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea name="description" value={data.description} onChange={handleChange} rows={3} placeholder="Add a brief description" className={`${inputClass} resize-y`} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <label className="block text-sm font-medium text-slate-700">Header Image</label>
            {data.imageUrl && <button onClick={resetImage} className="text-[10px] font-bold text-blue-600 uppercase tracking-wider hover:underline">Reset to Default</button>}
          </div>
          <input type="text" name="imageUrl" value={data.imageUrl || ''} onChange={handleChange} placeholder="Public image URL" className={inputClass} />
          <p className="text-[11px] text-slate-400">Best size: 1200 x 480 px. Default used if left blank.</p>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100">
        <button onClick={handleShareClick} disabled={copyStatus === 'loading'} className={`w-full py-4 text-white font-bold text-lg rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${copyStatus === 'success' ? 'bg-green-600' : copyStatus === 'invalid' || copyStatus === 'error' ? 'bg-red-600' : copyStatus === 'loading' ? 'bg-slate-400' : 'bg-slate-900 hover:bg-slate-800'}`}>
          {copyStatus === 'loading' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-link"></i>}
          {copyStatus === 'success' ? 'Link Copied!' : copyStatus === 'invalid' ? 'Title Required' : 'Generate Shareable Link'}
        </button>
      </div>
    </div>
  );
};

export default EventForm;
