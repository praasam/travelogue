import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function NavbarComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('role');


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login'); // Redirect to homepage after logout
  };

  const renderLinks = () => {
    if (!isLoggedIn) {
      return (
        <>
          <Link to="/" className="text-gray-700 hover:text-[#8A5647]">Home</Link>
          
        </>
      );
    }

    if (userRole === 'admin') {
      return (
        <>
          <Link to="/dash" className="text-gray-700 hover:text-[#8A5647]">Home</Link>
          {/* <Link to="/shop" className="text-gray-700 hover:text-[#8A5647]">Shop</Link>
          <Link to="/category" className="text-gray-700 hover:text-[#8A5647]">Category</Link>
          <Link to="/brand" className="text-gray-700 hover:text-[#8A5647]">Brand</Link>
          <Link to="/product" className="text-gray-700 hover:text-[#8A5647]">Product</Link>
          <Link to="/profile" className="text-gray-700 hover:text-[#8A5647]">All users</Link> */}

        </>
      );
    } else {
      return (
        <>
          <Link to="/dash" className="text-gray-700 hover:text-[#8A5647]">Home</Link>
          {/* <Link to="/shop" className="text-gray-700 hover:text-[#8A5647]">Shop</Link> */}
          <Link to="/contact" className="text-gray-700 hover:text-[#8A5647]">Contact Us</Link>
          {/* <Link to="/cart" className="text-gray-700 hover:text-[#8A5647]">Your Cart</Link> */}

        </>
      );
    }
  };

  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-white shadow-md">
      <div className="flex items-center space-x-4">
        <Link to="/" className="flex items-center py-2">
          <span className="text-lg font-bold tracking-wide text-gray-900">TRAVELOGUE</span>
        </Link>
      </div>
      <nav className="hidden md:flex items-center space-x-6">
        {renderLinks()}
        {isLoggedIn ? (
          <button 
            onClick={handleLogout} 
            className="px-4 py-2 border rounded-md text-[#8A5647] border-[#8A5647] hover:bg-[#8A5647] hover:text-white hover:border-white"
          >
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" className="px-4 py-2 border rounded-md text-[#8A5647] border-[#8A5647] hover:bg-[#8A5647] hover:text-white hover:border-white"
>Login</Link>
            {/* <Link to="/register" className="px-4 py-2 text-white rounded-md" style={{ backgroundColor: '#8A5647' }}>Signup</Link> */}
          </>
        )}
      </nav>
      <div className="md:hidden flex items-center">
        <button
          className="outline-none mobile-menu-button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className="w-6 h-6 text-gray-500"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
      {isOpen && (
        <div className="md:hidden">
          <ul>
            {renderLinks().map((link, index) => (
              <li key={index}>
                {link}
              </li>
            ))}
            {isLoggedIn ? (
              <li>
                <button 
                  onClick={handleLogout} 
                  className="px-4 py-2 border rounded-md text-[#8A5647] border-[#8A5647] hover:bg-[#8A5647] hover:text-white hover:border-white">
                  Logout
                </button>
              </li>
            ) : (
              <>
                {/* <li>
                  <Link to="/login" className="block text-sm px-2 py-4  transition duration-300" style={{ color: '#8A5647' , borderColor:'#8A5647'}}>
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="block text-sm px-2 py-4 transition duration-300" style={{ color: '#8A5647' , borderColor:'#8A5647'}}>
                    Sign Up
                  </Link>
                </li> */}
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}

export default NavbarComponent;
