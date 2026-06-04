// admin/hooks/useAdminAuth.js — ניהול התחברות אדמין מעל UserContext + cookie
import Cookies from "js-cookie";
import { useContext } from "react";
import { UserContext } from "@/context/UserContext";

const isHttps = () =>
  typeof window !== "undefined" && window.location.protocol === "https:";

const ADMIN_ROLES = ["admin", "super-admin"];

export default function useAdminAuth() {
  const { state, dispatch } = useContext(UserContext);
  const userInfo = state?.userInfo || null;

  const login = (payload) => {
    dispatch({ type: "USER_LOGIN", payload });
    Cookies.set("userInfo", JSON.stringify(payload), {
      expires: 1, // יום
      sameSite: isHttps() ? "None" : "Lax",
      secure: isHttps(),
    });
  };

  const logout = () => {
    dispatch({ type: "USER_LOGOUT" });
    Cookies.remove("userInfo");
  };

  const isAdmin = ADMIN_ROLES.includes(userInfo?.role);
  const isSuperAdmin = userInfo?.role === "super-admin";

  return { userInfo, isAdmin, isSuperAdmin, login, logout };
}
