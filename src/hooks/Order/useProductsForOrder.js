// src/hooks/Order/useProductsForOrder.js
import { useEffect, useState, useCallback } from "react";
import ProductServices from "@/services/ProductServices";

const PAGE_SIZE = 20;

const useProductsForOrder = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(
    async (reset = false) => {
      try {
        setLoading(true);
        setError(null);

        const currentPage = reset ? 1 : page;

        const res = await ProductServices.getAllProducts({
          page: currentPage,
          limit: PAGE_SIZE,
          search,
        });

        const newProducts = res?.products || [];

        setProducts((prev) =>
          reset ? newProducts : [...prev, ...newProducts]
        );

        setHasMore(newProducts.length === PAGE_SIZE);
        setPage(currentPage + 1);
      } catch (err) {
        console.error("Error loading products for order:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [page, search]
  );

 

  useEffect(() => {
    fetchProducts(true);
  }, [search]);

  return {
    products,
    loading,
    error,
    hasMore,

    search,
    setSearch,

    loadMore: () => {
      if (!loading && hasMore) {
        fetchProducts();
      }
    },

    refresh: () => fetchProducts(true),
  };
};

export default useProductsForOrder;
