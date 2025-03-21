// 


import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState({
    bio: "",
    address: "",
    phone: "",
    email: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/profile/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        setFormData({
          bio: response.data.bio || "",
          address: response.data.address || "",
          phone: response.data.phone || "",
          email: response.data.email || "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("There was an error fetching the profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    handleImageUpload(e.target.files[0]);
  };

  const handleImageUpload = async (selectedImage) => {
    if (!selectedImage) {
      showNotification("Please select an image to upload.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", selectedImage);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/profile/upload-profile-image",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUser((prevUser) => ({
        ...prevUser,
        profileImage: response.data.profileImage,
      }));

      showNotification("Profile image updated successfully!", "success");
    } catch (error) {
      console.error("Error uploading image:", error);
      showNotification("Failed to upload image.", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const token = localStorage.getItem("token");
    
    // Create a new object without the email property
    const dataToSubmit = {
      bio: formData.bio,
      address: formData.address,
      phone: formData.phone,
      // email is excluded since it's read-only
    };

    try {
      const response = await axios.put(
        "http://localhost:5000/api/profile/update-profile",
        dataToSubmit,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setUser((prevUser) => ({
        ...prevUser,
        ...response.data,
      }));

      showNotification("Profile updated successfully!", "success");
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.response) {
        showNotification(`Failed to update profile: ${error.response.data.message}`, "error");
      } else {
        showNotification("Failed to update profile. Please try again.", "error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center p-10 bg-white rounded-2xl shadow-xl">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-16 w-16 mb-6 rounded-full bg-gradient-to-r from-purple-200 to-pink-200"></div>
            <div className="h-4 w-32 bg-gradient-to-r from-purple-200 to-pink-200 rounded mb-3"></div>
            <div className="h-3 w-24 bg-gradient-to-r from-purple-200 to-pink-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center p-10 bg-white rounded-2xl shadow-xl">
          <div className="p-6 rounded-xl mb-6 border-2 border-red-400 bg-red-50 flex flex-col items-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-red-600 font-medium text-lg">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50 py-16 px-4">
      {notification.show && (
        <div
          className={`fixed top-5 right-5 p-4 rounded-xl shadow-xl z-50 transition-all duration-300 ${
            notification.type === "success" 
              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400" 
              : "bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-400"
          }`}
        >
          <div className="flex items-center">
            {notification.type === "success" ? (
              <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            ) : (
              <svg className="w-6 h-6 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
          <div className="h-64 relative bg-gradient-to-r from-purple-500 to-pink-500">
            <div className="absolute top-4 left-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center bg-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                <span className="text-purple-600 font-medium">Back</span>
              </button>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-white opacity-10"></div>
            <div className="absolute bottom-10 left-10 w-12 h-12 rounded-full bg-white opacity-10"></div>
            <div className="absolute top-20 right-40 w-8 h-8 rounded-full bg-white opacity-10"></div>

            <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                <div className="w-40 h-40 rounded-full border-4 border-white bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center overflow-hidden shadow-xl">
                  <img
                    src={user?.profileImage || "https://via.placeholder.com/150"}
                    alt="Profile"
                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-all duration-300"
                    onClick={() => fileInputRef.current.click()}
                  />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                  accept="image/*"
                />
                <div className="absolute bottom-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full cursor-pointer shadow-lg text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-24 text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{user?.username || "Username"}</h2>
            <div className="inline-flex items-center px-4 py-2 mt-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full font-medium text-purple-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-pink-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              {user?.role || "Role"}
            </div>
          </div>

          <div className="p-8 mt-6">
            <h3 className="text-xl font-bold text-purple-700 mb-6 border-b-2 border-purple-100 pb-2 flex items-center">
              <svg className="w-6 h-6 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Edit Profile
            </h3>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-purple-700 font-medium mb-2 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-pink-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      readOnly
                      className="w-full border-2 border-purple-100 p-4 rounded-xl shadow-sm bg-purple-50 text-gray-500"
                      placeholder="Email cannot be changed"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-purple-400 mt-1 ml-2">Email address cannot be changed</p>
                </div>

                <div className="flex flex-col">
                  <label className="text-purple-700 font-medium mb-2 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-pink-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border-2 border-purple-100 p-4 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-purple-700 font-medium mb-2 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-pink-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full border-2 border-purple-100 p-4 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                  placeholder="Enter your address"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-purple-700 font-medium mb-2 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-pink-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full border-2 border-purple-100 p-4 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                  placeholder="Tell us about yourself"
                  rows="4"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-8 py-4 border-2 border-purple-200 text-purple-600 rounded-xl hover:bg-purple-50 transition-all duration-300 font-medium text-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-medium text-lg flex items-center ${
                    isSaving ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isSaving && (
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;