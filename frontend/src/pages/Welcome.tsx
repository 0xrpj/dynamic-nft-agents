import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Gamepad2 } from "lucide-react";
import { useLogin } from "../context/UserContext";
import nftAgentsImage from "../assests/nft_agents.webp";

interface WelcomeProps {
  isDarkMode: boolean;
}

export const Welcome: React.FC<WelcomeProps> = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const { login, isLoggedIn, userDetails } = useLogin();

  useEffect(() => {
    console.log("Auth State:", { isLoggedIn, address: userDetails.address });

    if (isLoggedIn) {
      navigate("/select-nft");
    }
  }, [isLoggedIn, userDetails, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      login();
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  return (
    <div className="text-center mx-auto p-20 m-20 min-h-screen">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 z-0 pointer-events-none"
        style={{
          backgroundImage: `url(${nftAgentsImage})`
        }}
      />
      <div className="mb-8">
        <Gamepad2
          className={`w-16 h-16 mx-auto ${
            isDarkMode ? "text-indigo-400" : "text-indigo-600"
          }`}
        />
      </div>
      <h1
        className={`text-5xl font-bold mb-6 ${
          isDarkMode ? "text-white" : "text-gray-800"
        }`}
      >
        Guess the Word
      </h1>
      <div className={`text-2xl mb-12 font-semibold ${
          isDarkMode ? "text-white" : "text-gray-600"
        }`}>
      <p className="m-2">
        Welcome to an exciting word guessing adventure! 
      </p>
      <p className="m-2">
      Team up with your NFT agent companion to guess the word and earn points. 
      </p>
      <p className="m-2">
      Use strategic questions to get hints and guide you to victory!
      </p> 
      </div>
      <button
        className={`bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold
          hover:bg-indigo-700 transition-colors duration-200 z-10 relative`}
        onClick={handleGoogleSignIn}
      >
        Sign in with Google
      </button>
    </div>
  );
};
