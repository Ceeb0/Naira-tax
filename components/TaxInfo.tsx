
import React from 'react';
import { ShieldCheck, Info, Briefcase, Landmark, BookOpen, AlertCircle } from 'lucide-react';

// Fixed: Added optional modifier to children prop to resolve TS errors in JSX usage where children are passed as tag content
const TaxSection = ({ title, icon: Icon, children, colorClass = "text-gold-500" }: { title: string, icon: any, children?: React.ReactNode, colorClass?: string }) => (
  <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm space-y-3">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-gray-50 dark:bg-white/5 ${colorClass}`}>
        <Icon size={20} />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display">{title}</h3>
    </div>
    <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-2">
      {children}
    </div>
  </div>
);

const TaxInfo: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 py-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Tax Guide & Tips</h2>
        <p className="text-gray-500 dark:text-gray-400">Understanding Nigerian Tax Act 2025 Regulations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TaxSection title="VAT – Sales Tax" icon={Landmark}>
          <p>7.5% on all sales. You collect it from customers, then pay government.</p>
          <div className="bg-gray-50 dark:bg-black/20 p-3 rounded-xl border border-dashed border-gray-200 dark:border-white/10 mt-2">
            <p className="font-mono text-[11px] text-gray-500">Example: Sell ₦100,000 item</p>
            <p className="font-mono text-[11px] text-gray-700 dark:text-gray-300">Customer pays: ₦107,500 (₦7.5k VAT)</p>
          </div>
        </TaxSection>

        <TaxSection title="CIT – Business Tax" icon={Briefcase}>
          <p>Small Companies Pay No Tax (NTA 2025).</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Under ₦100M turnover → <span className="text-green-500 font-bold">0% tax ✅</span></li>
            <li>Over ₦100M turnover → 30% tax</li>
          </ul>
          <p className="text-xs italic opacity-60">Note: The 20% medium tax was abolished.</p>
        </TaxSection>

        <TaxSection title="Development Levy" icon={ShieldCheck} colorClass="text-blue-500">
          <p>Replaces old flat-rate system and Education Tax.</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Small companies (≤ ₦100M): Exempt</li>
            <li>Others: 4% of assessable profits</li>
          </ul>
        </TaxSection>

        <TaxSection title="PAYE – Employment Tax" icon={Info} colorClass="text-purple-500">
          <p className="font-bold">Your First ₦800,000 is Free.</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>₦800K – ₦3M: 15%</li>
            <li>₦3M – ₦12M: 18%</li>
            <li>₦12M – ₦50M: 21%</li>
            <li>Above ₦50M: 23%</li>
          </ul>
        </TaxSection>

        <TaxSection title="CGT – Capital Gains Tax" icon={BookOpen} colorClass="text-orange-500">
          <p>Tax on selling assets like land or shares.</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Companies: 30% flat rate</li>
            <li>Individuals: Progressive PIT rates</li>
            <li>Small companies (≤ ₦100M): Exempt</li>
          </ul>
        </TaxSection>

        <TaxSection title="WHT – Withholding Tax" icon={AlertCircle} colorClass="text-red-500">
          <p>Different payments, different rates.</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Rent payments: 10%</li>
            <li>Professional services: 5%</li>
            <li>Contract work: 5%</li>
          </ul>
        </TaxSection>
      </div>

      <div className="bg-royal-900 text-white p-6 rounded-3xl text-center space-y-2">
        <p className="text-sm font-medium opacity-80">Other Taxes Included in NTA 2025:</p>
        <div className="flex flex-wrap justify-center gap-4 text-xs font-bold uppercase tracking-widest">
            <span className="bg-white/10 px-3 py-1 rounded-full">Stamp Duties (₦50 per 1k)</span>
            <span className="bg-white/10 px-3 py-1 rounded-full">Petroleum Profits Tax (PPT)</span>
            <span className="bg-white/10 px-3 py-1 rounded-full">Business Premises Levy</span>
        </div>
      </div>
    </div>
  );
};

export default TaxInfo;
