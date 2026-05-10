import { useEffect, useState, useCallback, useContext } from "react";
import { useForm } from "react-hook-form";
import OrderServices from "@/services/OrderServices";
import notifyApiResponse from "@/utils/notifyApiResponse";
import { t } from "i18next";
import { UserContext } from "@/context/UserContext";
import UserServices from "@/services/UserServices";
import { nanoid } from "@reduxjs/toolkit";
import { parseInputNumber } from "@/utils/numberUtils";


const useOrderSubmit = (id, onSuccess) => {

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    getValues,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      supplier: "",
      orderNumber: "",
      status: "",
      
      customerDetails: {
        customerName: "",
        customerPhone: "",
        email: "",
        address: {
          streetAndNumber: "",
          city: "",
          floor: "",
          apartment: ""
        },
      },

      cart: [],

      price: {
        subPrice: 0,
        shippingPriceL: 0,
        finalPrice: 0,
      },

      customerNotes: "",
      ownerNotes: "",
      owner: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allAdmins, setAllAdmins] = useState([]);
  const [orderStatusDetails, setOrderStatusDetails] = useState([]);
  const { state: userState } = useContext(UserContext);
  const { userInfo } = userState;



  useEffect(() => {
    if (!id) {
      setOrderStatusDetails([]);
      return;
    }

    const fetchOrder = async () => {
      try {
        const order = await OrderServices.getOrderById(id);

        // Normalize supplier to ID string (API may return populated object { _id, name })
        const supplierId = order.supplier
          ? typeof order.supplier === "object" && order.supplier !== null && order.supplier._id
            ? order.supplier._id
            : String(order.supplier)
          : "";
        setValue("supplier", supplierId);
        setValue("orderNumber", order.displayOrderNumber || "");
        // Normalize status to ID string (API returns populated object { _id, label })
        const statusId = order.status
          ? typeof order.status === "object" && order.status !== null && order.status._id
            ? order.status._id
            : String(order.status)
          : "";
        setValue("status", statusId);
        setValue("deliveryType", order.deliveryType); // הערך המחושב מהשרת: 199/150/155/0/self-pickup או undefined

        setValue("customerDetails", order.customerDetails || {});
        setValue("cart", order.cart || []);
        setValue("price", order.price || {});

        setValue("customerNotes", order.customerNotes || "");
        setValue("ownerNotes", order.ownerNotes || "");

        if (order.owner) {
          setValue("owner", order.owner._id || order.owner);
        }

        setOrderStatusDetails(Array.isArray(order.statusDetails) ? order.statusDetails : []);
      } catch (err) {
        console.error("Failed to fetch order", err);
        setOrderStatusDetails([]);
      }
    };

    fetchOrder();
  }, [id, setValue]);

  const getAllUsers = async () => {
    try {
      if (userInfo?.role === "super-admin") {
        const res = await UserServices.getAllUser();
        setAllAdmins(res || []);
      }
    } catch (err) {
      console.error("Error fetching admins:", err);
    }
  };



  /* -------------------- watchers -------------------- */
  const cart = watch("cart") || [];
  const shippingPrice = watch("price.shippingPriceL") || 0;

  /* -------------------- cart logic -------------------- */
  const addProductToCart = useCallback((product) => {
    const currentCart = getValues("cart") || [];

    const idx = currentCart.findIndex((item) => item.sku === product.sku);
    const newCart = [...currentCart];


    if (idx !== -1) {
      // מוצר קיים — נעדכן את הכמות ונחשב מחדש את ה-totalPrice
      const item = { ...currentCart[idx] }; // clone item
      const prevQty = parseInputNumber(item.quantity);
      const unitPrice = parseInputNumber(item.price);
      const discount = parseInputNumber(item.discountPrice);

      item.quantity = prevQty + 1;
      // חישוב בטוח של המחיר הכולל
      item.totalPrice = Math.max(item.quantity * (unitPrice - discount), 0);

      newCart[idx] = item;
    } else {
      // פריט חדש — בנה את האובייקט העגלה כאן (SINGLE SOURCE OF TRUTH בתוך ה-hook)
      const newItem = {
        cartItemId: nanoid(), // 👈 מזהה פנימי
        productId: product._id,
        sku: product.sku,
        description: product.name,
        image: product.images?.[0] || "",
        quantity: 1,
        price: Number(product.price) || 0,
        discountPrice: 0,
        totalPrice: product.price || 0,
      };
      newCart.push(newItem);
    }

    // עדכן את ה-RHF
    setValue("cart", newCart);
    clearErrors("cart");
  }, [getValues, setValue, clearErrors]);


  const updateCartItem = useCallback((cartItemId, field, value) => {
    const updatedCart = getValues("cart").map((item) => {
      if (item.cartItemId !== cartItemId) return item;

      const updated = { ...item, [field]: value };

      if (["quantity", "price", "discountPrice"].includes(field)) {
        const qty = parseInputNumber(updated.quantity) || 1;
        const price = parseInputNumber(updated.price);
        const discount = parseInputNumber(updated.discountPrice);
        updated.totalPrice = Math.max(qty * (price - discount), 0);
      }

      return updated;
    });

    setValue("cart", updatedCart);
  }, [getValues, setValue]);

  const removeCartItem = useCallback((cartItemId) => {
    const newCart = getValues("cart").filter(
      (item) => item.cartItemId !== cartItemId
    );

    setValue("cart", newCart);
    clearErrors("cart");
  }, [getValues, setValue, clearErrors]);

  /* -------------------- pricing -------------------- */
  useEffect(() => {
    const subPrice = cart.reduce(
      (sum, item) => sum + (Number(item.totalPrice) || 0),
      0
    );

    setValue("price.subPrice", subPrice);
    setValue("price.finalPrice", subPrice + Number(shippingPrice));
  }, [cart, shippingPrice, setValue]);

  useEffect(() => {
    getAllUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?.role]);

  /* -------------------- submit -------------------- */
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Manual validation for fields without register
      if (!data.supplier) {
        setError("supplier", {
          type: "manual",
          message: `${t("Supplier")} ${t("isRequired")}!`,
        });
        setIsSubmitting(false);
        return;
      }

      if (!data.status) {
        setError("status", {
          type: "manual",
          message: `${t("Status")} ${t("isRequired")}!`,
        });
        setIsSubmitting(false);
        return;
      }

      if (!data.deliveryType) {
        setError("deliveryType", {
          type: "manual",
          message: `${t("DeliveryType")} ${t("isRequired")}!`,
        });
        setIsSubmitting(false);
        return;
      }

      // Cart validation
      if (!data.cart || data.cart.length === 0) {
        setError("cart", {
          type: "manual",
          message: t("NoProductsInCart"),
        });
        setIsSubmitting(false);
        return;
      }

      // Address validation - always required
      const address = data.customerDetails?.address;
      if (!address?.streetAndNumber || !address?.city || !address?.floor || !address?.apartment) {
          if (!address?.streetAndNumber) {
            setError("customerDetails.address.streetAndNumber", {
              type: "manual",
              message: `${t("StreetAndNumber")} ${t("isRequired")}!`,
            });
          }
          if (!address?.city) {
            setError("customerDetails.address.city", {
              type: "manual",
              message: `${t("City")} ${t("isRequired")}!`,
            });
          }
          if (!address?.floor) {
            setError("customerDetails.address.floor", {
              type: "manual",
              message: `${t("Floor")} ${t("isRequired")}!`,
            });
          }
          if (!address?.apartment) {
            setError("customerDetails.address.apartment", {
              type: "manual",
              message: `${t("Apartment")} ${t("isRequired")}!`,
            });
          }
        setIsSubmitting(false);
        return;
      }

      const payload = {
        supplier: data.supplier,
        orderNumber: data.orderNumber,
        status: data.status?._id || data.status,

        customerDetails: data.customerDetails,
        price: data.price,

        cart: data.cart.map((item) => ({
          description: item.description,
          image: item.image,
          sku: item.sku,
          quantity: parseInputNumber(item.quantity) || 1,
          price: parseInputNumber(item.price),
          discountPrice: parseInputNumber(item.discountPrice),
          totalPrice: parseInputNumber(item.totalPrice),
          productId: item.productId,
        })),

        customerNotes: data.customerNotes,
        ownerNotes: data.ownerNotes,
      };

      if (userInfo?.role === "super-admin" && data.owner) {
        payload.owner =
          typeof data.owner === "object"
            ? data.owner._id || ""
            : data.owner;
      }

      let res;
      if (id) {
        res = await OrderServices.updateOrder(id, payload);
      } else {
        res = await OrderServices.addOrder(payload);
      }

      notifyApiResponse(res, true);
      if (!id) reset();
      if (id && res?.order?.statusDetails) {
        setOrderStatusDetails(Array.isArray(res.order.statusDetails) ? res.order.statusDetails : []);
      }
      onSuccess?.(res);

      return res;
    } catch (err) {
      notifyApiResponse(err, false);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };


  return {
    /* RHF */
    register,
    handleSubmit,
    onSubmit,
    setValue,
    watch,
    reset,
    errors,
    clearErrors,
    setError,

    /* state */
    isSubmitting,
    allAdmins,
    orderStatusDetails,

    /* cart */
    addProductToCart,
    updateCartItem,
    removeCartItem,

  };
};

export default useOrderSubmit;
