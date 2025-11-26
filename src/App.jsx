// src/App.jsx
import React from 'react';
import AppRouter from './router/AppRouter';
import AppNavbar from './components/Navbar';
import Footer from './components/Footer';
import AnnouncementBar from './components/AnnouncementBar';
import { CartProvider } from "./context/CartContext";
import { AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import { useLocation } from 'react-router-dom';



function App() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  return (
    <>
      {/* Only render the public announcement & navbar when not on admin route */}
      {!isAdminRoute && <AnnouncementBar />}
      {!isAdminRoute && <AppNavbar />}
      <AppRouter />
      {!isAdminRoute && <Footer />}
      <CartProvider/>
    </>
  );
}

export default App;
