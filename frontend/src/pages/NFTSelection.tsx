import React from "react";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import { NFTCharacter } from "../types";
import { nftCharacters } from "../data/nfts";
import { Card } from "../components/Card";
import { Button } from '../components/Button';
import { PageTitle } from "../components/PageTitle";
import { useLogin } from "../context/UserContext";
import axios from 'axios';

interface NFTSelectionProps {
  onSelect: (nft: NFTCharacter) => void;
  isDarkMode: boolean;
  selectedNFT: NFTCharacter | null;
}

export const NFTSelection: React.FC<NFTSelectionProps> = ({
  onSelect,
  selectedNFT,
  isDarkMode,
}) => {
  const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const { logOut, userDetails } = useLogin();

  const handleNFTSelect = (nft: NFTCharacter) => {
    console.log('Selected nft:', nft.name);
    onSelect(nft);
  };

  const handleStartGame = async () => {
    console.log({ selectedNFT });
    if (selectedNFT) {
      console.log('Starting game with nft:', selectedNFT.name);
      const response = await axios.post(`${VITE_API_BASE_URL}/createRoom`, {
        "walletAddress": userDetails.address,
        "nftId": selectedNFT.id
      });
      console.log({ response });
      navigate(`/gameplay`);
    }
  };

  return (
    <div className="p-4 sm:p-8 md:p-12 lg:p-20">
          <div className="flex justify-between items-center mb-4 sm:mb-8">
            <PageTitle isDarkMode={isDarkMode}>Choose Your NFT Companion {userDetails.address}</PageTitle>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-8 md:gap-12 lg:gap-16">
            {nftCharacters.map((nft) => (
              <Card
                key={nft.id}
                isDarkMode={isDarkMode}
                onClick={() => handleNFTSelect(nft)}
                selectedNFTId={nft.id === selectedNFT?.id ? nft.id : undefined}
              >
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="w-full h-48 sm:h-56 md:h-64 lg:h-72 object-cover"
                />
                <div className="p-2 sm:p-4 mb-4 sm:mb-8">
                  <h3
                className={`text-lg sm:text-xl md:text-2xl font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}
                  >
                    {nft.name}
                  </h3>
                  <h3 className="text-sm sm:text-base md:text-lg">
                    Level: {nft.level}
                  </h3>
                  <h3 className="text-sm sm:text-base md:text-lg">
                    Points: {nft.points}
                  </h3>
                </div>
              </Card>
            ))}
          </div>
          {selectedNFT && (
            <Button
              onClick={handleStartGame}
              icon={Play}
              className="mx-auto mt-4 sm:mt-8"
            >
              Start Game
            </Button>
          )}
          <button
            onClick={logOut}
            className={`fixed bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded ${isDarkMode
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-red-500 text-white hover:bg-red-600"
              }`}
          >
            Logout
          </button>
        </div>
        );
};