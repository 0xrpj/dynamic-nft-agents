import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Welcome } from "./pages/Welcome";
import { NFTSelection } from "./pages/NFTSelection";
import { CategorySelection } from "./pages/CategorySelection";
import { GamePlay } from "./pages/GamePlay";
import { GameState, NFTCharacter, Category } from "./types";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  const [gameState, setGameState] = useState<GameState>({
    selectedNFT: null,
    selectedCategory: null,
    points: 100,
    isDarkMode: true,
  });

  const handleNFTSelect = (nft: NFTCharacter) => {
    setGameState((prev) => ({
      ...prev,
      selectedNFT: nft,
    }));
  };

  const handleCategorySelect = (category: Category) => {
    setGameState((prev) => ({
      ...prev,
      selectedCategory: category,
    }));
  };

  const toggleDarkMode = () => {
    setGameState((prev) => ({
      ...prev,
      isDarkMode: !prev.isDarkMode,
    }));
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout
              isDarkMode={gameState.isDarkMode}
              onToggleDarkMode={toggleDarkMode}
            />
          }
        >
          <Route
            index
            element={<Welcome isDarkMode={gameState.isDarkMode} />}
          />

          <Route element={<ProtectedRoute />}>
            <Route
              path="select-nft"
              element={
                <NFTSelection
                  onSelect={handleNFTSelect}
                  points={gameState.points}
                  isDarkMode={gameState.isDarkMode}
                />
              }
            />
            <Route
              path="select-category"
              element={
                gameState.selectedNFT ? (
                  <CategorySelection
                    onSelect={handleCategorySelect}
                    selectedCategory={gameState.selectedCategory}
                    isDarkMode={gameState.isDarkMode}
                  />
                ) : (
                  <Navigate to="/select-nft" replace />
                )
              }
            />
            <Route
              path="gameplay"
              element={
                gameState.selectedNFT && gameState.selectedCategory ? (
                  <GamePlay
                    category={gameState.selectedCategory}
                    nft={gameState.selectedNFT}
                    isDarkMode={gameState.isDarkMode}
                  />
                ) : (
                  <Navigate to="/select-nft" replace />
                )
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
