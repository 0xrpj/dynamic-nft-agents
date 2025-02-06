export interface NFTCharacter {
  id: string;
  name: string;
  image: string;
  level: number;
  points: number
}

export interface GameState {
  selectedNFT: NFTCharacter | null;
  isDarkMode: boolean;
}