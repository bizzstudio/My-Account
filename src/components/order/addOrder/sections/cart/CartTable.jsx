import React from "react";
import { Input, Button, TableContainer, TableBody, TableRow, TableCell } from "@windmill/react-ui";
import { t } from "i18next";
import { FiTrash2 } from "react-icons/fi";
import StandardTable from "@/components/table/StandardTable";
import StandardTableHeader from "@/components/table/StandardTableHeader";

const CartTable = ({ cart, updateCartItem, removeCartItem, readOnly = false }) => {
  if (!cart || cart.length === 0) return null;

  const cartColumns = [
    { key: "description", label: t("Product") },
    { key: "sku", label: t("SKU") },
    { key: "quantity", label: t("Qty") },
    { key: "price", label: t("Price") },
    { key: "discount", label: t("Discount") },
    { key: "total", label: t("Total") },
    ...(!readOnly ? [{ key: "actions", label: "" }] : []),
  ];

  return (
    <TableContainer className="mb-4">
      <StandardTable>
        <StandardTableHeader columns={cartColumns} />

        <TableBody>
          {cart.map((item) => (
            <TableRow key={item.cartItemId}>
              <TableCell className="text-center">
                <h2 className="text-sm font-medium text-center">
                  {item.description}
                </h2>
              </TableCell>

              <TableCell className="text-center">
                <span className="text-sm">{item.sku}</span>
              </TableCell>

              <TableCell className="text-center">
                {readOnly ? (
                  <span className="text-sm">{item.quantity}</span>
                ) : (
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateCartItem(item.cartItemId, "quantity", e.target.value)
                    }
                    className="h-10 text-center"
                  />
                )}
              </TableCell>

              <TableCell className="text-center">
                {readOnly ? (
                  <span className="text-sm">₪{Number(item.price).toFixed(2)}</span>
                ) : (
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.price}
                    onChange={(e) =>
                      updateCartItem(item.cartItemId, "price", e.target.value)
                    }
                    className="h-10 text-center"
                  />
                )}
              </TableCell>

              <TableCell className="text-center">
                {readOnly ? (
                  <span className="text-sm">₪{Number(item.discountPrice ?? 0).toFixed(2)}</span>
                ) : (
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.discountPrice}
                    onChange={(e) =>
                      updateCartItem(item.cartItemId, "discountPrice", e.target.value)
                    }
                    className="h-10 text-center"
                  />
                )}
              </TableCell>

              <TableCell className="text-center">
                <span className="text-sm">₪{item.totalPrice.toFixed(2)}</span>
              </TableCell>

              {!readOnly && (
                <TableCell className="text-center">
                  <Button
                    layout="link"
                    size="small"
                    onClick={() => removeCartItem(item.cartItemId)}
                  >
                    <FiTrash2 className="text-red-500" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </StandardTable>
    </TableContainer>
  );
};

export default CartTable;
