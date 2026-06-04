// portal/services/portalAuthService.js — קריאות אימות הלקוח (OTP)
import requests from "@/services/httpService";

const PortalAuthService = {
  // כניסה מאוחדת (אדמין או לקוח) — שלב 1: ת"ז + אימייל -> שליחת קוד
  start: (body) => requests.post("/auth/start", body),

  // כניסה מאוחדת — שלב 2: אימות הקוד -> מחזיר token + role + redirect
  verify: (body) => requests.post("/auth/verify", body),

  // פרטי המשתמש המחובר
  me: () => requests.get("/auth/me"),

  logout: () => requests.post("/auth/logout", {}),
};

export default PortalAuthService;
