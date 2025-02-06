import React, { useState } from 'react';
import { MessageCircle, Send, Trophy } from 'lucide-react';
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
  const [suggestedquestion, setSuggestedQuestion] = useState("");
  const [guess, setGuess] = useState('');
  const { logOut } = useLogin();
  const [messages, setMessages] = useState('');
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    console.log({messages})
    setMessages(input);
    setInput("");
  };

  const handleAskHint = () => {
    console.log('Asked question:', question);
    setSuggestedQuestion("Is it found in my room?")
  }
  return (
    <div className="p-20 pt-0">
      <div className="flex justify-end items-center">
        <div
          className={`flex justify-between items-center gap-2 px-4 py-2 rounded-lg mb-8
                      ${isDarkMode
              ? "bg-gray-800 text-white"
              : "bg-indigo-100 gray-800"
            }`}
        >
          <Trophy className="flex-col w-12 h-14" />
          <div className='flex-col'>
            <div className="flex text-l">
              <h3 className='flex-col mr-2'> Level: </h3>
              <div className='flex-col'>
                {nft.level}
              </div>
            </div>
            <div className="flex text-l">
              <h3 className='flex-col mr-2'> Points: </h3>
              <div className='flex-col'>
                {nft.points}
              </div>
            </div>
          </div>

        </div>
      </div>
      <div className={`p-4 rounded-lg mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-indigo-100'}`}>
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-800'}`}>
          Category: "Food"
        </h2>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card isDarkMode={isDarkMode} >
            <div className="p-8 h-[58vh]">
              <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Guessing Area
              </h3>
                <div className='flex h-[30vh]'>
                  {messages}
                </div>
                <div className="flex items-center gap-2 my-4">
                  <Input
                    value={input}
                    isDarkMode={isDarkMode}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    onKeyDown={(e: any) => e.key === "Enter" && sendMessage()}
                  />
                  <Button onClick={sendMessage}>
                    <Send size={18} />
                  </Button>
                </div>
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
            </div>
          </Card>
        </div>
        {/* Assitance Area */}
        <div>
          <Card isDarkMode={isDarkMode}>
            <div className="p-6 h-[58vh]">
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
                <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Game Rules
                </h4>
                <ul className={`text-sm space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>• Ask questions to narrow down the word</li>
                  <li>• Get hints from your AI assistant</li>
                  <li>• Make your guess when you're ready</li>
                </ul>
              </div>
              {suggestedquestion && (
                <h3 className={`p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`} >{suggestedquestion}</h3>
              )}
              <div className="flex gap-4">
                <Button
                  onClick={handleAskHint}
                  icon={MessageCircle}
                >
                  Hint
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <button
        onClick={logOut}
        className={`absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded ${isDarkMode
          ? "bg-red-600 text-white hover:bg-red-700"
          : "bg-red-500 text-white hover:bg-red-600"
          }`}
      >
        Logout
      </button>
    </div>
  );
};