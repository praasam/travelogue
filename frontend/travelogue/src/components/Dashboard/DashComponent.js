import { useState, useEffect } from "react";
import ImageSelector from "./ImageSelector";
import MusicSelector from "./MusicSelector";
import ReelCreator from "./ReelCreator";
import { useFetchImages } from "./useImage";

export default function DashboardComponent() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [reelUrl, setReelUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sentiment, setSentiment] = useState("");
  const [musicTrack, setMusicTrack] = useState(null);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [trimmedAudioInfo, setTrimmedAudioInfo] = useState(null); // New state for trimmed audio
  const [imageDurations, setImageDurations] = useState({});
  const [globalDuration, setGlobalDuration] = useState("");
  
  const userId = localStorage.getItem("id");
  const { photos, setPhotos, fetchUploadedImages } = useFetchImages(userId);

  const handleImageSelection = (imageUrl) => {
    setSelectedFiles((prevSelectedFiles) => {
      if (prevSelectedFiles.includes(imageUrl)) {
        return prevSelectedFiles.filter((file) => file !== imageUrl);
      } else {
        return [...prevSelectedFiles, imageUrl];
      }
    });
    
    if (!imageDurations[imageUrl]) {
      setImageDurations(prev => ({
        ...prev,
        [imageUrl]: 2.0
      }));
    }
  };

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
        <ImageSelector 
          photos={photos}
          selectedFiles={selectedFiles}
          handleImageSelection={handleImageSelection}
          fetchUploadedImages={fetchUploadedImages}
          userId={userId}
          setPhotos={setPhotos}
          setSelectedFiles={setSelectedFiles}
          setErrorMessage={setErrorMessage}
          imageDurations={imageDurations}
          setImageDurations={setImageDurations}
          globalDuration={globalDuration}
          setGlobalDuration={setGlobalDuration}
          calculateTotalDuration={calculateTotalDuration}
        />
  
        {/* Main Content */}
        <main className="flex-grow flex flex-col items-center justify-center">
          {errorMessage && <div className="text-red-500 text-center mb-4">{errorMessage}</div>}

          {/* Placeholder when no images uploaded */}
          {photos.length === 0 ? (
            <div className="text-center">
              <img 
                src="upload1.gif" 
                alt="Upload Placeholder" 
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
                    src="select.gif"
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
                  <MusicSelector 
                    sentiment={sentiment}
                    setSentiment={setSentiment}
                    musicTrack={musicTrack}
                    setMusicTrack={setMusicTrack}
                    selectedAudio={selectedAudio}
                    setSelectedAudio={setSelectedAudio}
                    setErrorMessage={setErrorMessage}
                    setTrimmedAudioInfo={setTrimmedAudioInfo} // Pass the new setter
                  />

                  <ReelCreator 
                    selectedFiles={selectedFiles}
                    sentiment={sentiment}
                    selectedAudio={selectedAudio}
                    userId={userId}
                    setIsProcessing={setIsProcessing}
                    setReelUrl={setReelUrl}
                    setErrorMessage={setErrorMessage}
                    imageDurations={imageDurations}
                    trimmedAudioInfo={trimmedAudioInfo} // Pass the trimmed audio info
                  />
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