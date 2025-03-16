import { useState, useEffect, useCallback } from "react";

export default function ReelComponent() {
  const [reels, setReels] = useState([]); // Store the user's reels
  const [selectedReels, setSelectedReels] = useState([]);
  const userId = localStorage.getItem("id");
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchUserReels = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reel/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("API Response:", data);
      setReels(data.reels);
    } catch (error) {
      console.error("Error fetching reels:", error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserReels();
    }
  }, [userId, fetchUserReels]);

  const handleReelSelection = (reelId) => {
    setSelectedReels((prevSelectedReels) => {
      if (prevSelectedReels.includes(reelId)) {
        return prevSelectedReels.filter((id) => id !== reelId); // Deselect reel
      } else {
        return [...prevSelectedReels, reelId]; // Select reel
      }
    });
  };

  const handleDeleteReels = async () => {
    if (selectedReels.length === 0) {
      setErrorMessage("Please select at least one reel to delete.");
      return;
    }

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
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex-grow p-8">
        <aside className="w-full max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">
            Your Reels
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {reels.map((reel) => (
              <div
                key={reel.id}
                className={`relative group bg-white rounded-xl shadow-md transition-all duration-300 transform ${
                  selectedReels.includes(reel.id)
                    ? "border-2 border-blue-600"
                    : "border-2 border-transparent"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedReels.includes(reel.id)}
                  onChange={() => handleReelSelection(reel.id)}
                  className="absolute top-4 right-4 z-10 bg-white border-gray-300 rounded-full p-2"
                />
                <a
                  href={`http://localhost:5000${reel.reelPath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <video
                    className="w-full h-56 object-cover rounded-t-xl group-hover:opacity-90"
                    controls
                  >
                    <source
                      src={`http://localhost:5000${reel.reelPath}`}
                      type="video/mp4"
                    />
                    <p>Your browser does not support the video tag.</p>
                  </video>
                </a>
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-600 truncate">{reel.title}</p>
                </div>
              </div>
            ))}
          </div>
          {selectedReels.length > 0 && (
            <div className="mt-8 text-center">
              <button
                onClick={handleDeleteReels}
                className="px-8 py-3 bg-red-600 text-white rounded-full text-lg font-semibold hover:bg-red-700 hover:scale-105 transition duration-300"
              >
                Delete Selected Reels
              </button>
            </div>
          )}
          {errorMessage && (
            <div className="text-red-600 mt-4 text-center text-lg">{errorMessage}</div>
          )}
        </aside>
      </div>
    </div>
  );
}
