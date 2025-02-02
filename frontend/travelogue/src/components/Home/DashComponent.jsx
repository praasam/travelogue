import { useState } from "react";
import { UserCircleIcon } from "@heroicons/react/20/solid"; // v2 format

export default function DashboardComponent() {
  const [photos, setPhotos] = useState([]);

  return (
    <div className="h-screen flex flex-col">
      {/* Navbar */}
      {/* <nav className="bg-teal-900 text-white flex items-center justify-between p-4">
        <h1 className="text-lg font-bold">JOURNI</h1>
        <div className="flex items-center gap-4">
          <span>{photos.length} of {photos.length} photos uploaded</span>
          <UserCircleIcon className="h-8 w-8" />
        </div>
      </nav> */}

      {/* Main Content */}
      <div className="flex flex-grow bg-blue-50">
        {/* Sidebar */}
        <aside className="w-1/4 bg-white p-4 shadow-md">
          <h2 className="text-lg font-semibold mb-4">Select Photos</h2>
          <div className="space-y-4">
            {["Add from Desktop", "Add from Phone", "Add from Family and Friends", "Drafts & Orders"].map(
              (option, index) => (
                <button
                  key={index}
                  className="w-full p-3 text-left bg-blue-100 rounded-lg hover:bg-blue-200"
                >
                  {option}
                </button>
              )
            )}
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-grow flex flex-col items-center justify-center">
          {photos.length === 0 ? (
            <div className="text-center">
              <img src="https://via.placeholder.com/100" alt="Placeholder" className="mx-auto mb-4" />
              <p className="text-gray-500">You didn’t upload any images yet...</p>
            </div>
          ) : (
            <div>{/* Display uploaded photos */}</div>
          )}
        </main>
      </div>
    </div>
  );
}
