import React from "react";
import RegisterForm from "../components/Auth/RegisterForm";

const Register: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex items-center justify-center min-h-screen">
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;