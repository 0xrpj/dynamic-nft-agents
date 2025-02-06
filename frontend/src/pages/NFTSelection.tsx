import React from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Play } from "lucide-react";
import { NFTCharacter } from "../types";
import { nftCharacters } from "../data/nfts";
import { Card } from "../components/Card";
import { Button } from '../components/Button';
import { PageTitle } from "../components/PageTitle";
import { useLogin } from "../context/UserContext";

interface NFTSelectionProps {
  onSelect: (nft: NFTCharacter) => void;
  points: number;
  isDarkMode: boolean;
  selectedNFT: NFTCharacter | null;
}

export const NFTSelection: React.FC<NFTSelectionProps> = ({
  onSelect,
  selectedNFT,
  points,
  isDarkMode,
}) => {
  const navigate = useNavigate();
  const { logOut } = useLogin();

    const handleNFTSelect = (nft: NFTCharacter) => {
      console.log('Selected nft:', nft.name);
      onSelect(nft);
    };
  
    const handleStartGame = () => {
      console.log({selectedNFT})
      if (selectedNFT) {
        console.log('Starting game with nft:', selectedNFT.name);
        navigate('/gameplay');
      }
    };

  return (
    <div className="p-20">
      <div className="flex justify-between items-center mb-8">
        <PageTitle isDarkMode={isDarkMode}>Choose Your NFT Companion</PageTitle>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg mb-8
                      ${
                        isDarkMode
                          ? "bg-gray-800 text-indigo-400"
                          : "bg-indigo-100 text-indigo-600"
                      }`}
        >
          <Trophy className="w-10 h-10" />
          <span className="font-semibold">{points} Points</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 m-16 mt-4 ml-0 gap-16">
        {nftCharacters.map((nft) => (
          <Card
            key={nft.id}
            isDarkMode={isDarkMode}
            onClick={() => {
              handleNFTSelect(nft)              
            }}
          >
            <img
              src={nft.image}
              alt={nft.name}
              className="w-full h-[80%] object-cover"
            />
            <div className="p-4">
              <h3
                className={`text-2xl [font-size:1.2vw] font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {nft.name}
              </h3>
            </div>
          </Card>
        ))}
      </div>
      {selectedNFT && (
        <Button
          onClick={handleStartGame}
          icon={Play}
          className="mx-auto"
        >
          Start Game
        </Button>
      )}
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
