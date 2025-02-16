import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingComponent = () => {
  const navigate = useNavigate(); // Initialize the hook for navigation

  return (
    <div className="bg-white">
      {/* Navbar
      <header className="bg-gray-300 h-16 flex items-center justify-between px-6">
      <h1 className="text-lg font-bold tracking-wide text-gray-900">TRAVELOGUE</h1>
      <button
        className="bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
        onClick={() => navigate('/login')} // Redirect to the login page
      >
        Log In
      </button>
    </header> */}


      {/* Hero Section */}
      <section className="relative h-[80vh]">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: "url('landing1.png')" }}
        ></div>
      </section>

      {/* Travel Tracker Section */}
      <section className="py-16 px-6 text-center md:text-left">
        <div className="md:flex md:items-center md:space-x-10">
          <div className="md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              A travel tracker to capture every awesome moment
            </h2>
            <p className="text-gray-700 mb-6">
              Keeping your phone in your pocket and your eyes on the world. Share it with everyone — 
              from your roommate to your soulmate — or keep it to yourself.
            </p>
          </div>
          <div className="md:w-1/2">
            <img src="landing2.png" alt="Map" className="rounded-lg shadow-lg" />
          </div>
        </div>
      </section>

      {/* Treasure Great Memories Section */}
      <section className="bg-gray-100 py-16 px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Treasure Great Memories</h2>
          <p className="text-gray-700 max-w-3xl mx-auto">
            Life is nothing but a series of memories. Not all of them are worth saving, but the truly 
            great ones — your family vacations, summer adventures, or your wedding day — deserve to 
            be shared and remembered forever. Create keepsakes that matter.
          </p>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 items-start">
          {/* Left Column */}
          <div className="grid grid-rows-2 gap-4">
            <img
              src="landing1.png"
              alt="Memory 1"
              className="w-full h-32 md:h-40 object-cover rounded-lg shadow-md"
            />
            <img
              src="landing2.png"
              alt="Memory 2"
              className="w-full h-32 md:h-40 object-cover rounded-lg shadow-md"
            />
          </div>

          {/* Center Large Image */}
          <div className="col-span-1 md:col-span-2">
            <img
              src="landing9.jpg"
              alt="Main Memory"
              className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Right Column */}
          <div className="grid grid-rows-3 gap-4">
            <img
              src="landing4.png"
              alt="Memory 4"
              className="w-full h-32 md:h-40 object-cover rounded-lg shadow-md"
            />
            <img
              src="landing5.png"
              alt="Memory 5"
              className="w-full h-32 md:h-40 object-cover rounded-lg shadow-md"
            />
            <img
              src="landing6.png"
              alt="Memory 6"
              className="w-full h-32 md:h-40 object-cover rounded-lg shadow-md"
            />
          </div>
        </div>
      </section>

      {/* Transform Adventure Section */}
      <section className="py-16 px-6 text-center md:text-left">
        <div className="md:flex md:items-center md:space-x-10">
          <div className="md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Transform your adventure into a Travel Book
            </h2>
            <p className="text-gray-700 mb-6">
              Your routes, travel stats, and photos transformed into a beautiful, hardback travel book.
            </p>
            <button className="bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600">
              Find out more
            </button>
          </div>
          <div className="md:w-1/2">
            <img src="landing7.png" alt="Travel Book" className="rounded-lg shadow-lg" />
          </div>
        </div>
      </section>

      {/* Relive Journey Section */}
      <section className="bg-gray-100 py-16 px-6">
        <div className="md:flex md:items-center md:space-x-10">
          <div className="md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Relive Your Journey, One Reel at a Time</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Quick and Easy: Turn travel memories into stunning reels.</li>
              <li>Top Quality: Showcase your memories in style.</li>
              <li>Beyond Easy: Quickly create and preview reels effortlessly.</li>
            </ul>
          </div>
          <div className="md:w-1/2">
            <img src="landing8.png" alt="Reel" className="rounded-lg shadow-lg" />
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-300 text-black text-center py-6">
        <p>About | Home | Contact Us</p>
      </footer>
    </div>
  );
};

export default LandingComponent;
