// src/pages/Login.jsx
import React, { useContext, useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState(null);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(form.email, form.password);
      // navigate based on role
      if (res.user?.role === 'admin') {
        navigate('/admin/orders');
      } else {
        navigate('/');
      }
    } catch (error) {
      setErr(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h2>Login</h2>
          {err && <div className="text-danger mb-3">{err}</div>}
          <Form onSubmit={submit}>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control name="email" value={form.email} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" name="password" value={form.password} onChange={handleChange} required />
            </Form.Group>
            <Button type="submit">Login</Button> <Link to="/register" className="ms-3">Register</Link>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
