import React, { useState, useCallback } from 'react';
import { AppState, ConversionResult } from './types';
import { convertBankStatement, ApiError, ParsingError, RateLimitError } from './services/geminiService';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FileUpload } from './components/FileUpload';
import { Features } from './components/Features';
import { LoadingView } from './components/LoadingView';
import { DownloadSection } from './components/DownloadSection';
import { ErrorView } from './components/ErrorView';

// pdf.js is loaded from a CDN, declare its global variable for TypeScript
declare const pdfjsLib: any;

const extractTextFromPdf = async (file: File): Promise<string> => {
  if (typeof pdfjsLib === 'undefined') {
    throw new Error("The PDF processing library (pdf.js) is not loaded. Please check your internet connection and refresh the page.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

  const pagePromises = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    pagePromises.push(pdf.getPage(i).then((page: any) => page.getTextContent()));
  }

  const pagesTextContent = await Promise.all(pagePromises);

  return pagesTextContent.map((textContent: any) =>
    textContent.items.map((item: any) => item.str).join(' ')
  ).join('\n\n');
};


const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [convertedData, setConvertedData] = useState<ConversionResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setFileName(selectedFile.name.replace(/\.pdf$/i, ''));
  };
  
  const handleConvert = useCallback(async () => {
    if (!file) {
      setError('Please select a PDF file first.');
      setAppState(AppState.ERROR);
      return;
    }

    setAppState(AppState.PROCESSING);
    setError(null);
    setConvertedData(null);

    try {
      const pdfText = await extractTextFromPdf(file);
      
      if (!pdfText.trim()) {
        throw new Error("Could not extract any text from the PDF. It might be an image-only file or corrupted.");
      }

      const data = await convertBankStatement(pdfText);
      setConvertedData(data);
      setAppState(AppState.SUCCESS);
    } catch (err) {
      console.error(err);
      if (err instanceof RateLimitError || err instanceof ParsingError || err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        if (err.message.includes('PasswordException')) {
          setError("The PDF file is password-protected. Please remove the password and try again.");
        } else {
          setError(err.message || 'An unknown error occurred during conversion.');
        }
      } else {
        setError('An unknown error occurred during conversion.');
      }
      setAppState(AppState.ERROR);
    }
  }, [file]);

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setError(null);
    setConvertedData(null);
    setFileName('');
    setFile(null);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.PROCESSING:
        return <LoadingView />;
      case AppState.SUCCESS:
        return convertedData && <DownloadSection result={convertedData} originalFileName={fileName} onReset={handleReset} />;
      case AppState.ERROR:
        return <ErrorView message={error || 'Something went wrong.'} onRetry={handleConvert} />;
      case AppState.IDLE:
      default:
        return (
          <>
            <Hero />
            <FileUpload onFileSelect={handleFileSelect} onConvert={handleConvert} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-5xl mx-auto">
          {renderContent()}
        </div>
      </main>
      {appState === AppState.IDLE && <Features />}
    </div>
  );
};

export default App;
