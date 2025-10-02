export interface Transaction {
  date: string;
  description: string;
  debit: number | null;
  credit: number | null;
  balance: number;
  category: string;
}

export interface Summary {
  totalIncome: number;
  totalSpending: number;
  spendingByCategory: { [key: string]: number };
}

export interface ConversionResult {
    transactions: Transaction[];
    summary: Summary;
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
