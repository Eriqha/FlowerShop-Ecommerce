// src/hooks/useFetchProducts.js
import { useEffect, useState } from 'react';
import API from 'src/api/api';

export const useFetchProducts = (params = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const res = await API.get('/products', { params });
      setProducts(res.data || []);
      setLoading(false);
    };
    fetch();
  }, [JSON.stringify(params)]);

  return { products, loading, setProducts };
};
