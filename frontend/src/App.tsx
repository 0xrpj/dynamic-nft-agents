import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Welcome } from "./pages/Welcome";
import { NFTSelection } from "./pages/NFTSelection";
import { GamePlay } from "./pages/GamePlay";
import { GameState, NFTCharacter} from "./types";
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
                  selectedNFT={gameState.selectedNFT}
                  isDarkMode={gameState.isDarkMode}
                />
              }
            />
            <Route
              path="gameplay"
              element={
                gameState.selectedNFT? (
                  <GamePlay
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
