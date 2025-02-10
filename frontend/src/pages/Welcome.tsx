import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Key } from "lucide-react";
import { useLogin } from "../context/UserContext";
import { motion } from "framer-motion";
import { Button } from "../components/Button";
import Slideshow from "../components/SlideShow";

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
            await login();
        } catch (error) {
            console.error("Sign-in error:", error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`min-h-screen flex flex-col justify-center items-center p-8 ${isDarkMode ? "text-white" : "bg-gray-50 text-gray-900"
                }`}
        >
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-center mb-12"
            >
                <div className="text-5xl font-bold mb-4 flex justify-center">
                    <p>Word Puzzler </p>
                    <svg xmlns="http://www.w3.org/2000/svg" width="82" height="55" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-whole-word"><circle cx="7" cy="12" r="3" /><path d="M10 9v6" /><circle cx="17" cy="12" r="3" /><path d="M14 7v8" /><path d="M22 17v1c0 .5-.5 1-1 1H3c-.5 0-1-.5-1-1v-1" /></svg>
                </div>
                <p className="text-xl text-gray-500">
                    A collaborative word-guessing game powered by AI.
                </p>
            </motion.div>

            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="bg-gray-800/10 p-8 rounded-lg border border-gray-800/20 w-full max-w-2xl mb-12 flex items-center gap-8"
            >
                <div className="flex-shrink-0">
                    <Slideshow />
                </div>
                <div className="flex-1 text-center">
                    <h2 className="text-xl font-semibold mb-4">Game Companion Agent</h2>
                    <p className="text-lg text-gray-500 mb-6">
                        Powered by Eliza ❤️
                    </p>
                    <Button
                        className="px-4 py-2 text-ls font-normal m-auto"
                        onClick={handleGoogleSignIn}
                    >
                        <Key className="mr-2 h-5 w-5" /> Continue with zkLogin
                    </Button>
                </div>
            </motion.div>

            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl"
            >
            </motion.div>
        </motion.div>
    );
};