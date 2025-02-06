import { useAuthCallback, useEnokiFlow, useZkLogin } from "@mysten/enoki/react";
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_APP_GOOGLE_CLIENT_ID;
const NETWORK = import.meta.env.VITE_APP_NETWORK;

interface LoginContextType {
  isLoggedIn: boolean;
  userDetails: UserDetails;
  login: () => void;
  logOut: () => void;
  isLoading: boolean;
}

const UserContext = createContext<LoginContextType | undefined>(undefined);

interface UserDetails {
  provider: string;
  salt: string;
  address: string;
}

interface UserProviderProps {
  children: ReactNode;
}

const UserDetailsInitialValues = {
  provider: "",
  salt: "",
  address: "",
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const flow = useEnokiFlow();
  const zkLogin = useZkLogin();
  useAuthCallback();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<UserDetails>(
    UserDetailsInitialValues
  );

  const login = async () => {
    try {
      setIsLoading(true);
      window.location.href = await flow.createAuthorizationURL({
        provider: "google",
        clientId: GOOGLE_CLIENT_ID,
        redirectUrl: window.location.origin,
        network: NETWORK,
      });
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  const logOut = async () => {
    setIsLoading(true);
    try {
      await flow.logout();
      clearStates();
    } finally {
      setIsLoading(false);
    }
  };

  const clearStates = () => {
    setIsLoggedIn(false);
    setUserDetails(UserDetailsInitialValues);
  };

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        if (zkLogin.address && zkLogin.salt && zkLogin.provider) {
          setUserDetails({
            provider: zkLogin.provider,
            salt: zkLogin.salt,
            address: zkLogin.address,
          });
          setIsLoggedIn(true);
        } else {
          clearStates();
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [zkLogin.address, zkLogin.salt, zkLogin.provider]);

  const contextValue: LoginContextType = {
    isLoggedIn,
    userDetails,
    login,
    logOut,
    isLoading,
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Logging in...
      </div>
    );
  }

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const useLogin = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useLogin must be used within UserProvider");
  }
  return context;
};
