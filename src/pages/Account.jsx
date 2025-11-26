// src/pages/Account.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import API from '../Api/api';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/FormatPrice';

const Account = () => {
  const { user, logout } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [receiptModalHtml, setReceiptModalHtml] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch user orders
    API.get(`/orders/${user._id}`)
      .then(res => setOrders(res.data))
      .catch(err => console.error(err));

  }, [user, navigate]);

  const viewReceipt = async (order) => {
    try {
      setModalLoading(true);
      setShowReceiptModal(true);
      setReceiptModalHtml(null);

      const res = await API.get(`/orders/${order._id}/receiptHtml`);

      if (!res?.data?.html) {
        if (order.receipt && order.receipt.endsWith('.pdf')) {
          window.open(`${process.env.REACT_APP_API_URL?.replace('/api', '') || ''}${order.receipt}`, '_blank');
          setShowReceiptModal(false);
          return;
        }
      }

      setReceiptModalHtml(res.data.html);

    } catch (err) {
      console.error('Failed to fetch receipt html', err);
      setShowReceiptModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <Container className="py-5">
        <Row className="mb-4">

          {/* Profile Card */}
          <Col md={4}>
            <Card className="shadow-sm rounded-4 p-3" style={{ border: 'none' }}>
              <div className="text-center">
                <img
                  src={user.avatar || '/assets/profile-placeholder.png'}
                  alt="Profile"
                  className="rounded-circle mb-3"
                  style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                />
              </div>
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
                  Logout
                </Button>
              </Card.Body>
            </Card>
          </Col>

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
                        <th>Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ maxWidth: '200px', overflowWrap: 'anywhere' }}>{order._id}</td>
                          <td>{order.status}</td>
                          <td style={{ fontWeight: 600 }}>{formatPrice(order.total)}</td>
                          <td>
                            {order.receipt ? (
                              (order.receipt.endsWith('.html') ||
                               order.receipt.endsWith('.htm') ||
                               order.receipt.endsWith('.pdf')) ? (
                                <Button variant="link" size="sm" onClick={() => viewReceipt(order)}>
                                  View receipt
                                </Button>
                              ) : (
                                <a
                                  href={`${process.env.REACT_APP_API_URL?.replace('/api', '') || ''}${order.receipt}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <img
                                    src={`${process.env.REACT_APP_API_URL?.replace('/api', '') || ''}${order.receipt}`}
                                    alt="receipt"
                                    style={{ width: 48, borderRadius: 6 }}
                                  />
                                </a>
                              )
                            ) : (
                              <span style={{ color: '#aaa', fontSize: '12px' }}>—</span>
                            )}
                          </td>
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

      {/* Receipt Modal */}
      <Modal show={showReceiptModal} onHide={() => setShowReceiptModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Receipt</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflow: 'auto' }}>
          {modalLoading && <p>Loading receipt...</p>}
          {!modalLoading && receiptModalHtml && (
            <div dangerouslySetInnerHTML={{ __html: receiptModalHtml }} />
          )}
          {!modalLoading && !receiptModalHtml && <p>No receipt content available.</p>}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Account;
