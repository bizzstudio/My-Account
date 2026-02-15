import React, { useEffect, useRef, useState } from "react";
import { Input, Button, Avatar } from "@windmill/react-ui";
import { FiSearch, FiPlus } from "react-icons/fi";
import { t } from "i18next";

import useProductsForOrder from "@/hooks/Order/useProductsForOrder";

const ProductPicker = ({ onSelectProduct }) => {
  const {
    products,
    loading,
    hasMore,
    search,
    setSearch,
    loadMore,
  } = useProductsForOrder();

  const listRef = useRef(null);
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);
  const [localSearch, setLocalSearch] = useState("");


  useEffect(() => {
    if (!sentinelRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      {
        root: listRef.current, // חשוב: הסקרול קורה בתוך הרשימה
        rootMargin: "0px",
        threshold: 0.8,
      }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [hasMore, loading, loadMore]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, setSearch]);



  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
        {t("SelectProduct")}
      </h3>

      {/* Search */}
      <div className="flex gap-2 mb-3">
        <Input
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder={t("ProductsSearchBy")}
          className="h-10"
        />

      </div>

      <div
        ref={listRef}
        className="max-h-72 overflow-y-auto flex flex-col gap-2"
      >
        {products.map((product) => (
          <div
            key={product._id}
            className="flex justify-between items-center p-2 border rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => onSelectProduct(product)}
          >
            <div className="flex items-center gap-3">
              <Avatar
                className="bg-gray-50"
                src={
                  product.images?.[0] ||
                  "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"
                }
                alt={product.name}
              />

              <div className="flex flex-col">
                <h2 className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</h2>
                <span className="text-sm text-gray-900 dark:text-white">{product.sku}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-900 dark:text-white">
                ₪{product.price?.toFixed(2) || "0.00"}
              </span>
              <FiPlus className="text-gray-600 dark:text-gray-300" />
            </div>
          </div>
        ))}

        {/* Sentinel */}
        <div ref={sentinelRef} />

        {/* Loading */}
        {loading && (
          <span className="text-sm text-gray-500 dark:text-gray-300 text-center py-2">
            {t("Loading")}
          </span>
        )}

        {/* Empty */}
        {!loading && products.length === 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-300 text-center py-4">
            {t("noProductFound")}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductPicker;
