import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface ButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'success';
  icon?: any;
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  onClick,
  variant = 'primary',
  icon: Icon,
  children,
  className = ''
}) => {
  const baseStyles = 'text-white px-6 py-2 transition-colors duration-200 flex items-center gap-2 rounded-[18px]';
  const variantStyles = {
    primary: 'bg-sky-700 hover:bg-sky-800',
    success: 'bg-green-600 hover:bg-green-700'
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );
};