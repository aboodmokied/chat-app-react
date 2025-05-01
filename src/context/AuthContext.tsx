
import React, { createContext, useState, useContext, useEffect } from "react";
// import { User } from "../services/socket";

interface AuthContextType {
  user: any | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
  isLoading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("chat_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // In a real app, we would call the API here
      // This is a mock implementation
      const mockUser: any = {
        id: `user_${Math.random().toString(36).substr(2, 9)}`,
        name: username,
        isOnline: true,
        avatar: `https://ui-avatars.com/api/?name=${username}&background=random`,
      };
      
      setUser(mockUser);
      localStorage.setItem("chat_user", JSON.stringify(mockUser));
      
      return Promise.resolve();
    } catch (error) {
      console.error("Login failed:", error);
      return Promise.reject(error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("chat_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
