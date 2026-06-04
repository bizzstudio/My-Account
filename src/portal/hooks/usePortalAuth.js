// portal/hooks/usePortalAuth.js
// ניהול התחברות/התנתקות הלקוח מעל UserContext + cookie קיימים (מיחזור).
import Cookies from "js-cookie";
import { useContext } from "react";
import { UserContext } from "@/context/UserContext";

const isHttps = () =>
  typeof window !== "undefined" && window.location.protocol === "https:";

export default function usePortalAuth() {
  const { state, dispatch } = useContext(UserContext);
  const userInfo = state?.userInfo || null;

  const login = (payload) => {
    dispatch({ type: "USER_LOGIN", payload });
    Cookies.set("userInfo", JSON.stringify(payload), {
      expires: 0.5, // ~12 שעות (תואם ל-session הקצר בשרת)
      sameSite: isHttps() ? "None" : "Lax",
      secure: isHttps(),
    });
  };

  const logout = () => {
    dispatch({ type: "USER_LOGOUT" });
    Cookies.remove("userInfo");
  };

  const isCustomer = userInfo?.role === "customer";

  return { userInfo, isCustomer, login, logout };
}
