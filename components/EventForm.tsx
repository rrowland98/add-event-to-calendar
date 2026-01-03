import React, { ChangeEvent, useRef, useState } from 'react';
import { EventData, TIMEZONES, REMINDERS } from '../types';
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
            placeholder="e.g. Q4 Marketing Sync"
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
              placeholder="e.g. https://zoom.us/..."
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
            placeholder="Event agenda and details..."
            className={`${inputClass} resize-y`}
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Header Image</label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-md transition-colors border border-slate-300"
            >
              <i className="fas fa-image mr-2"></i> Upload Image
            </button>
            <span className="text-xs text-slate-400">Supports JPG, PNG (Max 500kb for sharing)</span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
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