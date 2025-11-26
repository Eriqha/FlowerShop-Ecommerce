// src/components/AdminNavbar.jsx
import React, { useContext } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminNavbar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/') || location.pathname.startsWith(path);

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" style={{ minHeight: '70px', padding: '0 20px' }}>
      <Container>
        <Navbar.Brand as={Link} to="/admin/orders" style={{ fontWeight: '700', color: '#fff' }}>
          🧾 Fatima Flowers Admin
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Nav>
            <Nav.Link as={Link} to="/admin/orders" style={{ color: '#fff', marginRight: '20px', fontWeight: isActive('/admin/orders') ? 700 : 400 }}>Orders</Nav.Link>
            <Nav.Link as={Link} to="/admin/products" style={{ color: '#fff', marginRight: '20px', fontWeight: isActive('/admin/products') ? 700 : 400 }}>Products</Nav.Link>
            <Nav.Link as={Link} to="/admin/receipts" style={{ color: '#fff', marginRight: '20px', fontWeight: isActive('/admin/receipts') ? 700 : 400 }}>Receipts</Nav.Link>
            <Nav.Link onClick={() => { logout(); navigate('/login'); }} style={{ color: '#fff', fontWeight: 600 }}>Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;
