
import React, { useState } from 'react';
import { MEDICAL_TERMS_SIMPLE } from '../constants';

interface InfoTooltipProps {
  term: string;
  className?: string;
  iconOnly?: boolean;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ term, className = "", iconOnly = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const description = MEDICAL_TERMS_SIMPLE[term];

  if (!description) return null;

  return (
    <div 
      className={`relative inline-flex items-center group cursor-help ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsVisible(!isVisible);
      }}
    >
      <div className="flex items-center space-x-1">
        {!iconOnly && <span className="text-inherit">{term}</span>}
        <svg 
          className={`w-3.5 h-3.5 ${isVisible ? 'text-teal-600' : 'text-slate-400'} transition-colors`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-900 text-white text-[11px] leading-relaxed rounded-xl shadow-xl z-[100] animate-in fade-in zoom-in-95 duration-200">
          <p className="font-bold text-teal-400 mb-1">Meaning:</p>
          {description}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
