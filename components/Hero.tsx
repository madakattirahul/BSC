
import React from 'react';

export const Hero: React.FC = () => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
        Bank Statement Converter
      </h1>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto">
        Easily convert PDF bank statements from 1000s of banks worldwide into clean Excel (XLS) format.
      </p>
    </div>
  );
};
