import { useState, useEffect, useCallback } from "react";

export default function DashboardComponent() {
  const [photos, setPhotos] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [reelUrl, setReelUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sentiment, setSentiment] = useState("");
  const [musicTrack, setMusicTrack] = useState(null);
  const userId = localStorage.getItem("id");
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [globalDuration, setGlobalDuration] = useState(""); // For global input
  const [imageDurations, setImageDurations] = useState({}); // Store durations

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

  const handleImageSelection = (imageUrl) => {
    setSelectedFiles((prevSelectedFiles) => {
      if (prevSelectedFiles.includes(imageUrl)) {
        return prevSelectedFiles.filter((file) => file !== imageUrl); // Deselect file
      } else {
        return [...prevSelectedFiles, imageUrl]; // Select file
      }
    });
    
    // Initialize duration for newly selected image if not already set
    if (!imageDurations[imageUrl]) {
      setImageDurations(prev => ({
        ...prev,
        [imageUrl]: 2.0 // Default 2 seconds duration
      }));
    }
  };



  const handleCreateReel = async () => {
    if (selectedFiles.length < 2) {
      setErrorMessage("At least 2 images are required to create a reel.");
      return;
    }
  
    if (!sentiment) {
      setErrorMessage("Please select a sentiment.");
      return;
    }
  
    if (!selectedAudio) {
      setErrorMessage("Please select a music track.");
      return;
    }
  
    setIsProcessing(true);
  
    // Create an array of image objects with URL and duration
    const selectedImages = selectedFiles.map(url => ({
      url,
      duration: imageDurations[url] || 2.0, // Use the duration from imageDurations or default to 2 seconds
    }));
  
    const requestBody = {
      userId: userId,
      selectedImages: selectedImages, // Send the selected images with their durations
      sentiment: sentiment.toLowerCase(),
      selectedMusic: selectedAudio,
    };
  
    try {
      const response = await fetch("http://localhost:5000/api/reel/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
  
      const data = await response.json();
      setIsProcessing(false);
  
      if (response.ok) {
        setReelUrl(data.reelUrl);
        setErrorMessage(null);
      } else {
        console.error("Error creating reel:", data.message);
        setErrorMessage(data.message);
      }
    } catch (error) {
      setIsProcessing(false);
      console.error("Error creating reel:", error);
      setErrorMessage("Error creating reel");
    }
  };

  const handleSubmitSentiment = async () => {
    const sentimentLower = sentiment.toLowerCase();
    console.log("Sentiment being sent:", sentimentLower);
  
    try {
      const res = await fetch("http://localhost:5000/api/music/suggest-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentiment: sentimentLower }),
      });
  
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
  
      const data = await res.json();
      console.log("Suggested music:", data);
  
      if (data.message) {
        setErrorMessage(data.message);
        return;
      }
  
      // Store multiple tracks in the state
      const musicTracks = Array.isArray(data.suggestedTracks) ? data.suggestedTracks : [data.suggestedTracks];
      setMusicTrack(musicTracks);
  
    } catch (error) {
      console.error("Error fetching music:", error);
      setErrorMessage("Error fetching music: " + error.message);
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
        // Also remove from imageDurations
        setImageDurations(prev => {
          const newDurations = {...prev};
          delete newDurations[imageUrl];
          return newDurations;
        });
      } else {
        console.error("Error deleting image:", data.message);
        setErrorMessage(data.message || "Error deleting image");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      setErrorMessage("Error deleting image");
    }
  };

 // Handle individual image duration changes
 const handleDurationChange = (e, url) => {
  setImageDurations((prev) => ({
    ...prev,
    [url]: parseFloat(e.target.value) || 0, // Avoid NaN
  }));
};

 // Handle global input change
 const handleGlobalDurationChange = (e) => {
  setGlobalDuration(e.target.value);
};

 // Apply global duration to all selected images
 const handleSetAllDurations = () => {
  if (!globalDuration) return; // Don't apply if empty

  setImageDurations((prev) => {
    const newDurations = { ...prev };
    selectedFiles.forEach((url) => {
      newDurations[url] = parseFloat(globalDuration) || 2.0; // Apply input value
    });

    return newDurations;
  });
};

   // Set all image durations back to default (e.g., 2 seconds)
   const handleResetToDefaultDuration = () => {
    setImageDurations((prev) => {
      const newDurations = {};
      selectedFiles.forEach((url) => {
        newDurations[url] = 2.0; // Set all to 2 seconds
      });
      return newDurations;
    });
  };

 // Calculate total duration of reel
 const calculateTotalDuration = () => {
  let total = 0;
  selectedFiles.forEach(url => {
    total += imageDurations[url] || 2.0;
  });
  return total.toFixed(1);
};

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-grow bg-blue-50">
        {/* Sidebar */}
        <aside className="w-1/4 bg-white p-4 shadow-md">
          <h2 className="text-lg font-semibold mb-4">Select Photos</h2>
          <label className="w-full p-3 text-left bg-blue-100 rounded-lg hover:bg-blue-200 cursor-pointer block text-center">
            Upload images
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
  
          {/* Uploaded Images */}
          {photos.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium">Uploaded Images:</h3>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt={`Uploaded ${index}`}
                      className={`w-16 h-16 object-cover rounded-md cursor-pointer ${
                        selectedFiles.includes(photo) ? "border-2 border-blue-500" : ""
                      }`}
                      onClick={() => handleImageSelection(photo)}
                    />
                    {selectedFiles.includes(photo) && (
                      <>
                        <button
                          onClick={() => handleDeleteImage(photo)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 py-1 text-xs"
                        >
                          ×
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                          <input
                            type="number"
                            min="0.5"
                            max="10"
                            step="0.5"
                            value={imageDurations[photo] ?? 2}
                            onChange={(e) => handleDurationChange(e, photo)}
                            className="w-full text-black p-1 rounded"
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
  
          {/* Selected Images */}
          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium">Selected Images: {selectedFiles.length}</h3>
              <p className="text-xs text-gray-600">Total Duration: {calculateTotalDuration()} seconds</p>

              <div className="mt-2">
                <label className="text-xs block mb-1">Set all durations (seconds):</label>
                <div className="flex">
                  <input
                    type="number"
                    min="0.5"
                    max="10"
                    step="0.5"
                    defaultValue="2"
                    className="w-16 text-sm p-1 border rounded"
                  />
                  <button onClick={handleSetAllDurations} className="bg-blue-500 text-white px-4 py-2 ml-2 rounded">
                    Apply
                  </button>
                </div>
                {/* Button to reset all durations to default */}
                <button
                  onClick={handleResetToDefaultDuration}
                  className="mt-2 text-xs text-blue-600"
                >
                  Reset all durations to default (2 seconds)
                </button>
              </div>
            </div>
          )}

        </aside>
  
        {/* Main Content */}
        <main className="flex-grow flex flex-col items-center justify-center ">
  {errorMessage && <div className="text-red-500 text-center mb-4">{errorMessage}</div>}

  {/* Placeholder when no images uploaded */}
  {photos.length === 0 ? (
    <div className="text-center">
  <img 
    src="upload1.gif" 
    alt="Your GIF" 
    className="mx-auto mb-4 w-100 h-80" 
  />
  <p className="text-gray-500">You didn't upload any images yet...</p>
</div>


  ) : (
    <div className="flex flex-col items-center">
      {/* Show GIF when no images selected */}
      {selectedFiles.length === 0 && (
        <div className="flex justify-center mt-6">
          <img
            src="select.gif" // Replace with your GIF URL
            alt="No Images Selected"
            className="w-100 h-80 object-cover rounded-md"
          />
        </div>
      )}

      {/* Display Selected Images */}
      {selectedFiles.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-6">Your Selected Images</h2>
          <div className="mt-4 flex space-x-2">
            {selectedFiles.map((file, index) => (
              <img
                key={index}
                src={file}
                alt={`Selected ${index}`}
                className="w-16 h-16 object-cover rounded-md"
              />
            ))}
          </div>
        </>
      )}

      {selectedFiles.length >= 2 && !isProcessing && (
        <>
          {/* Sentiment Selection */}
          <div className="mt-4">
            <select
              id="sentiment"
              value={sentiment}
              onChange={(e) => setSentiment(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">Select Sentiment</option>
              <option value="happy">Happy</option>
              <option value="sad">Sad</option>
              <option value="angry">Angry</option>
              <option value="neutral">Neutral</option>
            </select>
            <button
              onClick={handleSubmitSentiment}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Submit Sentiment
            </button>
          </div>

          {/* Music Selection */}
          <div className="mt-4">
            {musicTrack && musicTrack.length > 0 && (
              <div>
                <h3 className="text-lg font-medium">Select Music:</h3>
                <div>
                  {musicTrack.map((track, index) => (
                    <div key={index} className="mt-2">
                      <h4 className="text-sm">{track}</h4>
                      {!selectedAudio && (
                        <audio controls className="mt-1">
                          <source src={`http://localhost:5000/music/${track}`} type="audio/mp3" />
                          Your browser does not support the audio tag.
                        </audio>
                      )}
                      <button
                        onClick={() => {
                          setSelectedAudio(track);
                          setMusicTrack([track]);
                        }}
                        className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        Select Music
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Music */}
            {selectedAudio && (
              <div className="mt-4">
                <h3 className="text-lg font-medium">Selected Music: {selectedAudio}</h3>
                <audio key={selectedAudio} controls autoPlay className="mt-2">
                  <source src={`http://localhost:5000/music/${selectedAudio}`} type="audio/mp3" />
                  Your browser does not support the audio tag.
                </audio>
              </div>
            )}
          </div>

          {/* Create Reel Button */}
          <button
            onClick={handleCreateReel}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Create Reel
          </button>
        </>
      )}

      {/* Processing State */}
      {isProcessing && <div className="mt-4 text-center text-gray-500">Processing your reel...</div>}

      {/* Reel Output */}
      {reelUrl && !isProcessing && (
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