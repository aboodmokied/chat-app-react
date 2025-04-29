
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import { useToast } from "../../hooks/use-toast";

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Username is required",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(username, password);
      toast({
        title: "Success",
        description: "You have successfully logged in!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Chat Application</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Sign in to start chatting</p>
      </div>
      
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm space-y-4">
          <div>
            <label htmlFor="username" className="sr-only">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
              placeholder="Password (any value works)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </div>

        <div className="text-center text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            For demo purposes, you can enter any username and password
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
