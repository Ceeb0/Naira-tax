import React, { useEffect, useState, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

export interface TourStep {
  targetId: string;
  title: string;
  content: string;
}

interface TourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const Tour: React.FC<TourProps> = ({ steps, isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (isOpen) {
      updateTargetRect();
      // Lock scrolling if desired, or handle window resize/scroll events
      window.addEventListener('resize', updateTargetRect);
      window.addEventListener('scroll', updateTargetRect);
    }
    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect);
    };
  }, [isOpen, currentStep]);

  const updateTargetRect = () => {
    const step = steps[currentStep];
    if (!step) return;

    // Special case for global/center steps (targetId = 'body')
    if (step.targetId === 'body') {
        setTargetRect(null);
        return;
    }

    const element = document.getElementById(step.targetId);
    if (element) {
      setTargetRect(element.getBoundingClientRect());
      // Scroll to element if off-screen
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        // Fallback if element not found, just show centered
        setTargetRect(null);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  const isCentered = !targetRect || step.targetId === 'body';

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Backdrop with "Spotlight" effect using box-shadow trick or simpler distinct overlay */}
      {/* Since box-shadow cutout is complex with scrolling, we will use a simpler approach:
          A full dark background, and we render a "highlight" box absolutely positioned over the target
          with a huge z-index, but pointer-events-none so users can't click it but see it.
          Wait, to block clicks outside, we need the overlay to capture events.
      */}
      
      <div className="absolute inset-0 bg-black/60 transition-colors duration-500">
         {/* Spotlight Box */}
         {!isCentered && targetRect && (
             <div 
                className="absolute border-2 border-gold-400 box-content shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] rounded-xl transition-all duration-300"
                style={{
                    top: targetRect.top - 4,
                    left: targetRect.left - 4,
                    width: targetRect.width + 8,
                    height: targetRect.height + 8,
                }}
             >
                {/* Pulse animation around target */}
                <div className="absolute inset-0 border border-gold-400 rounded-xl animate-ping opacity-30"></div>
             </div>
         )}
      </div>

      {/* Tooltip Card */}
      <div 
        className={`absolute max-w-sm w-[90%] bg-white dark:bg-[#0B1533] p-6 rounded-2xl shadow-2xl border border-gold-400/20 transition-all duration-500 flex flex-col gap-4 animate-scale-in`}
        style={isCentered ? {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
        } : {
            // Position below or above
            top: (targetRect!.bottom + 20 > window.innerHeight - 200) ? Math.max(20, targetRect!.top - 200) : targetRect!.bottom + 20,
            left: Math.max(20, Math.min(window.innerWidth - 320, targetRect!.left)),
            width: '320px'
        }}
      >
        <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold font-display text-gray-900 dark:text-white">
                {step.title}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={20} />
            </button>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {step.content}
        </p>

        <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-100 dark:border-white/10">
            <div className="flex gap-1">
                {steps.map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1.5 rounded-full transition-all ${i === currentStep ? 'w-6 bg-gold-400' : 'w-1.5 bg-gray-200 dark:bg-white/10'}`}
                    />
                ))}
            </div>
            
            <div className="flex gap-2">
                {currentStep > 0 && (
                    <button 
                        onClick={handlePrev}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                )}
                <button 
                    onClick={handleNext}
                    className="flex items-center gap-2 px-4 py-2 bg-royal-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                >
                    {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                    {currentStep === steps.length - 1 ? <Check size={16} /> : <ChevronRight size={16} />}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Tour;