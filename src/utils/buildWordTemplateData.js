/**
 * מפתחות שטוחים ל-docxtemplater — תואמים למקרא בהגדרות (Settings → LEGEND_SECTIONS).
 * מקור הנתונים: אובייקט מוצר כפי שחוזר מה-API / נשמר בטופס (ProductDrawer, ConsultantForm).
 */

const dash = (v) => {
  if (v == null || v === "") return "-";
  if (typeof v === "number" && !Number.isFinite(v)) return "-";
  return String(v);
};

const dashOptionalZero = (v) => {
  if (v == null || v === "" || v === 0) return "-";
  return String(v);
};

const formatDateHe = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("he-IL");
};

const genderHe = (g) => {
  if (g == null || g === "") return "-";
  if (g === "male") return "זכר";
  if (g === "female") return "נקבה";
  return dash(g);
};

const yesNoHe = (v) =>
  v === true || v === "true" || v === 1 || v === "1" ? "כן" : "לא";

/** האם הלווה מסומן כממשכן (לסינון תגי mortgagorName1… ו־nonMortgagor…) */
export function isBorrowerMortgagorFlag(b) {
  const v = b?.borrowerIsMortgagor;
  return v === true || v === "true" || v === 1 || v === "1";
}

/** מספר מקסימלי של לווים עם תגים ממוספרים ({borrowerName1}, {borrowerName2}, …) */
export const MAX_INDEXED_BORROWERS = 5;

/** שדות לווה לתת-מספר אחרי mortgagor / nonMortgagor (למשל mortgagorName1) */
const ROLE_INDEXED_BORROWER_KEYS = [
  ["borrowerName", "Name"],
  ["borrowerIdNumber", "IdNumber"],
  ["borrowerAddress", "Address"],
  ["borrowerDateOfBirth", "DateOfBirth"],
  ["borrowerGender", "Gender"],
  ["borrowerEmail", "Email"],
];

const INDEXED_BORROWER_FIELD_KEYS = [
  "borrowerName",
  "borrowerIdNumber",
  "borrowerAddress",
  "borrowerDateOfBirth",
  "borrowerGender",
  "borrowerEmail",
  "borrowerIsMortgagor",
];

export function formatBorrowerPlaceholderValue(key, borrower) {
  const b = borrower || {};
  switch (key) {
    case "borrowerName":
      return dash(b.borrowerName);
    case "borrowerIdNumber":
      return dash(b.borrowerIdNumber);
    case "borrowerAddress":
      return dash(b.borrowerAddress);
    case "borrowerDateOfBirth":
      return formatDateHe(b.borrowerDateOfBirth);
    case "borrowerGender":
      return genderHe(b.borrowerGender);
    case "borrowerEmail":
      return dash(b.borrowerEmail);
    case "borrowerIsMortgagor":
      return yesNoHe(b.borrowerIsMortgagor);
    default:
      return "-";
  }
}

/** תגים ממוספרים: {borrowerName1}, {borrowerName2}, … לפי סדר הלווים בתיק (עד MAX_INDEXED_BORROWERS) */
export function buildBorrowerIndexedPlaceholders(borrowers) {
  const brs = Array.isArray(borrowers) && borrowers.length ? borrowers : [{}];
  const out = {};
  for (let i = 0; i < MAX_INDEXED_BORROWERS; i++) {
    const b = brs[i] || {};
    const n = i + 1;
    for (const key of INDEXED_BORROWER_FIELD_KEYS) {
      out[`${key}${n}`] = formatBorrowerPlaceholderValue(key, b);
    }
  }
  return out;
}

/**
 * תגים לפי סדר ממשכנים (לווים עם צ'קבוקס ממשכן): {mortgagorName1}, {mortgagorHas1}, …
 * ולפי סדר לווים שאינם ממשכנים: {nonMortgagorName1}, {nonMortgagorHas1}, …
 * + borrowerIsMortgagorBool1… — בוליאני לתנאי docxtemplater לפי מספר לווה בתיק (לא לפי סינון ממשכן).
 */
export function buildMortgagorRolePlaceholders(borrowers) {
  const brs = Array.isArray(borrowers) && borrowers.length ? borrowers : [];
  const mort = brs.filter(isBorrowerMortgagorFlag);
  const non = brs.filter((b) => !isBorrowerMortgagorFlag(b));
  const out = {};
  for (let i = 0; i < MAX_INDEXED_BORROWERS; i++) {
    const n = i + 1;
    const bm = mort[i] || {};
    const bn = non[i] || {};
    out[`mortgagorHas${n}`] = !!mort[i];
    out[`nonMortgagorHas${n}`] = !!non[i];
    for (const [borrowKey, suffix] of ROLE_INDEXED_BORROWER_KEYS) {
      out[`mortgagor${suffix}${n}`] = formatBorrowerPlaceholderValue(borrowKey, bm);
      out[`nonMortgagor${suffix}${n}`] = formatBorrowerPlaceholderValue(borrowKey, bn);
    }
  }
  for (let i = 0; i < MAX_INDEXED_BORROWERS; i++) {
    const n = i + 1;
    const b = brs[i];
    out[`borrowerIsMortgagorBool${n}`] = isBorrowerMortgagorFlag(b);
  }
  return out;
}

/**
 * @param {object} product — מסמך מוצר מלא
 * @param {object} borrower — איבר מ- product.borrowers לעמוד הנוכחי בייצוא
 */
export function buildWordTemplateData(product, borrower) {
  const b = borrower || {};
  const rd = product?.registrationDetails || {};
  const sd = product?.signingDetails || {};
  const pd = product?.projectDetails || {};
  const fc = Array.isArray(product?.financingCompanies) && product.financingCompanies.length
    ? product.financingCompanies[0]
    : {};
  const seller = Array.isArray(product?.sellers) && product.sellers.length ? product.sellers[0] : {};
  const loan = Array.isArray(product?.loans) && product.loans.length ? product.loans[0] : {};
  const auth = Array.isArray(product?.authorizedPerson) && product.authorizedPerson.length
    ? product.authorizedPerson[0]
    : {};
  const sc = product?.seniorCreditor || {};
  const bba = product?.borrowerBankAccount || {};

  const allBorrowersList =
    Array.isArray(product?.borrowers) && product.borrowers.length ? product.borrowers : [b];
  const allBorrowerNames =
    allBorrowersList.map((x) => (x.borrowerName || "").trim()).filter(Boolean).join(" ו ") || "-";

  const indexedBorrowers = buildBorrowerIndexedPlaceholders(allBorrowersList);
  const mortgagorRolePlaceholders = buildMortgagorRolePlaceholders(allBorrowersList);

  return {
    lawyerName: dash(sd.lawyerName),
    lawyerRegistrationNumber: dash(sd.lawyerRegistrationNumber),
    lawyerIdNumber: dash(sd.lawyerIdNumber),
    lawyerEmail: dash(sd.lawyerEmail),
    signingDate: formatDateHe(sd.signingDate),

    consultant: dash(sd.consultant),
    consultantEmail: dash(sd.consultantEmail),

    financingCompanyName: dash(fc.name),
    financingCompanyIdNumber: dash(fc.idNumber),

    borrowerName: formatBorrowerPlaceholderValue("borrowerName", b),
    borrowerIdNumber: formatBorrowerPlaceholderValue("borrowerIdNumber", b),
    borrowerAddress: formatBorrowerPlaceholderValue("borrowerAddress", b),
    borrowerDateOfBirth: formatBorrowerPlaceholderValue("borrowerDateOfBirth", b),
    borrowerGender: formatBorrowerPlaceholderValue("borrowerGender", b),
    borrowerEmail: formatBorrowerPlaceholderValue("borrowerEmail", b),
    borrowerIsMortgagor: formatBorrowerPlaceholderValue("borrowerIsMortgagor", b),
    allBorrowerNames,
    ...indexedBorrowers,
    ...mortgagorRolePlaceholders,

    block: dash(rd.block),
    plot: dash(rd.plot),
    subPlot: dash(rd.subPlot),
    land: dash(rd.land),
    plan: dash(rd.plan),
    contract: dash(rd.contract),
    mortgageName: dash(rd.mortgageName),
    mortgageCompanyId: dash(rd.mortgageCompanyId),
    office: dash(rd.office),
    plotArea: dash(rd.plotArea),
    right: dash(rd.right),
    parts: dash(rd.parts),
    propertyType: dash(rd.propertyType),
    street: dash(rd.street),
    houseNumber: dash(rd.houseNumber),
    apartmentNumber: dash(rd.apartmentNumber),
    floor: dash(rd.floor),
    direction: dash(rd.direction),
    entrance: dash(rd.entrance),
    unit: dash(rd.unit),
    settlement: dash(rd.settlement),

    sellerName: dash(seller.sellerName),
    sellerIdType: dash(seller.sellerIdType),
    sellerIdNumber: dash(seller.sellerIdNumber),
    sellerAddress: dash(seller.sellerAddress),

    loanAmount: dash(loan.loanAmount),
    loanChange: dash(loan.loanChange),
    clause: dash(loan.clause),
    loanPlan: dash(loan.loanPlan),
    loanMonths: dash(loan.loanMonths),
    loanInterestRate: dash(loan.loanInterestRate),
    adjustedLoan: dash(loan.adjustedLoan),
    realLoan: dash(loan.realLoan),
    primeMargin: dash(loan.primeMargin),
    loanCreation: formatDateHe(loan.loanCreation),
    loanNumber: dashOptionalZero(loan.loanNumber),
    mortgageNumber: dashOptionalZero(loan.mortgageNumber),

    seniorCreditorName: dash(sc.seniorCreditorName),
    seniorCreditorIdType: dash(sc.seniorCreditorIdType),
    seniorCreditorIdNumber: dash(sc.seniorCreditorIdNumber),

    borrowerAccountNumber: dash(bba.borrowerAccountNumber),
    borrowerBranchCode: dash(bba.borrowerBranchCode),
    borrowerBankName: dash(bba.borrowerBankName),

    authorizedName: dash(auth.authorizedName),
    authorizedIdNumber: dashOptionalZero(auth.authorizedIdNumber),

    tamAgreementDate: formatDateHe(pd.tamAgreementDate),
    appraiser: dash(pd.appraiser),
    supervisor: dash(pd.supervisor),
    additionalFloors: dash(pd.additionalFloors),
    projectUnits: dash(pd.projectUnits),
    transferFees: dash(pd.transferFees),
    ltv: dash(pd.ltv),
    projectValue: dash(pd.projectValue),
    minimumWithdrawal: dash(pd.minimumWithdrawal),
    contractorName: dash(pd.contractorName),
    architect: dash(pd.architect),
  };
}
