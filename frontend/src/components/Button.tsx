import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface ButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'success';
  icon?: LucideIcon;
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
  const baseStyles = 'text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2';
  const variantStyles = {
    primary: 'bg-indigo-600 hover:bg-indigo-700',
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