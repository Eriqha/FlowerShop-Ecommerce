// src/pages/AdminOrders.jsx
import React, { useEffect, useState, useContext } from 'react';
import { Card, Table, Button, Badge, Form, Modal } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import API from '../Api/api';
import AdminLayout from '../components/AdminLayout';

const AdminOrders = () => {
  const { user, token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [receiptFile, setReceiptFile] = useState({});
  const [receiptModalHtml, setReceiptModalHtml] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
        console.debug('AdminOrders fetching; user role:', user?.role, 'token:', !!token);
      setLoading(true);
      try {
        const res = await API.get('/orders');
        console.log('AdminOrders fetched', res.data?.length, 'orders');
        setOrders(res.data || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch admin orders', err);
        const status = err?.response?.status;
        const msg = err?.response?.data?.message || err.message || 'Failed to fetch orders';
        setError(`(${status || 'error'}) ${msg}`);
      } finally {
        setLoading(false);
      }
    };
    if (user && token && String(user.role).toLowerCase() === 'admin') {
      fetchOrders();
    }
  }, [user, token]); // re-fetch when user or token changes (ensure Authorization is available)

  const updateStatus = async (orderId, status) => {
    try {
      setLoading(true);
      await API.put(`/orders/${orderId}/status`, { status });
      const res = await API.get('/orders');
      setOrders(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to update order status', err);
      const statusCode = err?.response?.status;
      const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to update order status';
      setError(`(${statusCode || 'error'}) ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async (orderId) => {
    try {
      setLoading(true);
      await API.put(`/orders/${orderId}/complete`);
      const res = await API.get('/orders');
      setOrders(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to mark complete', err);
      const statusCode = err?.response?.status;
      const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to mark completed';
      setError(`(${statusCode || 'error'}) ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const uploadReceipt = async (orderId) => {
    if (!receiptFile[orderId]) return;
    const formData = new FormData();
    formData.append('receipt', receiptFile[orderId]);
    try {
      setLoading(true);
      await API.post(`/orders/${orderId}/uploadReceipt`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const res = await API.get('/orders');
      setOrders(res.data);
      setReceiptFile(f => ({ ...f, [orderId]: null }));
      setError(null);
    } catch (err) {
      console.error('Failed to upload receipt', err);
      const statusCode = err?.response?.status;
      const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to upload receipt';
      setError(`(${statusCode || 'error'}) ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const getURL = (p) => p ? (p.startsWith('http') ? p : `${API.defaults.baseURL.replace('/api', '')}${p}`) : null;

  const viewReceipt = async (order) => {
    try {
      setModalLoading(true);
      setShowReceiptModal(true);
      setReceiptModalHtml(null);
      const res = await API.get(`/orders/${order._id}/receiptHtml`);
      if (!res?.data?.html) {
        // if no HTML returned but order has a receipt that is a pdf, open the pdf in new tab
        if (order.receipt && order.receipt.endsWith('.pdf')) {
          window.open(getURL(order.receipt), '_blank');
          setShowReceiptModal(false);
          return;
        }
      }
      setReceiptModalHtml(res.data.html);
    } catch (err) {
      console.error('Failed to fetch receipt html', err);
      const statusCode = err?.response?.status;
      const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to load receipt';
      setError(`(${statusCode || 'error'}) ${msg}`);
      setShowReceiptModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <>
    <AdminLayout>
      <Card className="shadow-sm rounded-4 p-3" style={{ border: 'none', maxWidth: 1200, margin: '0 auto' }}>
        <Card.Title style={{ fontWeight: 600, fontSize: '1.5rem' }}>Admin Orders</Card.Title>
        {loading && <p>Loading...</p>}
        {!loading && error && <p className="text-danger">{error}</p>}
        {!loading && !error && orders.length === 0 && <p>No orders found.</p>}
        {!loading && !error && orders.length > 0 && (
            <Table hover responsive borderless>
            <thead>
              <tr className="text-muted">
                <th>Order ID</th>
                <th>User</th>
                <th>Status</th>
                <th>Total</th>
                <th>Receipt</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td style={{ maxWidth: '180px', overflowWrap: 'anywhere' }}>{order._id}</td>
                  <td>{order.user?.name || 'N/A'}<br /><span style={{ fontSize: '12px', color: '#888' }}>{order.user?.email}</span></td>
                  <td>
                    <Badge bg={order.status === 'completed' ? 'success' : order.status === 'approved' ? 'primary' : order.status === 'declined' ? 'danger' : 'warning'}>
                      {order.status}
                    </Badge>
                  </td>
                  <td>₱{order.total}</td>
                  <td>
                    {order.receipt ? (
                      (order.receipt.endsWith('.html') || order.receipt.endsWith('.htm') || order.receipt.endsWith('.pdf')) ? (
                        // open a modal and fetch the receipt HTML content
                        <Button size="sm" variant="link" onClick={() => viewReceipt(order)}>View receipt</Button>
                      ) : (
                        <a href={getURL(order.receipt)} target="_blank" rel="noreferrer">
                          <img src={getURL(order.receipt)} alt="receipt" style={{ width: 60, borderRadius: 6 }} />
                        </a>
                      )
                    ) : (
                      <Form.Group>
                        <Form.Control type="file" size="sm" onChange={e => setReceiptFile(f => ({ ...f, [order._id]: e.target.files[0] }))} />
                        <Button size="sm" variant="outline-primary" className="mt-1" onClick={() => uploadReceipt(order._id)}>Upload</Button>
                      </Form.Group>
                    )}
                  </td>
                  <td>
                    <Button size="sm" variant="success" className="me-1" onClick={() => updateStatus(order._id, 'approved')} disabled={loading}>Approve</Button>
                    <Button size="sm" variant="danger" className="me-1" onClick={() => updateStatus(order._id, 'declined')} disabled={loading}>Decline</Button>
                    <Button size="sm" variant="secondary" onClick={() => markComplete(order._id)} disabled={loading}>Mark Completed</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </AdminLayout>
    
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

export default AdminOrders;
