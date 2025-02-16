import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingComponent from './components/Home/LandingComponent';
import Login from './components/Form/Login';
import Register from './components/Form/Register';
import DashboardComponent from './components/Home/DashComponent';
import NavbarComponent from './components/Navbar/NavbarComponent'

function App() {
  return (
    <Router>
    <NavbarComponent/>
      <Routes>
        <Route path="/" element={<LandingComponent />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dash" element={<DashboardComponent />} />
        
      </Routes>
    </Router>
  );
}

export default App;







