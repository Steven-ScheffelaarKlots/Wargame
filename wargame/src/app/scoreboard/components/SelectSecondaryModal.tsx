"use client";

import { useState } from 'react';
import { Secondary } from '../types';

interface SelectSecondaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  secondaryDeck: Secondary[];
  onSelectSecondaries: (selectedIds: string[]) => void;
}

export const SelectSecondaryModal = ({ 
  isOpen, 
  onClose, 
  secondaryDeck,
  onSelectSecondaries
}: SelectSecondaryModalProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  
  if (!isOpen) return null;
  
  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : [...prev, id]
    );
  };
  
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : [...prev, id]
    );
  };
  
  const handleSubmit = () => {
    onSelectSecondaries(selectedIds);
    setSelectedIds([]);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold">Select Secondaries</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {secondaryDeck.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No secondaries left in deck</p>
          ) : (
            <ul className="space-y-2">
              {secondaryDeck.map(secondary => (
                <li 
                  key={secondary.id} 
                  className="border dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <div 
                    className={`p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      selectedIds.includes(secondary.id) ? 'bg-amber-100 dark:bg-amber-900/20' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id={`select-${secondary.id}`}
                        checked={selectedIds.includes(secondary.id)}
                        onChange={() => toggleSelect(secondary.id)}
                        className="h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <label 
                        htmlFor={`select-${secondary.id}`} 
                        className="font-medium cursor-pointer flex-1"
                      >
                        {secondary.name}
                        {secondary.category && (
                          <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                            ({secondary.category})
                          </span>
                        )}
                      </label>
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(secondary.id);
                      }}
                      className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 transition-transform ${expandedIds.includes(secondary.id) ? 'rotate-180' : ''}`} 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    </button>
                  </div>
                  
                  {expandedIds.includes(secondary.id) && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-700">
                      <p className="text-sm">{secondary.shortDescription}</p>
                      
                      {secondary.completions && secondary.completions.length > 0 && (
                        <div className="mt-2">
                          <h4 className="text-sm font-medium mb-1">Scoring Options:</h4>
                          <ul className="space-y-1">
                            {secondary.completions.map((completion, idx) => (
                              <li key={idx} className="text-sm flex justify-between">
                                <span>{completion.description}</span>
                                <span className="font-medium">{completion.points} pts</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="p-4 border-t dark:border-gray-700 flex justify-between">
          <div className="text-sm text-gray-500">
            {selectedIds.length} secondary{selectedIds.length !== 1 ? 'ies' : ''} selected
          </div>
          <div className="space-x-2">
            <button 
              onClick={onClose} 
              className="px-4 py-2 border dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={selectedIds.length === 0}
              className={`px-4 py-2 rounded-md ${
                selectedIds.length > 0
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Draw Selected ({selectedIds.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
