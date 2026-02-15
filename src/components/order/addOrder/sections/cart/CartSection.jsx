import React, { useRef, useEffect } from "react";
import { Button } from "@windmill/react-ui";
import { t } from "i18next";

import ProductPicker from "./ProductPicker";
import CartTable from "./CartTable";
import Error from "@/components/form/others/Error";

const CartSection = ({ id, watch, errors, addProductToCart, updateCartItem, removeCartItem }) => {
  const cart = watch("cart") || [];
  const sectionRef = useRef(null);
  const isEditMode = Boolean(id);

  // Scroll to section when cart error appears
  useEffect(() => {
    if (errors.cart?.message) {
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 50);
    }
  }, [errors.cart?.message]);

  return (
    <div ref={sectionRef} className="flex flex-col gap-4">

      {!isEditMode && (
        <ProductPicker
          onSelectProduct={(product) => {
            addProductToCart(product);
          }}
        />
      )}

      {cart.length === 0 ? (
        !isEditMode && <Error errorName={errors.cart} />
      ) : (
        <CartTable
          cart={cart}
          updateCartItem={updateCartItem}
          removeCartItem={removeCartItem}
          readOnly={isEditMode}
        />
      )}
    </div>
  );
};

export default CartSection;
