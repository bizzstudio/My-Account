// portal/services/meService.js — קריאות האזור האישי של הלקוח
import requests from "@/services/httpService";

const MeService = {
  getDashboard: () => requests.get("/me"),
  getLoans: () => requests.get("/me/loans"),
  getLoan: (loanId) => requests.get(`/me/loans/${loanId}`),
  getTransactions: (loanId) => requests.get(`/me/loans/${loanId}/transactions`),
  getDocuments: (loanId) => requests.get(`/me/loans/${loanId}/documents`),
  getEarlyRepayment: (loanId) =>
    requests.get(`/me/loans/${loanId}/early-repayment`),

  // הורדה/צפייה במסמך כ-blob (דרך endpoint מאובטח עם טוקן)
  getDocumentBlob: (loanId, docId, download = false) =>
    requests.get(
      `/me/loans/${loanId}/documents/${docId}/file${download ? "?download=1" : ""}`,
      { responseType: "blob" }
    ),

  getInquiries: () => requests.get("/me/inquiries"),
  createInquiry: (body) => requests.post("/me/inquiries", body),
};

export default MeService;
