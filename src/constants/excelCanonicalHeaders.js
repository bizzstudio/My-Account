/**
 * כותרות אקסל אחידות — כותרת אחת לכל שדה.
 * משמש ייבוא (Excel/CSV) וייצוא (Excel) כדי שהקבצים יהיו תואמים.
 * עדכון: לשנות רק כאן; התיעוד ב-docs/רשימת-כותרות-אקסל-מדויקת.txt ו-CSV משקפים את הרשימה הזו.
 */

export const CANONICAL_EXCEL_HEADERS = {
  // לווים 1
  borrowerName: 'שם פרטי לווה 1',
  borrowerIdNumber: 'מספר תעודת זהות לווה 1',
  borrowerAddress: 'כתובת לווה 1',
  // לווים 2
  borrowerFirstName_2: 'שם פרטי לווה 2',
  borrowerIdNumber_2: 'מספר תעודת זהות לווה 2',
  borrowerAddress_2: 'כתובת לווה 2',
  // חתימה, עורך דין, יועץ, חברת מימון
  signingDate: 'תאריך חתימה',
  lawyerName: 'שם עורך הדין',
  lawyerRegistrationNumber: 'מספר רישום עורך דין',
  lawyerIdNumber: 'תעודת זהות עורך דין',
  consultant: 'שם יועץ',
  consultantEmail: 'אימייל יועץ',
  financingCompanyName: 'שם חברת מימון',
  primaryBacker: 'שם חברת מימון',
  financingCompanyId: 'מספר מזהה חברת מימון',
  primaryBackerId: 'מספר מזהה חברת מימון',
  financingCompanyName_2: 'שם חברת מימון 2',
  secondaryBacker: 'שם חברת מימון 2',
  financingCompanyId_2: 'מספר מזהה חברת מימון 2',
  secondaryBackerId: 'מספר מזהה חברת מימון 2',
  financingCompanyName_3: 'שם חברת מימון 3',
  thirdBacker: 'שם חברת מימון 3',
  financingCompanyId_3: 'מספר מזהה חברת מימון 3',
  thirdBackerId: 'מספר מזהה חברת מימון 3',
  // פרטי רישום
  block: 'גוש',
  plot: 'חלקה',
  subPlot: 'תת חלקה',
  land: 'מגרש',
  plan: 'תוכנית',
  contract: 'חוזה רמ"י',
  mortgageName: 'שם משכנת',
  mortgageCompanyId: 'ח.פ. משכנת',
  office: 'לשכה',
  plotArea: 'שטח חלקה',
  right: 'זכות',
  parts: 'חלקים',
  propertyType: 'מהות הנכס',
  street: 'רחוב',
  houseNumber: 'מס בית',
  apartmentNumber: 'מס דירה',
  floor: 'קומה',
  direction: 'כיוון',
  entrance: 'כניסה',
  unit: 'יחידה',
  settlement: 'יישוב',
  // הלוואות 1
  loanAmount: 'סכום הלוואה 1',
  loanChange: 'שינוי הלוואה 1',
  clause: 'סעיף',
  loanPlan: 'פריסה הלוואה 1',
  loanMonths: 'מס חודשים הלוואה 1',
  loanInterestRate: 'ריבית הלוואה 1',
  adjustedLoan: 'מתואמת הלוואה 1',
  realLoan: 'ממשית הלוואה 1',
  primeMargin: 'מרווח פריים',
  loanCreation: 'הקמה הלוואה 1',
  loanNumber: 'מספר הלוואה 1',
  mortgageNumber: 'ס. משכנתה הלוואה 1',
  // הלוואות 2
  loanAmount_2: 'סכום הלוואה 2',
  loanChange_2: 'שינוי הלוואה 2',
  loanPlan_2: 'פריסה הלוואה 2',
  loanMonths_2: 'מס חודשים הלוואה 2',
  loanInterestRate_2: 'ריבית הלוואה 2',
  adjustedLoan_2: 'מתואמת הלוואה 2',
  realLoan_2: 'ממשית הלוואה 2',
  loanCreation_2: 'הקמה הלוואה 2',
  loanNumber_2: 'מספר הלוואה 2',
  mortgageNumber_2: 'ס. משכנתה הלוואה 2',
  // הלוואות 3
  loanAmount_3: 'סכום הלוואה 3',
  loanChange_3: 'שינוי הלוואה 3',
  loanPlan_3: 'פריסה הלוואה 3',
  loanMonths_3: 'מס חודשים הלוואה 3',
  loanInterestRate_3: 'ריבית הלוואה 3',
  adjustedLoan_3: 'מתואמת הלוואה 3',
  realLoan_3: 'ממשית הלוואה 3',
  loanCreation_3: 'הקמה הלוואה 3',
  loanNumber_3: 'מספר הלוואה 3',
  mortgageNumber_3: 'ס. משכנתה הלוואה 3',
  // נושה בכיר
  seniorCreditorName: 'נושה בכיר',
  seniorCreditorIdType: 'סוג זיהוי נושה בכיר',
  seniorCreditorIdNumber: 'מ.ז. נושה בכיר',
  // חשבון בנק
  borrowerAccountNumber: 'חשבון לווה',
  borrowerBranchCode: 'סניף לווה',
  borrowerBankName: 'בנק לווה',
  // מוכרים 1–3
  sellerName: 'שם מוכר 1',
  sellerIdType: 'סוג זיהוי מוכר 1',
  sellerIdNumber: 'מס זיהוי מוכר 1',
  sellerAddress: 'כתובת מוכר 1',
  sellerName_2: 'שם מוכר 2',
  sellerIdType_2: 'סוג זיהוי מוכר 2',
  sellerIdNumber_2: 'מס זיהוי מוכר 2',
  sellerAddress_2: 'כתובת מוכר 2',
  sellerName_3: 'שם מוכר 3',
  sellerIdType_3: 'סוג זיהוי מוכר 3',
  sellerIdNumber_3: 'מס זיהוי מוכר 3',
  sellerAddress_3: 'כתובת מוכר 3',
  // מורשים 1–3
  authorizedName: 'שם מורשה',
  authorizedIdNumber: 'ת.ז. מורשה',
  authorizedName_2: 'שם מורשה 2',
  authorizedIdNumber_2: 'ת.ז. מורשה 2',
  authorizedName_3: 'שם מורשה 3',
  authorizedIdNumber_3: 'ת.ז. מורשה 3',
  // משכנים 1–3
  mortgagorDetails: 'פרטי ממשכן 1',
  mortgagorFamily: 'משפחה ממשכן 1',
  mortgagorIdType: 'זיהוי ממשכן 1',
  mortgagorIdNumber: 'מ. זיהוי ממשכן 1',
  mortgagorDetails_2: 'פרטי ממשכן 2',
  mortgagorFamily_2: 'משפחה ממשכן 2',
  mortgagorIdType_2: 'זיהוי ממשכן 2',
  mortgagorIdNumber_2: 'מ. זיהוי ממשכן 2',
  mortgagorDetails_3: 'פרטי ממשכן 3',
  mortgagorFamily_3: 'משפחה ממשכן 3',
  mortgagorIdType_3: 'זיהוי ממשכן 3',
  mortgagorIdNumber_3: 'מ. זיהוי ממשכן 3',
  // פרטי פרויקט
  tamAgreementDate: 'ת. הסכם תמא',
  appraiser: 'שמאי',
  supervisor: 'מפקח',
  additionalFloors: 'תוספת קומות',
  projectUnits: 'יחידות יזם',
  transferFees: 'עמלת העברת זכויות',
  projectValue: 'שווי פרויקט',
  minimumWithdrawal: 'משיכה מינימלית',
  contractorName: 'שם הקבלן',
  architect: 'אדריכל',
  ltv: 'אחוז מימון',
};

/** מחזיר כותרת עברית אחידה לשדה (לפי מפתח שדה, למשל מתוך key כמו signingDetails.consultant → consultant) */
export function getCanonicalHeader(fieldKey) {
  if (!fieldKey || typeof fieldKey !== 'string') return '';
  const flat = fieldKey.split('.').pop();
  return CANONICAL_EXCEL_HEADERS[flat] ?? '';
}

/** כותרות חלופיות מהאקסל של המשתמש — מוכרות כתקניות, לא מוצגות כ"לא תקינות" */
const ALTERNATIVE_EXCEL_HEADERS = {
  'מסד': 'block',
  'שם משפחה לווה1': 'borrowerName',
  'שם משפחה לווה 1': 'borrowerName',
  'מרשם': 'registry',
  'תמורה': 'transferFees',
  'ת.ח. הסכם מכר': 'contract',
  'פריים': 'primeMargin',
  'פיגורים': 'adjustedLoan',
  'פיגורים מתואמת': 'adjustedLoan',
  'מס רישום עורך דין': 'lawyerRegistrationNumber',
  'רישום עורך דין': 'lawyerRegistrationNumber',
};

/** מפת כותרת → שדה (לשימוש בייבוא) */
export function getHeaderToFieldMap() {
  const out = {};
  for (const [field, header] of Object.entries(CANONICAL_EXCEL_HEADERS)) {
    if (header && !(header in out)) out[header] = field;
  }
  for (const [altHeader, field] of Object.entries(ALTERNATIVE_EXCEL_HEADERS)) {
    if (!(altHeader in out)) out[altHeader] = field;
  }
  return out;
}
