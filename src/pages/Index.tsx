
import React from "react";
import { useAuth } from "../context/AuthContext";
import LoginForm from "../components/Auth/LoginForm";
import ChatLayout from "../components/Layout/ChatLayout";

const Index: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {isAuthenticated ? (
        <ChatLayout />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <LoginForm />
        </div>
      )}
    </div>
  );
};

export default Index;
