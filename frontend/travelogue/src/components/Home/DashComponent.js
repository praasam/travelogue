import { useState, useEffect, useCallback } from "react";

export default function DashboardComponent() {
  const [photos, setPhotos] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]); // Define selectedFiles state
  const [errorMessage, setErrorMessage] = useState(null);
  const [reelUrl, setReelUrl] = useState(null); // Store the created reel URL
  const [reels, setReels] = useState([]); // Store the user's reels
  const [isProcessing, setIsProcessing] = useState(false); // Track if reel is being processed
  const [sentiment, setSentiment] = useState(""); // Track sentiment value
  const [musicTrack, setMusicTrack] = useState(null); // Track music suggestion
  const userId = localStorage.getItem("id");
  const [selectedAudio, setSelectedAudio] = useState(null);

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

  const fetchUserReels = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reel/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("API Response:", data);
      setReels(data.reels); // Assuming the API returns the reel paths
    } catch (error) {
      console.error("Error fetching reels:", error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUploadedImages();
      fetchUserReels();
    }
  }, [userId, fetchUploadedImages, fetchUserReels]);

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
  
    if (!musicTrack || musicTrack.length === 0) {
      setErrorMessage("Please select a music track.");
      return;
    }
  
    const selectedMusicTrack = selectedAudio; // Use the actual selected track
    console.log("Selected Music Track:", selectedMusicTrack); // Debugging step to check what is being passed
  
    const requestBody = {
      userId: userId,
      selectedImageUrls: selectedFiles,
      sentiment: sentiment,
      selectedMusic: selectedMusicTrack,  // Pass the selected music track
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
      if (response.ok) {
        setReelUrl(data.reelUrl);
        fetchUserReels(); // Fetch updated list of reels after creating a new one
      } else {
        console.error("Error creating reel:", data.message);
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error("Error creating reel:", error);
      setErrorMessage("Error creating reel");
    }
  };
  
  
  
  
  const handleSubmitSentiment = async () => {
    const sentimentLower = sentiment.toLowerCase(); // Convert sentiment to lowercase
    console.log("Sentiment being sent:", sentimentLower); // Debugging the value being sent
  
    try {
      const res = await fetch("http://localhost:5000/api/music/suggest-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentiment: sentimentLower }), // Send lowercase sentiment
      });
  
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
  
      const data = await res.json();
      console.log("Suggested music:", data); // Debugging
  
      if (data.message) {
        setErrorMessage(data.message); // Display error message if sentiment not found
        return;
      }
  
      // Store multiple tracks in the state
      const musicTracks = Array.isArray(data.suggestedTracks) ? data.suggestedTracks : [data.suggestedTracks];
      setMusicTrack(musicTracks); // Store the array of music tracks
  
    } catch (error) {
      console.error("Error fetching music:", error);
      setErrorMessage("Error fetching music: " + error.message); // Display the error message
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
                      onClick={() => handleImageSelection(photo)}
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
              {selectedFiles.length >= 2 && !isProcessing && (
                <>
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
                    <button onClick={handleSubmitSentiment} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                      Submit Sentiment
                    </button>

                    <div>
  {musicTrack && musicTrack.length > 0 && (
    <div>
      <h3>Suggested Music:</h3>
      <div>
        {musicTrack.map((track, index) => (
          <div key={index} className="mt-2">
            <h4>{track}</h4> {/* Display the music track name */}
            {/* Only show the audio player for unselected tracks */}
            {!selectedAudio && (
              <audio controls>
                <source src={`http://localhost:5000/music/${track}`} type="audio/mp3" />
                Your browser does not support the audio tag.
              </audio>
            )}
            <button
              onClick={() => {
                setSelectedAudio(track); // Set the selected track
                setMusicTrack([track]); // Remove the other tracks from the list
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

  {/* Main Audio Player for Selected Track */}
  {selectedAudio && (
    <div className="mt-4">
      <h3>Selected Music: {selectedAudio}</h3>
      <audio key={selectedAudio} controls autoPlay>
        <source src={`http://localhost:5000/music/${selectedAudio}`} type="audio/mp3" />
        Your browser does not support the audio tag.
      </audio>
    </div>
  )}
</div>




                    <button onClick={handleCreateReel} className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                      Create Reel
                    </button>
                  </div>
                </>
              )}
              {isProcessing && (
                <div className="mt-4 text-center text-gray-500">Processing your reel...</div>
              )}
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

        <aside className="w-1/4 bg-white p-4 shadow-md">
          <h2 className="text-lg font-semibold mb-4">Your Reels</h2>
          <div className="flex flex-wrap gap-4 mt-2">
            {reels.map((reel, index) => (
              <div key={index} className="w-full sm:w-1/2 lg:w-1/4 p-2">
                {reel.reelPath.endsWith(".mp4") || reel.reelPath.endsWith(".mov") ? (
                  <a href={`http://localhost:5000${reel.reelPath}`} target="_blank" rel="noopener noreferrer">
                    <video className="w-full h-auto object-cover rounded-lg" controls>
                      <source src={`http://localhost:5000${reel.reelPath}`} type="video/mp4" />
                      <source src={`http://localhost:5000${reel.reelPath}`} type="video/ogg" />
                      <p>Your browser does not support the video tag.</p>
                    </video>
                  </a>
                ) : (
                  <a href={`http://localhost:5000${reel.reelPath}`} target="_blank" rel="noopener noreferrer">
                    <img
                      src={`http://localhost:5000${reel.reelPath}`}
                      alt={`Reel ${index}`}
                      className="w-full h-auto object-cover rounded-lg"
                    />
                  </a>
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
