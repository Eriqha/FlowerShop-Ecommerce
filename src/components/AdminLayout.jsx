// src/components/AdminLayout.jsx
import React from 'react';
import AdminNavbar from './AdminNavbar';

const AdminLayout = ({ children }) => (
  <>
    <AdminNavbar />
    <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: '40px 0' }}>
      {children}
    </div>
  </>
);

export default AdminLayout;
