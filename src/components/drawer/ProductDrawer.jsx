/// src/components/drawer/ProductDrawer.jsx
import React, { useContext, useEffect } from "react";
import { Card, CardBody } from "@windmill/react-ui";
import { useNavigate } from "react-router-dom";
import { t } from "i18next";
import { RiAdminLine } from "react-icons/ri";
import { BiSolidPackage, BiSolidDollarCircle } from "react-icons/bi";
import { MdEditNote, MdInventory, MdLocalShipping } from "react-icons/md";
import { FaTag } from "react-icons/fa";
import ReactTagInput from "@pathofdev/react-tag-input";
import ReactQuill from "react-quill-new";
import 'react-quill-new/dist/quill.snow.css';


// Internal imports
import Error from "@/components/form/others/Error";
import Title from "@/components/form/others/Title";
import InputArea from "@/components/form/input/InputArea";
import useProductSubmit from "@/hooks/Product/useProductSubmit";
import DrawerButton from "@/components/form/button/DrawerButton";
import LabelArea from "@/components/form/selectOption/LabelArea";
import TextAreaCom from "@/components/form/input/TextAreaCom";
import { UserContext } from "@/context/UserContext";
import { SidebarContext } from "@/context/SidebarContext";
import SelectWithOptions from "@/components/form/selectOption/SelectWithOptions";
import Uploader from "@/components/image-uploader/Uploader";
import CollapsibleSection from "@/components/common/CollapsibleSection";
import SwitchToggle from "@/components/form/switch/SwitchToggle";
import YouTubeVideoPreview from "@/components/product/YouTubeVideoPreview";
import FormSubmitActions from "../form/FormSubmitActions";
import { CARGO_TYPE_VALUES, PACKAGE_CARGO_TYPE_VALUES, DEFAULT_CARGO_TYPE } from "@/constants/cargoTypes";

const ProductDrawer = ({ id, onSuccess }) => {
    const navigate = useNavigate();
    const { state: userState } = useContext(UserContext);
    const { userInfo } = userState;
    const { closeDrawer } = useContext(SidebarContext);

    const {
        register,
        handleSubmit,
        onSubmit,
        errors,
        isSubmitting,
        allAdmins,
        setValue,
        watch,
    } = useProductSubmit(id, onSuccess);

    const productCargoType = watch("cargoType") ?? DEFAULT_CARGO_TYPE;
    const status = watch("status") || "active";
    const autoShipment = watch("autoShipment") || false;
    const isWarehouse = watch("isWarehouse") || false;
    const owner = watch("owner") || "";
    const images = watch("images") || [];
    const tags = watch("tags") || [];
    const description = watch("description") || "";
    const rawPackages = watch("packages");
    const packages = Array.isArray(rawPackages) && rawPackages.length > 0
        ? rawPackages
        : [{ cargoType: DEFAULT_CARGO_TYPE }];

    // סנכרון: כשאין אריזות (עריכת מוצר) – להגדיר אריזה אחת בדיפולט
    useEffect(() => {
        if (id && (!Array.isArray(rawPackages) || rawPackages.length === 0)) {
            setValue("packages", [{ cargoType: DEFAULT_CARGO_TYPE }]);
        }
    }, [id, rawPackages, setValue]);

    const packageCargoTypeOptions = PACKAGE_CARGO_TYPE_VALUES.map((value) => ({
        _id: value,
        name: t(`CargoType_${value}`),
    }));
    const productCargoTypeOptions = CARGO_TYPE_VALUES.map((value) => ({
        _id: value,
        name: t(`CargoType_${value}`),
    }));

    const handlePackageCargoChange = (index, value) => {
        const next = [...packages];
        if (!next[index]) next[index] = { cargoType: DEFAULT_CARGO_TYPE };
        next[index] = { ...next[index], cargoType: value };
        setValue("packages", next);
    };

    const handleAddPackage = () => {
        setValue("packages", [...packages, { cargoType: DEFAULT_CARGO_TYPE }]);
    };

    const handleRemovePackage = (index) => {
        if (packages.length <= 1) return;
        const next = packages.filter((_, i) => i !== index);
        setValue("packages", next);
    };

    const handleDescriptionChange = (value) => {
        setValue("description", value);
    };

    const handleShortDescriptionChange = (value) => {
        setValue("shortDescription", value);
    };

    const handleLongDescriptionChange = (value) => {
        setValue("longDescription", value);
    };

    const handleImageChange = (newImages) => {
        if (typeof newImages === 'function') {
            // אם מדובר בפונקציית callback, נפעיל אותה עם הערך הנוכחי
            const currentImages = watch("images") || [];
            setValue("images", newImages(currentImages));
        } else {
            // אחרת פשוט נעדכן את הערך
            setValue("images", newImages);
        }
    };

    const modules = {
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }],
                [{ 'align': [] }],
                ['link'],
                [{ 'indent': '-1' }, { 'indent': '+1' }],
                [{ 'direction': 'rtl' }],
            ],
        },
    };

    return (
        <>
        <div className="flex flex-col h-full">
        <div className="w-full relative p-6 border-b bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
  {id ? (
    <Title
      register={register}
      title={t("UpdateProduct")}
      description={t("UpdateProductDescription")}
    />
  ) : (
    <Title
      register={register}
      title={t("AddProduct")}
      description={t("AddProductDescription")}
    />
  )}
</div>
            <Card className="flex flex-col h-full !border-none">
    <CardBody className="flex flex-col flex-grow">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-grow overflow-y-auto">
        <div className="px-6 pt-2 pb-4 grid grid-cols-12 gap-5 flex-grow">

                           {/* סקשן: Borrowers */}
<div className="col-span-12">
  <CollapsibleSection
    title={t("Borrowers")}
    icon={<MdEditNote size={24} className="mt-1" />}
    defaultOpen
  >
    <div className="flex flex-col gap-2 mt-2">

      {/* כפתור להוספה */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            const current = watch("borrowers") || [];
            setValue("borrowers", [
              ...current,
              {
                borrowerName: "",
                borrowerFamily: "",
                borrowerIdType: "",
                borrowerIdNumber: "",
                borrowerAddress: "",
                borrowerDateOfBirth: "",
                borrowerGender: "",
                borrowerEmail: "",
              },
            ]);
          }}
          className="text-sm text-mainColor hover:underline whitespace-nowrap"
        >
          + {t("AddBorrower")}
        </button>
      </div>

      {/* מערך של Borrowers */}
      {(watch("borrowers") || []).map((borrower, index) => (
        <div
          key={index}
          className="grid grid-cols-12 gap-5 p-2 border rounded-md bg-gray-50 dark:bg-gray-800"
        >

          {/* Borrower Name */}
          <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
            <LabelArea label={t("BorrowerName")} />
            <div className="col-span-6">
              <InputArea
                register={register}
                label={t("BorrowerName")}
                name={`borrowers[${index}].borrowerName`}
                type="text"
                placeholder={t("BorrowerName")}
              />
              <Error errorName={errors?.borrowers?.[index]?.borrowerName} />
            </div>
          </div>

        

          {/* Borrower ID Number */}
          <div className="flex flex-col gap-1 md:col-span-2 col-span-12">
            <LabelArea label={t("BorrowerIdNumber")} />
            <div className="col-span-6">
              <InputArea
                register={register}
                label={t("BorrowerIdNumber")}
                name={`borrowers[${index}].borrowerIdNumber`}
                type="number"
                placeholder={t("BorrowerIdNumber")}
              />
              <Error errorName={errors?.borrowers?.[index]?.borrowerIdNumber} />
            </div>
          </div>

          {/* Borrower Address */}
          <div className="flex flex-col gap-1 md:col-span-4 col-span-12">
            <LabelArea label={t("BorrowerAddress")} />
            <div className="col-span-6">
              <InputArea
                register={register}
                label={t("BorrowerAddress")}
                name={`borrowers[${index}].borrowerAddress`}
                type="text"
                placeholder={t("BorrowerAddress")}
              />
              <Error errorName={errors?.borrowers?.[index]?.borrowerAddress} />
            </div>
          </div>

          {/* Borrower Date of Birth */}
          <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
            <LabelArea label={t("BorrowerDateOfBirth")} />
            <div className="col-span-6">
              <InputArea
                register={register}
                label={t("BorrowerDateOfBirth")}
                name={`borrowers[${index}].borrowerDateOfBirth`}
                type="date"
                
              />
              <Error errorName={errors?.borrowers?.[index]?.borrowerDateOfBirth} />
            </div>
          </div>

{/* Borrower Email */}
<div className="flex flex-col gap-1 md:col-span-6 col-span-12">
            <LabelArea label={t("BorrowerEmail")} />
            <div className="col-span-6">
              <InputArea
                register={register}
                label={t("BorrowerEmail")}
                name={`borrowers[${index}].borrowerEmail`}
                type="email"
                placeholder={t("BorrowerEmail")}
              />
              <Error errorName={errors?.borrowers?.[index]?.borrowerEmail} />
            </div>
          </div>

 {/* Borrower Gender */}
 <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
  <LabelArea label={t("BorrowerGender")} /> {/* כאן כבר משתמשים ב-t() */}
  <div className="flex gap-4">
    <label className="flex items-center gap-2">
      <input
        type="radio"
        value="male"  // הערך נשמר באנגלית, אין צורך לשנות
        {...register(`borrowers[${index}].borrowerGender`, {
          required: true,
        })}
      />
      {t("Male")} {/* כאן נוסף t() להצגה בעברית או אנגלית */}
    </label>

    <label className="flex items-center gap-2">
      <input
        type="radio"
        value="female"
        {...register(`borrowers[${index}].borrowerGender`, {
          required: true,
        })}
      />
      {t("Female")} {/* כאן נוסף t() להצגה בעברית או אנגלית */}
    </label>
  </div>

  <Error errorName={errors?.borrowers?.[index]?.borrowerGender} />
</div>

          

          {/* כפתור הסרה */}
          <div className="col-span-12 flex justify-end">
            <button
              type="button"
              onClick={() => {
                const current = watch("borrowers") || [];
                const next = current.filter((_, i) => i !== index);
                setValue("borrowers", next);
              }}
              className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-sm"
              disabled={(watch("borrowers") || []).length <= 1}
            >
              {t("RemoveBorrower")}
            </button>
          </div>

        </div>
      ))}
    </div>
  </CollapsibleSection>
</div>

      {/* Signing Details */}
<div className="col-span-12">
  <CollapsibleSection
    title={t("SigningDetails")}
    icon={<MdEditNote size={24} className="mt-1" />}
     defaultfalse
  >
    <div className="grid grid-cols-12 gap-5 mt-2">

      {/* תאריך חתימה */}
      <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
        <LabelArea label={t("SigningDate")} />
        <div className="col-span-6">
          <InputArea
            register={register}
            label={t("SigningDate")}
            name="signingDetails.signingDate"
            type="date"
            placeholder={t("SigningDate")}
            isRequired={false}
          />
          <Error errorName={errors?.signingDetails?.signingDate} />
        </div>
      </div>

      {/* שם עורך דין */}
      <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
        <LabelArea label={t("LawyerName")} />
        <div className="col-span-6">
          <InputArea
            register={register}
            label={t("LawyerName")}
            name="signingDetails.lawyerName"
            type="text"
            placeholder={t("LawyerName")}
            isRequired={false}
          />
          <Error errorName={errors?.signingDetails?.lawyerName} />
        </div>
      </div>

      {/* מספר רישום עורך דין */}
      <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
        <LabelArea label={t("LawyerRegistrationNumber")} />
        <div className="col-span-6">
          <InputArea
            register={register}
            label={t("LawyerRegistrationNumber")}
            name="signingDetails.lawyerRegistrationNumber"
            type="text"
            placeholder={t("LawyerRegistrationNumber")}
            isRequired={false}
          />
          <Error errorName={errors?.signingDetails?.lawyerRegistrationNumber} />
        </div>
      </div>

      {/* מספר ת"ז עורך דין */}
      <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
        <LabelArea label={t("LawyerIdNumber")} />
        <div className="col-span-6">
          <InputArea
            register={register}
            label={t("LawyerIdNumber")}
            name="signingDetails.lawyerIdNumber"
            type="number"
            placeholder={t("LawyerIdNumber")}
            isRequired={false}
          />
          <Error errorName={errors?.signingDetails?.lawyerIdNumber} />
        </div>
      </div>

      {/* יועץ */}
      <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
        <LabelArea label={t("Consultant")} />
        <div className="col-span-6">
          <InputArea
            register={register}
            label={t("Consultant")}
            name="signingDetails.consultant"
            type="text"
            placeholder={t("Consultant")}
            isRequired={false}
          />
          <Error errorName={errors?.signingDetails?.consultant} />
        </div>
      </div>

      {/* משקיע ראשי */}
      <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
        <LabelArea label={t("PrimaryBacker")} />
        <div className="col-span-6">
          <InputArea
            register={register}
            label={t("PrimaryBacker")}
            name="signingDetails.primaryBacker"
            type="text"
            placeholder={t("PrimaryBacker")}
            isRequired={false}
          />
          <Error errorName={errors?.signingDetails?.primaryBacker} />
        </div>
      </div>

      {/* מספר ת"ז משקיע ראשי */}
      <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
        <LabelArea label={t("PrimaryBackerId")} />
        <div className="col-span-6">
          <InputArea
            register={register}
            label={t("PrimaryBackerId")}
            name="signingDetails.primaryBackerId"
            type="number"
            placeholder={t("PrimaryBackerId")}
            isRequired={false}
          />
          <Error errorName={errors?.signingDetails?.primaryBackerId} />
        </div>
      </div>

      {/* משקיע שני */}
      <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
        <LabelArea label={t("SecondaryBacker")} />
        <div className="col-span-6">
          <InputArea
            register={register}
            label={t("SecondaryBacker")}
            name="signingDetails.secondaryBacker"
            type="text"
            placeholder={t("SecondaryBacker")}
            isRequired={false}
          />
          <Error errorName={errors?.signingDetails?.secondaryBacker} />
        </div>
      </div>

      {/* מספר ת"ז משקיע שני */}
      <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
        <LabelArea label={t("SecondaryBackerId")} />
        <div className="col-span-6">
          <InputArea
            register={register}
            label={t("SecondaryBackerId")}
            name="signingDetails.secondaryBackerId"
            type="number"
            placeholder={t("SecondaryBackerId")}
            isRequired={false}
          />
          <Error errorName={errors?.signingDetails?.secondaryBackerId} />
        </div>
      </div>

      {/* משקיע שלישי */}
      <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
        <LabelArea label={t("ThirdBacker")} />
        <div className="col-span-6">
          <InputArea
            register={register}
            label={t("ThirdBacker")}
            name="signingDetails.thirdBacker"
            type="text"
            placeholder={t("ThirdBacker")}
            isRequired={false}
          />
          <Error errorName={errors?.signingDetails?.thirdBacker} />
        </div>
      </div>

      {/* מספר ת"ז משקיע שלישי */}
      <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
        <LabelArea label={t("ThirdBackerId")} />
        <div className="col-span-6">
          <InputArea
            register={register}
            label={t("ThirdBackerId")}
            name="signingDetails.thirdBackerId"
            type="number"
            placeholder={t("ThirdBackerId")}
            isRequired={false}
          />
          <Error errorName={errors?.signingDetails?.thirdBackerId} />
        </div>
      </div>

    </div>
  </CollapsibleSection>
</div>

{/* קבוצה 4: פרטי רישום */}
<div className="col-span-12">
    <CollapsibleSection
        title={t("RegistrationDetails")}
        icon={<MdEditNote size={24} className="mt-1" />}
        defaultfalse
    >
        <div className="grid grid-cols-12 gap-5 mt-2">
            
            {/* Block */}
            <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("Block")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("Block")}
                        name="registrationDetails.block"
                        type="text"
                        placeholder={t("Block")}
                        isRequired={false}

                    />
                    <Error errorName={errors?.registrationDetails?.block} />
                </div>
            </div>

            {/* Plot */}
            <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("Plot")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("Plot")}
                        name="registrationDetails.plot"
                        type="text"
                        placeholder={t("Plot")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.registrationDetails?.plot} />
                </div>
            </div>

            {/* SubPlot */}
            <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("SubPlot")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("SubPlot")}
                        name="registrationDetails.subPlot"
                        type="text"
                        isRequired={false}
                        placeholder={t("SubPlot")}
                    />
                    <Error errorName={errors?.registrationDetails?.subPlot} />
                </div>
            </div>

            {/* Land */}
            <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("Land")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("Land")}
                        name="registrationDetails.land"
                        type="text"
                        placeholder={t("Land")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.registrationDetails?.land} />
                </div>
            </div>

            {/* Plan */}
            <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("Plan")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("Plan")}
                        name="registrationDetails.plan"
                        type="text"
                        placeholder={t("Plan")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.registrationDetails?.plan} />
                </div>
            </div>

            {/* Contract */}
            <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("Contract")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("Contract")}
                        name="registrationDetails.contract"
                        type="text"
                        placeholder={t("Contract")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.registrationDetails?.contract} />
                </div>
            </div>

            {/* MortgageName */}
            <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("MortgageName")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("MortgageName")}
                        name="registrationDetails.mortgageName"
                        type="text"
                        placeholder={t("MortgageName")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.registrationDetails?.mortgageName} />
                </div>
            </div>

            {/* MortgageCompanyId */}
            <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("MortgageCompanyId")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("MortgageCompanyId")}
                        name="registrationDetails.mortgageCompanyId"
                        type="text"
                          placeholder={t("MortgageCompanyId")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.registrationDetails?.mortgageCompanyId} />
                </div>
            </div>

            {/* Office */}
            <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("Office")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("Office")}
                        name="registrationDetails.office"
                        type="text"
                        placeholder={t("Office")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.registrationDetails?.office} />
                </div>
            </div>

            {/* PlotArea */}
            <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("PlotArea")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("PlotArea")}
                        name="registrationDetails.plotArea"
                        type="text"
                        placeholder={t("PlotArea")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.registrationDetails?.plotArea} />
                </div>
            </div>

            {/* Right */}
            <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("Right")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("Right")}
                        name="registrationDetails.right"
                        type="text"
                        placeholder={t("Right")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.registrationDetails?.right} />
                </div>
            </div>

            {/* Parts */}
            <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("Parts")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("Parts")}
                        name="registrationDetails.parts"
                        type="text"
                        placeholder={t("Parts")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.registrationDetails?.parts} />
                </div>
            </div>

            {/* PropertyType */}
            <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("PropertyType")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("PropertyType")}
                        name="registrationDetails.propertyType"
                        type="text"
                        placeholder={t("PropertyType")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.registrationDetails?.propertyType} />
                </div>
            </div>

            {/* Street */}
            <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("Street")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("Street")}
                        name="registrationDetails.street"
                        type="text"
                        placeholder={t("Street")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.registrationDetails?.street} />
                </div>
            </div>

            {/* HouseNumber */}
            <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                <LabelArea label={t("HouseNumber")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("HouseNumber")}
                        name="registrationDetails.houseNumber"
                        type="text"
                        placeholder={t("HouseNumber")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.registrationDetails?.houseNumber} />
                </div>
            </div>

            {/* ApartmentNumber */}
            <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                <LabelArea label={t("ApartmentNumber")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("ApartmentNumber")}
                        name="registrationDetails.apartmentNumber"
                        type="text"
                        placeholder={t("ApartmentNumber")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.registrationDetails?.apartmentNumber} />
                </div>
            </div>

            {/* Floor */}
            <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                <LabelArea label={t("Floor")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("Floor")}
                        name="registrationDetails.floor"
                        type="text"
                        placeholder={t("Floor")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.registrationDetails?.floor} />
                </div>
            </div>

            {/* Direction */}
            <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                <LabelArea label={t("Direction")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("Direction")}
                        name="registrationDetails.direction"
                        type="text"
                        placeholder={t("Direction")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.registrationDetails?.direction} />
                </div>
            </div>

            {/* Entrance */}
            <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("Entrance")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("Entrance")}
                        name="registrationDetails.entrance"
                        type="text"
                        placeholder={t("Entrance")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.registrationDetails?.entrance} />
                </div>
            </div>

            {/* Unit */}
            <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("Unit")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("Unit")}
                        name="registrationDetails.unit"
                        type="text"
                        placeholder={t("Unit")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.registrationDetails?.unit} />
                </div>
            </div>

            {/* Settlement */}
            <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("Settlement")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("Settlement")}
                        name="registrationDetails.settlement"
                        type="text"
                        placeholder={t("Settlement")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.registrationDetails?.settlement} />
                </div>
            </div>

        </div>
    </CollapsibleSection>
</div>

{/* סקשן: Sellers */}
<div className="col-span-12">
    <CollapsibleSection
        title={t("Sellers")}
        icon={<MdEditNote size={24} className="mt-1" />}
        defaultfalse
    >
        <div className="flex flex-col gap-2 mt-2">
            {/* כפתור להוספה */}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => {
                        const current = watch("sellers") || [];
                        setValue("sellers", [...current, { sellerName: "", sellerIdType: "", sellerIdNumber: "", sellerAddress: "" }]);
                    }}
                    className="text-sm text-mainColor hover:underline whitespace-nowrap"
                >
                    + {t("AddSeller")}
                </button>
            </div>

            {/* מערך של מוכרים */}
            {(watch("sellers") || []).map((seller, index) => (
                <div key={index} className="grid grid-cols-12 gap-5 p-2 border rounded-md bg-gray-50 dark:bg-gray-800">
                    
                    {/* Seller Name */}
                    <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                        <LabelArea label={t("SellerName")} />
                        <div className="col-span-6">
                            <InputArea
                                register={register}
                                label={t("SellerName")}
                                name={`sellers[${index}].sellerName`}
                                type="text"
                                placeholder={t("SellerName")}
                                isRequired={false}
                            />
                            <Error errorName={errors?.sellers?.[index]?.sellerName} />
                        </div>
                    </div>

                    {/* Seller ID Type */}
                    <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                        <LabelArea label={t("SellerIdType")} />
                        <div className="col-span-6">
                            <InputArea
                                register={register}
                                label={t("SellerIdType")}
                                name={`sellers[${index}].sellerIdType`}
                                type="text"
                                placeholder={t("SellerIdType")}
                                isRequired={false}
                            />
                            <Error errorName={errors?.sellers?.[index]?.sellerIdType} />
                        </div>
                    </div>

                    {/* Seller ID Number */}
                    <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                        <LabelArea label={t("SellerIdNumber")} />
                        <div className="col-span-6">
                            <InputArea
                                register={register}
                                label={t("SellerIdNumber")}
                                name={`sellers[${index}].sellerIdNumber`}
                                type="number"
                                placeholder={t("SellerIdNumber")}
                                isRequired={false}
                            />
                            <Error errorName={errors?.sellers?.[index]?.sellerIdNumber} />
                        </div>
                    </div>

                    {/* Seller Address */}
                    <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                        <LabelArea label={t("SellerAddress")} />
                        <div className="col-span-6">
                            <InputArea
                                register={register}
                                label={t("SellerAddress")}
                                name={`sellers[${index}].sellerAddress`}
                                type="text"
                                placeholder={t("SellerAddress")}
                                isRequired={false}
                            />
                            <Error errorName={errors?.sellers?.[index]?.sellerAddress} />
                        </div>
                    </div>

                    {/* כפתור הסרה */}
                    <div className="col-span-12 flex justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                const current = watch("sellers") || [];
                                const next = current.filter((_, i) => i !== index);
                                setValue("sellers", next);
                            }}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-sm"
                            
                        >
                            {t("RemoveSeller")}
                        </button>
                    </div>

                </div>
            ))}
        </div>
    </CollapsibleSection>
</div>


{/* סקשן: Loans */}
<div className="col-span-12">
    <CollapsibleSection
        title={t("Loans")}
        icon={<MdEditNote size={24} className="mt-1" />}
        defaultfalse
    >
        <div className="flex flex-col gap-2 mt-2">
            {/* כפתור להוספה */}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => {
                        const current = watch("loans") || [];
                        setValue("loans", [...current, { 
                            loanAmount: "", 
                            loanChange: "", 
                            clause: "", 
                            loanPlan: "", 
                            loanMonths: "", 
                            loanInterestRate: "", 
                            adjustedLoan: "", 
                            realLoan: "", 
                            primeMargin: "", 
                            loanCreation: "", 
                            loanNumber: "", 
                            mortgageNumber: "" 
                        }]);
                    }}
                    className="text-sm text-mainColor hover:underline whitespace-nowrap"
                >
                    + {t("AddLoan")}
                </button>
            </div>

            {/* מערך של הלוואות */}
            {(watch("loans") || []).map((loan, index) => (
                <div key={index} className="grid grid-cols-12 gap-5 p-2 border rounded-md bg-gray-50 dark:bg-gray-800">

                    {/* Loan Amount */}
                    <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                        <LabelArea label={t("LoanAmount")} />
                        <div className="col-span-6">
                            <InputArea
                                register={register}
                                label={t("LoanAmount")}
                                name={`loans[${index}].loanAmount`}
                                type="number"
                                placeholder={t("LoanAmount")}
                                step={0.01}
                                isRequired={false}
                            />
                            <Error errorName={errors?.loans?.[index]?.loanAmount} />
                        </div>
                    </div>

                    {/* Loan Change */}
                    <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                        <LabelArea label={t("LoanChange")} />
                        <div className="col-span-6">
                            <InputArea
                                register={register}
                                label={t("LoanChange")}
                                name={`loans[${index}].loanChange`}
                                type="text"
                                placeholder={t("LoanChange")}
                                isRequired={false}
                            />
                            <Error errorName={errors?.loans?.[index]?.loanChange} />
                        </div>
                    </div>

                    {/* Clause */}
                    <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                        <LabelArea label={t("Clause")} />
                        <div className="col-span-6">
                            <InputArea
                                register={register}
                                label={t("Clause")}
                                name={`loans[${index}].clause`}
                                type="text"
                                placeholder={t("Clause")}
                                isRequired={false}
                            />
                            <Error errorName={errors?.loans?.[index]?.clause} />
                        </div>
                    </div>

                    {/* Loan Plan */}
                    <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                        <LabelArea label={t("LoanPlan")} />
                        <div className="col-span-6">
                            <InputArea
                                register={register}
                                label={t("LoanPlan")}
                                name={`loans[${index}].loanPlan`}
                                type="text"
                                placeholder={t("LoanPlan")}
                                isRequired={false}
                            />
                            <Error errorName={errors?.loans?.[index]?.loanPlan} />
                        </div>
                    </div>

                    {/* Loan Months */}
                    <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                        <LabelArea label={t("LoanMonths")} />
                        <div className="col-span-6">
                            <InputArea
                                register={register}
                                label={t("LoanMonths")}
                                name={`loans[${index}].loanMonths`}
                                type="number"
                                placeholder={t("LoanMonths")}
                                isRequired={false}
                            />
                            <Error errorName={errors?.loans?.[index]?.loanMonths} />
                        </div>
                    </div>

                    {/* Loan Interest Rate */}
                    <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                        <LabelArea label={t("LoanInterestRate")} />
                        <div className="col-span-6">
                            <InputArea
                                register={register}
                                label={t("LoanInterestRate")}
                                name={`loans[${index}].loanInterestRate`}
                                type="number"
                                placeholder={t("LoanInterestRate")}
                                step={0.01}
                                isRequired={false}
                            />
                            <Error errorName={errors?.loans?.[index]?.loanInterestRate} />
                        </div>
                    </div>

                    {/* Adjusted Loan */}
                    <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                        <LabelArea label={t("AdjustedLoan")} />
                        <div className="col-span-6">
                            <InputArea
                                register={register}
                                label={t("AdjustedLoan")}
                                name={`loans[${index}].adjustedLoan`}
                                type="number"
                                placeholder={t("AdjustedLoan")}
                                step={0.01}
                                isRequired={false}
                            />
                            <Error errorName={errors?.loans?.[index]?.adjustedLoan} />
                        </div>
                    </div>

                    {/* Real Loan */}
                    <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                        <LabelArea label={t("RealLoan")} />
                        <div className="col-span-6">
                            <InputArea
                                register={register}
                                label={t("RealLoan")}
                                name={`loans[${index}].realLoan`}
                                type="number"
                                placeholder={t("RealLoan")}
                                step={0.01}
                                isRequired={false}
                            />
                            <Error errorName={errors?.loans?.[index]?.realLoan} />
                        </div>
                    </div>

                    {/* Prime Margin */}
                    <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                        <LabelArea label={t("PrimeMargin")} />
                        <div className="col-span-6">
                            <InputArea
                                register={register}
                                label={t("PrimeMargin")}
                                name={`loans[${index}].primeMargin`}
                                type="number"
                                placeholder={t("PrimeMargin")}
                                step={0.01}
                                isRequired={false}
                            />
                            <Error errorName={errors?.loans?.[index]?.primeMargin} />
                        </div>
                    </div>

                    {/* Loan Creation */}
                    <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                        <LabelArea label={t("LoanCreation")} />
                        <div className="col-span-6">
                            <InputArea
                                register={register}
                                label={t("LoanCreation")}
                                name={`loans[${index}].loanCreation`}
                                type="date"
                                placeholder={t("LoanCreation")}
                                isRequired={false}
                            />
                            <Error errorName={errors?.loans?.[index]?.loanCreation} />
                        </div>
                    </div>

                    {/* Loan Number */}
                    <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                        <LabelArea label={t("LoanNumber")} />
                        <div className="col-span-6">
                            <InputArea
                                register={register}
                                label={t("LoanNumber")}
                                name={`loans[${index}].loanNumber`}
                                type="text"
                                placeholder={t("LoanNumber")}
                                isRequired={false}
                            />
                            <Error errorName={errors?.loans?.[index]?.loanNumber} />
                        </div>
                    </div>

                    {/* Mortgage Number */}
                    <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                        <LabelArea label={t("MortgageNumber")} />
                        <div className="col-span-6">
                            <InputArea
                                register={register}
                                label={t("MortgageNumber")}
                                name={`loans[${index}].mortgageNumber`}
                                type="text"
                                placeholder={t("MortgageNumber")}
                                isRequired={false}
                            />
                            <Error errorName={errors?.loans?.[index]?.mortgageNumber} />
                        </div>
                    </div>

                    {/* כפתור הסרה */}
                    <div className="col-span-12 flex justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                const current = watch("loans") || [];
                                const next = current.filter((_, i) => i !== index);
                                setValue("loans", next);
                            }}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-sm"
                        >
                            {t("RemoveLoan")}
                        </button>
                    </div>

                </div>
            ))}
        </div>
    </CollapsibleSection>
</div>

{/* סקשן: Senior Creditor */}
<div className="col-span-12">
    <CollapsibleSection
        title={t("SeniorCreditor")}
        icon={<MdEditNote size={24} className="mt-1" />}
        defaultfalse
    >
        <div className="grid grid-cols-12 gap-5 mt-2">

            {/* Senior Creditor Name */}
            <div className="flex flex-col gap-1 md:col-span-4 col-span-12">
                <LabelArea label={t("SeniorCreditorName")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("SeniorCreditorName")}
                        name="seniorCreditor.seniorCreditorName"
                        type="text"
                        placeholder={t("SeniorCreditorName")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.seniorCreditor?.seniorCreditorName} />
                </div>
            </div>

            {/* Senior Creditor ID Type */}
            <div className="flex flex-col gap-1 md:col-span-4 col-span-12">
                <LabelArea label={t("SeniorCreditorIdType")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("SeniorCreditorIdType")}
                        name="seniorCreditor.seniorCreditorIdType"
                        type="text"
                        placeholder={t("SeniorCreditorIdType")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.seniorCreditor?.seniorCreditorIdType} />
                </div>
            </div>

            {/* Senior Creditor ID Number */}
            <div className="flex flex-col gap-1 md:col-span-4 col-span-12">
                <LabelArea label={t("SeniorCreditorIdNumber")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("SeniorCreditorIdNumber")}
                        name="seniorCreditor.seniorCreditorIdNumber"
                        type="number"
                        placeholder={t("SeniorCreditorIdNumber")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.seniorCreditor?.seniorCreditorIdNumber} />
                </div>
            </div>

        </div>
    </CollapsibleSection>
</div>

{/* סקשן: Borrower Bank Account */}
<div className="col-span-12">
    <CollapsibleSection
        title={t("BorrowerBankAccount")}
        icon={<MdEditNote size={24} className="mt-1" />}
        defaultfalse
    >
        <div className="grid grid-cols-12 gap-5 mt-2">

            {/* Borrower Account Number */}
            <div className="flex flex-col gap-1 md:col-span-4 col-span-12">
                <LabelArea label={t("BorrowerAccountNumber")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("BorrowerAccountNumber")}
                        name="borrowerBankAccount.borrowerAccountNumber"
                        type="number"
                        placeholder={t("BorrowerAccountNumber")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.borrowerBankAccount?.borrowerAccountNumber} />
                </div>
            </div>

            {/* Borrower Branch Code */}
            <div className="flex flex-col gap-1 md:col-span-4 col-span-12">
                <LabelArea label={t("BorrowerBranchCode")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("BorrowerBranchCode")}
                        name="borrowerBankAccount.borrowerBranchCode"
                        type="number"
                        placeholder={t("BorrowerBranchCode")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.borrowerBankAccount?.borrowerBranchCode} />
                </div>
            </div>

            {/* Borrower Bank Name */}
            <div className="flex flex-col gap-1 md:col-span-4 col-span-12">
                <LabelArea label={t("BorrowerBankName")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("BorrowerBankName")}
                        name="borrowerBankAccount.borrowerBankName"
                        type="text"
                        placeholder={t("BorrowerBankName")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.borrowerBankAccount?.borrowerBankName} />
                </div>
            </div>

        </div>
    </CollapsibleSection>
</div>

{/* סקשן: מורשים ומורשים מורשים (Authorized Person + Mortgagors) */}
<div className="col-span-12">
    <CollapsibleSection
        title={t("AuthorizedAndMortgagors")}
        icon={<MdEditNote size={24} className="mt-1" />}
        defaultfalse
    >
        <div className="flex flex-col gap-6 mt-2">

            {/* מערך: Authorized Persons */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <LabelArea label={t("AuthorizedPersons")} />
                    <button
                        type="button"
                        onClick={() => {
                            const current = watch("authorizedPerson") || [];
                            setValue("authorizedPerson", [
                                ...current,
                                { authorizedName: "", authorizedIdNumber: "" },
                            ]);
                        }}
                        className="text-sm text-mainColor hover:underline whitespace-nowrap"
                    >
                        + {t("AddAuthorizedPerson")}
                    </button>
                </div>

                {(watch("authorizedPerson") || []).map((person, index) => (
                    <div
                        key={index}
                        className="grid grid-cols-12 gap-5 p-2 border rounded-md bg-gray-50 dark:bg-gray-800"
                    >
                        {/* Name */}
                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                            <LabelArea label={t("AuthorizedName")} />
                            <InputArea
                                register={register}
                                label={t("AuthorizedName")}
                                name={`authorizedPerson[${index}].authorizedName`}
                                type="text"
                                placeholder={t("AuthorizedName")}
                                isRequired={false}
                            />
                            <Error
                                errorName={errors?.authorizedPerson?.[index]?.authorizedName}
                            />
                        </div>

                        {/* ID Number */}
                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                            <LabelArea label={t("AuthorizedIdNumber")} />
                            <InputArea
                                register={register}
                                label={t("AuthorizedIdNumber")}
                                name={`authorizedPerson[${index}].authorizedIdNumber`}
                                type="number"
                                placeholder={t("AuthorizedIdNumber")}
                                isRequired={false}
                            />
                            <Error
                                errorName={errors?.authorizedPerson?.[index]?.authorizedIdNumber}
                            />
                        </div>

                        {/* כפתור הסרה */}
                        <div className="col-span-12 flex justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    const current = watch("authorizedPerson") || [];
                                    setValue(
                                        "authorizedPerson",
                                        current.filter((_, i) => i !== index)
                                    );
                                }}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-sm"
                            >
                                {t("RemoveAuthorizedPerson")}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* מערך: Mortgagors */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <LabelArea label={t("Mortgagors")} />
                    <button
                        type="button"
                        onClick={() => {
                            const current = watch("mortgagors") || [];
                            setValue("mortgagors", [
                                ...current,
                                {
                                    mortgagorDetails: "",
                                    mortgagorFamily: "",
                                    mortgagorIdType: "",
                                    mortgagorIdNumber: "",
                                },
                            ]);
                        }}
                        className="text-sm text-mainColor hover:underline whitespace-nowrap"
                    >
                        + {t("AddMortgagor")}
                    </button>
                </div>

                {(watch("mortgagors") || []).map((mortgagor, index) => (
                    <div
                        key={index}
                        className="grid grid-cols-12 gap-5 p-2 border rounded-md bg-gray-50 dark:bg-gray-800"
                    >
                        {/* Details */}
                        <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                            <LabelArea label={t("MortgagorDetails")} />
                            <InputArea
                                register={register}
                                label={t("MortgagorDetails")}
                                name={`mortgagors[${index}].mortgagorDetails`}
                                type="text"
                                placeholder={t("MortgagorDetails")}
                                isRequired={false}
                            />
                            <Error
                                errorName={errors?.mortgagors?.[index]?.mortgagorDetails}
                            />
                        </div>

                        {/* Family */}
                        <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                            <LabelArea label={t("MortgagorFamily")} />
                            <InputArea
                                register={register}
                                label={t("MortgagorFamily")}
                                name={`mortgagors[${index}].mortgagorFamily`}
                                type="text"
                                placeholder={t("MortgagorFamily")}
                                isRequired={false}
                            />
                            <Error
                                errorName={errors?.mortgagors?.[index]?.mortgagorFamily}
                            />
                        </div>

                        {/* ID Type */}
                        <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                            <LabelArea label={t("MortgagorIdType")} />
                            <InputArea
                                register={register}
                                label={t("MortgagorIdType")}
                                name={`mortgagors[${index}].mortgagorIdType`}
                                type="text"
                                placeholder={t("MortgagorIdType")}
                                isRequired={false}
                            />
                            <Error
                                errorName={errors?.mortgagors?.[index]?.mortgagorIdType}
                            />
                        </div>

                        {/* ID Number */}
                        <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                            <LabelArea label={t("MortgagorIdNumber")} />
                            <InputArea
                                register={register}
                                label={t("MortgagorIdNumber")}
                                name={`mortgagors[${index}].mortgagorIdNumber`}
                                type="number"
                                placeholder={t("MortgagorIdNumber")}
                                isRequired={false}
                            />
                            <Error
                                errorName={errors?.mortgagors?.[index]?.mortgagorIdNumber}
                            />
                        </div>

                        {/* כפתור הסרה */}
                        <div className="col-span-12 flex justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    const current = watch("mortgagors") || [];
                                    setValue(
                                        "mortgagors",
                                        current.filter((_, i) => i !== index)
                                    );
                                }}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-sm"
                            >
                                {t("RemoveMortgagor")}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    </CollapsibleSection>
</div>

{/* סקשן: Project Details */}
<div className="col-span-12">
    <CollapsibleSection
        title={t("ProjectDetails")}
        icon={<MdEditNote size={24} className="mt-1" />}
        defaultfalse
    >
        <div className="grid grid-cols-12 gap-5 mt-2">

            {/* TAM Agreement Date */}
            <div className="flex flex-col gap-1 md:col-span-4 col-span-12">
                <LabelArea label={t("TamAgreementDate")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("TamAgreementDate")}
                        name="projectDetails.tamAgreementDate"
                        type="date"
                        placeholder={t("TamAgreementDate")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.projectDetails?.tamAgreementDate} />
                </div>
            </div>

            {/* Appraiser */}
            <div className="flex flex-col gap-1 md:col-span-4 col-span-12">
                <LabelArea label={t("Appraiser")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("Appraiser")}
                        name="projectDetails.appraiser"
                        type="text"
                        placeholder={t("Appraiser")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.projectDetails?.appraiser} />
                </div>
            </div>

            {/* Supervisor */}
            <div className="flex flex-col gap-1 md:col-span-4 col-span-12">
                <LabelArea label={t("Supervisor")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("Supervisor")}
                        name="projectDetails.supervisor"
                        type="text"
                        placeholder={t("Supervisor")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.projectDetails?.supervisor} />
                </div>
            </div>

            {/* Additional Floors */}
            <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                <LabelArea label={t("AdditionalFloors")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("AdditionalFloors")}
                        name="projectDetails.additionalFloors"
                        type="text"
                        placeholder={t("AdditionalFloors")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.projectDetails?.additionalFloors} />
                </div>
            </div>

            {/* Project Units */}
            <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                <LabelArea label={t("ProjectUnits")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("ProjectUnits")}
                        name="projectDetails.projectUnits"
                        type="text"
                        placeholder={t("ProjectUnits")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.projectDetails?.projectUnits} />
                </div>
            </div>

            {/* Transfer Fees */}
            <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                <LabelArea label={t("TransferFees")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("TransferFees")}
                        name="projectDetails.transferFees"
                        type="text"
                        placeholder={t("TransferFees")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.projectDetails?.transferFees} />
                </div>
            </div>

            {/* LTV */}
            <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                <LabelArea label={t("LTV")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("LTV")}
                        name="projectDetails.ltv"
                        type="text"
                        placeholder={t("LTV")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.projectDetails?.ltv} />
                </div>
            </div>

            {/* Project Value */}
            <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                <LabelArea label={t("ProjectValue")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("ProjectValue")}
                        name="projectDetails.projectValue"
                        type="text"
                            placeholder={t("ProjectValue")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.projectDetails?.projectValue} />
                </div>
            </div>

            {/* Minimum Withdrawal */}
            <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                <LabelArea label={t("MinimumWithdrawal")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("MinimumWithdrawal")}
                        name="projectDetails.minimumWithdrawal"
                        type="text"
                        placeholder={t("MinimumWithdrawal")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.projectDetails?.minimumWithdrawal} />
                </div>
            </div>

            {/* Contractor Name */}
            <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                <LabelArea label={t("ContractorName")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("ContractorName")}
                        name="projectDetails.contractorName"
                        type="text"
                        placeholder={t("ContractorName")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.projectDetails?.contractorName} />
                </div>
            </div>

            {/* Architect */}
            <div className="flex flex-col gap-1 md:col-span-3 col-span-12">
                <LabelArea label={t("Architect")} />
                <div className="col-span-6">
                    <InputArea
                        register={register}
                        label={t("Architect")}
                        name="projectDetails.architect"
                        type="text"
                        placeholder={t("Architect")}
                        isRequired={false}
                    />
                    <Error errorName={errors?.projectDetails?.architect} />
                </div>
            </div>

        </div>
    </CollapsibleSection>
</div>

                        </div>

     
                        <div className="px-3 py-2 border-t bg-gray-50 fixed bottom-0 left-0 right-0 z-50">

  <FormSubmitActions
    id={id}
    handleSubmit={handleSubmit}
    onSubmit={onSubmit}
    onCancel={() => closeDrawer()}
    isSubmitting={isSubmitting}
    createLabel="AddProduct"
    updateLabel="UpdateProduct"
  />
</div>

                    </form>
                    </CardBody>


</Card>
</div>
        </>
    );
};

export default ProductDrawer;