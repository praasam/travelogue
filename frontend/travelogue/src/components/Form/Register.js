import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    setUserData({ ...userData, [name]: value });
  };

  const validate = () => {
    const errors = {};
    if (!userData.username) {
      errors.username = "Username is required";
    }
    if (!userData.email) errors.email = "Email is required";
    if (!userData.password) errors.password = "Password is required";
    if (!userData.confirmPassword)
      errors.confirmPassword = "Confirm Password is required";
    if (userData.password !== userData.confirmPassword)
      errors.confirmPassword = "Passwords must match";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await axios.post(
          "http://localhost:5000/auth/register",
          {
            name: userData.username,
            email: userData.email,
            password: userData.password,
          }
        );
        toast.success(response.data.msg);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.msg);
        } else if (error.request) {
          toast.error("Network error: Please try again later.");
        } else {
          toast.error("An unexpected error occurred. Please try again.");
        }
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col md:flex-row bg-white shadow-lg max-w-4xl w-full rounded-lg overflow-hidden my-8">
        
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

        {/* Registration Form */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-3xl mb-6 text-center font-semibold text-gray-800">
            Register Here
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Create a new account to get started
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <ToastContainer />
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Username
              </label>
              <input
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.username && "border-red-500"
                }`}
                type="text"
                placeholder="Enter your username"
                name="username"
                value={userData.username}
                onChange={handleChange}
              />
              {errors.username && (
                <div className="text-red-500 text-sm">{errors.username}</div>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Email
              </label>
              <input
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.email && "border-red-500"
                }`}
                type="email"
                placeholder="Enter your email"
                name="email"
                value={userData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <div className="text-red-500 text-sm">{errors.email}</div>
              )}
            </div>
            <div className="mb-4 relative">
              <label className="block text-gray-700 font-medium mb-2">
                Password
              </label>
              <input
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.password && "border-red-500"
                }`}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                name="password"
                value={userData.password}
                onChange={handleChange}
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 mt-8 cursor-pointer"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
              </div>
              {errors.password && (
                <div className="text-red-500 text-sm">{errors.password}</div>
              )}
            </div>
            <div className="mb-6 relative">
              <label className="block text-gray-700 font-medium mb-2">
                Confirm Password
              </label>
              <input
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.confirmPassword && "border-red-500"
                }`}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                name="confirmPassword"
                value={userData.confirmPassword}
                onChange={handleChange}
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 mt-8 cursor-pointer"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
              </div>
            </div>
            <button className="w-full text-white px-6 py-3 rounded-lg shadow-md" style={{ backgroundColor: "#8A5647" }}>
              Register
            </button>
          </form>

          <p className="mt-4 text-center text-gray-600">
            Already have an account?
            <a
              href="/login"
              className="text-blue-600 hover:underline font-medium ml-1"
            >
              Login here
            </a>
          </p>

        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
