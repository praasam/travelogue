import { useState, useEffect } from "react";
import MusicTrimmer from "./MusicTrimmer";


function MusicSelector({
  sentiment,
  setSentiment,
  musicTrack,
  setMusicTrack,
  selectedAudio,
  setSelectedAudio,
  setErrorMessage,
  setTrimmedAudioInfo
}) {
  const [showTrimmer, setShowTrimmer] = useState(false);
  const [tempSelectedAudio, setTempSelectedAudio] = useState(null);
  const [currentTrimInfo, setCurrentTrimInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDurationPrompt, setShowDurationPrompt] = useState(false);
  const [videoDuration, setVideoDuration] = useState("");

  useEffect(() => {
    if (currentTrimInfo) {
      console.log("Current trim info:", currentTrimInfo);
    }
  }, [currentTrimInfo]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showTrimmer || showDurationPrompt) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showTrimmer, showDurationPrompt]);

  const handleSubmitSentiment = async () => {
    const sentimentLower = sentiment.toLowerCase();
    console.log("Sentiment being sent:", sentimentLower);

    if (!sentiment) {
      setErrorMessage("Please select a sentiment.");
      return;
    }

    // Show duration prompt before proceeding
    setShowDurationPrompt(true);
  };

  const handleConfirmDuration = async () => {
    setShowDurationPrompt(false);
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/music/suggest-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sentiment: sentiment.toLowerCase(),
          duration: videoDuration ? parseFloat(videoDuration) : null
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      console.log("Suggested music:", data);

      if (data.message) {
        setErrorMessage(data.message);
        return;
      }

      const musicTracks = Array.isArray(data.suggestedTracks) ? data.suggestedTracks : [data.suggestedTracks];
      setMusicTrack(musicTracks);
    } catch (error) {
      console.error("Error fetching music:", error);
      setErrorMessage("Error fetching music: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMusic = (track) => {
    setTempSelectedAudio(track);
    setShowTrimmer(true);
  };

  const handleTrimComplete = (trimInfo) => {
    console.log("Trim completed with info:", trimInfo);

    setSelectedAudio(trimInfo.audioFile);
    setTrimmedAudioInfo(trimInfo); // Pass the trim info to the parent
    setCurrentTrimInfo(trimInfo); // Store the trim info locally
    setShowTrimmer(false);

    // createReelWithAudio(trimInfo); // Create the reel with trimmed audio
  };

  const handleCancelTrim = () => {
    setShowTrimmer(false);
    setTempSelectedAudio(null);
  };

  // const createReelWithAudio = async (trimInfo) => {
  //   try {
  //     // Send the trimmed audio file info to the backend
  //     const response = await fetch("http://localhost:5000/api/reel/create", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         videoFile: "sample-video.mp4", // Include the video file name here
  //         audioFile: trimInfo.audioFile, // Use trimmed audio
  //         startTime: trimInfo.startTime, // Start time from trimming
  //         endTime: trimInfo.endTime, // End time from trimming
  //       }),
  //     });

  //     const data = await response.json();
  //     if (data.success) {
  //       console.log("Reel created successfully");
  //       // Handle further actions like showing the reel
  //     } else {
  //       console.error("Error creating reel:", data.message);
  //     }
  //   } catch (error) {
  //     console.error("Error creating reel:", error);
  //   }
  // };

  const formatTimeToMinutes = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get sentiment emoji
  const getSentimentEmoji = (sentiment) => {
    switch(sentiment.toLowerCase()) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'angry': return '😡';
      case 'neutral': return '😐';
      default: return '🎵';
    }
  };

  // Get sentiment color
  const getSentimentColor = (sentiment) => {
    switch(sentiment.toLowerCase()) {
      case 'happy': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'sad': return 'bg-blue-500 hover:bg-blue-600';
      case 'angry': return 'bg-red-500 hover:bg-red-600';
      case 'neutral': return 'bg-gray-500 hover:bg-gray-600';
      default: return 'bg-purple-500 hover:bg-purple-600';
    }
  };

  return (
    <div className="mt-6 w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      {/* Title and Description */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Music Selection</h2>
        <p className="text-gray-600 mt-1">Choose music that matches your mood</p>
      </div>
      
      {/* Sentiment Selection */}
      <div className="mb-6">
        <label htmlFor="sentiment" className="block text-sm font-medium text-gray-700 mb-2">
          What's your mood today?
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            id="sentiment"
            value={sentiment}
            onChange={(e) => setSentiment(e.target.value)}
            className="flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select Mood</option>
            <option value="happy">😊 Happy</option>
            <option value="sad">😢 Sad</option>
            <option value="angry">😡 Angry</option>
            <option value="neutral">😐 Neutral</option>
          </select>
          <button
            onClick={handleSubmitSentiment}
            disabled={isLoading}
            className={`px-6 py-3 text-white rounded-lg transition-all transform hover:scale-105 flex items-center justify-center ${sentiment ? getSentimentColor(sentiment) : 'bg-indigo-500 hover:bg-indigo-600'}`}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                {sentiment && getSentimentEmoji(sentiment)}
                <span className="ml-1">Find Music</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Music Selection */}
      {musicTrack && musicTrack.length > 0 && !showTrimmer && !selectedAudio && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Suggested Tracks</h3>
          <div className="space-y-4">
            {musicTrack.map((track, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                <h4 className="font-medium text-gray-700 truncate">{track}</h4>
                <audio 
                  controls 
                  className="w-full mt-2 h-10"
                  preload="metadata"
                >
                  <source src={`http://localhost:5000/music/${track}`} type="audio/mp3" />
                  Your browser does not support the audio tag.
                </audio>
                <button
                  onClick={() => handleSelectMusic(track)}
                  className="w-full mt-3 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Select & Trim
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Duration Prompt Modal */}
      {showDurationPrompt && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md mx-auto p-6 w-full">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Video Duration</h3>
            <p className="text-gray-600 mb-4">
              Have you set the time duration for your video?
            </p>
           
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDurationPrompt(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDuration}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
              >
                Yes, Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Music Trimmer Modal */}
      {showTrimmer && tempSelectedAudio && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div 
            className="relative bg-white rounded-lg shadow-xl max-w-4xl mx-auto my-8"
            style={{ maxHeight: "calc(100vh - 4rem)" }}
          >
            {/* Close button in the top right corner */}
            <button 
              onClick={handleCancelTrim}
              className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full text-gray-700"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Scrollable container for trimmer content */}
            <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 4rem)" }}>
              <MusicTrimmer
                selectedAudio={tempSelectedAudio}
                onTrimComplete={handleTrimComplete}
                onCancel={handleCancelTrim}
              />
            </div>
          </div>
        </div>
      )}

      {/* Selected Music with Trimming */}
      {selectedAudio && !showTrimmer && (
        <div className="mt-4">
          <h3 className="text-lg font-medium">Selected Music: {selectedAudio}</h3>
          <audio
            key={`${selectedAudio}-${currentTrimInfo?.startTime}-${currentTrimInfo?.endTime}`}
            controls
            ref={(audioElement) => {
              if (audioElement && currentTrimInfo) {
                // Set the current time to the trim start position
                audioElement.currentTime = currentTrimInfo.startTime;

                // Add event listener to stop playback at end time
                audioElement.addEventListener("timeupdate", () => {
                  if (audioElement.currentTime >= currentTrimInfo.endTime) {
                    audioElement.pause();
                  }
                });
              }
            }}
            className="mt-1 w-full"
          >
            <source src={`http://localhost:5000/music/${selectedAudio}`} type="audio/mp3" />
            Your browser does not support the audio tag.
          </audio>
          <div className="mt-2">
            {currentTrimInfo && (
              <p className="text-sm text-gray-600">
                Trimmed: {formatTimeToMinutes(currentTrimInfo.startTime)} to {formatTimeToMinutes(currentTrimInfo.endTime)}
              </p>
            )}
            <button
              onClick={() => {
                setShowTrimmer(true);
                setTempSelectedAudio(selectedAudio);
              }}
              className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              Re-trim Music
            </button>
            <button
              onClick={() => {
                setSelectedAudio(null);
                setCurrentTrimInfo(null);
                setTrimmedAudioInfo(null);
              }}
              className="mt-2 ml-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Remove Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MusicSelector;