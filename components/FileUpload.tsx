
import React, { useState, useCallback, useRef } from 'react';
import { UploadCloudIcon, FileIcon } from './icons';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onConvert: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, onConvert }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      onFileSelect(selectedFile);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if(droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        onFileSelect(droppedFile);
      }
    }
  };
  
  const handleBrowseClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      {!file ? (
        <div
          className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <UploadCloudIcon className="w-12 h-12 text-slate-400 mb-4" />
          <p className="text-slate-600 font-semibold text-center">
            Drag & drop your PDF statement here
          </p>
          <p className="text-slate-500 text-sm mt-1">or</p>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            ref={inputRef}
          />
          <button
            onClick={handleBrowseClick}
            className="mt-4 px-4 py-2 bg-white text-blue-600 font-semibold rounded-md border border-slate-300 hover:bg-slate-100 transition"
          >
            Browse File
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="flex items-center justify-center bg-slate-100 p-4 rounded-lg mb-6 border border-slate-200">
            <FileIcon className="w-8 h-8 text-blue-500 mr-4 flex-shrink-0" />
            <div className="text-left overflow-hidden">
                <p className="font-semibold text-slate-800 truncate">{file.name}</p>
                <p className="text-sm text-slate-500">{Math.round(file.size / 1024)} KB</p>
            </div>
          </div>
          <button
            onClick={onConvert}
            className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Convert to Excel
          </button>
        </div>
      )}
    </div>
  );
};

