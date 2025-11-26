// src/components/ProductForm.jsx
import React, { useEffect, useState } from 'react';
import API from '../Api/api';
import { Toast } from 'react-bootstrap';

export default function ProductForm({ onSaved, editing, setEditing }) {
  const [form, setForm] = useState({ name: '', price: '', category: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name || '',
        price: editing.price ?? '',
        category: editing.category?._id || editing.category || '',
        description: editing.description || ''
      });
      if (editing.images && editing.images.length) setPreviewUrl(editing.images[0]);
      else setPreviewUrl(null);
    } else {
      setForm({ name: '', price: '', category: '', description: '' });
      setPreviewUrl(null);
    }
  }, [editing]);

  useEffect(() => {
    // fetch categories for select
    let mounted = true;
    API.get('/categories')
      .then(res => { if (mounted) setCategories(res.data || []); })
      .catch(err => console.error('Failed to load categories', err));
    return () => { mounted = false; };
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function handleFileChange(e) {
    const file = e.target.files && e.target.files[0];
    setSelectedImage(file || null);
    if (file) setPreviewUrl(URL.createObjectURL(file));
    else setPreviewUrl(editing && editing.images && editing.images[0] ? editing.images[0] : null);
  }

  async function uploadImage(productId) {
    if (!selectedImage) return null;
    const fd = new FormData();
    fd.append('image', selectedImage);
    const res = await API.post(`/products/${productId}/images`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      let savedProduct = null;
      if (editing) {
        const res = await API.put(`/products/${editing._id}`, form);
        savedProduct = res.data;
      } else {
        const res = await API.post('/products', form);
        savedProduct = res.data;
      }

      if (selectedImage && savedProduct && savedProduct._id) {
        try {
          const updated = await uploadImage(savedProduct._id);
          savedProduct = updated || savedProduct;
        } catch (imgErr) {
          console.error('Image upload failed', imgErr);
          alert('Product saved but image upload failed');
        }
      }

      setForm({ name: '', price: '', stockQuantity: 0, description: '' });
      setSelectedImage(null);
      setPreviewUrl(null);
      setEditing && setEditing(null);
      onSaved();
      setToastMessage('Product saved');
      setShowToast(true);
    } catch (err) {
      console.error(err);
      alert('Error saving product');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6 }}>
      <h3>{editing ? 'Edit Product' : 'Create Product'}</h3>
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block' }}>Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block' }}>Price</label>
        <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block' }}>Category</label>
        <select name="category" value={form.category} onChange={handleChange} required>
          <option value="">-- Select category --</option>
          {categories.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Stock is managed elsewhere; removed from admin form */}

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block' }}>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block' }}>Image</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {previewUrl && (
          <div style={{ marginTop: 8 }}>
            <img src={previewUrl} alt="preview" style={{ maxWidth: 160, maxHeight: 120, borderRadius: 4 }} />
          </div>
        )}
      </div>

      <div>
        <button type="submit" disabled={loading}>{loading ? 'Saving...' : (editing ? 'Update' : 'Create')}</button>
        {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', price: '', stockQuantity: 0, description: '' }); setSelectedImage(null); setPreviewUrl(null); }}>Cancel</button>}
      </div>

      {/* toast */}
      <div style={{ position: 'fixed', top: 80, right: 20, zIndex: 1100 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={2500} autohide>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </div>
    </form>
  );
}
