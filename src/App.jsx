// src/App.jsx
import React from 'react';
import AppRouter from './router/AppRouter';
import AppNavbar from './components/Navbar';
import Footer from './components/Footer';
import AnnouncementBar from './components/AnnouncementBar';
import { CartProvider } from "./context/CartContext";



function App() {
  return (
    <>
      <AnnouncementBar />
      <AppNavbar />
      <AppRouter />
      <Footer />
      <CartProvider/>
    </>
  );
}

export default App;
