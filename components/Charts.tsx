import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { TaxResult, ChartData } from '../types';
import { formatCurrency } from '../utils/taxLogic';

interface ChartsProps {
  result: TaxResult;
  currency: string;
}

const COLORS = {
  net: '#10B981', // Green
  tax: '#EF4444', // Red
  pension: '#F2C94C', // Gold
  deductible: '#8B5CF6', // Purple (NHF, NHIS)
  expense: '#F97316', // Orange (Rent, Food)
  balance: '#3B82F6' // Blue (Final)
};

export const IncomePieChart: React.FC<ChartsProps> = ({ result, currency }) => {
  // Logic: 
  // 1. Statutory Deductions (Tax + Pension + TaxDeductibleExpenses)
  // 2. Personal Expenses
  // 3. Final Balance
  
  const data: ChartData[] = [
    { name: 'Final Savings/Bal', value: result.finalBalance, color: COLORS.balance },
    { name: 'Personal Expenses', value: result.totalPersonalExpenses, color: COLORS.expense },
    { name: 'Tax (PAYE)', value: result.payeTax, color: COLORS.tax },
    { name: 'Pension', value: result.pension, color: COLORS.pension },
  ];

  if (result.totalTaxDeductible > 0) {
    data.push({ name: 'Tax Exempt (NHF/NHIS)', value: result.totalTaxDeductible, color: COLORS.deductible });
  }

  // Filter out zero values
  const activeData = data.filter(d => d.value > 0);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={activeData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {activeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => formatCurrency(value, currency)}
            contentStyle={{ backgroundColor: '#0A1A44', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
            itemStyle={{ color: '#F2C94C' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TaxBarChart: React.FC<ChartsProps> = ({ result, currency }) => {
  const data = [
    { name: 'Gross', amount: result.grossIncome, fill: '#6B7280' },
    { name: 'Taxable', amount: result.taxableIncome, fill: '#F2C94C' },
    { name: 'Net', amount: result.netIncome, fill: '#10B981' },
    { name: 'Dispos.', amount: result.finalBalance, fill: '#3B82F6' },
  ];

  return (
    <div className="h-64 w-full mt-2">
       <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.1} />
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={12} width={50} tickLine={false} axisLine={false} />
          <Tooltip 
             cursor={{fill: 'rgba(255,255,255,0.05)'}}
             formatter={(value: number) => formatCurrency(value, currency)}
             contentStyle={{ backgroundColor: '#0A1A44', border: '1px solid #F2C94C', borderRadius: '8px', color: '#fff' }}
          />
          <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
