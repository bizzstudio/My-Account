import { normalizeIsraeliID } from "@/utils/israeliId";

/**
 * מפתחות שטוחים ל-docxtemplater — תואמים למקרא בהגדרות (Settings → LEGEND_SECTIONS).
 * מקור הנתונים: אובייקט מוצר כפי שחוזר מה-API / נשמר בטופס (ProductDrawer, ConsultantForm).
 * שמות לווה: `borrowerName` = שם פרטי + שם משפחה יחד; `borrowerFirstName` = שם פרטי בלבד;
 * `borrowerLastName` = שם משפחה בלבד. רובריקות ממשכן/לא-ממשכן: mortgagorFirstName1, mortgagorLastName1, …
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

/** מפצל תאריך לרכיבים נפרדים (יום / חודש / שנה) כמחרוזות */
const splitDate = (v) => {
  if (!v) return { day: "-", month: "-", year: "-" };
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return { day: "-", month: "-", year: "-" };
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: String(d.getMonth() + 1).padStart(2, "0"),
    year: String(d.getFullYear()),
  };
};

const genderHe = (g) => {
  if (g == null || g === "") return "-";
  if (g === "male") return "זכר";
  if (g === "female") return "נקבה";
  return dash(g);
};

/** ערכי אמת נפוצים מצ'קבוקס / JSON / מסד (כולל "on" מטפסי HTML ) */
function truthyBorrowerIsMortgagor(v) {
  if (v === true || v === 1) return true;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    const t = v.trim();
    return s === "true" || s === "1" || s === "on" || s === "yes" || t === "כן";
  }
  return false;
}

const yesNoHeMortgagor = (v) => (truthyBorrowerIsMortgagor(v) ? "כן" : "לא");

/**
 * איחוד מפתחות נפוצים מהבקאנד/מיגרציה — כדי ש־{mortgagorName1}, {borrowerName} וכו'
 * יקבלו שם מלא גם כש־שם המשפחה נשמר תחת lastName / familyName / borrowerFamily (שדה ישן בבקאנד) במקום borrowerLastName.
 */
export function coerceBorrowerFields(borrower) {
  if (!borrower || typeof borrower !== "object") return {};
  let borrowerName =
    borrower.borrowerName ??
    borrower.firstName ??
    borrower.givenName ??
    "";
  borrowerName =
    borrowerName != null && String(borrowerName).trim() !== ""
      ? String(borrowerName).trim()
      : "";

  const explicitLast =
    borrower.borrowerLastName ??
    borrower.lastName ??
    borrower.familyName ??
    borrower.surname;

  let borrowerLastName =
    explicitLast != null && String(explicitLast).trim() !== ""
      ? String(explicitLast).trim()
      : "";

  const famRaw = borrower.borrowerFamily;
  const fam =
    famRaw != null && String(famRaw).trim() !== "" ? String(famRaw).trim() : "";

  /**
   * מיגרציה משדות ישנים (פרטי ממשכן / borrowerFamily): לפעמים נשמר שם פרטי בטעות כטוקן אחרון של משפחה דו־מילית
   * (למשל borrowerName = "גד", borrowerFamily = "בן גד" במקום פרטי "בן" ומשפחה "גד").
   */
  if (!borrowerLastName && fam) {
    const famParts = fam.split(/\s+/).filter(Boolean);
    if (famParts.length >= 2 && borrowerName && borrowerName === famParts[famParts.length - 1]) {
      const givenFromFam = famParts.slice(0, -1).join(" ");
      borrowerName = givenFromFam || borrowerName;
      borrowerLastName = famParts[famParts.length - 1];
    } else {
      borrowerLastName = fam;
    }
  }

  return { ...borrower, borrowerName, borrowerLastName };
}

/** שם לתצוגה (תיקיית Drive, טקסט מאוחד) — שם פרטי + שם משפחה כששניהם קיימים */
export function formatBorrowerDisplayName(borrower) {
  const b = coerceBorrowerFields(borrower);
  const parts = [b.borrowerName, b.borrowerLastName].filter(Boolean);
  if (!parts.length) return "-";
  return parts.join(" ");
}

/** שם תיקיית Drive כמו ב־ExportWord — כל הלווים עם שם מלא, מחוברים ב־« ו » */
export function formatDriveFolderNameFromBorrowers(borrowers) {
  const brs = Array.isArray(borrowers) && borrowers.length ? borrowers : [];
  const joined = brs
    .map((br) => {
      const d = formatBorrowerDisplayName(br);
      return d !== "-" ? d : "";
    })
    .filter(Boolean)
    .join(" ו ");
  return joined || "";
}


/** האם הלווה מסומן כממשכן (לסינון תגי mortgagorName1… ו־nonMortgagor…) */
export function isBorrowerMortgagorFlag(b) {
  return truthyBorrowerIsMortgagor(b?.borrowerIsMortgagor);
}

/** מספר מקסימלי של לווים עם תגים ממוספרים ({borrowerName1}, {borrowerName2}, …) */
export const MAX_INDEXED_BORROWERS = 5;

/** שדות לווה לתת-מספר אחרי mortgagor / nonMortgagor (למשל mortgagorName1) */
const ROLE_INDEXED_BORROWER_KEYS = [
  ["borrowerName", "Name"],
  ["borrowerFirstName", "FirstName"],
  ["borrowerLastName", "LastName"],
  ["borrowerIdNumber", "IdNumber"],
  ["borrowerAddress", "Address"],
  ["borrowerDateOfBirth", "DateOfBirth"],
  ["borrowerGender", "Gender"],
  ["borrowerEmail", "Email"],
];

const INDEXED_BORROWER_FIELD_KEYS = [
  "borrowerName",
  "borrowerFirstName",
  "borrowerLastName",
  "borrowerIdNumber",
  "borrowerAddress",
  "borrowerDateOfBirth",
  "borrowerGender",
  "borrowerEmail",
  "borrowerIsMortgagor",
];

export function formatBorrowerPlaceholderValue(key, borrower) {
  const b = coerceBorrowerFields(borrower || {});
  switch (key) {
    case "borrowerName":
      return formatBorrowerDisplayName(b);
    case "borrowerFirstName":
      return dash(b.borrowerName);
    case "borrowerLastName":
      return dash(b.borrowerLastName);
    case "borrowerIdNumber": {
      const v = b.borrowerIdNumber;
      if (v === undefined || v === null || v === "") return "-";
      if (typeof v === "number" && Number.isFinite(v))
        return normalizeIsraeliID(v) || "-";
      const s = String(v).trim();
      return s || "-";
    }
    case "borrowerAddress":
      return dash(b.borrowerAddress);
    case "borrowerDateOfBirth":
      return formatDateHe(b.borrowerDateOfBirth);
    case "borrowerDateOfBirthDay":
      return splitDate(b.borrowerDateOfBirth).day;
    case "borrowerDateOfBirthMonth":
      return splitDate(b.borrowerDateOfBirth).month;
    case "borrowerDateOfBirthYear":
      return splitDate(b.borrowerDateOfBirth).year;
    case "borrowerGender":
      return genderHe(b.borrowerGender);
    case "borrowerEmail":
      return dash(b.borrowerEmail);
    case "borrowerIsMortgagor":
      return yesNoHeMortgagor(b.borrowerIsMortgagor);
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
    // תאריך לידה מפוצל לכל לווה ממוספר
    const dob = splitDate(b.borrowerDateOfBirth);
    out[`borrowerDateOfBirthDay${n}`] = dob.day;
    out[`borrowerDateOfBirthMonth${n}`] = dob.month;
    out[`borrowerDateOfBirthYear${n}`] = dob.year;
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
  // תגים בלי מספר — שווים לממשכן/לא-ממשכן הראשון (נוחות במקרא ובתבניות ישנות)
  out.mortgagorIdNumber = formatBorrowerPlaceholderValue("borrowerIdNumber", mort[0] || {});
  out.nonMortgagorIdNumber = formatBorrowerPlaceholderValue("borrowerIdNumber", non[0] || {});
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
    // תאריך לידה מפוצל לממשכנים / לא-ממשכנים
    const dobM = splitDate(bm.borrowerDateOfBirth);
    out[`mortgagorDateOfBirthDay${n}`] = dobM.day;
    out[`mortgagorDateOfBirthMonth${n}`] = dobM.month;
    out[`mortgagorDateOfBirthYear${n}`] = dobM.year;
    const dobN = splitDate(bn.borrowerDateOfBirth);
    out[`nonMortgagorDateOfBirthDay${n}`] = dobN.day;
    out[`nonMortgagorDateOfBirthMonth${n}`] = dobN.month;
    out[`nonMortgagorDateOfBirthYear${n}`] = dobN.year;
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
    allBorrowersList
      .map((x) => formatBorrowerDisplayName(x))
      .filter((s) => s && s !== "-")
      .join(" ו ") || "-";

  const indexedBorrowers = buildBorrowerIndexedPlaceholders(allBorrowersList);
  const mortgagorRolePlaceholders = buildMortgagorRolePlaceholders(allBorrowersList);

  return {
    lawyerName: dash(sd.lawyerName),
    lawyerRegistrationNumber: dash(sd.lawyerRegistrationNumber),
    lawyerIdNumber: dash(sd.lawyerIdNumber),
    lawyerEmail: dash(sd.lawyerEmail),
    signingDate: formatDateHe(sd.signingDate),
    signingDateDay: splitDate(sd.signingDate).day,
    signingDateMonth: splitDate(sd.signingDate).month,
    signingDateYear: splitDate(sd.signingDate).year,

    consultant: dash(sd.consultant),
    consultantEmail: dash(sd.consultantEmail),

    financingCompanyName: dash(fc.name),
    financingCompanyIdNumber: dash(fc.idNumber),

    borrowerName: formatBorrowerPlaceholderValue("borrowerName", b),
    borrowerFirstName: formatBorrowerPlaceholderValue("borrowerFirstName", b),
    borrowerLastName: formatBorrowerPlaceholderValue("borrowerLastName", b),
    borrowerIdNumber: formatBorrowerPlaceholderValue("borrowerIdNumber", b),
    borrowerAddress: formatBorrowerPlaceholderValue("borrowerAddress", b),
    borrowerDateOfBirth: formatBorrowerPlaceholderValue("borrowerDateOfBirth", b),
    borrowerDateOfBirthDay: splitDate(b.borrowerDateOfBirth).day,
    borrowerDateOfBirthMonth: splitDate(b.borrowerDateOfBirth).month,
    borrowerDateOfBirthYear: splitDate(b.borrowerDateOfBirth).year,
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
    registry: dash(rd.registry),
    lienRank: dash(rd.lienRank),
    lienRankHe:
      rd.lienRank === "first"
        ? "דרגה ראשונה"
        : rd.lienRank === "second"
          ? "דרגה שניה"
          : dash(rd.lienRank),
    firstLienAmount: dash(rd.firstLienAmount),
    secondLienAmount: dash(rd.secondLienAmount),
    ramiContractNumber: dash(rd.ramiContractNumber),
    lotNumber: dash(rd.lotNumber),
    applicationNumber: dash(rd.applicationNumber),
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

    loanAmount: loan.loanAmount != null && loan.loanAmount !== "" ? Number(loan.loanAmount).toLocaleString("en-US") : "-",
    loanChange: dash(loan.loanChange),
    clause: dash(loan.clause),
    loanPlan: dash(loan.loanPlan),
    interestLockDate: formatDateHe(loan.interestLockDate),
    primeRate: dash(loan.primeRate),
    repaymentTrackName: dash(loan.repaymentTrackName),
    loanMonths: dash(loan.loanMonths),
    loanInterestRate: dash(loan.loanInterestRate),
    adjustedInterestRate: dash(loan.adjustedInterestRate),
    adjustedLoan: dash(loan.adjustedLoan),
    realLoan: dash(loan.realLoan),
    realCreditCostRate: dash(loan.realCreditCostRate),
    primeMargin: dash(loan.primeMargin),
    indexLinked:
      loan.indexLinked === "yes" ? "כן" : loan.indexLinked === "no" ? "לא" : dash(loan.indexLinked),
    indexLinkedHe:
      loan.indexLinked === "yes" ? "כן" : loan.indexLinked === "no" ? "לא" : dash(loan.indexLinked),
    establishmentFee: dash(loan.establishmentFee),
    borrowerReceivesAmount: dash(loan.borrowerReceivesAmount),
    excessPaymentBeyondCredit: dash(loan.excessPaymentBeyondCredit),
    totalPayableEndOfTerm: dash(loan.totalPayableEndOfTerm),
    loanPurpose: dash(loan.loanPurpose),
    loanCreation: formatDateHe(loan.loanCreation),
    loanCreationDay: splitDate(loan.loanCreation).day,
    loanCreationMonth: splitDate(loan.loanCreation).month,
    loanCreationYear: splitDate(loan.loanCreation).year,
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
    tamAgreementDateDay: splitDate(pd.tamAgreementDate).day,
    tamAgreementDateMonth: splitDate(pd.tamAgreementDate).month,
    tamAgreementDateYear: splitDate(pd.tamAgreementDate).year,
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
