import React, { useEffect, useState } from 'react';
import { Phone, Mail, User, Star, Award, ShieldCheck } from 'lucide-react';

interface ConsultantProfile {
    name: string;
    title: string;
    gender: string;
    email: string;
    phone: string;
    picture: string;
}

const ConsultantAd: React.FC = () => {
    const [consultant, setConsultant] = useState<ConsultantProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConsultant = async () => {
            try {
                // Using randomuser.me to simulate fetching consultant data from a URL as requested
                const response = await fetch('https://randomuser.me/api/?results=1&inc=name,email,phone,picture,gender&nat=us,gb');
                const data = await response.json();
                const result = data.results[0];
                
                setConsultant({
                    name: `${result.name.first} ${result.name.last}`,
                    title: 'Senior Tax Consultant',
                    gender: result.gender,
                    email: result.email,
                    phone: result.phone,
                    picture: result.picture.large
                });
            } catch (error) {
                console.error("Failed to load consultant data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchConsultant();
    }, []);

    if (loading) return null; // Or a skeleton loader
    if (!consultant) return null;

    return (
        <div className="w-full max-w-lg mt-8 animate-fade-in-up delay-200">
            <div className="relative bg-white dark:bg-[#0B1533] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden group">
                {/* Decorative Badge */}
                <div className="absolute top-0 right-0 bg-gold-400 text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    Featured Expert
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Profile Image */}
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full p-[2px] bg-gradient-to-tr from-gold-400 to-yellow-600">
                            <img 
                                src={consultant.picture} 
                                alt={consultant.name} 
                                className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#0B1533]"
                            />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full border-2 border-white dark:border-[#0B1533]">
                            <ShieldCheck size={12} />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="text-center sm:text-left flex-1 space-y-2">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display">
                                {consultant.name}
                            </h3>
                            <p className="text-gold-500 font-medium text-xs uppercase tracking-wide flex items-center justify-center sm:justify-start gap-1">
                                <Award size={12} /> {consultant.title}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Mail size={14} className="text-gray-400" />
                                {consultant.email}
                            </div>
                            <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Phone size={14} className="text-gray-400" />
                                {consultant.phone}
                            </div>
                        </div>

                        <div className="pt-2 flex justify-center sm:justify-start">
                             <button className="px-4 py-1.5 bg-gray-100 dark:bg-white/5 hover:bg-gold-400 dark:hover:bg-gold-400 hover:text-black transition-colors rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300">
                                 Book Consultation
                             </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <p className="text-center text-[10px] text-gray-400 mt-2 uppercase tracking-widest opacity-60">Sponsored Advertisement</p>
        </div>
    );
};

export default ConsultantAd;