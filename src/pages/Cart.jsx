import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { formatPrice } from "../utils/FormatPrice";

const Cart = () => {
const {
cartItems,
removeFromCart,
updateQuantity,
clearCart,
updateAddOnQuantity,
removeAddOn
} = useContext(CartContext);

const [total, setTotal] = useState(0);

useEffect(() => {
const totalPrice = cartItems.reduce((sum, item) => {
const productTotal = (item.product?.price || 0) * (item.quantity || 1);
const addonsTotal = (item.addOns || []).reduce((aSum, addon) => {
const addonDetails = item.product?.addOns?.find(a => a._id === addon.addOnId);
return aSum + ((addonDetails?.price || 0) * (addon.quantity || 1));
}, 0);
return sum + productTotal + addonsTotal;
}, 0);

setTotal(totalPrice);


}, [cartItems]);

if (!cartItems || cartItems.length === 0) {
return (
<div style={{ display: "flex", justifyContent: "center", padding: "40px 20px" }}>
<div style={{ width: "100%", maxWidth: "1100px" }}> <h2>Your Cart</h2> <p>Your cart is empty. <Link to="/shop">Go shopping</Link></p> </div> </div>
);
}

return (
<div style={{ display: "flex", justifyContent: "center", padding: "40px 20px" }}>
<div style={{ width: "100%", maxWidth: "1100px" }}>
<h2 style={{ marginBottom: "30px", fontWeight: 600 }}>Your cart</h2>


    {cartItems.map((item) => (
      <div
        key={item.product?._id}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          padding: "20px 0",
          borderBottom: "1px solid #eee"
        }}
      >
        {/* MAIN PRODUCT ROW */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <img
            src={item.product?.images?.[0] || "/assets/placeholder.jpg"}
            alt={item.product?.name}
            style={{ width: "120px", height: "120px", borderRadius: "10px", objectFit: "cover" }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "20px", marginBottom: "5px" }}>{item.product?.name}</div>
            <div style={{ color: "gray", fontSize: "15px" }}>{formatPrice(item.product?.price)}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => updateQuantity(item.product?._id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              style={qtyBtn}
            >–</button>
            <div style={qtyDisplay}>{item.quantity}</div>
            <button
              onClick={() => updateQuantity(item.product?._id, item.quantity + 1)}
              style={qtyBtn}
            >+</button>
          </div>
          <div style={{ width: "100px", textAlign: "right", fontWeight: 600 }}>
            {formatPrice(item.product?.price * item.quantity)}
          </div>
          <button
            onClick={() => removeFromCart(item.product?._id)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#d9534f" }}
          ><FaTrash /></button>
        </div>

        {/* ADD-ONS */}
{item.addOns && item.addOns.length > 0 && (
  <div style={{ marginLeft: "150px", display: "flex", flexDirection: "column", gap: "12px" }}>
    {item.addOns.map((addon) => {
      const addonDetails = item.product?.addOns?.find(a => a._id === addon.addOnId);
      if (!addonDetails) return null;

      return (
        <div key={addon.addOnId} style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <img
            src={addonDetails?.image || "/assets/placeholder.jpg"}
            alt={addonDetails?.name}
            style={{ width: "80px", height: "80px", borderRadius: "8px", objectFit: "cover" }}
          />
          <div style={{ flex: 1 }}>
            <div>{addonDetails.name}</div>
            {addon.customMessage && <div style={{ fontSize: "14px", color: "gray" }}>({addon.customMessage})</div>}
          </div>

          {/* Quantity */}
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <button
              onClick={() => updateAddOnQuantity(item.product._id, addon.addOnId, (addon.quantity || 1) - 1)}
              disabled={(addon.quantity || 1) <= 1}
              style={qtyBtn}
            >–</button>
            <div style={qtyDisplay}>{addon.quantity || 1}</div>
            <button
              onClick={() => updateAddOnQuantity(item.product._id, addon.addOnId, (addon.quantity || 1) + 1)}
              style={qtyBtn}
            >+</button>
          </div>

          {/* Price */}
          <div style={{ width: "100px", textAlign: "right", fontWeight: 600 }}>
            {formatPrice((addonDetails?.price || 0) * (addon.quantity || 1))}
          </div>

          {/* Remove Button */}
          <button
            onClick={() => removeAddOn(item.product._id, addon.addOnId)}
            style={{ background: "none", border: "none", color: "#d9534f", cursor: "pointer", fontSize: "18px" }}
          ><FaTrash /></button>
        </div>
      );
    })}
  </div>
)}

      </div>
    ))}

    {/* TOTAL SUMMARY */}
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "30px", fontSize: "22px", fontWeight: 600 }}>
      Total: {formatPrice(total)}
    </div>

    {/* BUTTONS */}
    <div style={{ display: "flex", justifyContent: "flex-end", gap: "15px", marginTop: "20px" }}>
      <Link to="/checkout" style={{ background: "#000", color: "#fff", padding: "12px 25px", borderRadius: "8px", textDecoration: "none" }}>
        Checkout
      </Link>
      <button onClick={clearCart} style={{ background: "#ccc", padding: "12px 25px", borderRadius: "8px", border: "none" }}>Clear cart</button>
    </div>
  </div>
</div>


);
};

export default Cart;

const qtyBtn = {
width: "32px",
height: "32px",
border: "1px solid #dcdcdc",
borderRadius: "6px",
background: "white",
fontSize: "18px",
cursor: "pointer",
};

const qtyDisplay = {
border: "1px solid #dcdcdc",
width: "40px",
textAlign: "center",
padding: "6px 0",
borderRadius: "6px",
background: "white",
};
