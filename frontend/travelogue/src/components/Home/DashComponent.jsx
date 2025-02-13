import { useState } from "react";

export default function DashboardComponent() {
  const [photos, setPhotos] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  const userId = "679f40e5c991d9f21b1a0409"; // Replace with actual user ID from authentication

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
        // Check if data.urls is valid
        const validUrls = Array.isArray(data.urls)
          ? data.urls.filter(url => url.startsWith("http"))
          : [];

        setPhotos((prevPhotos) => [
          ...prevPhotos,
          ...files.map((file) => URL.createObjectURL(file)), // Local preview
          ...validUrls, // Only add valid backend URLs
        ]);
      } else {
        setErrorMessage(`Upload failed: ${data.message || "Unknown error"}`);
        console.error("Upload failed:", data.message);
      }
    } catch (error) {
      setErrorMessage(`Error uploading files: ${error.message}`);
      console.error("Error uploading files:", error);
    }
  };

  const removePhoto = async (indexToRemove, imageUrl) => {
    try {
      const response = await fetch("http://localhost:5000/api/images/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, imageUrl })
      });
  
      const data = await response.json();
      
      if (response.ok) {
        setPhotos((prevPhotos) => prevPhotos.filter((_, index) => index !== indexToRemove));
      } else {
        console.error("Error deleting photo:", data.message);
        setErrorMessage(data.message || "Error deleting photo");
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      setErrorMessage("Error deleting photo");
    }
  };
  
  

  return (
    <div className="h-screen flex flex-col">
      {/* Main Content */}
      <div className="flex flex-grow bg-blue-50">
        {/* Sidebar */}
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
        </aside>

        {/* Content Area */}
        <main className="flex-grow flex flex-col items-center justify-center">
          {errorMessage && <div className="text-red-500 text-center">{errorMessage}</div>}
          {photos.length === 0 ? (
            <div className="text-center">
              <img src="https://via.placeholder.com/100" alt="Placeholder" className="mx-auto mb-4" />
              <p className="text-gray-500">You didn’t upload any images yet...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="grid grid-cols-3 gap-4 p-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={typeof photo === "string" ? photo : URL.createObjectURL(photo)}
                      alt={`Uploaded ${index}`}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <button
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 py-1 text-xs"
                      onClick={() => removePhoto(index, photo)} // Pass index and imageUrl
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {photos.length > 1 && (
                <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                  Create a Reel
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
