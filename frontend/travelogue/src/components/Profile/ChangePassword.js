// 3. Create a React component for changing password

import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ChangePasswordComponent = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const validate = () => {
    const errors = {};
    if (!passwordData.currentPassword) errors.currentPassword = "Current password is required";
    if (!passwordData.newPassword) errors.newPassword = "New password is required";
    if (passwordData.newPassword.length < 6) errors.newPassword = "Password must be at least 6 characters";
    if (!passwordData.confirmPassword) errors.confirmPassword = "Please confirm your new password";
    if (passwordData.newPassword !== passwordData.confirmPassword) 
      errors.confirmPassword = "Passwords do not match";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const token = localStorage.getItem("token");
        
        const response = await axios.put(
          "http://localhost:5000/auth/change-password",
          {
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        toast.success(response.data.msg);
        // Clear form after successful submission
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } catch (error) {
        toast.error(error.response?.data?.msg || "Failed to change password");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-center mb-6">Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ToastContainer />
        
        {/* Current Password Field */}
        <div className="relative">
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Current Password
          </label>
          <input
            className={`border p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              errors.currentPassword ? "border-red-500" : "border-gray-300"
            }`}
            type={showCurrentPassword ? "text" : "password"}
            name="currentPassword"
            placeholder="Enter your current password"
            value={passwordData.currentPassword}
            onChange={handleChange}
          />
          <div
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 mt-8 cursor-pointer"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
          >
            {showCurrentPassword ? (
              <FaEyeSlash className="text-gray-500" />
            ) : (
              <FaEye className="text-gray-500" />
            )}
          </div>
          {errors.currentPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>
          )}
        </div>

        {/* New Password Field */}
        <div className="relative">
          <label className="block text-gray-700 text-sm font-medium mb-1">
            New Password
          </label>
          <input
            className={`border p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              errors.newPassword ? "border-red-500" : "border-gray-300"
            }`}
            type={showNewPassword ? "text" : "password"}
            name="newPassword"
            placeholder="Enter your new password"
            value={passwordData.newPassword}
            onChange={handleChange}
          />
          <div
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 mt-8 cursor-pointer"
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? (
              <FaEyeSlash className="text-gray-500" />
            ) : (
              <FaEye className="text-gray-500" />
            )}
          </div>
          {errors.newPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="relative">
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Confirm New Password
          </label>
          <input
            className={`border p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              errors.confirmPassword ? "border-red-500" : "border-gray-300"
            }`}
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm your new password"
            value={passwordData.confirmPassword}
            onChange={handleChange}
          />
          <div
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 mt-8 cursor-pointer"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <FaEyeSlash className="text-gray-500" />
            ) : (
              <FaEye className="text-gray-500" />
            )}
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            className="text-white px-6 py-3 rounded-lg shadow-md transition duration-300"
            style={{ backgroundColor: "#8A5647" }}
            type="submit"
          >
            Change Password
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordComponent;