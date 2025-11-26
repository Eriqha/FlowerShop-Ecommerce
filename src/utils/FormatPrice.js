// src/utils/formatPrice.js
export const formatPrice = (num) => {
  if (num == null) return '₱0.00';
  return '₱' + Number(num).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
