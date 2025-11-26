// src/pages/Account.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Table } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import API from '../Api/api';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/FormatPrice';

const Account = () => {
const { user, logout } = useContext(AuthContext);
const [orders, setOrders] = useState([]);
const navigate = useNavigate();

useEffect(() => {
if (!user) {
navigate('/login');
return;
}

// Fetch user orders
API.get(`/orders/user/${user._id}`)
  .then(res => setOrders(res.data))
  .catch(err => console.error(err));


}, [user, navigate]);

if (!user) return null;

return ( <Container className="py-5"> <Row className="mb-4">
{/* Profile Card */} <Col md={4}>
<Card className="shadow-sm rounded-4 p-3" style={{ border: 'none' }}> <div className="text-center">
<img
src={user.avatar || '/assets/profile-placeholder.png'}
alt="Profile"
className="rounded-circle mb-3"
style={{ width: '120px', height: '120px', objectFit: 'cover' }}
/> </div>
<Card.Body className="text-center">
<Card.Title className="mb-2" style={{ fontWeight: 600, fontSize: '1.5rem' }}>
{user.name}
</Card.Title>
<Card.Text className="text-muted">{user.email}</Card.Text>
<Button
variant="danger"
className="mt-3 px-4"
style={{ borderRadius: '30px' }}
onClick={() => { logout(); navigate('/'); }}
>
Logout </Button>
</Card.Body> </Card> </Col>

    {/* Orders Card */}
    <Col md={8}>
      <Card className="shadow-sm rounded-4" style={{ border: 'none' }}>
        <Card.Body>
          <Card.Title style={{ fontWeight: 600, marginBottom: '20px' }}>My Orders</Card.Title>

          {orders.length === 0 ? (
            <p className="text-muted">You have no orders yet.</p>
          ) : (
            <Table hover responsive borderless>
              <thead>
                <tr className="text-muted">
                  <th>Order ID</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ maxWidth: '200px', overflowWrap: 'anywhere' }}>{order._id}</td>
                    <td>{order.status}</td>
                    <td style={{ fontWeight: 600 }}>{formatPrice(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Col>
  </Row>
</Container>


);
};

export default Account;
