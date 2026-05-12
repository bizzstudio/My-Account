import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Cookies from "js-cookie";

// Internal imports
import { SidebarContext } from "@/context/SidebarContext";
import { UserContext } from "@/context/UserContext";
import ProductServices from "@/services/ProductServices";
import UserServices from "@/services/UserServices";
import notifyApiResponse from "@/utils/notifyApiResponse";
import ExportWord from "@/components/product/ExportWord";
import { coerceBorrowerFields, isBorrowerMortgagorFlag } from "@/utils/buildWordTemplateData";

export const defaultLoan = {
  loanPlan: "",
  loanInterestRate: "",
  adjustedInterestRate: "",
  adjustedLoan: "",
  realCreditCostRate: "",
  realLoan: "",
  primeMargin: "",
  indexLinked: "",
  establishmentFee: "",
  borrowerReceivesAmount: "",
  excessPaymentBeyondCredit: "",
  totalPayableEndOfTerm: "",
  loanPurpose: "",
  loanAmount: "",
  loanChange: "",
  clause: "",
  loanMonths: "",
  loanCreation: "",
  loanNumber: "",
  mortgageNumber: "",
};

const useProductSubmit = (id, onSuccess) => {
  const { isDrawerOpen, closeDrawer, setIsUpdate } =
    useContext(SidebarContext);
  const { state: userState } = useContext(UserContext);
  const { userInfo } = userState;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allAdmins, setAllAdmins] = useState([]);
  const [lawyers, setLawyers] = useState([]);

  const defaultBorrower = {
    borrowerName: "",
    borrowerLastName: "",
    borrowerIdNumber: "",
    borrowerAddress: "",
    borrowerDateOfBirth: "",
    borrowerGender: "",
    borrowerEmail: "",
    borrowerIsMortgagor: false,
  };

  const defaultSeller = {
    sellerName: "",
    sellerIdType: "",
    sellerIdNumber: "",
    sellerAddress: "",
  };

  const defaultAuthorized = {
    authorizedName: "",
    authorizedIdNumber: 0,
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      signingDetails: {},
      registrationDetails: {},
      projectDetails: {},
      borrowerBankAccount: {},
      seniorCreditor: {},
      borrowers: [defaultBorrower],
      sellers: [defaultSeller],
      financingCompanies: [],
      loans: [defaultLoan],
      authorizedPerson: [defaultAuthorized],
      mortgagors: [],
      transcriptText: "",
      facebookFeedData: "",
      /** UI בלבד — בחירת עורך דין מהרשימה (אדמין); לא נשלח ל-API */
      _selectedLawyerId: "",
    },
  });

  const convertDate = (value) => {
    if (!value) return undefined;
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d;
  };

  const reExportToDrive = async (productId, productData) => {
    try {
      const tokenHolder = Cookies.get("userInfo") ? JSON.parse(Cookies.get("userInfo")) : null;
      const authHeader = tokenHolder ? `Bearer ${tokenHolder.token}` : "";
      const res = await fetch(
        `${import.meta.env.VITE_APP_API_BASE_URL}/products/${productId}/exported-templates`,
        { headers: { Authorization: authHeader } }
      );
      if (!res.ok) return;
      const { exportedTemplates } = await res.json();
      if (!exportedTemplates || exportedTemplates.length === 0) return;

      const fullProduct = { ...productData, _id: productId };
      const isMongoObjectId = (id) =>
        typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);

      for (const tpl of exportedTemplates) {
        const tid = tpl?.id != null ? String(tpl.id) : "";
        if (!tid || tid === "default" || !isMongoObjectId(tid)) continue;
        const templateArg = { _id: tid, name: tpl.name };
        try {
          await ExportWord([fullProduct], [], templateArg, {
            singleDocumentPerProduct: Boolean(tpl.singleDocument),
          });
        } catch (exportErr) {
          const msg = String(exportErr?.message || "");
          const isNotFound =
            msg.includes("404") ||
            msg.toLowerCase().includes("not found") ||
            msg.toLowerCase().includes("תבנית");
          if (isNotFound) {
            // תבנית נמחקה — מסירים מרשימת ה־exportedTemplates של התיק
            fetch(
              `${import.meta.env.VITE_APP_API_BASE_URL}/products/${productId}/exported-templates/${tid}`,
              { method: "DELETE", headers: { Authorization: authHeader } }
            ).catch(() => {});
          }
        }
      }
    } catch (err) {
      console.error("re-export failed:", err);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // 🔹 Prepare product data (שדות UI פנימיים לא נשלחים לשרת)
      const { _selectedLawyerId: _uiLawyer, ...restData } = data;
      const productData = {
        ...restData,
        mortgagors: [],
        signingDetails: {
          ...restData.signingDetails,
          signingDate: convertDate(restData.signingDetails?.signingDate),
        },
        projectDetails: {
          ...restData.projectDetails,
          tamAgreementDate: convertDate(restData.projectDetails?.tamAgreementDate),
        },
        borrowers: restData.borrowers?.map((b) => {
          const { _clientKey: _ck, ...rest } = b;
          const normalized = coerceBorrowerFields(rest);
          const idRaw = normalized.borrowerIdNumber;
          const borrowerIdNumber =
            idRaw === undefined || idRaw === null || String(idRaw).trim() === ""
              ? ""
              : String(idRaw).trim();
          return {
            ...normalized,
            borrowerIdNumber,
            borrowerDateOfBirth: convertDate(b.borrowerDateOfBirth),
            borrowerIsMortgagor: isBorrowerMortgagorFlag(b),
          };
        }),
        loans: data.loans?.map((l) => {
          const parseNumeric = (val) => {
            if (val === undefined || val === null || val === "") return undefined;
            const n = Number(String(val).replace(/,/g, ""));
            return isNaN(n) ? undefined : n;
          };
          return {
            ...l,
            loanAmount: parseNumeric(l.loanAmount),
            loanMonths: parseNumeric(l.loanMonths),
            loanCreation: convertDate(l.loanCreation),
          };
        }),
        transcriptText: data.transcriptText || "",
        facebookFeedData: data.facebookFeedData || "",
      };

      // 🔹 Only super-admin can set owner
      if (userInfo?.role === "super-admin" && restData.owner) {
        productData.owner = restData.owner;
      }

      let res;
      if (id) {
        res = await ProductServices.updateProduct(id, productData);
      } else {
        res = await ProductServices.addProduct(productData);
      }

      setIsUpdate(true);
      notifyApiResponse(res, true);
      closeDrawer();
      if (onSuccess) onSuccess();

      // re-export אוטומטי לדרייב אם קיימות תבניות שיוצאו בעבר
      if (id) {
        reExportToDrive(id, productData).catch(console.error);
      }
    } catch (err) {
      notifyApiResponse(err, false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProductData = async () => {
    try {
      const res = await ProductServices.getProductById(id);
      if (!res) return;

      // 🔹 Signing Details – תאריך לפורמט input date
      const signingDetails = res.signingDetails || {};
      const updatedSigningDetails = { ...signingDetails };
      if (updatedSigningDetails.signingDate) {
        updatedSigningDetails.signingDate = new Date(
          updatedSigningDetails.signingDate
        ).toISOString().split("T")[0];
      }

      // 🔹 כל המערכים — שומרים את כל האיברים (לווים, הלוואות, מוכרים וכו')
      const formatWithCommas = (val) => {
        if (val == null || val === "") return "";
        const n = Number(val);
        return isNaN(n) ? String(val) : n.toLocaleString("en-US");
      };

      const loansMapped = (res.loans && res.loans.length > 0)
        ? res.loans.map((l) => ({
            ...defaultLoan,
            ...l,
            loanAmount: formatWithCommas(l.loanAmount),
            loanMonths: formatWithCommas(l.loanMonths),
            loanCreation: l.loanCreation
              ? new Date(l.loanCreation).toISOString().split("T")[0]
              : "",
          }))
        : [defaultLoan];

      // תמיכה גם ב-borrower ביחיד (אם הבקאנד מחזיר כך) וגם במערך borrowers
      const borrowersRaw = Array.isArray(res.borrowers)
        ? res.borrowers
        : res.borrower
          ? [res.borrower]
          : [];
      const borrowersCount = borrowersRaw.length;
      console.log("[עריכת תיק] לווים שהתקבלו מהשרת:", borrowersCount, borrowersCount !== 1 ? "— אמורים להופיע כולם בעריכה" : "— אם יש יותר מלווה אחד בתיק, תקן בבקאנד (GET /products/:id)");

      const borrowersMappedFinal =
        borrowersRaw.length > 0
          ? borrowersRaw.map((b) => {
              /** מיזוג עם default ואז coerce — מונע borrowerLastName:null שדורס ברירת מחדל,
               * ומאחד מפתחות חלופיים מהבקאנד (lastName וכו') לשדות הטופס */
              const merged = coerceBorrowerFields({ ...defaultBorrower, ...b });
              return {
                ...merged,
                borrowerDateOfBirth: merged.borrowerDateOfBirth
                  ? new Date(merged.borrowerDateOfBirth).toISOString().split("T")[0]
                  : "",
                borrowerIsMortgagor: isBorrowerMortgagorFlag(b),
              };
            })
          : [defaultBorrower];

      const formData = {
        signingDetails: updatedSigningDetails,
        registrationDetails: res.registrationDetails || {},
        projectDetails: res.projectDetails || {},
        borrowerBankAccount: res.borrowerBankAccount || {},
        seniorCreditor: res.seniorCreditor || {},
        borrowers: borrowersMappedFinal,
        loans: loansMapped,
        authorizedPerson: res.authorizedPerson?.length ? res.authorizedPerson : [defaultAuthorized],
        mortgagors: [],
        sellers: res.sellers?.length ? res.sellers : [defaultSeller],
        financingCompanies: res.financingCompanies || [],
        transcriptText: res.transcriptText || "",
        facebookFeedData: res.facebookFeedData || "",
      };

      // החלפה מלאה של מצב הטופס כדי שכל הלווים יוצגו
      reset(formData, { keepDefaultValues: false });
    } catch (err) {
      notifyApiResponse(err, false);
    }
  };

  const getAllUsers = async () => {
    try {
      const res = await UserServices.getAllUser();
      const all = res || [];
      setAllAdmins(all);
      // רשימת עורכי דין לבחירה ב-ProductDrawer
      setLawyers(all.filter((u) => u.role === "lawyer"));
    } catch (err) {
      console.error("Error fetching admins:", err);
    }
  };

  useEffect(() => {
    if (!isDrawerOpen) {
      clearErrors();
      reset();
      return;
    }

    if (id) {
      getProductData();
    } else if (userInfo?.role === "lawyer") {
      // תיק חדש — עורך דין: מלא אוטומטית את פרטיו
      setValue("signingDetails.lawyerName", userInfo.name || "");
      setValue("signingDetails.lawyerIdNumber", userInfo.idNumber || "");
      setValue("signingDetails.lawyerEmail", userInfo.email || "");
    }
    getAllUsers();
  }, [id, isDrawerOpen]);

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
    allAdmins,
    lawyers,
    setValue,
    watch,
  };
};

export default useProductSubmit;
