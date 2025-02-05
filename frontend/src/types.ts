export interface NFTCharacter {
  id: number;
  name: string;
  image: string;
}

export interface Category {
  id: number;
  name: string;
  image: string;
}

export interface GameState {
  selectedNFT: NFTCharacter | null;
  selectedCategory: Category | null;
  points: number;
  isDarkMode: boolean;
}