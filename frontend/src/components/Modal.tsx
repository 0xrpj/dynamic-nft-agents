import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  isDarkMode?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  isDarkMode = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-md p-6 rounded-lg shadow-xl ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className={`p-1 rounded-full hover:bg-opacity-10 ${
              isDarkMode ? 'hover:bg-white' : 'hover:bg-gray-800'
            }`}
          >
            <X size={20} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}