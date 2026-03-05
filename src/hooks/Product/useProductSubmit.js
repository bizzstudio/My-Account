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
    borrowerIdNumber: "",
    borrowerAddress: "",
    borrowerDateOfBirth: "",
    borrowerGender: "",
    borrowerEmail: "",
  };

  const defaultSeller = {
    sellerName: "",
    sellerIdType: "",
    sellerIdNumber: "",
    sellerAddress: "",
  };

  const defaultLoan = {
    loanAmount: 0,
    loanChange: "",
    clause: "",
    loanPlan: "",
    loanMonths: 0,
    loanInterestRate: 0,
    adjustedLoan: 0,
    realLoan: 0,
    primeMargin: 0,
    loanCreation: "",
    loanNumber: 0,
    mortgageNumber: 0,
  };

  const defaultAuthorized = {
    authorizedName: "",
    authorizedIdNumber: 0,
  };

  const defaultMortgagor = {
    mortgagorDetails: "",
    mortgagorFamily: "",
    mortgagorIdType: "",
    mortgagorIdNumber: 0,
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
      mortgagors: [defaultMortgagor],
      transcriptText: "",
      facebookFeedData: "",
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
      const res = await fetch(
        `${import.meta.env.VITE_APP_API_BASE_URL}/products/${productId}/exported-templates`,
        { headers: { Authorization: tokenHolder ? `Bearer ${tokenHolder.token}` : "" } }
      );
      if (!res.ok) return;
      const { exportedTemplates } = await res.json();
      if (!exportedTemplates || exportedTemplates.length === 0) return;

      const fullProduct = { ...productData, _id: productId };
      for (const tpl of exportedTemplates) {
        const templateArg = tpl.id === "default" ? null : { _id: tpl.id, name: tpl.name };
        ExportWord([fullProduct], [], templateArg).catch(console.error);
      }
    } catch (err) {
      console.error("re-export failed:", err);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // 🔹 Prepare product data
      const productData = {
        ...data,
        signingDetails: {
          ...data.signingDetails,
          signingDate: convertDate(data.signingDetails?.signingDate),
        },
        projectDetails: {
          ...data.projectDetails,
          tamAgreementDate: convertDate(data.projectDetails?.tamAgreementDate),
        },
        borrowers: data.borrowers?.map((b) => ({
          ...b,
          borrowerDateOfBirth: convertDate(b.borrowerDateOfBirth),
        })),
        loans: data.loans?.map((l) => ({
          ...l,
          loanCreation: convertDate(l.loanCreation),
        })),
        transcriptText: data.transcriptText || "",
        facebookFeedData: data.facebookFeedData || "",
      };

      // 🔹 Only super-admin can set owner
      if (userInfo?.role === "super-admin" && data.owner) {
        productData.owner = data.owner;
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
      const loansMapped = (res.loans && res.loans.length > 0)
        ? res.loans.map((l) => ({
            ...defaultLoan,
            ...l,
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
          ? borrowersRaw.map((b) => ({
              ...defaultBorrower,
              ...b,
              borrowerDateOfBirth: b.borrowerDateOfBirth
                ? new Date(b.borrowerDateOfBirth).toISOString().split("T")[0]
                : "",
            }))
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
        mortgagors: res.mortgagors?.length ? res.mortgagors : [defaultMortgagor],
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
