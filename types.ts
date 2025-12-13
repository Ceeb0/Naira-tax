
export type CurrencyCode = 'NGN' | 'USD' | 'GBP' | 'EUR';

export interface TaxResult {
  grossIncome: number;
  consolidatedRelief: number;
  pension: number;
  taxableIncome: number;
  payeTax: number;
  netIncome: number;
  breakdown: TaxBandBreakdown[]; // Represents the aggregate breakdown
  period: string; // 'Monthly', 'Annual', or 'Jan, Feb...'
  durationMonths: number;
  selectedMonths: string[]; // List of selected months
  effectiveTaxRate: number;
  dailyNet: number;
  // New Expense Fields
  totalTaxDeductible: number; // Sum of NHF, NHIS, etc.
  totalPersonalExpenses: number; // Rent, Food, etc.
  finalBalance: number; // Net Income - Personal Expenses
  transactionHistory: Transaction[]; // Ledger of all inputs
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
  amount: number; // Always Monthly in the internal logic
  bank?: string;
  date?: string;
  receiptRef?: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number; // Monthly
  isTaxDeductible: boolean;
  bank?: string;
  date?: string;
  receiptRef?: string;
}

export interface MonthlyInput {
  month: string;
  incomeSources: IncomeSource[];
  expenses: Expense[];
}

export interface FinancialInput {
  // Deprecated in favor of MonthlyInput[] for multi-month calcs, 
  // but kept for compatibility if needed, or used as a single-month container.
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
