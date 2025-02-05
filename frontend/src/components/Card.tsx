import React from 'react';

interface CardProps {
  isDarkMode: boolean;
  onClick?: () => void;
  isSelected?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ isDarkMode, onClick, isSelected, children }) => {
  return (
    <div
      onClick={onClick}
      className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} 
                rounded-xl shadow-lg overflow-hidden
                ${onClick ? 'cursor-pointer transform hover:scale-105 transition-transform duration-200' : ''}
                ${isSelected ? 'ring-2 ring-indigo-600' : ''}`}
    >
      {children}
    </div>
  );
};