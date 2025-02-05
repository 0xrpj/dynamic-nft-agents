import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Moon, Sun } from 'lucide-react';

interface LayoutProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ isDarkMode, onToggleDarkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    const paths = {
      '/gameplay': '/select-category',
      '/select-category': '/select-nft',
      '/select-nft': '/'
    };
    navigate(paths[location.pathname as keyof typeof paths] || '/');
    console.log('Navigating back');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      {/* Navigation and Theme Toggle */}
      <div className="fixed top-4 right-4 left-4 flex justify-between items-center z-10">
        {location.pathname !== '/' && (
          <button
            onClick={handleBack}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg
                     ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'}
                     transition-colors duration-200`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        )}
        <button
          onClick={() => {
            console.log('Toggling dark mode');
            onToggleDarkMode();
          }}
          className={`p-2 rounded-lg ml-auto
                   ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'}
                   transition-colors duration-200`}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="pt-16">
        <Outlet />
      </div>
    </div>
  );
}