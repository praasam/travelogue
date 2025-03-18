import { useState, useRef, useEffect } from "react";

function MusicTrimmer({ 
  selectedAudio, 
  onTrimComplete, 
  onCancel
}) {
  // Constants for validation
  const MIN_DURATION = 3; // Absolute minimum 3 seconds
  const MAX_DURATION = 60; // Maximum 60 seconds (1 minute)

  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [hoverTime, setHoverTime] = useState(null);
  const audioRef = useRef(null);
  const waveformRef = useRef(null);
  const audioUrl = selectedAudio ? `http://localhost:5000/music/${selectedAudio}` : null;

  // Validation function - only applied when confirming selection
  const validateTrimSelection = (start, end) => {
    const selectedDuration = end - start;
    
    if (selectedDuration < MIN_DURATION) {
      return {
        valid: false,
        message: `Selection must be at least ${formatTime(MIN_DURATION)} long`
      };
    }
    
    if (selectedDuration > MAX_DURATION) {
      return {
        valid: false,
        message: `Selection cannot exceed ${MAX_DURATION} seconds (${Math.floor(MAX_DURATION/60)} minute)`
      };
    }
    
    return { valid: true };
  };

  // Initialize audio duration and end time when file loads
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration;
      setDuration(audioDuration);
      setEndTime(audioDuration);
      
      // Check if the total audio length is sufficient for the minimum required
      if (audioDuration < MIN_DURATION) {
        setValidationError(`This audio file (${formatTime(audioDuration)}) is too short for the minimum required duration of ${formatTime(MIN_DURATION)}`);
      }
    }
  };

  // Update audio position when playing within the trimmed section
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      
      if (audioRef.current.currentTime >= endTime) {
        audioRef.current.pause();
        audioRef.current.currentTime = startTime;
        setIsPlaying(false);
      }
    }
  };

  // Handle start time change
  const handleStartTimeChange = (e) => {
    const newStart = parseFloat(e.target.value);
    if (newStart < endTime) {
      setStartTime(newStart);
      if (audioRef.current && isPlaying) {
        audioRef.current.currentTime = newStart;
      }
      setValidationError("");
    } else {
      setValidationError("Start time must be before end time");
    }
  };

  // Handle end time change
  const handleEndTimeChange = (e) => {
    const newEnd = parseFloat(e.target.value);
    if (newEnd > startTime) {
      setEndTime(newEnd);
      setValidationError("");
    } else {
      setValidationError("End time must be after start time");
    }
  };

  // Update the validation status without changing the selection
  const updateValidationStatus = () => {
    const validation = validateTrimSelection(startTime, endTime);
    if (!validation.valid) {
      setValidationError(validation.message);
    } else {
      setValidationError("");
    }
  };

  // Effect to update validation status when times change
  useEffect(() => {
    updateValidationStatus();
  }, [startTime, endTime]);

  // Play/pause toggle
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // If current time is outside the trim range, reset to start
        if (audioRef.current.currentTime < startTime || audioRef.current.currentTime > endTime) {
          audioRef.current.currentTime = startTime;
        }
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Preview trimmed section
  const previewTrimmed = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = startTime;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Confirm trim with validation and send data back to parent
  const confirmTrim = () => {
    const validation = validateTrimSelection(startTime, endTime);
    if (!validation.valid) {
      setValidationError(validation.message);
      return;
    }
    
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    // Send trimmed audio info to parent in minutes and seconds format
    onTrimComplete({
      audioFile: selectedAudio,
      startTime: startTime,
      endTime: endTime,
      duration: endTime - startTime,
      formattedStartTime: formatTime(startTime),
      formattedEndTime: formatTime(endTime),
    });
  };

  // Format time in MM:SS format
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Jump to a specific time point
  const jumpToTime = (time) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(time, duration));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Set start time to current time
  const setStartToCurrent = () => {
    if (audioRef.current && audioRef.current.currentTime < endTime) {
      setStartTime(audioRef.current.currentTime);
    }
  };

  // Set end time to current time
  const setEndToCurrent = () => {
    if (audioRef.current && audioRef.current.currentTime > startTime) {
      setEndTime(audioRef.current.currentTime);
    }
  };

  // Handle waveform clicking
  const handleWaveformClick = (e) => {
    if (waveformRef.current) {
      const rect = waveformRef.current.getBoundingClientRect();
      const clickPosition = (e.clientX - rect.left) / rect.width;
      const newTime = duration * clickPosition;
      jumpToTime(newTime);
    }
  };

  // Handle waveform hover
  const handleWaveformHover = (e) => {
    if (waveformRef.current) {
      const rect = waveformRef.current.getBoundingClientRect();
      const hoverPosition = (e.clientX - rect.left) / rect.width;
      setHoverTime(duration * hoverPosition);
    }
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Pause audio when component unmounts
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-100 max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
        <span className="mr-2 text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </span>
        Trim Music
        <span className="ml-3 text-base font-normal text-gray-500 bg-gray-100 py-1 px-3 rounded-full">
          {selectedAudio}
        </span>
      </h3>
      
      {audioUrl && (
        <div className="mb-6">
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <audio 
              ref={audioRef} 
              src={audioUrl} 
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              className="hidden"
            />
            
            {/* Waveform visualization */}
            <div 
              ref={waveformRef}
              className="w-full h-20 bg-gray-200 rounded-lg mb-4 relative cursor-pointer"
              onClick={handleWaveformClick}
              onMouseMove={handleWaveformHover}
              onMouseLeave={() => setHoverTime(null)}
            >
              {/* Waveform background (simulated) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-full h-16" viewBox="0 0 100 20">
                  <path d="M0,10 Q5,5 10,10 T20,10 T30,10 T40,10 T50,10 T60,10 T70,10 T80,10 T90,10 T100,10" 
                        fill="none" stroke="#CBD5E0" strokeWidth="0.5"/>
                  <path d="M0,10 Q5,2 10,10 T20,10 T30,5 T40,15 T50,5 T60,15 T70,5 T80,15 T90,5 T100,10" 
                        fill="none" stroke="#4F46E5" strokeWidth="1"/>
                </svg>
              </div>
              
              {/* Selected region */}
              <div 
                className="absolute top-0 bottom-0 bg-indigo-200 bg-opacity-60"
                style={{ 
                  left: `${(startTime / duration) * 100}%`,
                  width: `${((endTime - startTime) / duration) * 100}%`
                }}
              />
              
              {/* Current time marker */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-indigo-600"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              />
              
              {/* Hover time marker */}
              {hoverTime !== null && (
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-gray-500"
                  style={{ left: `${(hoverTime / duration) * 100}%` }}
                >
                  <div className="absolute top-0 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-1 py-0.5 rounded">
                    {formatTime(hoverTime)}
                  </div>
                </div>
              )}
            </div>
            
            {/* Custom audio controls */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={togglePlay}
                  className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition duration-200"
                >
                  {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </button>
                <div className="text-sm font-medium text-gray-700">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={setStartToCurrent}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition duration-200 text-sm font-medium"
                >
                  Set Start
                </button>
                <button 
                  onClick={setEndToCurrent}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition duration-200 text-sm font-medium"
                >
                  Set End
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trim controls */}
      {audioUrl && (
        <div className="border-t pt-6">
          <h4 className="text-lg font-medium mb-4 text-gray-800 flex items-center">
            <span className="mr-2 text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </span>
            Trim Settings
            <span className="ml-3 text-sm font-normal text-gray-500 bg-gray-100 py-1 px-3 rounded-full">
              Selection: {formatTime(endTime - startTime)}
            </span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block mb-2 text-sm font-medium text-gray-700">Start Time</label>
              <div className="flex items-center">
                <input 
                  type="range" 
                  min="0" 
                  max={duration - 0.1} 
                  step="0.1" 
                  value={startTime}
                  onChange={handleStartTimeChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="ml-3 w-20 text-sm font-medium bg-gray-100 py-1 px-2 rounded text-center">{formatTime(startTime)}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block mb-2 text-sm font-medium text-gray-700">End Time</label>
              <div className="flex items-center">
                <input 
                  type="range" 
                  min="0" 
                  max={duration}
                  step="0.1" 
                  value={endTime}
                  onChange={handleEndTimeChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="ml-3 w-20 text-sm font-medium bg-gray-100 py-1 px-2 rounded text-center">{formatTime(endTime)}</span>
              </div>
            </div>
          </div>
          
          {/* Duration requirements */}
          <div className="bg-blue-50 border border-blue-100 text-blue-800 p-3 rounded-md mb-4 flex items-center text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Required duration: {formatTime(MIN_DURATION)} - {formatTime(MAX_DURATION)}
          </div>
          
          {/* Validation error message */}
          {validationError && (
            <div className="bg-red-50 border border-red-100 text-red-800 p-3 rounded-md mb-4 flex items-center text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {validationError}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-6 space-y-4 sm:space-y-0">
            <span className="text-sm font-medium text-gray-700 bg-gray-100 py-1 px-3 rounded-full">
              Trimmed Selection: {formatTime(endTime - startTime)}
            </span>
            <div className="flex space-x-3">
              <button 
                onClick={onCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-200 flex items-center text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button 
                onClick={previewTrimmed}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-200 flex items-center text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Preview
              </button>
              <button 
                onClick={confirmTrim}
                className={`px-4 py-2 text-white rounded-md flex items-center text-sm ${validationError ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 transition duration-200'}`}
                disabled={!!validationError}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MusicTrimmer;