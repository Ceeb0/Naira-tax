import { FinancialInput, TaxResult, TaxBandBreakdown } from '../types';

export const calculateTax = (input: FinancialInput, isAnnualView: boolean): TaxResult => {
  // Convert everything to Annual first for accurate tax band calculation
  const annualGross = (input.monthlyIncome + input.additionalEarnings) * 12;

  // 1. Pension: Assume 8% of Gross (Simplified standard for calculators)
  // In strict law, it's 8% of Basic + Housing + Transport, but usually ~80% of Gross. 
  // We will use 8% of Gross for a conservative estimate.
  const annualPension = annualGross * 0.08;

  // 2. CRA (Consolidated Relief Allowance)
  // Higher of 200,000 or 1% of Gross + 20% of Gross
  const onePercentGross = annualGross * 0.01;
  const fixedRelief = 200000;
  const baseRelief = Math.max(fixedRelief, onePercentGross);
  const twentyPercentGross = annualGross * 0.20;
  const annualCRA = baseRelief + twentyPercentGross;

  // 3. Taxable Income
  let annualTaxable = annualGross - annualCRA - annualPension;
  if (annualTaxable < 0) annualTaxable = 0;

  // 4. PAYE Tax Bands
  let tax = 0;
  let remainingTaxable = annualTaxable;
  const breakdown: TaxBandBreakdown[] = [];

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
    
    tax += taxAmount;
    remainingTaxable -= taxableAmount;

    if (taxAmount > 0) {
      breakdown.push({
        band: band.limit === Infinity ? 'Above ₦3.2M' : `Next ₦${(band.limit / 1000).toFixed(0)}k`,
        rate: band.rate,
        amount: taxAmount
      });
    }
  }

  // 1% Minimum Tax Rule: If calculated tax is less than 1% of Gross, pay 1% of Gross.
  // Note: This usually applies to small companies or specific scenarios, but generally for individuals
  // the bands apply. If taxable income is zero due to reliefs, min tax might apply.
  // For standard employee calculators, we stick to the bands.

  // 5. Final Net
  const annualNet = annualGross - annualPension - tax;

  // Return based on view
  const divisor = isAnnualView ? 1 : 12;

  return {
    grossIncome: annualGross / divisor,
    consolidatedRelief: annualCRA / divisor,
    pension: annualPension / divisor,
    taxableIncome: annualTaxable / divisor,
    payeTax: tax / divisor,
    netIncome: annualNet / divisor,
    breakdown: breakdown.map(b => ({ ...b, amount: b.amount / divisor })),
    period: isAnnualView ? 'Annual' : 'Monthly'
  };
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
