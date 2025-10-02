
import React from 'react';
import { ExcelIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
             <ExcelIcon className="h-7 w-7 text-emerald-600" />
            <span className="text-xl font-bold text-slate-800">Bank Statement Converter</span>
          </div>
        </div>
      </div>
    </header>
  );
};
