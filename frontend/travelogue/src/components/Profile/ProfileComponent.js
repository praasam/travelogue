// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const ProfileComponent = () => {
//   const [userDetails, setUserDetails] = useState(null);
//   const [image, setImage] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [imageURL, setImageURL] = useState('');

//   // Fetch the user's profile details
//   useEffect(() => {
//     const fetchUserDetails = async () => {
//       try {
//         const token = localStorage.getItem('token'); // Retrieve token from local storage
//         const response = await axios.get('http://localhost:5000/api/users/profile', {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setUserDetails(response.data);
//         setImageURL(response.data.profilePicture || '');
//         setLoading(false);
//       } catch (err) {
//         setError('Error fetching profile');
//         setLoading(false);
//       }
//     };

//     fetchUserDetails();
//   }, []);

//   // Handle file change
//   const handleImageChange = (e) => {
//     setImage(e.target.files[0]);
//   };

//   // Upload the profile picture
//   const handleProfilePictureUpload = async (e) => {
//     e.preventDefault();

//     if (!image) {
//       setError('Please select a file to upload');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('profilePic', image);

//     const token = localStorage.getItem('token'); // Retrieve token from local storage

//     try {
//         const response = await axios.post('http://localhost:5000/api/users/upload-profile-picture', formData, {
//             headers: {
//               'Content-Type': 'multipart/form-data',
//               Authorization: `Bearer ${token}`,
//             },
//           });
          
          

//       // Update the user's profile picture after successful upload
//       setImageURL(response.data.profilePicture);
//       setError('');
//     } catch (error) {
//       setError('Error uploading profile picture');
//     }
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg">
//       <h2 className="text-2xl font-semibold text-center mb-4">Your Profile</h2>

//       {/* Profile Picture */}
//       <div className="flex justify-center mb-6">
//         <img
//           src={imageURL || 'https://via.placeholder.com/150'}
//           alt="Profile"
//           className="w-32 h-32 rounded-full object-cover border-4 border-gray-300"
//         />
//       </div>

//       {/* Upload Form */}
//       <form onSubmit={handleProfilePictureUpload} className="space-y-4">
//         <input
//           type="file"
//           onChange={handleImageChange}
//           className="block w-full py-2 px-4 border border-gray-300 rounded-md"
//         />
//         <button
//           type="submit"
//           className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
//         >
//           Upload Profile Picture
//         </button>
//       </form>

//       {error && <p className="text-red-500 mt-4">{error}</p>}
//     </div>
//   );
// };

// export default ProfileComponent;
