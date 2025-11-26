// src/pages/Checkout.jsx
import React, { useContext, useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { CartContext } from '../context/CartContext';
import API from '../Api/api';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { cartItems, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    senderName: '',
    senderPhone: '',
    recipientName: '',
    recipientPhone: '',
    address: '',
    deliveryDate: '',
    deliveryTime: '',
    messageCard: '',
    specialInstructions: ''
  });
  const [loading, setLoading] = useState(false);

  const total = cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submitOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return alert('Cart is empty');
    const items = cartItems.map(i => ({ product: i.product._id, quantity: i.quantity, price: i.product.price }));
    const payload = {
      items,
      total,
      deliveryDate: form.deliveryDate,
      deliveryTime: form.deliveryTime,
      senderName: form.senderName,
      senderPhone: form.senderPhone,
      recipientName: form.recipientName,
      recipientPhone: form.recipientPhone,
      address: form.address,
      messageCard: form.messageCard,
      specialInstructions: form.specialInstructions
    };
    setLoading(true);
    try {
      await API.post('/orders', payload);
      clearCart();
      navigate('/'); // or a thank you page
    } catch (err) {
      alert(err.response?.data?.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <h2>Checkout</h2>
      <Row>
        <Col md={7}>
          <Form onSubmit={submitOrder}>
            <h5>Sender</h5>
            <Form.Group className="mb-2">
              <Form.Label>Name</Form.Label>
              <Form.Control name="senderName" value={form.senderName} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Phone</Form.Label>
              <Form.Control name="senderPhone" value={form.senderPhone} onChange={handleChange} required />
            </Form.Group>

            <h5 className="mt-3">Recipient</h5>
            <Form.Group className="mb-2">
              <Form.Label>Name</Form.Label>
              <Form.Control name="recipientName" value={form.recipientName} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Phone</Form.Label>
              <Form.Control name="recipientPhone" value={form.recipientPhone} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Address</Form.Label>
              <Form.Control name="address" value={form.address} onChange={handleChange} required />
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-2">
                  <Form.Label>Delivery Date</Form.Label>
                  <Form.Control type="date" name="deliveryDate" value={form.deliveryDate} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-2">
                  <Form.Label>Delivery Time</Form.Label>
                  <Form.Control type="time" name="deliveryTime" value={form.deliveryTime} onChange={handleChange} required />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-2">
              <Form.Label>Message Card</Form.Label>
              <Form.Control as="textarea" rows={3} name="messageCard" value={form.messageCard} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Special Instructions</Form.Label>
              <Form.Control as="textarea" rows={2} name="specialInstructions" value={form.specialInstructions} onChange={handleChange} />
            </Form.Group>

            <Button type="submit" disabled={loading}>{loading ? 'Placing order...' : 'Place Order'}</Button>
          </Form>
        </Col>

        <Col md={5}>
          <h5>Order Summary</h5>
          <ul className="list-unstyled">
            {cartItems.map(i => (
              <li key={i.product._id} className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <small>{i.product.name} × {i.quantity}</small>
                </div>
                <div><strong>₱{(i.product.price * i.quantity).toFixed(2)}</strong></div>
              </li>
            ))}
          </ul>
          <hr />
          <h4>Total: ₱{total.toFixed(2)}</h4>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;
