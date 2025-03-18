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
  trimmedAudioInfo, // New prop to handle trimmed audio info
}) {
  const [processingStatus, setProcessingStatus] = useState("");
  const [isProcessing] = useState(false);

  const convertToMinutes = (seconds, isDuration = false) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return isDuration ? `${minutes}m ${secs}s` : `${minutes}:${secs.toString().padStart(2, "0")} min`;
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
    setProcessingStatus("Preparing images and audio...");

    const selectedImages = selectedFiles.map((url) => ({
      url,
      duration: imageDurations[url] || 2.0, // Use default or specified duration
    }));

    const audioTrimData = trimmedAudioInfo ? {
      startTime: trimmedAudioInfo.startTime,
      endTime: trimmedAudioInfo.endTime,
      duration: trimmedAudioInfo.duration,
    } : null;

    console.log("Sending audio trim data:", audioTrimData); // Log for debugging

    const requestBody = {
      userId: userId,
      selectedImages: selectedImages,
      sentiment: sentiment.toLowerCase(),
      selectedMusic: selectedAudio,
      audioTrim: audioTrimData, // Send trimming data if available
    };

    try {
      setProcessingStatus("Creating reel...");
      const response = await fetch("http://localhost:5000/api/reel/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      setIsProcessing(false);
      setProcessingStatus("");

      if (response.ok) {
        setReelUrl(data.reelUrl);
        setErrorMessage(null);
      } else {
        console.error("Error creating reel:", data.message);
        setErrorMessage(data.message);
      }
    } catch (error) {
      setIsProcessing(false);
      setProcessingStatus("");
      console.error("Error creating reel:", error);
      setErrorMessage("Error creating reel: " + error.message);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleCreateReel}
        disabled={isProcessing}
        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-md disabled:bg-gray-400"
      >
        {isProcessing ? "Creating Reel..." : "Create Reel"}
      </button>

      {processingStatus && (
        <div className="mt-2 text-sm text-gray-600">{processingStatus}</div>
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
