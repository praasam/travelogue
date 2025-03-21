import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingComponent from './components/Home/LandingComponent';
import Login from './components/Form/Login';
import Register from './components/Form/Register';
import NavbarComponent from './components/Navbar/NavbarComponent'
// import UserProfile from './components/Profile/ProfileComponent';
import ReelComponent from './components/Home/ReelComponent';
import DashboardComponent from './components/Dashboard/DashComponent';
import ProfileComponent from './components/Profile/ProfileComponent';
import ChangePasswordComponent from './components/Profile/ChangePassword';

function App() {
  return (
    <Router>
    <NavbarComponent/>
      <Routes>
        <Route path="/" element={<LandingComponent />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dash" element={<DashboardComponent />} />
        <Route path="/reels" element={<ReelComponent />} />
        <Route path="/profile" element={<ProfileComponent userId="me" />} />
          {/* Route for viewing any user's profile */}
          <Route path="/profile/:userId" element={<ProfileComponent />} />
          <Route path="/password" element={<ChangePasswordComponent />} />

          
      </Routes>
    </Router>
  );
}

export default App;







