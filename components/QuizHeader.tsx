
import React from 'react';

export const QuizHeader: React.FC = () => {
  return (
    <header className="py-6 px-4 bg-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">IZ</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">IZYSHOW Assessment</h1>
        </div>
        <div className="hidden md:block text-slate-500 text-sm font-medium">
          Stagiaire Comptable | Marketplace & Fintech
        </div>
      </div>
    </header>
  );
};
