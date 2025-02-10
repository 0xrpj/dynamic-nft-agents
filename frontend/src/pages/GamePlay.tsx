import React, { useEffect, useRef, useState } from 'react';
import { Send, Trophy } from 'lucide-react';
import { NFTCharacter } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { useLogin } from "../context/UserContext";
import axios from 'axios';
import { motion } from 'framer-motion';
import client from '../chain';
import { demoAddress, packageId } from '../constant/constant';

interface GamePlayProps {
  nft: NFTCharacter;
  isDarkMode: boolean;
}

export const GamePlay: React.FC<GamePlayProps> = ({ nft, isDarkMode }) => {
  const [input, setInput] = useState("");
  const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [gptConversation, setGptConversation] = useState<{ question: string; answer: string; }[]>([]);
  const [agentConversation, setAgentConversation] = useState<{ question: string; answer: string; }[]>([]);
  const [suggestedQuestionInput, setSuggestedQuestionInput] = useState('')
  const [guessInput, setGuessInput] = useState("");
  const { userDetails } = useLogin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState({ title: '', content: '' });
  const [apiToggler, setApiToggler] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState("");
  const [nftApiToggler, setNftApiToggler] = useState(false);

  const [nfts, setNfts] = useState<NFTCharacter[]>([]);

  useEffect(() => {
    async function fetchAllNfts() {
      try {
        const nfts = [];

        const objects = await client.getOwnedObjects({
          owner: demoAddress,
          options: {
            showContent: true,
          },
        });

        for (let i = 0; i < objects.data.length; i++) {
          const object = objects.data[i];
          if ((object.data?.content as any)?.type === `${packageId}::aiagent::NFT`) {
            nfts.push({
              id: i.toString(),
              name: (object.data?.content as any)?.fields?.name,
              image: (object.data?.content as any)?.fields?.image_url,
              collection: (object.data?.content as any)?.fields?.description,
              level: (object.data?.content as any)?.fields?.ai_level,
              points: (object.data?.content as any)?.fields?.win_rate
            })
          }
        }
        setNfts(nfts);
      } catch (error) {
        console.error('Error fetching all nfts:', error);
      }
    }

    fetchAllNfts();
  }, [nftApiToggler]);

  useEffect(() => {
    getUserData();
  }, [apiToggler]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [gptConversation]);


  const getUserData = async () => {
    try {
      const data = await axios.post(VITE_API_BASE_URL + "/gameInfo", {
        "walletAddress": userDetails.address,
        "nftId": nft.id
      })

      setGptConversation(data.data.userInfo.gptConversationHistory)
      setAgentConversation(data.data.userInfo.companionConversationHistory)
      setCategory(data.data.userInfo.category)

      if (data.data.userInfo.companionConversationHistory?.length === 0) {
        talkToCompanion('');
      }

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
      "walletAddress": userDetails.address,
      "nftId": nft.id,
      "question": input
    });

    if (data?.data?.success) {
      await getUserData();
      setApiToggler(!apiToggler);
    }
    setInput("");
    talkToCompanion('');
  };

  const talkToCompanion = async (input: string) => {
    const data = await axios.post(VITE_API_BASE_URL + "/playWithUser", {
      "walletAddress": userDetails.address,
      "nftId": nft.id,
      "question": input
    });

    if (data?.data?.success) {
      await getUserData();
      setApiToggler(!apiToggler);
    }
    setSuggestedQuestionInput("");
  };

  const showMessage = (title: string, content: string) => {
    setModalMessage({ title, content });
    setNftApiToggler(!nftApiToggler);
    setIsModalOpen(true);
  };

  const handleGuessSubmit = async (guessInput: string) => {
    if (!guessInput.trim()) {
      showMessage('Error', 'Please enter a guess before submitting.');
      return;
    }
    const data = await axios.post(VITE_API_BASE_URL + "/guessWord", {
      "walletAddress": userDetails.address,
      "nftId": nft.id,
      "guessedWord": guessInput
    });
    console.log({ data })
    if (data?.data?.success) {
      await getUserData();
      setApiToggler(!apiToggler);
      const response = await axios.post(VITE_API_BASE_URL + "/gameInfo", {
        "walletAddress": userDetails.address,
        "nftId": nft.id,
      });
      console.log({ response })
      showMessage(data?.data?.message, `You are at level ${response?.data?.userInfo?.level} and your score is ${response?.data?.userInfo?.score} `)
    }
    else {
      showMessage("Wrong guess", data?.data?.message)
    }
    setGuessInput("");
  };

  return (
    <div className="p-12 mt-12 pt-0">
      <div className="flex justify-end items-center">
      </div>
      {/* <div className={`p-4 text-center flex justify-between rounded-lg mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-indigo-100'}`}>
        <h2 className={`text-2xl flex-col font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-800'}`}>
          Your category for the word is: {category.toUpperCase()}.
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
      </div> */}


      <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-1">
          <Card isDarkMode={isDarkMode} >
            <div className="p-8 h-[85vh]">

              {/* <div className='flex flex-col h-[45vh] p-4 rounded-lg overflow-y-auto'>
                {gptConversation.length === 0 ? (
                  <div className='flex justify-center items-center h-full'>
                    <p className='text-gray-400'>You have not asked any questions. You can ask YES/NO questions to the AI to pinpoint your answer.</p>
                  </div>
                ) : null}
                {gptConversation.map((message, index) => (
                  <div key={index} className='flex flex-col space-y-2'>
                    <div className='flex justify-end'>
                      <div className='bg-blue-500 text-white p-3 rounded-lg max-w-[70%]'>
                        {message.question}
                      </div>
                    </div>
                    <div className='flex justify-start' ref={messagesEndRef}>
                      <div className='bg-gray-300 text-gray-800 p-3 rounded-lg max-w-[70%]'>
                        {message.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div> */}

              <div className='flex flex-col h-[55vh] p-4 rounded-lg overflow-y-auto text-[30px] font-mono text-center justify-center'>
                The Category of the word is: <br /> <div className='text-[70px]'>{category.toUpperCase()} </div>
              </div>

              {gptConversation.some(data => data.answer.toLowerCase().includes("yes")) && (
                <>
                  You are on the right path with these questions
                  <div className="mt-2 overflow-x-auto whitespace-nowrap flex gap-2 p-2">
                    {gptConversation
                      .filter(data => data.answer.toLowerCase().includes("yes"))
                      .map((data, index) => (
                        <div
                          key={index}
                          className="bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-full inline-block"
                        >
                          <div className="ml-2 mr-2">
                            {data.question}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </>
              )}





              <div className="flex items-center gap-2 my-4">
                <Input
                  value={input}
                  isDarkMode={isDarkMode}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me a YES/NO question"
                  className="flex-1 bg-transparent"
                  onKeyDown={async (e: any) => e.key === "Enter" && await askQuestion(input)}
                />
                <Button className='h-12' onClick={async () => { await askQuestion(input) }}>
                  <Send size={18} />
                </Button>
              </div>
              {gptConversation.length > 0 ? <>
                You asked: {gptConversation[gptConversation.length - 1]?.question} <br />
                Know-It-All agent says: {gptConversation[gptConversation.length - 1]?.answer}</> : <>You have not asked any questions to the Know-It-All agent! <br /> You really should, that's how the game works! 😉</>}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">

          <Card isDarkMode={isDarkMode}>
            <div className="p-6 h-[76vh]">
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
                    NFT AI Agent
                  </p>
                </div>
              </div>

              <div className="rounded-lg">
                <div className='h-[57vh]'>
                  <div className='flex flex-col h-[50vh] p-4 rounded-lg overflow-y-auto'>
                    {agentConversation.length === 0 ? (
                      <div className='flex justify-center items-center h-full'>
                        <p className='text-gray-400'>Hi. I am your AI friend. I will help you guess the word by suggesting questions.</p>
                      </div>
                    ) : null}
                    {agentConversation.map((message, index) => (
                      <div key={index} className="flex flex-col space-y-2">
                        {/* User Question */}
                        {message.question && (
                          <motion.div
                            initial={{ opacity: 0, x: 50 }} // Slide in from the right
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex justify-end"
                          >
                            <div className="bg-gradient-to-r from-blue-500 to-blue-500 text-white p-3 rounded-lg max-w-[70%] shadow-lg hover:shadow-xl transition-shadow">
                              {message.question}
                            </div>
                          </motion.div>
                        )}

                        {/* Agent Answer */}
                        <motion.div
                          initial={{ opacity: 0, x: -50 }} // Slide in from the left
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex justify-start"
                          ref={messagesEndRef}
                        >
                          <div className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 p-3 rounded-lg max-w-[70%] mt-2 shadow-lg hover:shadow-xl transition-shadow">
                            {message.answer}
                          </div>
                        </motion.div>
                      </div>

                    ))}
                  </div>
                </div>
                <div className={`flex items-center gap-2 mb-4 bg-transparent ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <Input
                    value={suggestedQuestionInput}
                    isDarkMode={isDarkMode}
                    onChange={(e) => setSuggestedQuestionInput(e.target.value)}
                    placeholder="Talk to your companion"
                    className="flex-1 bg-transparent"
                    onKeyDown={async (e: any) => e.key === "Enter" && await talkToCompanion(suggestedQuestionInput)}
                  />
                  <Button className='h-12' onClick={async () => { await talkToCompanion(suggestedQuestionInput) }}>
                    Send Message
                  </Button>
                </div>
              </div>
            </div>
          </Card>
          <div className="flex gap-4 mt-4">
            <Input
              isDarkMode={isDarkMode}
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              placeholder="Submit your guess"
              className="w-full mb-4"
              onKeyDown={async (e: any) => e.key === "Enter" && handleGuessSubmit(guessInput)}
            />
            <Button className="mb-4"
              onClick={() => {
                handleGuessSubmit(guessInput)
              }}
              variant="primary"
            >
              Submit word
            </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMessage.title}
        isDarkMode={isDarkMode}
      >
        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>

          {/* {nfts.map((item) =>
            item.id === nft.id && item.level > nft.level ? <>
              Viola, your NFT got upgraded! <br /><br />
              <img key={item.id} src={item.image} width={200} alt="NFT" />
            </> : null
          )} */}

          {nfts.map((item) => {
            console.log("NFT ID:", nft.id, "Item Level:", item.level);

            return item.id === nft.id && item.level > nft.level ? (
              <>
                Viola, your NFT got upgraded! <br /><br />
                <img key={item.id} src={item.image} width={200} alt="NFT" />
              </>
            ) : null;
          })}


        </p>
      </Modal>

    </div>
  );
};