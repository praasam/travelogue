// frontend/src/DashboardComponent.js
import { useState, useEffect, useCallback } from "react";

export default function DashboardComponent() {
  const [photos, setPhotos] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);  // Define selectedFiles state
  const [errorMessage, setErrorMessage] = useState(null);
  const [reelUrl, setReelUrl] = useState(null); // Store the created reel URL

  const userId = localStorage.getItem("id");

  const fetchUploadedImages = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/images/${userId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (data.images.length > 0) {
        setPhotos(data.images.map((img) => `http://localhost:5000${img}`));
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUploadedImages();
    }
  }, [userId, fetchUploadedImages]);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    const formData = new FormData();

    formData.append("userId", userId);
    files.forEach((file) => formData.append("photos", file));

    try {
      const response = await fetch("http://localhost:5000/api/images/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Response from backend:", data);

      if (response.ok) {
        fetchUploadedImages();
      } else {
        console.error("Upload failed:", data.message);
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      setErrorMessage("Error uploading files");
    }
  };

  const handleImageSelection = (imageFile) => {
    setSelectedFiles((prevSelectedFiles) => {
      if (prevSelectedFiles.includes(imageFile)) {
        return prevSelectedFiles.filter((file) => file !== imageFile); // Deselect file
      } else {
        return [...prevSelectedFiles, imageFile]; // Select file
      }
    });
  };

  const handleCreateReel = async () => {
    if (selectedFiles.length < 2) {
      setErrorMessage("At least 2 images are required to create a reel.");
      return;
    }
  
    console.log("Selected files:", selectedFiles);
    
    // Make sure selectedFiles is an array of image URLs
    const selectedImageUrls = selectedFiles.map((file) => file);  // Assuming selectedFiles are URLs directly
  
    console.log("Selected Image URLs:", selectedImageUrls);
  
    // Send the image URLs as a JSON body, not as FormData
    const requestBody = {
      userId: "someUserId",  // Replace with actual userId if needed
      selectedImageUrls: selectedImageUrls,
    };
  
    try {
      const response = await fetch("http://localhost:5000/api/reel/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",  // Make sure Content-Type is set as application/json
        },
        body: JSON.stringify(requestBody),  // Send the request body as a JSON string
      });
  
      const data = await response.json();
      if (response.ok) {
        setReelUrl(data.reelUrl);
      } else {
        console.error("Error creating reel:", data.message);
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error("Error creating reel:", error);
      setErrorMessage("Error creating reel");
    }
  };
  
  

  const handleDeleteImage = async (imageUrl) => {
    try {
      const response = await fetch("http://localhost:5000/api/images/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, imageUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setPhotos((prevPhotos) => prevPhotos.filter((photo) => photo !== imageUrl));
        setSelectedFiles((prevSelectedFiles) =>
          prevSelectedFiles.filter((file) => file !== imageUrl)
        );
      } else {
        console.error("Error deleting image:", data.message);
        setErrorMessage(data.message || "Error deleting image");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      setErrorMessage("Error deleting image");
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-grow bg-blue-50">
        <aside className="w-1/4 bg-white p-4 shadow-md">
          <h2 className="text-lg font-semibold mb-4">Select Photos</h2>
          <label className="w-full p-3 text-left bg-blue-100 rounded-lg hover:bg-blue-200 cursor-pointer block text-center">
            Upload images
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          {photos.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium">Uploaded Images:</h3>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt={`Uploaded ${index}`}
                      className={`w-16 h-16 object-cover rounded-md ${selectedFiles.includes(photo) ? "border-2 border-blue-500" : ""}`}
                      onClick={() => handleImageSelection(photo)}  // Update to handle file selection
                    />
                    {selectedFiles.includes(photo) && (
                      <button
                        onClick={() => handleDeleteImage(photo)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 py-1 text-xs"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        <main className="flex-grow flex flex-col items-center justify-center">
          {errorMessage && <div className="text-red-500 text-center">{errorMessage}</div>}
          {photos.length === 0 ? (
            <div className="text-center">
              <img src="https://via.placeholder.com/100" alt="Placeholder" className="mx-auto mb-4" />
              <p className="text-gray-500">You didn’t upload any images yet...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {selectedFiles.length >= 2 && (
                <button
                  onClick={handleCreateReel}
                  className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Create a Reel
                </button>
              )}
              {reelUrl && (
                <div className="mt-4">
                  <a href={reelUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                    View Reel
                  </a>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
