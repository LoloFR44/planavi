'use client';

import { useEffect, useState } from 'react';

interface ToastMessageProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function ToastMessage({ type, message, onClose, duration = 3000 }: ToastMessageProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      } ${
        type === 'success'
          ? 'bg-[#3db54a]/10 border border-[#3db54a]/20 text-[#2d8a38]'
          : 'bg-red-50 border border-red-200 text-red-800'
      }`}
    >
      <div className="flex items-center gap-2">
        <span>{type === 'success' ? '✓' : '✗'}</span>
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}
