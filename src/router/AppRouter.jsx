// src/router/AppRouter.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Shop from '../pages/Shop';
import ProductDetails from '../pages/ProductDetails';
import CartPage from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AnniversaryCollection from '../pages/AnniversaryCollection';
import Account from '../pages/Account';
import BirthdayCollection from "../pages/BirthdayCollection";
import CongratulationsCollection from "../pages/CongratulationsCollection";
import GetWellSoonCollection from "../pages/GetWellSoonCollection";
import ImSorryCollection from "../pages/ImSorryCollection";
import RomanticCollection from "../pages/RomanticCollection";
import SympathyFuneralCollection from "../pages/SympathyFuneralCollection";
import ThankYouCollection from "../pages/ThankYouCollection";


const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/collections/anniversary" element={<AnniversaryCollection />} />
      <Route path="/account" element={<Account />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Home />} />
      <Route path="/collections/birthday" element={<BirthdayCollection />} />
      <Route path="/collections/congratulations" element={<CongratulationsCollection />} />
      <Route path="/collections/get-well-soon" element={<GetWellSoonCollection />} />
      <Route path="/collections/im-sorry" element={<ImSorryCollection />} />
      <Route path="/collections/romantic" element={<RomanticCollection />} />
      <Route path="/collections/sympathy-funeral" element={<SympathyFuneralCollection />} />
      <Route path="/collections/thank-you" element={<ThankYouCollection />} />
    </Routes>
  );
};

export default AppRouter;
