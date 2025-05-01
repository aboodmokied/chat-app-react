
import React, { createContext, useState, useContext, useEffect } from "react";
// import { User } from "../services/socket";
import axios, { AxiosRequestConfig } from 'axios';
import { User } from "@/services/socket";

interface AuthContextType {
  user: any | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  token:string;
  authError:any
}


interface LoginResponse {
  accessToken: string;
  user:User
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
  isLoading: true,
  token: null,
  authError:null
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // setIsLoading(true);
    // Check if user is already logged in
    const storedUser = localStorage.getItem("chat_user");
    const token = localStorage.getItem("token");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if(token){
      setToken(JSON.parse(token));
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      };
      const response=await axios.post<LoginResponse>('http://localhost:3000/auth/login',{
        email,
        password
      },config)
      const {accessToken,user}=response.data;
      console.log({accessToken,user});
      // This is a mock implementation
      setToken(accessToken);  
      // setUser(user);
      setIsAuthenticated(true);  
      const mockUser: any = {
        id: `user_${Math.random().toString(36).substr(2, 9)}`,
        name: "abood",
        isOnline: true,
        avatar: `https://ui-avatars.com/api/?name=${"abood"}&background=random`,
      };
      
      setUser(mockUser);
      localStorage.setItem("chat_user", JSON.stringify(mockUser));
      localStorage.setItem("token", JSON.stringify(accessToken));
      
      
    } catch (error) {
      console.error("Login failed:", error);
      setAuthError(error.response?.data || error.message );
      // return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);
    localStorage.removeItem("chat_user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        isLoading,
        token,
        authError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
