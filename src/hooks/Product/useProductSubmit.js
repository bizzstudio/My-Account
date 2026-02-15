import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// Internal imports
import { SidebarContext } from "@/context/SidebarContext";
import { UserContext } from "@/context/UserContext";
import ProductServices from "@/services/ProductServices";
import UserServices from "@/services/UserServices";
import notifyApiResponse from "@/utils/notifyApiResponse";

const useProductSubmit = (id, onSuccess) => {
  const { isDrawerOpen, closeDrawer, setIsUpdate } =
    useContext(SidebarContext);
  const { state: userState } = useContext(UserContext);
  const { userInfo } = userState;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allAdmins, setAllAdmins] = useState([]);

  const defaultBorrower = {
    borrowerName: "",
    borrowerFamily: "",
    borrowerIdType: "",
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

      // 🔹 Signing Details – nested object like registrationDetails
      const signingDetails = res.signingDetails || {};
      const updatedSigningDetails = { ...signingDetails };
      if (updatedSigningDetails.signingDate) {
        updatedSigningDetails.signingDate = new Date(
          updatedSigningDetails.signingDate
        ).toISOString().split("T")[0];
      }
      setValue("signingDetails", updatedSigningDetails);

      // 🔹 Registration Details
      setValue("registrationDetails", res.registrationDetails || {});

      // 🔹 Borrowers – array with date conversion
      setValue(
        "borrowers",
        res.borrowers?.map((b) => ({
          ...b,
          borrowerDateOfBirth: b.borrowerDateOfBirth
            ? new Date(b.borrowerDateOfBirth).toISOString().split("T")[0]
            : "",
        })) || [defaultBorrower]
      );

      // 🔹 Loans – array with date conversion
      setValue(
        "loans",
        res.loans?.map((l) => ({
          ...l,
          loanCreation: l.loanCreation
            ? new Date(l.loanCreation).toISOString().split("T")[0]
            : "",
        })) || [defaultLoan]
      );

      setValue("authorizedPerson", res.authorizedPerson || [defaultAuthorized]);
      setValue("mortgagors", res.mortgagors || [defaultMortgagor]);
      setValue("sellers", res.sellers || [defaultSeller]);
      setValue("transcriptText", res.transcriptText || "");
      setValue("facebookFeedData", res.facebookFeedData || "");
    } catch (err) {
      notifyApiResponse(err, false);
    }
  };

  const getAllUsers = async () => {
    try {
      if (userInfo?.role === "super-admin") {
        const res = await UserServices.getAllUser();
        setAllAdmins(res || []);
      }
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

    if (id) getProductData();
    getAllUsers();
  }, [id, isDrawerOpen]);

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
    allAdmins,
    setValue,
    watch,
  };
};

export default useProductSubmit;
