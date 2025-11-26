// src/components/Navbar.jsx
import React, { useContext } from 'react';
import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser } from 'react-icons/fa';

const AppNavbar = () => {
  const { cartItems } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const cartCount = user ? cartItems.reduce((s, i) => s + i.quantity, 0) : 0;

  return (
    <Navbar 
      bg="light" 
      expand="lg" 
      sticky="top"
      style={{ zIndex: 9999, boxShadow: '0 2px 6px rgba(0,0,0,0.1)', minHeight: '80px', padding: '0 20px' }}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" style={{ fontWeight: '700' }}>
          🌸 Fatima Flowers
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/collections/anniversary" style={{ marginRight: '15px' }}>Anniversary</Nav.Link>
            <Nav.Link as={Link} to="/collections/birthday" style={{ marginRight: '15px' }}>Birthday</Nav.Link>
            <Nav.Link as={Link} to="/collections/congratulations" style={{ marginRight: '15px' }}>Congratulations</Nav.Link>
            <Nav.Link as={Link} to="/collections/get-well-soon" style={{ marginRight: '15px' }}>Get Well Soon</Nav.Link>
            <Nav.Link as={Link} to="/collections/im-sorry" style={{ marginRight: '15px' }}>I'm Sorry</Nav.Link>
            <Nav.Link as={Link} to="/collections/romantic" style={{ marginRight: '15px' }}>Romantic</Nav.Link>
            <Nav.Link as={Link} to="/collections/sympathy-funeral" style={{ marginRight: '15px' }}>Sympathy & Funeral</Nav.Link>
            <Nav.Link as={Link} to="/collections/thank-you" style={{ marginRight: '15px' }}>Thank you</Nav.Link>
          </Nav>

          <Nav className="align-items-center">
            {/* Always show profile icon */}
            <Nav.Link as={Link} to={user ? '/account' : '/login'} style={{ marginRight: '20px', display: 'flex', alignItems: 'center' }} className="nav-icon">
              <FaUser size={22} />
            </Nav.Link>

            {/* Cart Icon */}
            <Nav.Link as={Link} to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center' }} className="nav-icon">
              <FaShoppingCart size={22} />
              {cartCount > 0 && (
                <Badge bg="danger" style={{ position: 'absolute', top: '-5px', right: '-10px', fontSize: '0.65rem', padding: '2px 6px' }}>{cartCount}</Badge>
              )}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>

      <style>{`
        .nav-icon:hover {
          color: #f45c5c;
          transition: color 0.3s ease;
        }
      `}</style>
    </Navbar>
  );
};

export default AppNavbar;
