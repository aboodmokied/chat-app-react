import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import { useToast } from "../../hooks/use-toast";
import { Input } from "../../components/ui/input";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../../components/ui/alert";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const { login, authError } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous server errors
    setServerErrors([]);
    
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(email, password);
      toast({
        title: "Success",
        description: "You have successfully logged in!",
      });
    } catch (error) {
      // Handle validation errors with status 400 and message property as array
      if (error.response && error.response.status === 400 && Array.isArray(error.response.data.message)) {
        setServerErrors(error.response.data.message);
      } else {
        toast({
          title: "Error",
          description: "Failed to log in. Please try again.",
          variant: "destructive",
        });
      }
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
      
      {serverErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc pl-5 mt-2">
              {serverErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="email"
              name="email"
              type="email"
              required
              className="pl-10"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              className="pl-10"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        {authError && !serverErrors.length && (
          <div className="text-red-500 text-sm text-center">
            {authError.message || "Authentication failed"}
          </div>
        )}

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
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-purple-600 hover:text-purple-500">
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;