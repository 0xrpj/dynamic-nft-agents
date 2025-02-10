import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import { NFTCharacter } from "../types";
// import { nftCharacters } from "../data/nfts";
import { Card } from "../components/Card";
import { Button } from '../components/Button';
import { PageTitle } from "../components/PageTitle";
import { useLogin } from "../context/UserContext";
import axios from 'axios';
import client from "../chain";
import { demoAddress, packageId } from "../constant/constant";

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
  const { userDetails } = useLogin();

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
            console.log({ object })
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

        console.log({ nfts })

        setNfts(nfts);
      } catch (error) {
        console.error('Error fetching all nfts:', error);
      }
    }

    fetchAllNfts();
  }, []);

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
      <div className="flex justify-between items-center mb-2">
        <PageTitle isDarkMode={isDarkMode}>Pick an your <span className="bg-[#800000]">Game Companion NFT Agent</span></PageTitle>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-1 sm:gap-2 md:gap-3 lg:gap-6">
        {nfts.map((nft) => (
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
            <div className="p-2 sm:p-4">
              <h3
                className={`text-md font-mono text-center ${isDarkMode ? "text-white" : "text-gray-800"
                  }`}
              >
                {nft.name}
              </h3>
              <h3
                className={`text-sm font-normal text-center ${isDarkMode ? "text-white" : "text-gray-800"
                  }`}
              >
                {nft.collection}
              </h3>
              <hr className="m-2 opacity-15" />
              <div className="flex justify-evenly mt-2">
                <h3 className="text-sm">
                  Level {nft.level}
                </h3>

                <h3 className="text-sm">
                  Points {nft.points}
                </h3>
              </div>

            </div>
          </Card>
        ))}

        {nfts.length === 0 && (
          <div className="col-span-full">
            <p className="text-lg font-semibold mb-2">No NFTs found</p>
            <p className="text-sm text-gray-500">
              Please mint an NFT from the marketplace
            </p>
          </div>)}

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

    </div>
  );
};