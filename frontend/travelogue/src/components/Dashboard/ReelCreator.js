import React, { useState } from "react";

function ReelCreator({
  selectedFiles,
  sentiment,
  selectedAudio,
  userId,
  setIsProcessing,
  setReelUrl,
  setErrorMessage,
  imageDurations,
  trimmedAudioInfo,
}) {
  const [processingStatus, setProcessingStatus] = useState("");
  const [isProcessingState, setIsProcessingState] = useState(false);
  const [progress, setProgress] = useState(0);

  const convertToMinutes = (seconds, isDuration = false) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return isDuration ? `${minutes}m ${secs}s` : `${minutes}:${secs.toString().padStart(2, "0")} min`;
  };

  const handleCreateReel = async () => {
    if (selectedFiles.length < 2 || selectedFiles.length > 10) {
      setErrorMessage("You must select between 2 and 10 images.");
      return;
    }

    const totalDuration = selectedFiles.reduce((acc, url) => {
      return acc + (imageDurations[url] || 2.0);
    }, 0);

    if (totalDuration < 5 || totalDuration > 20) {
      setErrorMessage("The total reel duration must be between 5 and 20 seconds.");
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

    setIsProcessingState(true);
    setIsProcessing(true);
    setProcessingStatus("Preparing images and audio...");
    setProgress(10);

    const selectedImages = selectedFiles.map((url) => ({
      url,
      duration: imageDurations[url] || 2.0,
    }));

    const audioTrimData = trimmedAudioInfo
      ? {
          startTime: trimmedAudioInfo.startTime,
          endTime: trimmedAudioInfo.endTime,
          duration: trimmedAudioInfo.duration,
        }
      : null;

    console.log("Sending audio trim data:", audioTrimData);

    const requestBody = {
      userId: userId,
      selectedImages: selectedImages,
      sentiment: sentiment.toLowerCase(),
      selectedMusic: selectedAudio,
      audioTrim: audioTrimData,
    };

    try {
      setProcessingStatus("Creating reel...");
      setProgress(30);

      const response = await fetch("http://localhost:5000/api/reel/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      setProgress(90);
      const data = await response.json();
      setProgress(100);
      setIsProcessingState(false);
      setIsProcessing(false);
      setProcessingStatus("");

      if (response.ok) {
        setReelUrl(data.reelUrl);
        setErrorMessage("");
      } else {
        console.error("Error creating reel:", data.message);
        setErrorMessage(data.message);
      }
    } catch (error) {
      setIsProcessingState(false);
      setIsProcessing(false);
      setProcessingStatus("");
      console.error("Error creating reel:", error);
      setErrorMessage("Error creating reel: " + error.message);
    }
  };

  return (
    <div className="mt-6 w-full max-w-md mx-auto">
      <button
        onClick={handleCreateReel}
        disabled={isProcessingState}
        className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-md disabled:bg-gray-400 font-semibold text-lg"
      >
        {isProcessingState ? "Creating Reel..." : "Create Reel"}
      </button>

      {isProcessingState && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-purple-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-gray-600">{processingStatus}</p>
        </div>
      )}

      {trimmedAudioInfo && (
        <div className="mt-2 text-xs text-gray-500">
          Using trimmed audio:{" "}
          {convertToMinutes(trimmedAudioInfo.startTime)} to{" "}
          {convertToMinutes(trimmedAudioInfo.endTime)} (Duration:{" "}
          {convertToMinutes(trimmedAudioInfo.duration, true)})
        </div>
      )}
    </div>
  );
}

export default ReelCreator; 