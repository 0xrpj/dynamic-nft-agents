import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { NFTCharacter } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useLogin } from "../context/UserContext";

interface GamePlayProps {
  nft: NFTCharacter;
  isDarkMode: boolean;
}

export const GamePlay: React.FC<GamePlayProps> = ({ nft, isDarkMode }) => {
  const [question, setQuestion] = useState('');
  const [guess, setGuess] = useState('');
  const { logOut } = useLogin();

  return (
    <div className="p-20">
      <div className={`p-4 rounded-lg mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-indigo-100'}`}>
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-800'}`}>
          Category: "Food"
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-3">
          <Card isDarkMode={isDarkMode} >
            <div className="p-8">
              <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Guessing Area
              </h3>
              <div className="flex gap-4">
              <Input
                isDarkMode={isDarkMode}
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Type your guess..."
                className="w-full mb-4"
              />
              <Button className="mb-4"
                onClick={() => {
                  console.log('Submitted guess:', guess);
                }}
                variant="success"
              >
                Submit
              </Button>
              </div>
              <div className="flex gap-4">
                <Input
                  isDarkMode={isDarkMode}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1"
                />
                <Button 
                  onClick={() => {
                    console.log('Asked question:', question);
                  }}
                  icon={MessageCircle}
                >
                  Ask
                </Button>
              </div>
            </div>
            
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card isDarkMode={isDarkMode}>
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {nft.name}
                  </h3>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Your AI Assistant
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                  Howdy mate! Let's win this game. You can always ask for my help.
                </p>
              </div>

              <div className="flex gap-4">
                <Input
                  isDarkMode={isDarkMode}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask help"
                  className="flex-1"
                />
                <Button
                  onClick={() => {
                    console.log('Asked question:', question);
                  }}
                  icon={MessageCircle}
                >
                  Ask
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <button
        onClick={logOut}
        className={`absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded ${
          isDarkMode
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-red-500 text-white hover:bg-red-600"
        }`}
      >
        Logout
      </button>
    </div>
  );
};