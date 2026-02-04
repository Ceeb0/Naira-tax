
import { MonthlyInput, TaxResult, TaxBandBreakdown, Transaction, SalaryTier } from '../types';

export const CURRENCIES: Record<string, { symbol: string, locale: string, name: string }> = {
  NGN: { symbol: '₦', locale: 'en-NG', name: 'Naira' },
  USD: { symbol: '$', locale: 'en-US', name: 'Dollar' },
  GBP: { symbol: '£', locale: 'en-GB', name: 'Pound' },
  EUR: { symbol: '€', locale: 'en-IE', name: 'Euro' },
};

export const SPECIALIZED_TAX_RATES = [
  { label: 'VAT (Sales Tax)', rate: 7.5, category: 'Indirect' },
  { label: 'WHT (Rent)', rate: 10, category: 'Withholding' },
  { label: 'WHT (Professional/Contract)', rate: 5, category: 'Withholding' },
  { label: 'CIT (Large Company)', rate: 30, category: 'Company' },
  { label: 'Development Levy', rate: 4, category: 'Company' },
  { label: 'CGT (Assets)', rate: 30, category: 'Capital Gains' },
  { label: 'Stamp Duty (Proxy)', rate: 0.5, category: 'Stamp' },
];

export const COMMON_EXPENSES = [
  { label: 'National Housing Fund (NHF)', isTaxDeductible: true }, 
  { label: 'National Health Insurance (NHIS)', isTaxDeductible: true }, 
  { label: 'Life Assurance Premium', isTaxDeductible: true }, 
  { label: 'Rent', isTaxDeductible: false },
  { label: 'Food & Groceries', isTaxDeductible: false },
  { label: 'Transport', isTaxDeductible: false },
  { label: 'Utilities', isTaxDeductible: false },
  { label: 'Internet/Data', isTaxDeductible: false },
  { label: 'Savings/Investment', isTaxDeductible: false },
];

export const NIGERIAN_BANKS = [
  "Access Bank", "Access Bank (Diamond)", "ALAT by WEMA", "Citibank Nigeria", "Ecobank Nigeria",
  "Fidelity Bank", "First Bank of Nigeria", "FCMB", "Globus Bank", "GTBank",
  "Heritage Bank", "Jaiz Bank", "Keystone Bank", "Kuda Bank", "Lotus Bank",
  "Moniepoint MFB", "Opay", "Optimus Bank", "PalmPay", "Parallex Bank",
  "Polaris Bank", "Premium Trust Bank", "Providus Bank", "Stanbic IBTC", "Standard Chartered",
  "Sterling Bank", "SunTrust Bank", "Taj Bank", "Titan Trust", "Union Bank",
  "UBA", "Union Bank", "VFD MFB", "Wema Bank", "Zenith Bank"
];

export const getSalaryTier = (amount: number): SalaryTier => {
  if (amount < 200000) return SalaryTier.LOW;
  if (amount < 1000000) return SalaryTier.MID;
  if (amount < 5000000) return SalaryTier.HIGH;
  return SalaryTier.ELITE;
};

const calculateSingleMonth = (input: MonthlyInput, customTaxRate?: number) => {
  const isAnnual = !!input.isAnnual;
  const totalPeriodIncome = input.incomeSources.reduce((sum, source) => sum + source.amount, 0);

  let periodTaxDeductible = 0;
  let periodPersonalExpenses = 0;

  input.expenses.forEach(exp => {
    periodTaxDeductible += exp.amount;
    if (!exp.isTaxDeductible) {
      periodPersonalExpenses += exp.amount;
    }
  });

  const annualGross = isAnnual ? totalPeriodIncome : totalPeriodIncome * 12;
  const annualTaxDeductible = isAnnual ? periodTaxDeductible : periodTaxDeductible * 12;
  const annualPersonalExpenses = isAnnual ? periodPersonalExpenses : periodPersonalExpenses * 12;
  
  const annualPension = annualGross * 0.08;

  const onePercentGross = annualGross * 0.01;
  const fixedRelief = 200000;
  const baseRelief = Math.max(fixedRelief, onePercentGross);
  const twentyPercentGross = annualGross * 0.20;
  const annualCRA = baseRelief + twentyPercentGross;

  let annualTaxable = annualGross - annualCRA - annualPension - annualTaxDeductible;
  if (annualTaxable < 0) annualTaxable = 0;

  let annualTax = 0;
  const breakdown: TaxBandBreakdown[] = [];

  if (customTaxRate !== undefined && !isNaN(customTaxRate)) {
      annualTax = annualGross * (customTaxRate / 100);
      breakdown.push({
          band: 'Specialized Rate',
          rate: customTaxRate / 100,
          amount: annualTax
      });
  } else {
      let remainingTaxable = annualTaxable;
      const bands = [
        { limit: 800000, rate: 0.00, label: 'First ₦800k' },
        { limit: 2200000, rate: 0.15, label: '₦800k - ₦3M' }, 
        { limit: 9000000, rate: 0.18, label: '₦3M - ₦12M' }, 
        { limit: 38000000, rate: 0.21, label: '₦12M - ₦50M' }, 
        { limit: Infinity, rate: 0.23, label: 'Above ₦50M' },
      ];

      for (const band of bands) {
        if (remainingTaxable <= 0) break;
        const taxableAmount = Math.min(remainingTaxable, band.limit);
        const taxAmount = taxableAmount * band.rate;
        annualTax += taxAmount;
        remainingTaxable -= taxableAmount;
        
        if (taxAmount > 0) {
             breakdown.push({
                band: band.label,
                rate: band.rate,
                amount: taxAmount
             });
        }
      }
  }

  const divisor = isAnnual ? 1 : 12;

  return {
    gross: annualGross / 12, // Standardize back to monthly for aggregated logic if multiple months
    pension: annualPension / 12,
    cra: annualCRA / 12,
    taxable: annualTaxable / 12,
    tax: annualTax / 12,
    taxDeductible: annualTaxDeductible / 12,
    personalExpenses: annualPersonalExpenses / 12,
    net: (annualGross - annualPension - annualTax - annualTaxDeductible) / 12,
    final: ((annualGross - annualPension - annualTax - annualTaxDeductible) - annualPersonalExpenses) / divisor,
    // For single month mode res.final is monthly. For annual mode res.final is annual.
    // Wait, the aggregated loop below sums them up. If it's one month marked as annual, 
    // it should just return the full annual figures.
    annualGross,
    annualTax,
    annualNet: annualGross - annualPension - annualTax - annualTaxDeductible,
    annualFinal: (annualGross - annualPension - annualTax - annualTaxDeductible) - annualPersonalExpenses,
    isAnnual,
    breakdown 
  };
};

export const calculateTax = (monthlyInputs: MonthlyInput[], customTaxRate?: number): TaxResult => {
  const selectedMonths = monthlyInputs.map(m => m.month);
  const monthsCount = monthlyInputs.length || 1;
  const isFullAnnualMode = monthlyInputs.length === 1 && !!monthlyInputs[0].isAnnual;

  let totalGross = 0;
  let totalPension = 0;
  let totalCRA = 0;
  let totalTaxable = 0;
  let totalTax = 0;
  let totalTaxDeductible = 0;
  let totalPersonalExpenses = 0;
  let totalNet = 0;
  let totalFinal = 0;

  const transactionHistory: Transaction[] = [];
  const aggregatedBreakdownMap: Record<string, TaxBandBreakdown> = {};

  monthlyInputs.forEach(input => {
    const res = calculateSingleMonth(input, customTaxRate);
    
    if (res.isAnnual) {
        // If the single input provided is annual data
        totalGross = res.annualGross;
        totalPension = res.pension * 12;
        totalCRA = res.cra * 12;
        totalTaxable = res.taxable * 12;
        totalTax = res.annualTax;
        totalTaxDeductible = res.taxDeductible * 12;
        totalPersonalExpenses = res.personalExpenses * 12;
        totalNet = res.annualNet;
        totalFinal = res.annualFinal;

        res.breakdown.forEach(b => {
            if (!aggregatedBreakdownMap[b.band]) {
                aggregatedBreakdownMap[b.band] = { ...b, amount: 0 };
            }
            aggregatedBreakdownMap[b.band].amount += b.amount;
        });
    } else {
        totalGross += res.gross;
        totalPension += res.pension;
        totalCRA += res.cra;
        totalTaxable += res.taxable;
        totalTax += res.tax;
        totalTaxDeductible += res.taxDeductible;
        totalPersonalExpenses += res.personalExpenses;
        totalNet += res.net;
        totalFinal += res.final;

        res.breakdown.forEach(b => {
            if (!aggregatedBreakdownMap[b.band]) {
                aggregatedBreakdownMap[b.band] = { ...b, amount: 0 };
            }
            aggregatedBreakdownMap[b.band].amount += (b.amount / 12);
        });
    }

    input.incomeSources.forEach(inc => {
        transactionHistory.push({
            id: inc.id, month: input.month, type: 'Income', description: inc.description, amount: inc.amount,
            bank: inc.bank, date: inc.date, receiptRef: inc.receiptRef
        });
    });

    input.expenses.forEach(exp => {
        transactionHistory.push({
            id: exp.id, month: input.month, type: 'Expense', description: exp.category, amount: exp.amount,
            bank: exp.bank, date: exp.date, receiptRef: exp.receiptRef, isTaxDeductible: exp.isTaxDeductible
        });
    });
  });

  const breakdown = Object.values(aggregatedBreakdownMap);

  let periodLabel = 'Monthly';
  if (isFullAnnualMode) periodLabel = 'Annual (Full Year)';
  else if (monthsCount === 12) periodLabel = 'Annual (Breakdown)';
  else if (monthsCount === 1) periodLabel = selectedMonths[0] || 'Monthly';
  else periodLabel = `${monthsCount} Selected Months`;

  return {
    grossIncome: totalGross,
    consolidatedRelief: totalCRA,
    pension: totalPension,
    taxableIncome: totalTaxable,
    payeTax: totalTax,
    netIncome: totalNet,
    breakdown: breakdown,
    period: periodLabel,
    durationMonths: isFullAnnualMode ? 12 : monthsCount,
    selectedMonths: selectedMonths,
    effectiveTaxRate: totalGross > 0 ? (totalTax / totalGross) * 100 : 0,
    dailyNet: totalNet / ((isFullAnnualMode ? 12 : monthsCount) * 30),
    totalTaxDeductible: totalTaxDeductible,
    totalPersonalExpenses: totalPersonalExpenses,
    finalBalance: totalFinal,
    transactionHistory: transactionHistory
  };
};

export const formatCurrency = (amount: number, currency: string = 'NGN') => {
  const config = CURRENCIES[currency] || CURRENCIES.NGN;
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
