import { useState, useEffect } from "react";

function ImageSelector({ 
  photos, 
  selectedFiles, 
  handleImageSelection, 
  fetchUploadedImages, 
  userId, 
  setPhotos, 
  setSelectedFiles, 
  setErrorMessage, 
  imageDurations, 
  setImageDurations, 
  globalDuration, 
  setGlobalDuration, 
  calculateTotalDuration,
  onDurationsApplied, // New prop to report when durations are applied
  onDurationsChanged,  // New prop to report when durations are changed
  setHasDurationsApplied // New prop to control the applied state
}) {
  const [globalDurationInput, setGlobalDurationInput] = useState("2.0");
  const [showModal, setShowModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [hasDurationChanged, setHasDurationChanged] = useState(false);
  const [validationModalOpen, setValidationModalOpen] = useState(false);

  useEffect(() => {
    // Reset the applied status when selected files change
    if (selectedFiles.length > 0) {
      setHasDurationChanged(true);
      if (setHasDurationsApplied) {
        setHasDurationsApplied(false);
      }
      if (onDurationsChanged) {
        onDurationsChanged();
      }
    }
  }, [selectedFiles, setHasDurationsApplied, onDurationsChanged]);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
  
    // Check if the number of files exceeds 10
    if (files.length + photos.length > 10) {
      setToastMessage("You can upload a maximum of 10 images.");
      return;
    }
  
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
        
        // Mark that durations have changed
        setHasDurationChanged(true);
        if (setHasDurationsApplied) {
          setHasDurationsApplied(false);
        }
        if (onDurationsChanged) {
          onDurationsChanged();
        }
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
    e.stopPropagation(); // Prevent triggering image selection
    const value = parseFloat(e.target.value) || 2.0;
    
    // Round to whole numbers (no 0.5 increments)
    const roundedValue = Math.round(value);
    
    // Clamp the value between 1 and 10
    const clampedValue = Math.min(Math.max(roundedValue, 1), 10);
    
    setImageDurations(prev => ({
      ...prev,
      [url]: clampedValue
    }));
    
    // Mark that durations have changed
    setHasDurationChanged(true);
    if (setHasDurationsApplied) {
      setHasDurationsApplied(false);
    }
    if (onDurationsChanged) {
      onDurationsChanged();
    }
    console.log(`Set duration for ${url} to ${clampedValue}s`);
  };

  // Handle global input change
  const handleGlobalDurationInputChange = (e) => {
    setGlobalDurationInput(e.target.value);
    setHasDurationChanged(true);
    if (setHasDurationsApplied) {
      setHasDurationsApplied(false);
    }
    if (onDurationsChanged) {
      onDurationsChanged();
    }
  };

  // Show modal when Apply button is clicked
  const handleApplyClick = () => {
    const duration = parseFloat(globalDurationInput);
    
    // Round to whole numbers
    const roundedDuration = Math.round(duration);
    
    // Validate the input
    if (isNaN(roundedDuration) || roundedDuration < 1 || roundedDuration > 10) {
      setErrorMessage("Duration must be between 1 and 10 seconds");
      return;
    }
    
    // Set the rounded duration
    setGlobalDurationInput(roundedDuration.toString());
    
    // Check if there are any custom durations
    const hasCustomDurations = selectedFiles.some(url => 
      imageDurations[url] && imageDurations[url] !== 2.0
    );
    
    // Only show modal if there are custom durations
    if (hasCustomDurations) {
      setShowModal(true);
    } else {
      // If no custom durations, apply to all directly
      applyDuration(true);
    }
  };
  
  // Apply global duration to all or non-custom images
 // In the ImageSelector component, make sure we're properly handling the durationsApplied state

// Apply global duration to all or non-custom images
const applyDuration = (applyToAll) => {
  const duration = Math.round(parseFloat(globalDurationInput));
  const newDurations = {...imageDurations};
  
  selectedFiles.forEach(url => {
    // If applyToAll is true, apply to all images
    // Otherwise, only apply to images without custom durations
    if (applyToAll || !newDurations[url] || newDurations[url] === 2.0) {
      newDurations[url] = duration;
    }
  });
  
  setImageDurations(newDurations);
  setShowModal(false);
  setHasDurationChanged(false);
  
  // Mark that durations have been applied
  if (setHasDurationsApplied) {
    setHasDurationsApplied(true);
  }
  if (onDurationsApplied) {
    onDurationsApplied();
  }
  
  // Show success toast
  setToastMessage("Durations applied successfully! Choose a sentiment to continue.");
  setTimeout(() => setToastMessage(""), 3000);
  
  console.log(`Applied ${duration}s duration to selected images`, newDurations);
};

// Reset all image durations to default (2 seconds)
const handleResetToDefaultDuration = () => {
  const newDurations = {...imageDurations};
  selectedFiles.forEach(url => {
    newDurations[url] = 2.0;
  });
  
  setImageDurations(newDurations);
  setGlobalDurationInput("2.0");
  setHasDurationChanged(false);
  
  // Mark that durations have been applied
  if (setHasDurationsApplied) {
    setHasDurationsApplied(true);
  }
  if (onDurationsApplied) {
    onDurationsApplied();
  }
  
  // Show success toast
  setToastMessage("All durations reset to default (2s). Choose a sentiment to continue.");
  setTimeout(() => setToastMessage(""), 3000);
  
  console.log("Reset all durations to default (2s)");
};

 

  // Function to count custom durations
  const getCustomDurationCount = () => {
    let customCount = 0;
    
    selectedFiles.forEach(url => {
      if (imageDurations[url] && imageDurations[url] !== 2.0) {
        customCount++;
      }
    });
    
    return customCount;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    
    const formData = new FormData();
    formData.append("userId", userId);
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        formData.append("photos", file);
      }
    });

    try {
      const response = await fetch("http://localhost:5000/api/images/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        fetchUploadedImages();
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      setErrorMessage("Error uploading files");
    }
  };

  const handleCloseToast = () => {
    setToastMessage(""); // Clear the toast message
  };

  // Function to show validation modal
  const showValidationModalForDurations = () => {
    setValidationModalOpen(true);
  };

  return (
    <aside className="w-1/4 bg-white p-4 shadow-md">
      <h2 className="text-lg font-semibold mb-4">Select Photos</h2>
       {/* Drag & Drop Upload Area */}
       <div 
        className={`relative w-full h-32 mb-6 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all duration-200 ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center px-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="mt-1 text-sm text-gray-600">
            Drag and drop images or
            <label className="ml-1 text-blue-600 hover:text-blue-800 cursor-pointer">
              browse
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
        </div>
      </div>

      {/* Toast message */}
      {toastMessage && (
        <div 
          className="fixed top-16 left-4 z-50 bg-green-500 text-white p-3 rounded-lg shadow-lg flex items-center space-x-2"
          style={{ zIndex: 9999 }}
        >
          <p>{toastMessage}</p>
          <button
            className="text-white bg-transparent border-0 text-lg"
            onClick={handleCloseToast}
          >
            &times;
          </button>
        </div>
      )}

      {/* Uploaded Images */}
      {photos.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Gallery ({photos.length})</h3>
            {selectedFiles.length > 0 && (
              <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                {selectedFiles.length} selected
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {photos.map((photo, index) => (
              <div className="relative" key={index}>
                <img
                  src={photo}
                  alt={`Uploaded ${index}`}
                  className={`w-24 h-20 object-cover rounded-md cursor-pointer ${
                    selectedFiles.includes(photo) ? "border-2 border-blue-500" : ""
                  }`}
                  onClick={() => handleImageSelection(photo)}
                />
                {selectedFiles.includes(photo) && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(photo);
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 py-1 text-xs"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        step="1"
                        value={imageDurations[photo] || 2.0}
                        onChange={(e) => handleDurationChange(e, photo)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-20 text-black p-1 rounded"
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
                min="1"
                max="10"
                step="1"
                value={globalDurationInput}
                onChange={handleGlobalDurationInputChange}
                className="w-16 text-sm p-1 border rounded"
              />
              <button
                onClick={handleApplyClick}
                disabled={!selectedFiles.length}
                className={`text-white px-4 py-2 ml-2 rounded text-sm ${
                  hasDurationChanged ? "bg-blue-500 animate-pulse" : "bg-blue-500"
                }`}
              >
                {hasDurationChanged ? "Apply*" : "Apply"}
              </button>
            </div>
            
            {hasDurationChanged && (
              <p className="text-xs text-amber-500 mt-1">
                *Please apply your duration settings before selecting a sentiment
              </p>
            )}
            
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
      
      {/* Custom Modal for apply confirmation */}
      {showModal && (() => {
        const customCount = getCustomDurationCount();
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-lg font-medium mb-4">Custom Durations Detected</h3>
              <div className="mb-6">
                <p className="mb-3">
                  {customCount} of your selected images {customCount === 1 ? 'has a' : 'have'} custom duration different from the default 2 seconds.
                </p>
                
                <p className="mb-3">
                  You're attempting to set all images to <strong>{globalDurationInput} seconds</strong>.
                </p>
                
                <p className="mt-3 text-sm">
                  Please choose one of the following options:
                </p>
              </div>
              
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => applyDuration(false)}
                  className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-left"
                >
                  <span className="font-medium">Keep custom durations</span>
                  <br />
                  <span className="text-xs text-gray-500">
                    Only change images with default duration (2s) to {globalDurationInput}s. 
                    Images with custom durations will not be changed.
                  </span>
                </button>
                
                <button
                  onClick={() => applyDuration(true)}
                  className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-left"
                >
                  <span className="font-medium">Override all durations</span>
                  <br />
                  <span className="text-xs text-blue-100">
                    Change ALL selected images to {globalDurationInput}s, including those with custom durations.
                  </span>
                </button>
              </div>
              
              <button
                onClick={() => setShowModal(false)}
                className="mt-4 w-full py-2 text-gray-500 hover:text-gray-700 border-t border-gray-200 pt-4"
              >
                Cancel
              </button>
            </div>
          </div>
        );
      })()}
      
      {/* Validation Modal */}
      {validationModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full">
            <h3 className="text-lg font-semibold text-amber-500">Action Required</h3>
            <p className="mt-2 text-sm text-gray-700">
              Please click the "Apply" button to confirm your image durations before selecting a sentiment.
            </p>
            <button
              onClick={() => setValidationModalOpen(false)}
              className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

export default ImageSelector;