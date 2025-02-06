import React from 'react';

interface CardProps {
  isDarkMode: boolean;
  onClick?: () => void;
  selectedNFTId?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ isDarkMode, onClick, selectedNFTId, children }) => {
  return (
    <div
      onClick={onClick}
      className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} 
                rounded-xl shadow-lg overflow-hidden
                ${onClick ? 'cursor-pointer transform hover:scale-105 transition-transform duration-200' : ''}
                ${selectedNFTId ? 'ring-2 ring-indigo-600' : ''}`}
    >
      {children}
    </div>
  );
};