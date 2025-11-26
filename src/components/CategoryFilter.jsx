// src/components/CategoryFilter.jsx
import React from 'react';
import { Form } from 'react-bootstrap';



const CategoryFilter = ({ categories, value, onChange }) => {
  return (
    <Form.Select value={value} onChange={onChange}>
      <option value="">All Categories</option>
      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
    </Form.Select>
  );
};


export default CategoryFilter;

