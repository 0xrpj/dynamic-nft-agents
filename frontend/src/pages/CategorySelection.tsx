import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { categories } from '../data/nfts';
import { Category } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PageTitle } from '../components/PageTitle';
import { useLogin } from "../context/UserContext";

interface CategorySelectionProps {
  onSelect: (category: Category) => void;
  selectedCategory: Category | null;
  isDarkMode: boolean;
}

export const CategorySelection: React.FC<CategorySelectionProps> = ({
  onSelect,
  selectedCategory,
  isDarkMode,
}) => {
  const navigate = useNavigate();

  const handleCategorySelect = (category: Category) => {
    console.log('Selected category:', category.name);
    onSelect(category);
  };

  const handleStartGame = () => {
    if (selectedCategory) {
      console.log('Starting game with category:', selectedCategory.name);
      navigate('/gameplay');
    }
  };

  const { logOut } = useLogin();

  return (
    <div className="p-20">
      <PageTitle isDarkMode={isDarkMode}>Choose a Category</PageTitle>
      <div className="grid grid-cols-1 md:grid-cols-5 m-16 mt-4 ml-0 gap-16">
        {categories.map((category) => (
          <Card
            key={category.id}
            isDarkMode={isDarkMode}
            onClick={() => handleCategorySelect(category)}
            isSelected={selectedCategory?.id === category.id}
          >
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-50 object-cover"
            />
            <div className="p-4">
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {category.name}
              </h3>
            </div>
          </Card>
        ))}
      </div>
      
      {selectedCategory && (
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