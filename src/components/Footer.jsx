import { Container, Row, Col, Form, Button } from 'react-bootstrap';

const Footer = () => (
  <footer className="bg-light py-5">
    <Container>
      <Row>
        <Col md={4}>
          <h5>Flower Shop</h5>
          <p>Fresh flowers delivered to your doorstep.</p>
        </Col>
        <Col md={4}>
          <h5>Quick Links</h5>
          <ul className="list-unstyled">
            <li>About Us</li>
            <li>Contact</li>
            <li>FAQ</li>
          </ul>
        </Col>
        <Col md={4}>
          <h5>Newsletter</h5>
          <Form className="d-flex">
            <Form.Control placeholder="Email address" />
            <Button className="ms-2">Subscribe</Button>
          </Form>
        </Col>
      </Row>
      <hr />
      <p className="text-center mb-0">© {new Date().getFullYear()} Flower Shop. All rights reserved.</p>
    </Container>
  </footer>
);



export default Footer;  // ✅ This is required
