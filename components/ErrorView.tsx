
import React from 'react';

interface ErrorViewProps {
    message: string;
    onRetry: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({ message, onRetry }) => {
    return (
        <div className="bg-red-50 border border-red-200 p-8 rounded-xl shadow-lg text-center">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-16 h-16 text-red-500 mx-auto mb-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h2 className="text-2xl font-bold text-red-800">Conversion Failed</h2>
            <p className="text-red-700 mt-2 mb-6">{message}</p>
            <button
                onClick={onRetry}
                className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition focus:outline-none focus:ring-4 focus:ring-red-300"
            >
                Try Again
            </button>
        </div>
    );
};
