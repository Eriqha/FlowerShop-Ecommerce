// src/components/AdminRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (String(user.role).toLowerCase() !== 'admin') return <Navigate to="/" replace />;
  return children;
};

export default AdminRoute;
