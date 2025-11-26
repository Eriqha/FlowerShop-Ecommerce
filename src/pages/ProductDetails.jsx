import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import API from '../Api/api';
import { Container, Row, Col, Button, InputGroup, FormControl } from 'react-bootstrap';
import { CartContext } from '../context/CartContext';
import { formatPrice } from '../utils/FormatPrice';

const ProductDetails = () => {
const { id } = useParams();
const [product, setProduct] = useState(null);
const [selectedImg, setSelectedImg] = useState("");
const [quantity, setQuantity] = useState(1);
const { addToCart } = useContext(CartContext); // make sure your provider has addToCart
const [addonMessages, setAddonMessages] = useState({});
const [selectedAddOns, setSelectedAddOns] = useState([]);
const [visibleMessageAddOn, setVisibleMessageAddOn] = useState(null);
const [showCartPreview, setShowCartPreview] = useState(false);

useEffect(() => {
API.get(`/products/${id}`)
.then(res => {
setProduct(res.data);
setSelectedImg(res.data.images?.[0] || '/assets/placeholder.jpg');
})
.catch(() => setProduct(null));
}, [id]);

if (!product) return <Container className="py-5">Loading...</Container>;

const handleSelectAddOn = (addon) => {
if (addon.customizable) {
setVisibleMessageAddOn(addon._id);
} else if (!selectedAddOns.includes(addon._id)) {
setSelectedAddOns(prev => [...prev, addon._id]);
}
};

const handleSaveCustomMessage = (addon) => {
if (!selectedAddOns.includes(addon._id)) {
setSelectedAddOns(prev => [...prev, addon._id]);
}
setVisibleMessageAddOn(null);
};

const handleAddToCart = () => {
  if (!addToCart || typeof addToCart !== "function") {
    console.error("addToCart is not defined or not a function");
    return;
  }

  if (!product || !product._id) {
    console.error("Cannot add to cart: product is undefined or missing _id");
    return;
  }

  const addOnsToSend = selectedAddOns.map(id => {
    const addon = product.addOns?.find(a => a._id === id);
    return { addOnId: id, customMessage: addonMessages[id] || '' };
  });

  addToCart({ 
    product, 
    quantity: quantity || 1, 
    addOns: addOnsToSend 
  });

  // Reset selections
  setSelectedAddOns([]);
  setAddonMessages({});
  setShowCartPreview(false);
};



return ( <Container className="py-5"> <Row> <Col md={6}>
<img
src={selectedImg}
alt={product.name}
className="img-fluid"
style={{ width: "100%", height: "480px", objectFit: "cover", borderRadius: "12px" }}
/> <div className="d-flex gap-3 mt-3 flex-wrap">
{product.images?.map((img, index) => (
<img
key={index}
src={img}
alt={`thumbnail ${index + 1}`}
onClick={() => setSelectedImg(img)}
style={{
width: "90px",
height: "90px",
objectFit: "cover",
borderRadius: "4px",
cursor: "pointer",
border: selectedImg === img ? "3px solid #f45c5c" : "2px solid #ddd",
transition: "0.25s",
}}
/>
))} </div> </Col>


    <Col md={6}>
      {/* ADD-ONS */}
      <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }}>
        {product.addOns.map(addon => (
          <div key={addon._id} className="border rounded p-2 text-center" style={{ width: "150px", flexShrink: 0 }}>
            <img
              src={addon.image || '/assets/placeholder.jpg'}
              alt={addon.name}
              style={{ width: "100px", height: "100px", objectFit: "cover", marginBottom: "8px", borderRadius: "6px" }}
            />
            <h6>{addon.name}</h6>
            <p>{formatPrice(addon.price)}</p>

            <Button
              size="sm"
              style={{
                backgroundColor: selectedAddOns.includes(addon._id) ? "#4caf50" : "#f45c5c",
                color: "#fff",
                border: "none",
                width: "100%",
                marginTop: "4px",
                fontWeight: "600",
                transition: "all 0.15s ease"
              }}
              onClick={() => handleSelectAddOn(addon)}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = selectedAddOns.includes(addon._id) ? "#45a049" : "#e14b50"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = selectedAddOns.includes(addon._id) ? "#4caf50" : "#f45c5c"}
            >
              {selectedAddOns.includes(addon._id) ? "Added" : "Add"}
            </Button>
          </div>
        ))}
      </div>

      {/* Custom message modal */}
      {visibleMessageAddOn && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999
        }}>
          <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", width: "90%", maxWidth: "500px" }}>
            <h5 style={{ marginBottom: "10px" }}>
              Enter custom message for {product.addOns.find(a => a._id === visibleMessageAddOn)?.name}
            </h5>
            <FormControl
              autoFocus
              as="textarea"
              placeholder="Type your message here..."
              value={addonMessages[visibleMessageAddOn] || ''}
              onChange={e => setAddonMessages(prev => ({ ...prev, [visibleMessageAddOn]: e.target.value }))}
              style={{ fontSize: "1rem", padding: "12px", height: "120px", marginBottom: "12px" }}
            />
            <Button
              variant="success"
              style={{ width: "100%", fontWeight: "600", marginBottom: "8px" }}
              onClick={() => handleSaveCustomMessage(product.addOns.find(a => a._id === visibleMessageAddOn))}
            >
              Save
            </Button>
            <Button
              variant="secondary"
              style={{ width: "100%", fontWeight: "600" }}
              onClick={() => setVisibleMessageAddOn(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* PRODUCT DETAILS */}
      <h2 style={{ fontWeight: "700", marginTop: "20px" }}>{product.name}</h2>
      <p className="lead" style={{ fontSize: "1.5rem", fontWeight: "600" }}>
        {formatPrice(product.price)}
      </p>
      <p style={{ fontSize: "1.1rem", color: "#444" }}>{product.description}</p>

      {/* Quantity selector */}
      <InputGroup className="mb-3" style={{ maxWidth: "160px" }}>
        <Button variant="outline-secondary" onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ borderRadius: "4px 0 0 4px" }}>-</Button>
        <FormControl
          value={quantity}
          onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          style={{ textAlign: "center", borderRadius: 0 }}
        />
        <Button variant="outline-secondary" onClick={() => setQuantity(q => q + 1)} style={{ borderRadius: "0 4px 4px 0" }}>+</Button>
      </InputGroup>

      {/* Main Add to Cart button */}
      <Button
        onClick={() => setShowCartPreview(true)}
        style={{
          backgroundColor: "#f45c5c",
          border: "none",
          borderRadius: "4px",
          padding: "12px 40px",
          fontSize: "1.2rem",
          fontWeight: "600",
          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
          transition: "all 0.3s ease",
          marginTop: "10px"
        }}
      >
        Add to Cart
      </Button>

      {/* Cart preview modal */}
      {showCartPreview && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999
        }}>
          <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", width: "90%", maxWidth: "500px" }}>
            <h5 style={{ marginBottom: "10px" }}>Confirm Cart</h5>
            <img src={product.images[0]} alt={product.name} style={{ width: "100px", marginBottom: "8px" }} />
            <p>{product.name}</p>
            {selectedAddOns.map(id => {
              const addon = product.addOns.find(a => a._id === id);
              return (
                <p key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>+ {addon.name} {addonMessages[id] ? `(${addonMessages[id]})` : ''}</span>
                  <Button
                    size="sm"
                    variant="danger"
                    style={{ padding: "0 8px", fontWeight: "600" }}
                    onClick={() => setSelectedAddOns(prev => prev.filter(aid => aid !== id))}
                  >
                    ×
                  </Button>
                </p>
              );
            })}
            <Button
              style={{ width: "100%", marginTop: "10px", backgroundColor: "#4caf50", color: "#fff", fontWeight: "600" }}
              onClick={handleAddToCart}
            >
              Confirm
            </Button>
            <Button
              style={{ width: "100%", marginTop: "8px", backgroundColor: "#ddd", color: "#444", fontWeight: "600" }}
              onClick={() => setShowCartPreview(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Col>
  </Row>
</Container>


);
};

export default ProductDetails;
