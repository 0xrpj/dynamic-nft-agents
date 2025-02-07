import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Send, Trophy } from 'lucide-react';
import { NFTCharacter } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { useLogin } from "../context/UserContext";
import axios from 'axios';

interface GamePlayProps {
  nft: NFTCharacter;
  isDarkMode: boolean;
}

export const GamePlay: React.FC<GamePlayProps> = ({ nft, isDarkMode }) => {
  const [input, setInput] = useState("");
  const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [conversation, setConversation] = useState<{ question: string; answer: string; }[]>([]);
  const [agentConversation, setAgentConversation] = useState<{ user: string; agent: string; }[]>([]);

  const [question, setQuestion] = useState('');
  const [suggestedQuestionInput, setSuggestedQuestionInput] = useState('')
  const [suggestedquestion, setSuggestedQuestion] =
    useState("");
  const [guessInput, setGuessInput] = useState("");
  const { logOut, userDetails } = useLogin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState({ title: '', content: '' });
  const [apiToggler, setApiToggler] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    getUserData();
  }, [apiToggler]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);


  const getUserData = async () => {
    try {
      const walletAddress = userDetails.address;

      const data = await axios.post(VITE_API_BASE_URL + "/gameInfo", {
        "walletAddress": "0x42c6d17e78e5a8ad53be1c249e04e16d6870c655b5ff23412b150df2d5d4bcaf",
        "nftId": nft.id
      })

      setConversation(data.data.userInfo.gptConversationHistory)

    } catch (e) {
      alert((e as any).toString());
    }
  };

  const askQuestion = async (input: string) => {
    if (!input.trim()) {
      showMessage('Error', 'Please enter a message before sending.');
      return;
    }

    const data = await axios.post(VITE_API_BASE_URL + "/reply", {
      "walletAddress": "0x42c6d17e78e5a8ad53be1c249e04e16d6870c655b5ff23412b150df2d5d4bcaf",
      "nftId": nft.id,
      "question": input
    });

    if (data?.data?.success) {
      await getUserData();
      setApiToggler(!apiToggler);
    }
    setInput("");
  };

  const showMessage = (title: string, content: string) => {
    setModalMessage({ title, content });
    setIsModalOpen(true);
  };

  const sendMessage = async () => {
    if (!input.trim()) {
      showMessage('Error', 'Please enter a message before sending.');
      return;
    }
    console.log({ question });
    setQuestion(input);
    setInput("");
  };

  const handleAskHint = () => {
    if (!suggestedQuestionInput.trim()) {
      showMessage('Error', 'Please enter a message before sending.');
      return;
    }
    console.log('Asked question:', suggestedQuestionInput);
    setSuggestedQuestion(suggestedQuestionInput);
    setSuggestedQuestionInput("")
  }

  const handleGuessSubmit = async(guessInput:string) => {
    if (!guessInput.trim()) {
      showMessage('Error', 'Please enter a guess before submitting.');
      return;
    }
    
    console.log({guessInput})
    const data = await axios.post(VITE_API_BASE_URL + "/guessWord", {
      "walletAddress": "0x42c6d17e78e5a8ad53be1c249e04e16d6870c655b5ff23412b150df2d5d4bcaf",
      "nftId": nft.id,
      "guessedWord": guessInput
    });
    console.log({data})
    if (data?.data?.success) {
      await getUserData();
      setApiToggler(!apiToggler);
      const response = await axios.post(VITE_API_BASE_URL + "/gameInfo", {
        "walletAddress": "0x42c6d17e78e5a8ad53be1c249e04e16d6870c655b5ff23412b150df2d5d4bcaf",
        "nftId": nft.id,
      });
      console.log({response})
      showMessage(data?.data?.message, `You are at level ${response?.data?.userInfo?.level} and your score is ${response?.data?.userInfo?.score} `)
    }
    else{
      showMessage("Wrong guess", data?.data?.message)
    }
    setInput("");
  };

  return (
    <div className="p-12 mt-12 pt-0">
      <div className="flex justify-end items-center">
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


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-1">
          <Card isDarkMode={isDarkMode} >
            <div className="p-8 h-[65vh]">
              <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Let's start
              </h3>
              <div className='flex flex-col h-[45vh] p-4 rounded-lg overflow-y-auto'>
                {conversation.length === 0 ? (
                  <div className='flex justify-center items-center h-full'>
                    <p className='text-gray-400'>You have not asked any questions. You can ask YES/NO questions to the AI to pinpoint your answer.</p>
                  </div>
                ) : null}
                {conversation.map((message, index) => (
                  <div key={index} className='flex flex-col space-y-2'>
                    {/* Question Bubble */}
                    <div className='flex justify-end'>
                      <div className='bg-blue-500 text-white p-3 rounded-lg max-w-[70%]'>
                        {message.question}
                      </div>
                    </div>

                    {/* Answer Bubble */}
                    <div className='flex justify-start' ref={messagesEndRef}>
                      <div className='bg-gray-300 text-gray-800 p-3 rounded-lg max-w-[70%]'>
                        {message.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 my-4">
                <Input
                  value={input}
                  isDarkMode={isDarkMode}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  onKeyDown={async (e: any) => e.key === "Enter" && await askQuestion(input)}
                />
                <Button className='h-12' onClick={async () => { await askQuestion(input) }}>
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
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              placeholder="Type your guess..."
              className="w-full mb-4"
              onKeyDown={async(e: any) => e.key === "Enter" && handleGuessSubmit(guessInput)}
            />
            <Button className="mb-4"
              onClick={() => {
                handleGuessSubmit(guessInput)
              }}
              variant="success"
            >
              Submit
            </Button>
          </div>
          {/* Assitance Area */}
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
                    AI Agent
                  </p>
                </div>
              </div>

              <div className="rounded-lg">
                <div className='h-[35vh]'>
                  <div className='flex flex-col h-[30vh] p-4 rounded-lg overflow-y-auto'>
                    {agentConversation.length === 0 ? (
                      <div className='flex justify-center items-center h-full'>
                        <p className='text-gray-400'>Hi. I am your AI friend. I will help you guess the word by suggesting questions.</p>
                      </div>
                    ) : null}
                    {agentConversation.map((message, index) => (
                      <div key={index} className='flex flex-col space-y-2'>
                        {/* Question Bubble */}
                        <div className='flex justify-end'>
                          <div className='bg-blue-500 text-white p-3 rounded-lg max-w-[70%]'>
                            {message.user}
                          </div>
                        </div>

                        {/* Answer Bubble */}
                        <div className='flex justify-start'>
                          <div className='bg-gray-300 text-gray-800 p-3 rounded-lg max-w-[70%]'>
                            {message.agent}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`flex items-center gap-2 mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <Input
                    value={suggestedQuestionInput}
                    isDarkMode={isDarkMode}
                    onChange={(e) => setSuggestedQuestionInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    onKeyDown={(e: any) => e.key === "Enter" && handleAskHint()}
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
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMessage.title}
        isDarkMode={isDarkMode}
      >
        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {modalMessage.content}
        </p>
      </Modal>

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