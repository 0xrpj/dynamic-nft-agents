import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, LogOut, Moon, Sun } from 'lucide-react';
import { useLogin } from '../context/UserContext';
import { Button } from './Button';


interface LayoutProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ isDarkMode, onToggleDarkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logOut } = useLogin();

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
    <div className={`min-h-screen ${isDarkMode ? 'text-white' : 'bg-gray-50 text-gray-800'}`} style={{ "backgroundColor": "#160720" }}>
      {/* Navigation and Theme Toggle */}
      <div className="fixed top-4 right-4 left-4 flex justify-between items-center z-10 ml-[30px] mr-[30px]">
        {location.pathname !== '/' && (
          <Button
            onClick={handleBack}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg
                     ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'}
                     transition-colors duration-200`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>
        )}

        {location.pathname !== '/' && (

          <Button
            onClick={logOut}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg
                     ${isDarkMode ? 'bg-red-900 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'}
                     transition-colors duration-200`}
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </Button>
        )}

      </div>

      <div className="pt-16">
        <Outlet />
      </div>
    </div>
  );
}