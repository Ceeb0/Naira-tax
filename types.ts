

export type CurrencyCode = 'NGN' | 'USD' | 'GBP' | 'EUR';

export interface TaxResult {
  grossIncome: number;
  consolidatedRelief: number;
  pension: number;
  taxableIncome: number;
  payeTax: number;
  netIncome: number;
  breakdown: TaxBandBreakdown[]; 
  period: string; 
  durationMonths: number;
  selectedMonths: string[]; 
  effectiveTaxRate: number;
  dailyNet: number;
  totalTaxDeductible: number; 
  totalPersonalExpenses: number; 
  finalBalance: number; 
  transactionHistory: Transaction[]; 
}

export interface Transaction {
  id: string;
  month: string;
  date?: string;
  type: 'Income' | 'Expense';
  description: string;
  amount: number;
  bank?: string;
  receiptRef?: string;
  isTaxDeductible?: boolean;
}

export interface TaxBandBreakdown {
  band: string;
  rate: number;
  amount: number;
}

export interface IncomeSource {
  id: string;
  description: string;
  amount: number; 
  bank?: string;
  date?: string;
  receiptRef?: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number; 
  isTaxDeductible: boolean;
  bank?: string;
  date?: string;
  receiptRef?: string;
}

export interface MonthlyInput {
  month: string;
  incomeSources: IncomeSource[];
  expenses: Expense[];
  isAnnual?: boolean;
}

export interface FinancialInput {
  incomeSources: IncomeSource[];
  expenses: Expense[];
  customTaxRate?: number;
}

export enum SalaryTier {
  LOW = 'Starter',
  MID = 'Professional',
  HIGH = 'Executive',
  ELITE = 'Tycoon'
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
}

export interface CustomCategory {
  label: string;
  isTaxDeductible: boolean;
}

// Added RowItem interface to support UI state tracking for dynamic form rows in the Calculator component
export interface RowItem {
  id: string;
  text: string;
  amount: string;
  isExpanded: boolean;
  date?: string;
  bank?: string;
  receiptRef?: string;
  isTaxDeductible?: boolean;
}

export interface TaxReminder {
  id: string;
  userId: string;
  taxType: string;
  dueDate: string;
  amount?: number;
  notes?: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface SavedCalculation {
  id: string;
  timestamp: string;
  result: TaxResult;
}

export interface UserPreferences {
  darkMode: boolean;
  lastFormattedAmount?: string;
  customCategories?: CustomCategory[];
  currency?: CurrencyCode;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  password?: string;
  preferences: UserPreferences;
  createdAt: string;
}