export interface TaxResult {
  grossIncome: number;
  consolidatedRelief: number;
  pension: number;
  taxableIncome: number;
  payeTax: number;
  netIncome: number;
  breakdown: TaxBandBreakdown[];
  period: 'Monthly' | 'Annual';
}

export interface TaxBandBreakdown {
  band: string;
  rate: number;
  amount: number;
}

export interface FinancialInput {
  monthlyIncome: number;
  additionalEarnings: number; // Monthly
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
