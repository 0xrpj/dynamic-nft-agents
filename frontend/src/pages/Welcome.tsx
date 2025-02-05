import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';

interface WelcomeProps {
  isDarkMode: boolean;
}

export const Welcome: React.FC<WelcomeProps> = ({ isDarkMode }) => {
  const navigate = useNavigate();

  return (
    <div className="text-center max-w-2xl mx-auto p-8">
      <div className="mb-8">
        <Gamepad2 className={`w-16 h-16 mx-auto ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
      </div>
      <h1 className={`text-4xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        Guess the Word
      </h1>
      <p className={`text-lg mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        Welcome to an exciting word guessing adventure! Team up with your NFT agent
        companion to solve word puzzles and earn points. Use strategic questions to
        get hints and guide you to victory!
      </p>
      <button
        onClick={() => {
          console.log('Starting game from welcome page');
          navigate('/select-nft');
        }}
        className={`bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold
                   hover:bg-indigo-700 transition-colors duration-200`}
      >
        Connect Wallet
      </button>
    </div>
  );
}