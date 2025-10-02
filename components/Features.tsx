
import React from 'react';
import { CheckCircleIcon } from './icons';

const features = [
  'Unlimited Conversions',
  'High-Accuracy OCR Engine',
  'Secure & Private Processing',
  'No Watermarks on Output',
  'Multi-Currency & Language Support',
  'Instant Download',
];

const FeatureItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-center space-x-3">
    <CheckCircleIcon className="w-6 h-6 text-emerald-500 flex-shrink-0" />
    <span className="text-slate-700">{children}</span>
  </li>
);

export const Features: React.FC = () => {
  return (
    <div className="bg-white py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-sm font-semibold uppercase text-blue-600 tracking-wider">All Premium Features Included</h2>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
            Everything You Need, For Free.
          </p>
          <div className="mt-8">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-left">
              {features.map((feature) => (
                <FeatureItem key={feature}>{feature}</FeatureItem>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
