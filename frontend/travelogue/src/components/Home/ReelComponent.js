import { useState, useEffect, useCallback } from "react";

export default function ReelComponent() {
  const [reels, setReels] = useState([]); // Store the user's reels
  const [selectedReels, setSelectedReels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const userId = localStorage.getItem("id");
  const [errorMessage, setErrorMessage] = useState(null);
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest
  const [playingReel, setPlayingReel] = useState(null);
  const [thumbnailLoadErrors, setThumbnailLoadErrors] = useState({});

  const fetchUserReels = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/reel/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("API Response:", data);
      
      // Sort the reels based on the current sort preference
      const sortedReels = [...data.reels].sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        } else {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
      });
      
      // Verify thumbnailPath for each reel
      const reelsWithVerifiedThumbnails = sortedReels.map(reel => {
        // If thumbnailPath doesn't exist or is empty, check if we need to generate one
        if (!reel.thumbnailPath || reel.thumbnailPath === '') {
          console.log(`Missing thumbnail for reel: ${reel.id}`);
          // You could potentially trigger thumbnail generation here if needed
        }
        return reel;
      });
      
      setReels(reelsWithVerifiedThumbnails);
    } catch (error) {
      console.error("Error fetching reels:", error);
      setErrorMessage("Failed to load your reels. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [userId, sortBy]);

  useEffect(() => {
    if (userId) {
      fetchUserReels();
    }
  }, [userId, fetchUserReels]);

  // Handle thumbnail load error
  const handleThumbnailError = (reelId) => {
    setThumbnailLoadErrors(prev => ({
      ...prev,
      [reelId]: true
    }));
    console.log(`Thumbnail failed to load for reel: ${reelId}`);
  };

  // You could add a function to generate thumbnails if needed
  const generateThumbnail = async (reelId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reel/generate-thumbnail/${reelId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (response.ok) {
        // Refresh the reel data to get the new thumbnail
        fetchUserReels();
      } else {
        console.error('Failed to generate thumbnail');
      }
    } catch (error) {
      console.error('Error generating thumbnail:', error);
    }
  };

  const handleReelSelection = (reelId, event) => {
    // Prevent selection when clicking on the video or play button
    if (event && (event.target.tagName === 'VIDEO' || event.target.closest('.play-button'))) {
      return;
    }
    
    setSelectedReels((prevSelectedReels) => {
      if (prevSelectedReels.includes(reelId)) {
        return prevSelectedReels.filter((id) => id !== reelId); // Deselect reel
      } else {
        return [...prevSelectedReels, reelId]; // Select reel
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedReels.length === reels.length) {
      // If all are selected, deselect all
      setSelectedReels([]);
    } else {
      // Otherwise select all
      setSelectedReels(reels.map(reel => reel.id));
    }
  };

  const handleDeleteReels = async () => {
    if (selectedReels.length === 0) {
      setErrorMessage("Please select at least one reel to delete.");
      return;
    }

    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/reel/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, reelIds: selectedReels }),
      });

      const data = await response.json();
      if (response.ok) {
        setReels((prevReels) =>
          prevReels.filter((reel) => !selectedReels.includes(reel.id))
        );
        setSelectedReels([]); // Clear the selected reels
      } else {
        setErrorMessage(data.message || "Error deleting reels");
      }
    } catch (error) {
      console.error("Error deleting reels:", error);
      setErrorMessage("Error deleting reels");
    } finally {
      setShowConfirmDelete(false);
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Function to play a reel
  const playReel = (reel, event) => {
    event.preventDefault();
    event.stopPropagation();
    setPlayingReel(reel);
  };

  // Function to close the video player
  const closeVideoPlayer = () => {
    setPlayingReel(null);
  };

  // Function to get thumbnail URL with cache-busting parameter if needed
  const getThumbnailUrl = (reel) => {
    if (!reel.thumbnailPath) return null;
    
    // Add a timestamp to prevent caching issues
    const cacheBuster = thumbnailLoadErrors[reel.id] ? `?t=${Date.now()}` : '';
    return `http://localhost:5000${reel.thumbnailPath}${cacheBuster}`;
  };

  // Thumbnail component with retry capability
  const ThumbnailImage = ({ reel }) => {
    const thumbnailUrl = getThumbnailUrl(reel);
    
    if (!thumbnailUrl || thumbnailLoadErrors[reel.id]) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-200">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {thumbnailLoadErrors[reel.id] && (
            <button 
              className="mt-2 text-xs text-blue-600 hover:text-blue-800"
              onClick={(e) => {
                e.stopPropagation();
                // Clear the error so we can try loading the thumbnail again
                setThumbnailLoadErrors(prev => ({...prev, [reel.id]: false}));
                // Optionally trigger thumbnail generation
                generateThumbnail(reel.id);
              }}
            >
              Regenerate Thumbnail
            </button>
          )}
        </div>
      );
    }
    
    return (
      <img
        src={thumbnailUrl}
        alt={reel.title || "Reel thumbnail"}
        className="object-cover w-full h-full"
        onError={() => handleThumbnailError(reel.id)}
      />
    );
  };

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="mx-auto h-24 w-24 text-gray-400 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900">No reels found</h3>
      <p className="mt-2 text-sm text-gray-500">Get started by creating your first reel.</p>
      <div className="mt-6">
        <button 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          onClick={() => window.location.href = "/dash"}
        >
          Create New Reel
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
            <h2 className="text-2xl font-bold text-gray-800">Your Reels</h2>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* View Toggle */}
              <div className="bg-white border border-gray-200 rounded-lg flex p-1">
                <button 
                  className={`px-3 py-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-gray-800' : 'text-gray-500'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                  </svg>
                </button>
                <button 
                  className={`px-3 py-1.5 rounded ${viewMode === 'list' ? 'bg-gray-100 text-gray-800' : 'text-gray-500'}`}
                  onClick={() => setViewMode('list')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                  </svg>
                </button>
              </div>

              {/* Sort Dropdown */}
              <select 
                className="border border-gray-200 rounded-lg bg-white px-3 py-2 text-sm text-gray-700"
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>

              {/* Create New Button */}
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                onClick={() => window.location.href = "/dash"}
              >
                Create New
              </button>
            </div>
          </div>
          
          {/* Toolbar */}
          {reels.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={selectedReels.length === reels.length && reels.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <label htmlFor="select-all" className="ml-2 text-sm text-gray-700">
                  Select All
                </label>
                
                {selectedReels.length > 0 && (
                  <span className="ml-3 text-sm text-gray-600">
                    {selectedReels.length} selected
                  </span>
                )}
              </div>
              
              {selectedReels.length > 0 && (
                <button
                  onClick={handleDeleteReels}
                  className="flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Delete Selected
                </button>
              )}
            </div>
          )}

          {/* Content Area */}
          <div className="px-6 py-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : reels.length === 0 ? (
              <EmptyState />
            ) : (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {reels.map((reel) => (
                    <div
                      key={reel.id}
                      className={`relative group rounded-xl shadow-md overflow-hidden transition-all duration-300 transform ${
                        selectedReels.includes(reel.id)
                          ? "ring-2 ring-blue-600 ring-offset-2"
                          : "hover:shadow-lg"
                      }`}
                      onClick={(e) => handleReelSelection(reel.id, e)}
                    >
                      <div className="absolute top-3 left-3 z-10">
                        <input
                          type="checkbox"
                          checked={selectedReels.includes(reel.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleReelSelection(reel.id);
                          }}
                          className="h-5 w-5 text-blue-600 rounded border-gray-300"
                        />
                      </div>
                      
                      <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
                        <ThumbnailImage reel={reel} />
                        
                        {/* Play Button */}
                        <button 
                          className="play-button absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => playReel(reel, e)}
                        >
                          <div className="bg-white bg-opacity-90 rounded-full p-3">
                            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </button>
                      </div>
                      
                      {/* Reel Info */}
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 mb-1 truncate">
                          {reel.title || "Untitled Reel"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(reel.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {reels.map((reel) => (
                    <div
                      key={reel.id}
                      className={`py-4 flex items-center ${
                        selectedReels.includes(reel.id)
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={(e) => handleReelSelection(reel.id, e)}
                    >
                      <div className="flex-shrink-0 mr-4">
                        <input
                          type="checkbox"
                          checked={selectedReels.includes(reel.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleReelSelection(reel.id);
                          }}
                          className="h-5 w-5 text-blue-600 rounded border-gray-300"
                        />
                      </div>
                      
                      <div className="flex-shrink-0 mr-4 w-24 h-16 bg-gray-100 rounded overflow-hidden relative">
                        <ThumbnailImage reel={reel} />
                        
                        {/* Play Button */}
                        <button 
                          className="play-button absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity"
                          onClick={(e) => playReel(reel, e)}
                        >
                          <div className="bg-white bg-opacity-90 rounded-full p-1">
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </button>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="block">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {reel.title || "Untitled Reel"}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Created on {formatDate(reel.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 ml-4">
                        <button
                          className="text-blue-600 hover:text-blue-800 mr-4"
                          onClick={(e) => playReel(reel, e)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
      
      {/* Error Message */}
      {errorMessage && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path>
            </svg>
            <span>{errorMessage}</span>
            <button 
              className="ml-auto"
              onClick={() => setErrorMessage(null)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedReels.length} selected {selectedReels.length === 1 ? 'reel' : 'reels'}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Video Player Modal */}
      {playingReel && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-black rounded-lg max-w-4xl w-full max-h-screen overflow-hidden">
            <div className="flex justify-end p-2">
              <button 
                onClick={closeVideoPlayer}
                className="text-white hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="relative pt-[56.25%]"> {/* 16:9 aspect ratio */}
              <video 
                className="absolute top-0 left-0 w-full h-full"
                src={`http://localhost:5000${playingReel.reelPath}`}
                controls
                autoPlay
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="p-4 bg-gray-900 text-white">
              <h3 className="text-lg font-medium">{playingReel.title || "Untitled Reel"}</h3>
              <p className="text-sm text-gray-400 mt-1">
                Created on {formatDate(playingReel.createdAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}