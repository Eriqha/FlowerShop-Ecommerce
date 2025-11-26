// src/pages/AdminProducts.jsx
import React, { useEffect, useState, useContext } from 'react';
import AdminLayout from '../components/AdminLayout';
import API from '../Api/api';
import ProductForm from '../components/ProductForm';
import { AuthContext } from '../context/AuthContext';
import { Toast } from 'react-bootstrap';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    try {
      const res = await API.get('/products');
      setProducts(res.data || []);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  }

  async function deactivate(id) {
    try {
      if (!window.confirm('Mark product inactive?')) return;
      await API.delete(`/products/${id}`);
      fetchProducts();
      setToastMessage('Product marked inactive');
      setShowToast(true);
    } catch (err) {
      console.error('Failed to deactivate', err);
    }
  }

  const { user } = useContext(AuthContext);

  if (!user || String(user.role).toLowerCase() !== 'admin') {
    return (
      <AdminLayout>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2>Admin - Products</h2>
          <p>You must be an admin to access this page.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Admin - Products</span>
        </h2>

        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <ProductForm onSaved={fetchProducts} editing={editing} setEditing={setEditing} />
          </div>

          <div style={{ flex: 2 }}>
            <table className="admin-table" style={{ marginTop: 16 }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Image</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && (
                  <tr><td colSpan="5" style={{ padding: 12 }}>No products</td></tr>
                )}
                {products.map(p => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>
                      {p.images && p.images.length ? (
                        <img src={p.images[0]} alt={p.name} className="admin-img-thumb" />
                      ) : (
                        <div style={{ width: 100, height: 60, background: '#f3f3f3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>No image</div>
                      )}
                    </td>
                    <td>₱{(p.price || 0).toFixed(2)}</td>
                    <td>{p.isActive ? <span className="admin-badge-active">Active</span> : <span className="admin-badge-inactive">Inactive</span>}</td>
                    <td>
                      <div className="admin-action-group">
                        <button className="icon-btn edit" title="Edit product" onClick={() => setEditing(p)}>
                          {/* Pencil icon */}
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M12.146.854a.5.5 0 0 1 .708 0l2.292 2.292a.5.5 0 0 1 0 .708l-9.193 9.193a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.62-.62l1-4a.5.5 0 0 1 .131-.233l9.193-9.193zM11.207 2L3 10.207V12h1.793L14 3.793 11.207 2z"/>
                          </svg>
                        </button>
                        <button className="icon-btn delete" title="Deactivate product" onClick={() => deactivate(p._id)}>
                          {/* Trash icon */}
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5.5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6zm3 .5a.5.5 0 0 1 .5-.5h.5v6a.5.5 0 0 1-1 0V6z"/>
                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 1 1 0-2H5V1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1h2.5a1 1 0 0 1 1 1zM6.5 1v1h3V1h-3zM4 4v9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4H4z"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div style={{ position: 'fixed', top: 80, right: 20, zIndex: 1100 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={2500} autohide>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </div>
    </AdminLayout>
  );
}
