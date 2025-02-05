import React from 'react';
import { Trophy } from 'lucide-react';
import { NFTCharacter } from '../types';
import { nftCharacters } from '../data/nfts';

interface NFTSelectionProps {
  onSelect: (nft: NFTCharacter) => void;
  points: number;
  isDarkMode: boolean;
}

export const NFTSelection: React.FC<NFTSelectionProps> = ({ onSelect, points, isDarkMode }) => {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Choose Your NFT Companion
        </h2>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg
                      ${isDarkMode ? 'bg-gray-800 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
          <Trophy className="w-5 h-5" />
          <span className="font-semibold">{points} Points</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {nftCharacters.map((nft) => (
          <div
            key={nft.id}
            onClick={() => {
              console.log('Selected NFT:', nft.name);
              onSelect(nft);
            }}
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden cursor-pointer
                     transform hover:scale-105 transition-transform duration-200`}
          >
            <img
              src={nft.image}
              alt={nft.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {nft.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};