export interface NFTCharacter {
  id: string;
  name: string;
  image: string;
  collection: string;
  level: number;
  points: number
}

export interface GameState {
  selectedNFT: NFTCharacter | null;
  isDarkMode: boolean;
}