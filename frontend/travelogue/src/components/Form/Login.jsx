import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const LoginComponent = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Image Slideshow Logic
  const images = ["/log2.png", "/log.jpg"]; // Replace with actual image paths
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 7000); // Change every 7 seconds

    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
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

        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("role", response.data.user.role);
          localStorage.setItem("id", response.data.id);

          toast.success("Login successful");
          navigate("/dash");
        } else {
          toast.error("Login failed: No token received");
        }
      } catch (error) {
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
        
        {/* Slideshow Container */}
        <div className="md:w-1/2 p-8 flex items-center justify-center bg-white relative overflow-hidden">
          <div
            className="flex transition-transform duration-1000 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Slide ${index}`}
                className="w-full h-auto flex-shrink-0"
              />
            ))}
          </div>
        </div>

        {/* Login Form */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center">
          <h1 className="text-3xl mb-6 text-center font-semibold text-gray-800">
            Welcome back
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Log in to access your account
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <ToastContainer />
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Email
              </label>
              <input
                className={`border p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={loginData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div className="relative">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Password
              </label>
              <input
                className={`border p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                type={showPassword ? "text" : "password"}
                name="password"
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
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div className="flex justify-center">
              <button
                className="text-white px-6 py-3 rounded-lg shadow-md transition duration-300"
                style={{ backgroundColor: "#8A5647" }}
                type="submit"
              >
                Login
              </button>
            </div>
          </form>
          <p className="mt-4 text-center text-gray-600">
            Don’t have an account?
            <a
              href="/register"
              className="text-blue-600 hover:underline font-medium ml-1"
            >
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
