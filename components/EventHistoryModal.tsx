import React, { useState } from 'react';
import { SavedEvent } from '../types';

interface EventHistoryModalProps {
  history: SavedEvent[];
  onClose: () => void;
  onLoad: (event: SavedEvent) => void;
  onDelete: (id: string) => void;
}

const EventHistoryModal: React.FC<EventHistoryModalProps> = ({ history, onClose, onLoad, onDelete }) => {
  const [copyId, setCopyId] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, link: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(link);
    setCopyId(id);
    setTimeout(() => setCopyId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">My Event History</h3>
            <p className="text-sm text-slate-500">Your previously generated event links</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors shadow-sm"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-6 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <i className="fas fa-history text-4xl mb-3 opacity-50"></i>
              <p>No history found. Generate a link to save it here.</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all gap-4"
              >
                <div className="flex-grow min-w-0">
                  <h4 className="font-bold text-slate-800 truncate pr-4">
                    {item.data.title || 'Untitled Event'}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <i className="far fa-calendar"></i>
                      {item.data.startDate}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="truncate">Created {new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onLoad(item)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg border border-slate-200 transition-colors"
                    title="Load into form"
                  >
                    <i className="fas fa-pen mr-1"></i> Edit
                  </button>
                  
                  <button
                    onClick={(e) => handleCopy(e, item.link, item.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1 w-24 justify-center
                      ${copyId === item.id 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                      }`}
                  >
                    {copyId === item.id ? (
                      <><i className="fas fa-check"></i> Copied</>
                    ) : (
                      <><i className="fas fa-link"></i> Copy</>
                    )}
                  </button>

                  <button
                    onClick={() => onDelete(item.id)}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete from history"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Privacy Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
           <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
             <i className="fas fa-shield-alt text-slate-300"></i>
             <span>History is stored locally on this device and is not shared via event links.</span>
           </p>
        </div>
      </div>
    </div>
  );
};

export default EventHistoryModal;