import React, { useState } from 'react';
import { Send, Trophy } from 'lucide-react';
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
  const [suggestedquestion, setSuggestedQuestion] =
    useState(`Howdy mate! Let's get this game done. I can see that the selected category is Food.`);
  const [guess, setGuess] = useState('');
  const { logOut } = useLogin();
  // const [messages, setMessages] = useState('');
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    console.log({ question })
    setQuestion(input);
    setInput("");
  };

  const handleAskHint = () => {
    console.log('Asked question:', question);
    setSuggestedQuestion("Is it found in my room?")
  }
  return (
    <div className="p-12 mt-12 pt-0">
      <div className="flex justify-end items-center">
        {/* <div
          className={`flex justify-between items-center gap-2 px-4 py-2 rounded-lg mb-8
                      ${isDarkMode
              ? "bg-gray-800 text-white"
              : "bg-indigo-100 gray-800"
            }`}
        >


        </div> */}
      </div>
      <div className={`p-4 text-center flex justify-between rounded-lg mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-indigo-100'}`}>
        <h2 className={`text-2xl flex-col font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-800'}`}>
          Category: "Food"
        </h2>
        <div className='flex-col'>
          <div className='flex gap-4'>
          <Trophy className="flex-col w-12 h-12" />
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
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card isDarkMode={isDarkMode} >
            <div className="p-8 h-[58vh]">
              <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Let's start
              </h3>
              <div className='flex h-[38vh]'>
                {question}
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
                <Button className='h-12' onClick={sendMessage}>
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </Card>
        </div>
        <div>
          {/* Guessng Area */}
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
          {/* Assitance Area */}
          <Card isDarkMode={isDarkMode}>
            <div className="p-6 h-[50vh]">
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
                    AI Agent
                  </p>
                </div>
              </div>

              <div className="p-4 pl-0 rounded-lg mb-4">
                <div className='h-[25vh]'>
                  {suggestedquestion}
                </div>
                <div className={`flex items-center gap-2 mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <Input
                    value={input}
                    isDarkMode={isDarkMode}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    onKeyDown={(e: any) => e.key === "Enter" && sendMessage()}
                  />
                  <Button className='h-12' onClick={handleAskHint}>
                    <Send size={18} />
                  </Button>
                </div>
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