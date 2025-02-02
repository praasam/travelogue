import React, { useState } from "react";
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
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
        console.log(response);
        toast.success(response.data.msg);

        // navigate to login page
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (error) {
        // Check if error.response is defined
        if (error.response) {
          console.error("Error response:", error.response);
          toast.error(error.response.data.msg);
        } else if (error.request) {
          // The request was made but no response was received
          console.error("Error request:", error.request);
          toast.error("Network error: Please try again later.");
        } else {
          // Something else caused the error
          console.error("Error:", error.message);
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
        <div className="md:w-1/2 p-8 flex items-center justify-center bg-white">
          <img
            src="/login.gif"
            alt="Register illustration"
            className="w-full h-auto"
          />
        </div>
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
              <label
                className="block text-gray-700 font-medium mb-2"
                htmlFor="username"
              >
                Username
              </label>
              <input
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.username && "border-red-500"
                }`}
                type="text"
                id="username"
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
              <label
                className="block text-gray-700 font-medium mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.email && "border-red-500"
                }`}
                type="email"
                id="email"
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
              <label
                className="block text-gray-700 font-medium mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <input
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.password && "border-red-500"
                }`}
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                name="password"
                value={userData.password}
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
                <div className="text-red-500 text-sm">{errors.password}</div>
              )}
            </div>
            <div className="mb-6 relative">
              <label
                className="block text-gray-700 font-medium mb-2"
                htmlFor="confirm-password"
              >
                Confirm Password
              </label>
              <input
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.confirmPassword && "border-red-500"
                }`}
                type={showConfirmPassword ? "text" : "password"}
                id="confirm-password"
                placeholder="Confirm your password"
                name="confirmPassword"
                value={userData.confirmPassword}
                onChange={handleChange}
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 mt-8 cursor-pointer"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className="text-gray-500" />
                ) : (
                  <FaEye className="text-gray-500" />
                )}
              </div>
              {errors.confirmPassword && (
                <div className="text-red-500 text-sm">
                  {errors.confirmPassword}
                </div>
              )}
            </div>
            <button
              className="w-full text-white px-6 py-3 rounded-lg shadow-md transition duration-300"
              style={{ backgroundColor: "#F0BCCD" }}
              type="submit"
            >
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
