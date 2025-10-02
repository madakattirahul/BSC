import React, { useState, useMemo } from 'react';
import type { WorkBook, WorkSheet } from 'xlsx';
import { ConversionResult, Transaction } from '../types';
import { CheckCircleIcon, ExcelIcon, ArrowUpIcon, ArrowDownIcon, ArrowUpRightIcon, ArrowDownLeftIcon } from './icons';

// xlsx is loaded from a CDN and available on the window object
declare const XLSX: {
  utils: {
    json_to_sheet: (data: any[]) => WorkSheet;
    book_new: () => WorkBook;
    book_append_sheet: (wb: WorkBook, ws: WorkSheet, name: string) => void;
  };
  writeFile: (wb: WorkBook, filename: string) => void;
};

type SortKey = 'date' | 'description' | 'debit' | 'credit' | 'category';
type SortDirection = 'asc' | 'desc';

interface DownloadSectionProps {
  result: ConversionResult;
  originalFileName: string;
  onReset: () => void;
}

const SummaryAnalytics: React.FC<{ summary: ConversionResult['summary'] }> = ({ summary }) => {
    const netFlow = summary.totalIncome - summary.totalSpending;
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center text-slate-600 mb-1">
                    <ArrowUpRightIcon className="w-5 h-5 mr-2 text-emerald-500" />
                    <span className="text-sm font-medium">Total Income</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(summary.totalIncome)}</p>
            </div>
            <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center text-slate-600 mb-1">
                    <ArrowDownLeftIcon className="w-5 h-5 mr-2 text-red-500" />
                    <span className="text-sm font-medium">Total Spending</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalSpending)}</p>
            </div>
            <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center text-slate-600 mb-1">
                    <span className="text-sm font-medium">Net Cash Flow</span>
                </div>
                <p className={`text-2xl font-bold ${netFlow >= 0 ? 'text-slate-800' : 'text-orange-600'}`}>
                    {formatCurrency(netFlow)}
                </p>
            </div>
        </div>
    );
};

const CategoryChart: React.FC<{ summary: ConversionResult['summary'] }> = ({ summary }) => {
    const sortedCategories = useMemo(() => 
        Object.entries(summary.spendingByCategory)
            .filter(([, amount]) => amount > 0)
            .sort(([, a], [, b]) => b - a)
    , [summary.spendingByCategory]);

    const maxSpending = sortedCategories.length > 0 ? sortedCategories[0][1] : 0;
    if (sortedCategories.length === 0) return null;

    return (
        <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 text-left">Spending by Category</h3>
            <div className="space-y-3">
                {sortedCategories.map(([category, amount]) => (
                    <div key={category} className="flex items-center">
                        <span className="w-1/4 text-sm text-slate-600 text-left truncate pr-2">{category}</span>
                        <div className="w-3/4 bg-slate-200 rounded-full h-5">
                            <div
                                className="bg-blue-500 h-5 rounded-full flex items-center justify-end pr-2"
                                style={{ width: `${(amount / maxSpending) * 100}%` }}
                            >
                                <span className="text-xs font-medium text-white">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TransactionTable: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => (
    <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-96">
        <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 sticky top-0">
                <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Debit</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Credit</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
                {transactions.map((t, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{t.date}</td>
                        <td className="px-4 py-3 text-sm text-slate-800">{t.description}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{t.category}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 text-right font-mono">{t.debit ? `$${t.debit.toFixed(2)}` : ''}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-emerald-600 text-right font-mono">{t.credit ? `$${t.credit.toFixed(2)}` : ''}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


export const DownloadSection: React.FC<DownloadSectionProps> = ({ result, originalFileName, onReset }) => {
  const { transactions: data, summary } = result;
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const [minDate, maxDate] = useMemo(() => {
    if (!data || data.length === 0) return [undefined, undefined];
    const dates = data.map(t => t.date);
    return [dates.reduce((a, b) => a < b ? a : b), dates.reduce((a, b) => a > b ? a : b)];
  }, [data]);

  const processedData = useMemo(() => {
    let filtered = data;
    if (startDate || endDate) {
        filtered = data.filter(transaction => {
            if (startDate && transaction.date < startDate) return false;
            if (endDate && transaction.date > endDate) return false;
            return true;
        });
    }

    const sorted = [...filtered].sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        const direction = sortDirection === 'asc' ? 1 : -1;

        if (valA === null) return 1;
        if (valB === null) return -1;
        
        if (typeof valA === 'string' && typeof valB === 'string') {
            return valA.localeCompare(valB) * direction;
        }
        
        if (typeof valA === 'number' && typeof valB === 'number') {
            return (valA - valB) * direction;
        }

        return 0;
    });

    return sorted;
  }, [data, startDate, endDate, sortKey, sortDirection]);

  const handleDownload = () => {
    if (processedData.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(processedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    
    const columnWidths = Object.keys(processedData[0] || {}).map(key => ({
      wch: Math.max(
        key.length, 
        ...processedData.map(row => String(row[key as keyof Transaction] || '').length)
      ) + 2
    }));
    worksheet['!cols'] = columnWidths;

    XLSX.writeFile(workbook, `${originalFileName || 'converted-statement'}.xls`);
  };
  
  const toggleSortDirection = () => {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-slate-200">
        <div className="text-center">
            <CheckCircleIcon className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800">Conversion Complete!</h2>
            <p className="text-slate-600 mt-2 mb-8">Here's a summary of your statement. Review, filter, and download your data.</p>
        </div>
        
        <SummaryAnalytics summary={summary} />
        <CategoryChart summary={summary} />
        <TransactionTable transactions={processedData} />

      <div className="my-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Filter & Sort Transactions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="w-full">
                <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 text-left mb-1">Start Date</label>
                <input type="date" id="startDate" value={startDate} min={minDate} max={endDate || maxDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" aria-label="Start Date Filter" />
            </div>
            <div className="w-full">
                <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 text-left mb-1">End Date</label>
                <input type="date" id="endDate" value={endDate} min={startDate || minDate} max={maxDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" aria-label="End Date Filter" />
            </div>
            <div className="w-full">
                <label htmlFor="sortKey" className="block text-sm font-medium text-slate-700 text-left mb-1">Sort By</label>
                <select id="sortKey" value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white" aria-label="Sort By">
                    <option value="date">Date</option>
                    <option value="description">Description</option>
                    <option value="category">Category</option>
                    <option value="debit">Debit</option>
                    <option value="credit">Credit</option>
                </select>
            </div>
            <div className="w-full">
                <button onClick={toggleSortDirection} className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-white text-slate-700 hover:bg-slate-100 transition">
                    {sortDirection === 'asc' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
                    <span>{sortDirection === 'asc' ? 'Ascending' : 'Descending'}</span>
                </button>
            </div>
        </div>
        {processedData.length === 0 && data.length > 0 && (
            <p className="text-red-600 mt-4 text-sm">No transactions found for the selected range.</p>
        )}
      </div>
      
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <button
            onClick={handleDownload}
            disabled={processedData.length === 0}
            className="flex-1 bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-300 flex items-center justify-center disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none"
        >
            <ExcelIcon className="w-5 h-5 mr-2" />
            Download ({processedData.length} Transactions)
        </button>
        <button
            onClick={onReset}
            className="flex-1 bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 transition"
        >
            Convert another file
        </button>
      </div>
    </div>
  );
};
