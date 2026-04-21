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
  const mort = Array.isArray(product?.mortgagors) && product.mortgagors.length ? product.mortgagors[0] : {};
  const sc = product?.seniorCreditor || {};
  const bba = product?.borrowerBankAccount || {};

  return {
    lawyerName: dash(sd.lawyerName),
    lawyerRegistrationNumber: dash(sd.lawyerRegistrationNumber),
    lawyerIdNumber: dash(sd.lawyerIdNumber),
    lawyerEmail: dash(sd.lawyerEmail),

    consultant: dash(sd.consultant),
    consultantEmail: dash(sd.consultantEmail),

    financingCompanyName: dash(fc.name),
    financingCompanyIdNumber: dash(fc.idNumber),

    borrowerName: dash(b.borrowerName),
    borrowerIdNumber: dash(b.borrowerIdNumber),
    borrowerAddress: dash(b.borrowerAddress),
    borrowerDateOfBirth: formatDateHe(b.borrowerDateOfBirth),
    borrowerGender: genderHe(b.borrowerGender),
    borrowerEmail: dash(b.borrowerEmail),

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

    mortgagorDetails: dash(mort.mortgagorDetails),
    mortgagorFamily: dash(mort.mortgagorFamily),
    mortgagorIdType: dash(mort.mortgagorIdType),
    mortgagorIdNumber: dashOptionalZero(mort.mortgagorIdNumber),

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
