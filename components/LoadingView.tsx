
import React from 'react';

const LoadingSpinner: React.FC = () => (
  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
);

const messages = [
    "Analyzing document structure...",
    "Extracting transaction data...",
    "Applying AI-powered recognition...",
    "Formatting for Excel...",
    "Almost there...",
];

export const LoadingView: React.FC = () => {
    const [message, setMessage] = React.useState(messages[0]);

    React.useEffect(() => {
        const intervalIds = messages.map((_, index) => 
            setTimeout(() => {
                setMessage(messages[index]);
            }, index * 2500)
        );

        return () => {
            intervalIds.forEach(clearTimeout);
        };
    }, []);

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 text-center flex flex-col items-center justify-center min-h-[300px]">
            <LoadingSpinner />
            <p className="mt-6 text-lg font-semibold text-slate-700">{message}</p>
            <p className="mt-1 text-slate-500">Please keep this window open.</p>
        </div>
    );
};
