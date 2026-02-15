// src/components/drawer/SchoolDrawer.jsx
import React, { useContext } from "react";
import { Card, CardBody, Button } from "@windmill/react-ui";
import { t } from "i18next";
import { BiSolidSchool } from "react-icons/bi";
import { GrUserManager, GrUserWorker } from "react-icons/gr";
import { RiAdminLine } from "react-icons/ri";
import { MdEditNote } from "react-icons/md";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

// Internal import
import Error from "@/components/form/others/Error";
import Title from "@/components/form/others/Title";
import InputArea from "@/components/form/input/InputArea";
import DrawerButton from "@/components/form/button/DrawerButton";
import LabelArea from "@/components/form/selectOption/LabelArea";
import TextAreaCom from "@/components/form/input/TextAreaCom";
import { UserContext } from "@/context/UserContext";
import SelectWithOptions from "@/components/form/selectOption/SelectWithOptions";
import useSchoolSubmit from "@/hooks/useSchoolSubmit";
import CollapsibleSection from "@/components/common/CollapsibleSection";
import Uploader from "@/components/image-uploader/Uploader";

const SchoolDrawer = ({ id }) => {
    const { state: userState } = useContext(UserContext);
    const { userInfo } = userState;

    const {
        register,
        handleSubmit,
        onSubmit,
        errors,
        isSubmitting,
        manager,
        setManager,
        allAdmins,
        imageUrl,
        setImageUrl,
        classes,
        gradeOptions,
        gradeRange,
        setGradeRange,
        updateClassCount,
        watch,
        setValue,
    } = useSchoolSubmit(id);

    // יצירת marks עבור rc-slider - מוערת זמנית
    const marks = gradeOptions.reduce((acc, grade, index) => {
        acc[index] = grade.label;
        return acc;
    }, {});

    return (
        <>
            <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {id ? (
                    <Title
                        register={register}
                        title={t("UpdateSchool")}
                        description={t("UpdateSchooldescription")}
                    />
                ) : (
                    <Title
                        register={register}
                        title={t("AddSchoolTitle")}
                        description={t("AddSchooldescription")}
                    />
                )}
            </div>
            <Card className="overflow-y-auto flex-grow w-full max-h-full !border-none">
                <CardBody>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="px-6 pt-2 flex-grow scrollbar-hide w-full max-h-full pb-28 grid grid-cols-12 gap-5">

                            {/* פרטים בסיסיים */}
                            <div className="col-span-12">
                                <CollapsibleSection
                                    title={t("Basic Details")}
                                    icon={<BiSolidSchool size={20} className="mt-1" />}
                                    defaultOpen
                                >
                                    <div className="grid grid-cols-12 gap-5 mt-2">
                                        {/* תמונת בית הספר */}
                                        <div className="flex flex-col gap-1 col-span-12">
                                            <LabelArea label={t("SchoolImage")} />
                                            <div className="col-span-6">
                                                <Uploader
                                                    setImageUrl={setImageUrl}
                                                    imageUrl={imageUrl}
                                                    folder="guide-management-admin-schools"
                                                />
                                                <Error errorName={errors.image} />
                                            </div>
                                        </div>

                                        {/* שם בית הספר */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("SchoolName")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("SchoolName")}
                                                    name="name"
                                                    type="text"
                                                    placeholder={t("SchoolName")}
                                                />
                                                <Error errorName={errors.name} />
                                            </div>
                                        </div>

                                        {/* סמל בית הספר */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("SchoolSymbol")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("SchoolSymbol")}
                                                    name="symbol"
                                                    type="text"
                                                    placeholder={t("SchoolSymbol")}
                                                    isRequired={false}
                                                />
                                                <Error errorName={errors.symbol} />
                                            </div>
                                        </div>

                                        {/* מיקום */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("SchoolLocation")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("SchoolLocation")}
                                                    name="location"
                                                    type="text"
                                                    placeholder={t("SchoolLocation")}
                                                    isRequired={false}
                                                />
                                                <Error errorName={errors.location} />
                                            </div>
                                        </div>

                                        {/* מספר תלמידים */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("StudentsCount")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("StudentsCount")}
                                                    name="studentsCount"
                                                    type="number"
                                                    placeholder={t("StudentsCount")}
                                                    isRequired={false}
                                                    min={0}
                                                />
                                                <Error errorName={errors.studentsCount} />
                                            </div>
                                        </div>

                                        {/* מספר מורים */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("TeachersCount")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("TeachersCount")}
                                                    name="teachersCount"
                                                    type="number"
                                                    placeholder={t("TeachersCount")}
                                                    isRequired={false}
                                                    min={0}
                                                />
                                                <Error errorName={errors.teachersCount} />
                                            </div>
                                        </div>

                                        {/* סוג בית הספר */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("SchoolType")} />
                                            <div className="col-span-6">
                                                <SelectWithOptions
                                                    options={[
                                                        { value: "תיכון", label: t("SchoolTypeHighSchool") },
                                                        { value: "חטיבת ביניים", label: t("SchoolTypeMiddleSchool") },
                                                        { value: "יסודי", label: t("SchoolTypeElementary") }
                                                    ]}
                                                    value={watch("type") || "תיכון"}
                                                    onChange={(value) => setValue("type", value)}
                                                    placeholder={t("SchoolType")}
                                                    valueKey="value"
                                                    labelKey="label"
                                                    hideEmptyOption
                                                />
                                                <Error errorName={errors.type} />
                                            </div>
                                        </div>

                                        {/* נכלל בדיווח */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("IncludedInReport")} />
                                            <div className="col-span-6">
                                                <SelectWithOptions
                                                    options={[
                                                        { value: "true", label: t("IncludedInReportYes") },
                                                        { value: "false", label: t("IncludedInReportNo") }
                                                    ]}
                                                    value={watch("includedInReport") ? "true" : "false"}
                                                    onChange={(value) => setValue("includedInReport", value === "true")}
                                                    placeholder={t("IncludedInReport")}
                                                    valueKey="value"
                                                    labelKey="label"
                                                    hideEmptyOption
                                                />
                                                <Error errorName={errors.includedInReport} />
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            </div>

                            {/* פרטי המנהל */}
                            <div className="col-span-12">
                                <CollapsibleSection
                                    title={t("Principal Details")}
                                    icon={<GrUserManager size={20} className="mt-1" />}
                                    defaultOpen
                                >
                                    <div className="grid grid-cols-12 gap-5 mt-2">
                                        {/* שם המנהל */}
                                        <div className="flex flex-col gap-1 md:col-span-4 col-span-12">
                                            <LabelArea label={t("PrincipalName")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("PrincipalName")}
                                                    name="principal.name"
                                                    type="text"
                                                    placeholder={t("PrincipalName")}
                                                    isRequired={false}
                                                />
                                                <Error errorName={errors?.principal?.name} />
                                            </div>
                                        </div>

                                        {/* אימייל המנהל */}
                                        <div className="flex flex-col gap-1 md:col-span-4 col-span-12">
                                            <LabelArea label={t("PrincipalEmail")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("PrincipalEmail")}
                                                    name="principal.email"
                                                    type="email"
                                                    placeholder={t("PrincipalEmail")}
                                                    isRequired={false}
                                                />
                                                <Error errorName={errors?.principal?.email} />
                                            </div>
                                        </div>

                                        {/* טלפון המנהל */}
                                        <div className="flex flex-col gap-1 md:col-span-4 col-span-12">
                                            <LabelArea label={t("PrincipalPhone")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("PrincipalPhone")}
                                                    name="principal.phone"
                                                    type="tel"
                                                    placeholder={t("PrincipalPhone")}
                                                    isRequired={false}
                                                />
                                                <Error errorName={errors?.principal?.phone} />
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            </div>

                            {/* פרטי הרכז */}
                            <div className="col-span-12">
                                <CollapsibleSection
                                    title={t("Coordinator Details")}
                                    icon={<GrUserWorker size={20} className="mt-1" />}
                                    defaultOpen
                                >
                                    <div className="grid grid-cols-12 gap-5 mt-2">
                                        {/* שם הרכז */}
                                        <div className="flex flex-col gap-1 md:col-span-4 col-span-12">
                                            <LabelArea label={t("CoordinatorName")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("CoordinatorName")}
                                                    name="coordinator.name"
                                                    type="text"
                                                    placeholder={t("CoordinatorName")}
                                                    isRequired={false}
                                                />
                                                <Error errorName={errors?.coordinator?.name} />
                                            </div>
                                        </div>

                                        {/* אימייל הרכז */}
                                        <div className="flex flex-col gap-1 md:col-span-4 col-span-12">
                                            <LabelArea label={t("CoordinatorEmail")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("CoordinatorEmail")}
                                                    name="coordinator.email"
                                                    type="email"
                                                    placeholder={t("CoordinatorEmail")}
                                                    isRequired={false}
                                                />
                                                <Error errorName={errors?.coordinator?.email} />
                                            </div>
                                        </div>

                                        {/* טלפון הרכז */}
                                        <div className="flex flex-col gap-1 md:col-span-4 col-span-12">
                                            <LabelArea label={t("CoordinatorPhone")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("CoordinatorPhone")}
                                                    name="coordinator.phone"
                                                    type="tel"
                                                    placeholder={t("CoordinatorPhone")}
                                                    isRequired={false}
                                                />
                                                <Error errorName={errors?.coordinator?.phone} />
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            </div>

                            {/* כיתות */}
                            <div className="col-span-12">
                                <CollapsibleSection
                                    title={t("SchoolClasses")}
                                    icon={<BiSolidSchool size={20} className="mt-1" />}
                                    defaultOpen
                                >
                                    <div className="grid grid-cols-12 gap-5 mt-2">
                                        <div className="col-span-12">
                                            {/* סליידר טווח שכבות */}
                                            <div className="mb-6">
                                                <LabelArea label={t("GradeRange")} />
                                                <div className="mt-4 px-4">
                                                    {/* הצגת הטווח הנוכחי */}
                                                    <div className="flex justify-between items-center mb-4">
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            {gradeOptions[gradeRange[0]]?.label}
                                                        </span>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                            {t("To")}
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            {gradeOptions[gradeRange[1]]?.label}
                                                        </span>
                                                    </div>

                                                    {/* RC-Slider Range */}
                                                    <div className="px-2">
                                                        <Slider
                                                            range
                                                            min={0}
                                                            max={gradeOptions.length - 1}
                                                            value={gradeRange}
                                                            onChange={setGradeRange}
                                                            marks={marks}
                                                            allowCross={false}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* רשימת כיתות */}
                                            {/* {classes.length > 0 && (
                                                <div className="space-y-4">
                                                    <LabelArea label={t("ClassesList")} />
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                        {classes.map((classItem, index) => (
                                                            <div key={index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                                                                <div className="text-center mb-3">
                                                                    <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                                        {t("Grade")} {classItem.name}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <LabelArea label={t("ClassesInGrade")} />
                                                                    <InputArea
                                                                        register={register}
                                                                        label=""
                                                                        name={`classes.${index}.classesInGrade`}
                                                                        type="number"
                                                                        placeholder="1"
                                                                        min={1}
                                                                        max={30}
                                                                        value={classItem.classesInGrade}
                                                                        onChange={(e) => updateClassCount(classItem.name, parseInt(e.target.value) || 1)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )} */}

                                            {classes.length === 0 && (
                                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                    {t("NoClassesSelected")}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            </div>

                            {/* הערות */}
                            <div className="col-span-12">
                                <CollapsibleSection
                                    title={t("SchoolNotes")}
                                    icon={<MdEditNote size={24} className="mt-1" />}
                                    defaultOpen
                                >
                                    <div className="grid grid-cols-12 gap-5 mt-2">
                                        <div className="flex flex-col gap-1 col-span-12">
                                            <LabelArea label={t("SchoolNotes")} />
                                            <div className="col-span-6">
                                                <TextAreaCom
                                                    register={register}
                                                    label={t("SchoolNotes")}
                                                    name="notes"
                                                    type="text"
                                                    placeholder={t("SchoolNotes")}
                                                    isRequired={false}
                                                />
                                                <Error errorName={errors.notes} />
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            </div>

                            {/* מנהל (רק לסופר אדמין) */}
                            {userInfo?.role === "super-admin" && (
                                <div className="col-span-12">
                                    <CollapsibleSection
                                        title={t("superAdminFields")}
                                        icon={<RiAdminLine size={20} className="mt-1" />}
                                    >
                                        <div className="grid grid-cols-12 gap-5 mt-2">
                                            <div className="flex flex-col gap-1 col-span-12">
                                                <LabelArea label={t("Manager")} />
                                                <div className="col-span-6">
                                                    <SelectWithOptions
                                                        options={allAdmins}
                                                        value={manager}
                                                        onChange={setManager}
                                                        placeholder={t("selectManager")}
                                                        valueKey="_id"
                                                        labelKey="name"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CollapsibleSection>
                                </div>
                            )}
                        </div>

                        <DrawerButton id={id} title={t("School")} isSubmitting={isSubmitting} />
                    </form>
                </CardBody>
            </Card>
        </>
    );
};

export default SchoolDrawer;