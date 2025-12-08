import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TaxResult, ChartData } from '../types';

interface ChartsProps {
  result: TaxResult;
}

const COLORS = ['#F2C94C', '#EF4444', '#3B82F6', '#10B981'];

export const IncomePieChart: React.FC<{ result: TaxResult }> = ({ result }) => {
  const data: ChartData[] = [
    { name: 'Net Income', value: result.netIncome, color: '#10B981' }, // Green
    { name: 'Tax (PAYE)', value: result.payeTax, color: '#EF4444' }, // Red
    { name: 'Pension', value: result.pension, color: '#F2C94C' }, // Gold
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `₦${value.toLocaleString()}`}
            contentStyle={{ backgroundColor: '#0A1A44', border: '1px solid #F2C94C', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: '#F2C94C' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-2 text-xs font-medium">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1">
             <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></span>
             <span className="text-gray-600 dark:text-gray-300">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TaxBarChart: React.FC<{ result: TaxResult }> = ({ result }) => {
  const data = [
    { name: 'Gross', amount: result.grossIncome },
    { name: 'Taxable', amount: result.taxableIncome },
    { name: 'Net', amount: result.netIncome },
  ];

  return (
    <div className="h-64 w-full mt-6">
       <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.1} />
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={12} width={60} tickLine={false} axisLine={false} />
          <Tooltip 
             cursor={{fill: 'rgba(255,255,255,0.05)'}}
             formatter={(value: number) => `₦${value.toLocaleString()}`}
             contentStyle={{ backgroundColor: '#0A1A44', border: '1px solid #F2C94C', borderRadius: '8px', color: '#fff' }}
          />
          <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? '#3B82F6' : index === 1 ? '#F2C94C' : '#10B981'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
