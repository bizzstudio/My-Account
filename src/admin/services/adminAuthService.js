// admin/services/adminAuthService.js — אימות אדמין (מיחזור /user/login + OTP)
import requests from "@/services/httpService";

const AdminAuthService = {
  login: (body) => requests.post("/user/login", body), // {email, password}
  verifyMfa: (body) => requests.post("/user/mfa/verify", body), // {tempToken, code}
};

export default AdminAuthService;
