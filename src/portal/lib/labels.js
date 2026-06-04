// portal/lib/labels.js — תרגומי תוויות לתצוגת הלקוח (עברית)

// סוגי תנועה (4.3)
export const TRANSACTION_TYPE_LABELS = {
  monthly_payment: "החזר חודשי",
  interest_charge: "חיוב ריבית",
  linkage: "הצמדה",
  fee: "עמלה",
  partial_prepayment: "פירעון חלקי",
  adjustment: "תיקון / התאמה",
  reversal: "החזר שבוטל",
};

// סטטוס הלוואה
export const LOAN_STATUS_LABELS = {
  active: "פעילה",
  closed: "סגורה",
  default: "בפיגור",
  sold: "נמכרה",
};

export const LOAN_STATUS_TONE = {
  active: "green",
  closed: "gray",
  default: "red",
  sold: "amber",
};

// סוגי מסמכים (4.6)
export const DOCUMENT_TYPE_LABELS = {
  loan_agreement: "הסכם הלוואה",
  main_details_form: "טופס פרטים עיקריים",
  periodic_report: "דוח תקופתי",
  early_repayment: "פירעון מוקדם",
  other: "מסמך נוסף",
};

// סטטוס פנייה (4.8)
export const INQUIRY_STATUS_LABELS = {
  open: "פתוחה",
  in_progress: "בטיפול",
  closed: "סגורה",
};

export const INQUIRY_STATUS_TONE = {
  open: "amber",
  in_progress: "blue",
  closed: "green",
};
