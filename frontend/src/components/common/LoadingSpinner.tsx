import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 24, className }) => {
  return (
    <div className={cn("flex justify-center items-center min-h-[200px]", className)}>
      <Loader2 className={cn("animate-spin", `w-${size/4} h-${size/4}`)} />
    </div>
  );
};

export default LoadingSpinner;