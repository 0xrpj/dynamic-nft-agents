import React from 'react';

interface InputProps {
  isDarkMode: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  className?: string;
  onKeyDown?: (e:React.KeyboardEvent<HTMLInputElement>) => void;
}

export const Input: React.FC<InputProps> = ({
  isDarkMode,
  value,
  onChange,
  placeholder,
  className = '',
  onKeyDown
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`p-3 rounded-lg border ${
        isDarkMode
          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
          : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
      } ${className}`}
      onKeyDown = {onKeyDown}
    />
  );
};