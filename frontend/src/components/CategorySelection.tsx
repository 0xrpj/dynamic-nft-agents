import React from 'react';
import { categories } from '../data/nfts';
import { Category } from '../types';
import { Play } from 'lucide-react';

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
  return (
    <div className="p-8">
      <h2 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        Choose a Category
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => {
              console.log('Selected category:', category.name);
              onSelect(category);
            }}
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden cursor-pointer
                      ${selectedCategory?.id === category.id ? 'ring-2 ring-indigo-600' : ''}`}
          >
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {category.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
      
      {selectedCategory && (
        <button
          onClick={() => {
            console.log('Starting game with category:', selectedCategory.name);
            onSelect(selectedCategory);
          }}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white
                     px-8 py-3 rounded-lg text-lg font-semibold mx-auto
                     hover:bg-indigo-700 transition-colors duration-200"
        >
          <Play className="w-5 h-5" />
          Start Game
        </button>
      )}
    </div>
  );
};