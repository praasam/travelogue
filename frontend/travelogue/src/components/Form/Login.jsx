import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";


const LoginComponent = () => {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });
  };

  const validate = () => {
    const errors = {};
    if (!loginData.email) errors.email = "Email is required";
    if (!loginData.password) errors.password = "Password is required";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
  
    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await axios.post(
          "http://localhost:5000/auth/login",
          loginData
        );
      
        console.log("API Response:", response.data); // Log the response
      
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("role", response.data.user.role);
          localStorage.setItem("id", response.data.id);
      
          toast.success("Login successful");
          navigate("/dash");
        } else {
          console.error("No token received");
          toast.error("Login failed: No token received");
        }
      } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        toast.error(error.response?.data?.msg || "Login failed");
      }
      
    }
  };
  

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col md:flex-row bg-white shadow-lg max-w-4xl w-full rounded-lg overflow-hidden">
        <div className="md:w-1/2 p-8 flex items-center justify-center bg-white">
          <img src="/login.gif" alt="Login" className="w-full h-auto" />
        </div>
        <div className="md:w-1/2 p-8 flex flex-col justify-center">
          <h1 className="text-3xl mb-6 text-center font-semibold text-gray-800">Welcome to SkinSync</h1>
          <p className="text-center text-gray-600 mb-8">Log in to access your account</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <ToastContainer />
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="email">
                Email
              </label>
              <input
                className={`border p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email address"
                value={loginData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="relative">
              <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="password">
                Password
              </label>
              <input
                className={`border p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={handleChange}
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 mt-8 cursor-pointer"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <FaEyeSlash className="text-gray-500" />
                ) : (
                  <FaEye className="text-gray-500" />
                )}
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div className="flex justify-center">
              <button
                className="text-white px-6 py-3 rounded-lg shadow-md transition duration-300"
                style={{ backgroundColor: '#F0BCCD' }}
                type="submit"
              >
                Login
              </button>
            </div>
          </form>
          <p className="mt-4 text-center text-gray-600">
            Don’t have an account?
            <a href="/register" className="text-blue-600 hover:underline font-medium ml-1">
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;