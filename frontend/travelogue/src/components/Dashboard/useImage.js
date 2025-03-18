import { useState, useEffect, useCallback } from "react";

export function useFetchImages(userId) {
  const [photos, setPhotos] = useState([]);

  const fetchUploadedImages = useCallback(async () => {
    if (!userId) return;
    
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

  return { photos, setPhotos, fetchUploadedImages };
}