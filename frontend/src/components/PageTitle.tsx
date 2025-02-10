import React from 'react';

interface PageTitleProps {
  isDarkMode: boolean;
  children: React.ReactNode;
}

export const PageTitle: React.FC<PageTitleProps> = ({ isDarkMode, children }) => {
  return (
    <h2 className={`text-3xl font-mono mb-8 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
      {children}
    </h2>
  );
};