import { CheckCircle2, Circle, Loader2, AlertCircle } from 'lucide-react';

const STEPS = [
  { id: 'CART', label: 'Cart' },
  { id: 'PAYMENT', label: 'Payment' },
  { id: 'PROCESS', label: 'Process' },
  { id: 'DONE', label: 'Done' }
];

export function OrderTimeline({ currentState }) {
  // Map exact machine states to timeline steps to ensure proper coloring
  const getStepIndex = (state) => {
    if (['CART', 'ORDER_INCONSISTENT', 'ROLLED_BACK'].includes(state)) return 0;
    if (['PAYMENT_PENDING', 'PAYMENT_DECLINED', 'FRAUD_HOLD', 'ORDER_FAILED'].includes(state)) return 1;
    if (['CONFIRMED', 'FULFILLMENT', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERY_FAILED'].includes(state)) return 2;
    if (['DELIVERED', 'RETURN_INITIATED', 'CLOSED', 'CANCELLED'].includes(state)) return 3;
    return 0; 
  };

  const currentIdx = getStepIndex(currentState);
  const isError = ['PAYMENT_DECLINED', 'FRAUD_HOLD', 'ORDER_FAILED', 'DELIVERY_FAILED', 'ORDER_INCONSISTENT', 'ROLLED_BACK'].includes(currentState);

  return (
    <div className="flex justify-between py-6 gap-2">
      {STEPS.map((step, idx) => {
        const isComplete = idx < currentIdx || currentState === 'DELIVERED' || currentState === 'CLOSED';
        const isActive = idx === currentIdx;
        
        let icon = <Circle size={16} />;
        let borderColor = 'border-gray-200 text-gray-300';
        let textColor = 'text-gray-400';

        if (isComplete) {
          icon = <CheckCircle2 size={16} />;
          borderColor = 'border-green-500 text-green-500';
          textColor = 'text-green-500';
        } else if (isActive) {
          if (isError) {
            icon = <AlertCircle size={16} />;
            borderColor = 'border-red-500 text-red-500 shadow-md';
            textColor = 'text-red-500';
          } else if (currentState === 'PAYMENT_PENDING') {
            icon = <Loader2 size={16} className="animate-spin" />;
            borderColor = 'border-blue-600 text-blue-600 shadow-md';
            textColor = 'text-blue-600';
          } else {
            icon = <Circle size={16} fill="currentColor" />;
            borderColor = 'border-blue-600 text-blue-600 shadow-md';
            textColor = 'text-blue-600';
          }
        }

        return (
          <div key={step.id} className="flex flex-col items-center flex-1 relative">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 z-10 bg-white transition-colors duration-300 ${borderColor}`}>
              {icon}
            </div>
            <span className={`mt-2 text-[9px] font-bold uppercase tracking-tighter transition-colors duration-300 ${textColor}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}