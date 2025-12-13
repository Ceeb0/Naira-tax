import { MonthlyInput, TaxResult, TaxBandBreakdown, Transaction, SalaryTier } from '../types';

export const CURRENCIES: Record<string, { symbol: string, locale: string, name: string }> = {
  NGN: { symbol: '₦', locale: 'en-NG', name: 'Naira' },
  USD: { symbol: '$', locale: 'en-US', name: 'Dollar' },
  GBP: { symbol: '£', locale: 'en-GB', name: 'Pound' },
  EUR: { symbol: '€', locale: 'en-IE', name: 'Euro' },
};

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
  "Access Bank",
  "Access Bank (Diamond)",
  "ALAT by WEMA",
  "Citibank Nigeria",
  "Ecobank Nigeria",
  "Fidelity Bank",
  "First Bank of Nigeria",
  "First City Monument Bank (FCMB)",
  "Globus Bank",
  "Guaranty Trust Bank (GTBank)",
  "Heritage Bank",
  "Jaiz Bank",
  "Keystone Bank",
  "Kuda Bank",
  "Lotus Bank",
  "Moniepoint Microfinance Bank",
  "Opay (Paycom)",
  "Optimus Bank",
  "PalmPay",
  "Parallex Bank",
  "Polaris Bank",
  "Premium Trust Bank",
  "Providus Bank",
  "Stanbic IBTC Bank",
  "Standard Chartered Bank",
  "Sterling Bank",
  "SunTrust Bank",
  "Taj Bank",
  "Titan Trust Bank",
  "Union Bank of Nigeria",
  "United Bank for Africa (UBA)",
  "Unity Bank",
  "VFD Microfinance Bank",
  "Wema Bank",
  "Zenith Bank"
];

/**
 * Determines the salary tier based on monthly income amount.
 */
export const getSalaryTier = (amount: number): SalaryTier => {
  if (amount < 200000) return SalaryTier.LOW;
  if (amount < 1000000) return SalaryTier.MID;
  if (amount < 5000000) return SalaryTier.HIGH;
  return SalaryTier.ELITE;
};

/**
 * Calculates tax for a single month's data by annualizing it, 
 * calculating annual liability, then dividing by 12.
 */
const calculateSingleMonth = (input: MonthlyInput, customTaxRate?: number) => {
  // 1. Total Monthly Income
  const totalMonthlyIncome = input.incomeSources.reduce((sum, source) => sum + source.amount, 0);

  // 2. Expenses (Annualize)
  let annualTaxDeductible = 0;
  let annualPersonalExpenses = 0;

  input.expenses.forEach(exp => {
    const annualAmount = exp.amount * 12;
    if (exp.isTaxDeductible) {
      annualTaxDeductible += annualAmount;
    } else {
      annualPersonalExpenses += annualAmount;
    }
  });

  // 3. Annual Gross
  const annualGross = totalMonthlyIncome * 12;

  // 4. Pension (8%)
  const annualPension = annualGross * 0.08;

  // 5. CRA
  const onePercentGross = annualGross * 0.01;
  const fixedRelief = 200000;
  const baseRelief = Math.max(fixedRelief, onePercentGross);
  const twentyPercentGross = annualGross * 0.20;
  const annualCRA = baseRelief + twentyPercentGross;

  // 6. Taxable Income
  let annualTaxable = annualGross - annualCRA - annualPension - annualTaxDeductible;
  if (annualTaxable < 0) annualTaxable = 0;

  // 7. Calculate Tax
  let annualTax = 0;
  const breakdown: TaxBandBreakdown[] = [];

  if (customTaxRate !== undefined && !isNaN(customTaxRate)) {
      const rateDecimal = customTaxRate / 100;
      annualTax = annualTaxable * rateDecimal;
  } else {
      let remainingTaxable = annualTaxable;
      const bands = [
        { limit: 300000, rate: 0.07 },
        { limit: 300000, rate: 0.11 },
        { limit: 500000, rate: 0.15 },
        { limit: 500000, rate: 0.19 },
        { limit: 1600000, rate: 0.21 },
        { limit: Infinity, rate: 0.24 },
      ];

      for (const band of bands) {
        if (remainingTaxable <= 0) break;
        const taxableAmount = Math.min(remainingTaxable, band.limit);
        const taxAmount = taxableAmount * band.rate;
        annualTax += taxAmount;
        remainingTaxable -= taxableAmount;
        
        if (taxAmount > 0) {
             breakdown.push({
                band: band.limit === Infinity ? 'Above ₦3.2M' : `Next ₦${(band.limit / 1000).toFixed(0)}k`,
                rate: band.rate,
                amount: taxAmount // Annual amount
             });
        }
      }
  }

  // 8. Monthly Values (Divide Annual by 12)
  return {
    gross: totalMonthlyIncome,
    pension: annualPension / 12,
    cra: annualCRA / 12,
    taxable: annualTaxable / 12,
    tax: annualTax / 12,
    taxDeductible: annualTaxDeductible / 12,
    personalExpenses: annualPersonalExpenses / 12,
    net: (annualGross - annualPension - annualTax - annualTaxDeductible) / 12,
    final: ((annualGross - annualPension - annualTax - annualTaxDeductible) - annualPersonalExpenses) / 12,
    breakdown // Annual breakdown structure, we'll scale it later if needed or just aggregate numbers
  };
};

export const calculateTax = (monthlyInputs: MonthlyInput[], customTaxRate?: number): TaxResult => {
  const selectedMonths = monthlyInputs.map(m => m.month);
  const monthsCount = monthlyInputs.length || 1;

  // Aggregate accumulators
  let totalGross = 0;
  let totalPension = 0;
  let totalCRA = 0;
  let totalTaxable = 0;
  let totalTax = 0;
  let totalTaxDeductible = 0;
  let totalPersonalExpenses = 0;
  let totalNet = 0;
  let totalFinal = 0;

  // History Ledger
  const transactionHistory: Transaction[] = [];

  // We will average the breakdown for display purposes, or sum them. 
  // Summing makes sense for the "Total Period" view.
  const aggregatedBreakdownMap: Record<string, TaxBandBreakdown> = {};

  monthlyInputs.forEach(input => {
    // 1. Process Calculation
    const res = calculateSingleMonth(input, customTaxRate);
    
    totalGross += res.gross;
    totalPension += res.pension;
    totalCRA += res.cra;
    totalTaxable += res.taxable;
    totalTax += res.tax;
    totalTaxDeductible += res.taxDeductible;
    totalPersonalExpenses += res.personalExpenses;
    totalNet += res.net;
    totalFinal += res.final;

    // 2. Aggregate Breakdown
    res.breakdown.forEach(b => {
        if (!aggregatedBreakdownMap[b.band]) {
            aggregatedBreakdownMap[b.band] = { ...b, amount: 0 };
        }
        aggregatedBreakdownMap[b.band].amount += (b.amount / 12);
    });

    // 3. Populate History
    input.incomeSources.forEach(inc => {
        transactionHistory.push({
            id: inc.id,
            month: input.month,
            type: 'Income',
            description: inc.description,
            amount: inc.amount,
            bank: inc.bank,
            date: inc.date,
            receiptRef: inc.receiptRef
        });
    });

    input.expenses.forEach(exp => {
        transactionHistory.push({
            id: exp.id,
            month: input.month,
            type: 'Expense',
            description: exp.category,
            amount: exp.amount,
            bank: exp.bank,
            date: exp.date,
            receiptRef: exp.receiptRef,
            isTaxDeductible: exp.isTaxDeductible
        });
    });
  });

  const breakdown = Object.values(aggregatedBreakdownMap);

  // Determine Period Label
  let periodLabel = 'Monthly';
  if (monthsCount === 12 && selectedMonths.length === 12) periodLabel = 'Annual (Full Year)';
  else if (monthsCount === 1) periodLabel = selectedMonths[0] || 'Monthly';
  else {
      if (monthsCount <= 3) {
          const last = selectedMonths[monthsCount - 1];
          const rest = selectedMonths.slice(0, monthsCount - 1).join(', ');
          periodLabel = `${rest} & ${last}`;
      } else {
          periodLabel = `${monthsCount} Selected Months`;
      }
  }

  return {
    grossIncome: totalGross,
    consolidatedRelief: totalCRA,
    pension: totalPension,
    taxableIncome: totalTaxable,
    payeTax: totalTax,
    netIncome: totalNet,
    breakdown: breakdown,
    period: periodLabel,
    durationMonths: monthsCount,
    selectedMonths: selectedMonths,
    effectiveTaxRate: totalGross > 0 ? (totalTax / totalGross) * 100 : 0,
    dailyNet: totalNet / (monthsCount * 30),
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
