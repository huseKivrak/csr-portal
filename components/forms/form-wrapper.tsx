'use client';

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SuccessCard } from '../cards/success-card';
import { toast } from 'sonner';
import { Card } from '../ui/card';

interface FormWrapperProps {
  successTitle: string;
  successMessage: string;
  showSuccessCard?: boolean;
  onSuccess?: () => void;
  children: (onSuccess: () => void) => ReactNode;
}

export function FormWrapper({
  successTitle,
  successMessage,
  showSuccessCard = true,
  onSuccess,
  children,
}: FormWrapperProps) {
  const [ isSubmitted, setIsSubmitted ] = useState(false);

  const combinedOnSuccess = () => {
    if (showSuccessCard) {
      setIsSubmitted(true);
    } else {
      toast.success(successTitle);
    }
    onSuccess?.();
  };

  return (
    <Card className="w-full max-w-7xl p-6">
      <AnimatePresence mode="wait">
        {isSubmitted && showSuccessCard ? (
          <motion.div>
            <SuccessCard
              title={successTitle}
              message={successMessage}
              onReset={() => setIsSubmitted(false)}
            />
          </motion.div>
        ) : (
          <motion.div>
            <div className="space-y-4">
              {children(combinedOnSuccess)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
