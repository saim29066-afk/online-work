import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PageHeader = ({ title, subtitle, backTo, rightAction }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-slate-200 mb-4">
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go Back"
          className="p-2 -ml-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 transition-all flex items-center justify-center shrink-0 shadow-2xs"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-slate-600 font-medium truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {rightAction && (
        <div className="shrink-0">
          {rightAction}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
