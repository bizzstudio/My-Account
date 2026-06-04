// admin/services/adminService.js — קריאות ניהול הפורטל (/api/admin/*)
import requests from "@/services/httpService";

const AdminService = {
  // דשבורד
  getDashboard: () => requests.get("/admin/dashboard"),

  // לקוחות
  listCustomers: (search = "") =>
    requests.get(`/admin/customers${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  getCustomer: (id) => requests.get(`/admin/customers/${id}`),
  createCustomer: (body) => requests.post("/admin/customers", body),
  updateCustomer: (id, body) => requests.patch(`/admin/customers/${id}`, body),

  // הלוואות
  listLoans: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return requests.get(`/admin/loans${q ? `?${q}` : ""}`);
  },
  getLoan: (id) => requests.get(`/admin/loans/${id}`),
  createLoan: (body) => requests.post("/admin/loans", body),
  updateLoan: (id, body) => requests.patch(`/admin/loans/${id}`, body),

  // יתרות
  addBalance: (loanId, body) => requests.post(`/admin/loans/${loanId}/balances`, body),

  // תנועות
  addTransaction: (loanId, body) =>
    requests.post(`/admin/loans/${loanId}/transactions`, body),
  updateTransaction: (loanId, txId, body) =>
    requests.patch(`/admin/loans/${loanId}/transactions/${txId}`, body),
  deleteTransaction: (loanId, txId) =>
    requests.delete(`/admin/loans/${loanId}/transactions/${txId}`),

  // מסלולים
  addTrack: (loanId, body) => requests.post(`/admin/loans/${loanId}/tracks`, body),
  updateTrack: (loanId, trackId, body) =>
    requests.patch(`/admin/loans/${loanId}/tracks/${trackId}`, body),
  deleteTrack: (loanId, trackId) =>
    requests.delete(`/admin/loans/${loanId}/tracks/${trackId}`),

  // מסמכים
  listDocuments: (loanId) => requests.get(`/admin/loans/${loanId}/documents`),
  uploadDocument: (loanId, formData) =>
    requests.post(`/admin/loans/${loanId}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateDocument: (docId, body) => requests.patch(`/admin/documents/${docId}`, body),
  deleteDocument: (docId) => requests.delete(`/admin/documents/${docId}`),
  getDocumentLogs: (docId) => requests.get(`/admin/documents/${docId}/logs`),

  // פניות
  listInquiries: (status = "") =>
    requests.get(`/admin/inquiries${status ? `?status=${status}` : ""}`),
  updateInquiry: (id, body) => requests.patch(`/admin/inquiries/${id}`, body),

  // הגדרות
  getLicenseHolder: () => requests.get("/admin/settings/license-holder"),
  updateLicenseHolder: (body) =>
    requests.put("/admin/settings/license-holder", body),
};

export default AdminService;
