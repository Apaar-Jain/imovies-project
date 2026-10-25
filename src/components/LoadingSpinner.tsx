import React from 'react';
import { Film } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({
  message = 'Loading cinema experience...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
      <div className="relative w-14 h-14 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-gray-800 border-t-red-500 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-red-500">
          <Film className="w-6 h-6 animate-pulse" />
        </div>
      </div>
      <p className="text-sm font-medium text-gray-400">{message}</p>
    </div>
  );
};
