import React from 'react';
import { useNavigate } from 'react-router-dom';
// import { Swiper, SwiperSlide } from 'swiper/react';
// import { Autoplay, Pagination } from 'swiper/modules';
// import 'swiper/css';
// import 'swiper/css/pagination';


const LandingComponent = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white font-sans">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between min-h-screen px-10 bg-gray-100">
  {/* Left Content */}
  <div className="md:w-1/2 text-left">
    <h1 className="text-5xl font-bold mb-4 leading-tight text-[#8A5647]">
      Capture Moments, <br />
      Create Soundtracks, <br />
      Share Joy
    </h1>
    <p className="text-gray-700 mb-6 max-w-md">
      Upload your favorite images and express your feelings. Let our platform suggest the perfect music to enhance your memories and seamlessly integrate it into your reels.
    </p>
    <div className="flex space-x-4">
      <button className="bg-[#8A5647] text-white px-6 py-3 rounded">Get Started</button>
      <button className="border text-[#8A5647] border-[#8A5647] hover:bg-[#8A5647] hover:text-white hover:border-white px-6 py-3 rounded">Learn More</button>
    </div>
  </div>

  {/* Right Media Grid */}
  <div className="md:w-1/2 grid grid-cols-2 gap-2 h-[500px]">
    {/* Left Column */}
    <div className="grid grid-rows-2 gap-2">
      <video src="video.mp4" className="w-full h-full object-cover rounded-lg aspect-video" autoPlay muted loop />
      <img src="landing1.png" alt="Gallery" className="w-full h-full object-cover rounded-lg" />
    </div>

    {/* Right Column */}
    <div className="grid grid-rows-3 gap-2">
    <video src="video.mp4" className="w-full h-full object-cover rounded-lg aspect-video" autoPlay muted loop />
    <img src="landing1.png" alt="Gallery" className="w-full h-full object-cover rounded-lg" />
      <video src="video.mp4" className="w-full h-full object-cover rounded-lg aspect-video" autoPlay muted loop />

    </div>
  </div>
</section>

    {/* Create Stunning Reels Section */}
<section className="bg-white py-16 px-6 text-center">
  <h2 className="text-3xl font-bold mb-10">Create Stunning Reels with Your Favorite Memories and Music</h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
    {[ 
      { 
        title: "Transform Your Photos into Musical Journeys with Ease", 
        desc: "Upload your images, select the sentiment, and let the music flow.",
        btn: "Upload >",
        img: "log1.jpg"
      },
      { 
        title: "Choose Your Sentiment to Match Your Memories Perfectly", 
        desc: "Select the emotion that best captures your experience for tailored music suggestions.",
        btn: "Select >",
        img: "log.jpg"
      },
      { 
        title: "Get Personalized Music Suggestions for Your Unique Story", 
        desc: "Receive curated music recommendations that resonate with your chosen sentiment.",
        btn: "Get Music >",
        img: "log1.jpg"
      }
    ].map((item, index) => (
      <div key={index} className="p-6 bg-white shadow-lg rounded-lg">
        <img src={item.img} alt={item.title} className="w-full h-48 object-cover rounded-lg mb-4" />
        <h3 className="font-bold text-lg mb-2">{item.title}</h3>
        <p className="text-gray-600 text-md mb-4">{item.desc}</p>
        <button className="text-black font-semibold">{item.btn}</button>
      </div>
    ))}
  </div>
</section>

 {/* Transform Your Memories with Music */}
 <section className="bg-gray-100 py-16 px-6 mx-auto">
        {/* Top Section: Title & Description */}
        <div className="flex flex-col md:flex-row justify-between items-start">
          <div className="md:w-1/2">
            <h2 className="text-4xl font-bold mb-4">Transform Your Memories with Music</h2>
            <p className="text-gray-600 text-lg">
              Elevate your image reels by seamlessly integrating music that matches your emotions. Experience a new way to relive your moments.
            </p>
          </div>

          {/* Features Section */}
          <div className="md:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 md:mt-0">
            {[
              { 
                title: "Personalized Soundtracks", 
                desc: "Choose your sentiment and discover music that resonates with your journey.",
                icon: "🎵"
              },
              { 
                title: "Easy Integration", 
                desc: "Quickly add the perfect soundtrack to your visual stories with just a click.",
                icon: "⚡"
              }
            ].map((item, index) => (
              <div key={index} className="p-4 bg-white shadow-md rounded-lg flex items-start">
                <span className="text-2xl mr-3">{item.icon}</span>
                <div>
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-gray-600 text-md">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Image Carousel (Replaces the Static Image) */}
       {/* Image Carousel (Replaces the Static Image) */}
<div className="mt-10">
  {/* <Swiper
    modules={[Autoplay, Pagination]}
    spaceBetween={10}
    slidesPerView={1}
    loop={true}
    autoplay={{ delay: 3000 }}
    pagination={{ clickable: true }}
    className="rounded-lg shadow-lg max-w-3xl mx-auto"  
  >
    {["log.jpg", "log1.jpg", "log.jpg", "log1.jpg"].map((image, index) => (
      <SwiperSlide key={index}>
        <img src={image} alt={`Slide ${index}`} className="rounded-lg w-full h-[400px] object-cover" />
      </SwiperSlide>
    ))}
  </Swiper> */}
</div>

      </section>

{/* Discover Music That Matches Your Mood */}
<section className="py-16 px-6 flex flex-col md:flex-row items-center max-w-6xl mx-auto">
  <div className="md:w-1/2 text-left">
    <h2 className="text-3xl font-bold mb-4 text-[#8A5647]">Discover Music That Matches Your Mood</h2>
    <p className="text-gray-600 text-lg mb-6">
      Transform your travel memories into a musical experience. Our unique sentiment-based suggestions ensure the perfect soundtrack for every moment.
    </p>
    <div className="flex space-x-4">
      <button className="border text-[#8A5647] border-[#8A5647] hover:bg-[#8A5647] hover:text-white hover:border-white px-6 py-2 rounded">Explore</button>
      <button className="border text-[#8A5647] border-[#8A5647] hover:bg-[#8A5647] hover:text-white hover:border-white px-6 py-2 rounded">Integrate</button>
    </div>
  </div>

  <div className="md:w-1/2 flex justify-end">
    <img src="landing5.png" alt="Music Mood" className="rounded-lg shadow-lg w-full max-w-sm" />
  </div>
</section>


     

     {/*journey soundtrack*/}
     <div className="w-full p-8 bg-gray-100">
      {/* Section Title */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mt-2">Your Journey, Your Soundtrack</h1>
        <p className="text-gray-600 mt-2">Easily upload images and express your feelings.</p>
      </div>
      
      <div className="w-full p-8 bg-gray-100">
      {/* Cards Container */}
      <div className="flex gap-6 justify-center mx-2">
        {/* First Card - Upload (Wider with right half being the image) */}
        <div className="flex border rounded border-gray-300 shadow-sm w-96 h-80">
          <div className="w-1/2 p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-semibold">Upload</h2>
              <h3 className="text-lg font-bold mt-1">Multiple Sentiment Options Available</h3>
              <p className="text-sm text-gray-600 mt-2">Choose from various emotions to enhance your experience.</p>
            </div>
            <div className="mt-4">
              <button className="text-sm font-semibold flex items-center text-blue-600">
                Explore <span className="ml-1">›</span>
              </button>
            </div>
          </div>
          <div className="w-1/2 bg-gray-200 flex items-center justify-center">
            <img src="log.jpg" alt="Upload placeholder" className="w-16 h-16" />
          </div>
        </div>
        
        {/* Second Card - Integrate (Top content, bottom image) */}
        <div className="border rounded border-gray-300 shadow-sm w-64 h-80">
          <div className="p-6 h-1/2">
            <h2 className="text-sm font-semibold">Integrate</h2>
            <h3 className="text-lg font-bold mt-1">Seamless Music Integration</h3>
            <p className="text-sm text-gray-600 mt-2">Effortlessly blend music into your visual stories.</p>
            <button className="text-sm font-semibold flex items-center mt-4 text-blue-600">
              Start <span className="ml-1">›</span>
            </button>
          </div>
          <div className="h-1/2 bg-gray-200 flex items-center justify-center">
            <img src="log1.jpg" alt="Integrate placeholder" className="w-16 h-16" />
          </div>
        </div>
        
        {/* Third Card - Create (Top content, bottom image) - Reduced height */}
        <div className="border rounded border-gray-300 shadow-sm w-60 h-72">
          <div className="p-6 h-1/2">
            <h2 className="text-sm font-semibold">Create</h2>
            <h3 className="text-lg font-bold mt-1">Share Your Memories</h3>
            <p className="text-sm text-gray-600 mt-2">Showcase your adventures with personalized music.</p>
            <button className="text-sm font-semibold flex items-center mt-4 text-blue-600">
              Join <span className="ml-1">›</span>
            </button>
          </div>
          <div className="h-1/2 bg-gray-200 flex items-center justify-center">
            <img src="log.jpg" alt="Create placeholder" className="w-16 h-16" />
          </div>
        </div>
      </div>
    </div>
    </div>


      {/* Footer */}
      <footer className="bg-gray-300 text-black text-center py-6 text-lg">
        <p>&copy; 2025 Your Company. All rights reserved.</p>
        <p className="text-sm">Privacy Policy | Terms of Service | Contact</p>
      </footer>
    </div>
  );
};

export default LandingComponent;