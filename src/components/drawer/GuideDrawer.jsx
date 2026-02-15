// src/components/drawer/GuideDrawer.jsx
import React, { useContext } from "react";
import { Card, CardBody } from "@windmill/react-ui";
import { t } from "i18next";
import { RiAdminLine } from "react-icons/ri";
import { BiSolidSchool, BiSolidUserDetail } from "react-icons/bi";
import { MdEditNote } from "react-icons/md";

// Internal import
import Error from "@/components/form/others/Error";
import Title from "@/components/form/others/Title";
import InputArea from "@/components/form/input/InputArea";
import useGuideSubmit from "@/hooks/useGuideSubmit";
import DrawerButton from "@/components/form/button/DrawerButton";
import LabelArea from "@/components/form/selectOption/LabelArea";
import TextAreaCom from "@/components/form/input/TextAreaCom";
import { UserContext } from "@/context/UserContext";
import { SidebarContext } from "@/context/SidebarContext";
import SelectWithOptions from "@/components/form/selectOption/SelectWithOptions";
import Uploader from "@/components/image-uploader/Uploader";
import CollapsibleSection from "@/components/common/CollapsibleSection";
import SelectWithCheckbox from "@/components/form/SelectWithCheckbox";

const GuideDrawer = ({ id }) => {
    const { state: userState } = useContext(UserContext);
    const { userInfo } = userState;
    const { schools } = useContext(SidebarContext);

    const {
        register,
        handleSubmit,
        onSubmit,
        errors,
        isSubmitting,
        manager,
        setManager,
        allAdmins,
        selectedSchools,
        setSelectedSchools,
        imageUrl,
        setImageUrl,
    } = useGuideSubmit(id);

    return (
        <>
            <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {id ? (
                    <Title
                        register={register}
                        title={t("UpdateGuide")}
                        description={t("UpdateGuidedescription")}
                    />
                ) : (
                    <Title
                        register={register}
                        title={t("AddGuideTitle")}
                        description={t("AddGuidedescription")}
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
                                    icon={<BiSolidUserDetail size={20} className="mt-1" />}
                                    defaultOpen
                                >
                                    <div className="grid grid-cols-12 gap-5 mt-2">
                                        {/* תמונה */}
                                        <div className="flex flex-col gap-1 col-span-12">
                                            <LabelArea label={t("UserImage")} />
                                            <div className="col-span-6">
                                                <Uploader
                                                    imageUrl={imageUrl}
                                                    setImageUrl={setImageUrl}
                                                    folder="guides"
                                                />
                                            </div>
                                        </div>

                                        {/* שם המנחה */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("GuideName")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("GuideName")}
                                                    name="name"
                                                    type="text"
                                                    placeholder={t("GuideName")}
                                                />
                                                <Error errorName={errors.name} />
                                            </div>
                                        </div>

                                        {/* אימייל */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("GuideEmail")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("GuideEmail")}
                                                    name="email"
                                                    type="email"
                                                    placeholder={t("GuideEmail")}
                                                />
                                                <Error errorName={errors.email} />
                                            </div>
                                        </div>

                                        {/* טלפון */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("GuidePhone")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("GuidePhone")}
                                                    name="phone"
                                                    type="tel"
                                                    placeholder={t("GuidePhone")}
                                                />
                                                <Error errorName={errors.phone} />
                                            </div>
                                        </div>

                                        {/* סיסמה (רק לאדמין/סופר אדמין) */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("GuidePassword")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("GuidePassword")}
                                                    name="password"
                                                    type="password"
                                                    placeholder={t("GuidePassword")}
                                                    isRequired={false}
                                                />
                                                <Error errorName={errors.password} />
                                            </div>
                                        </div>

                                        {/* שעות חודשיות */}
                                        {/* <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("MonthlyHours")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("MonthlyHours")}
                                                    name="monthlyHours"
                                                    type="number"
                                                    placeholder={t("MonthlyHours")}
                                                    isRequired={false}
                                                />
                                                <Error errorName={errors.monthlyHours} />
                                            </div>
                                        </div> */}
                                    </div>
                                </CollapsibleSection>
                            </div>

                            {/* בתי ספר */}
                            <div className="col-span-12">
                                <CollapsibleSection
                                    title={t("GuideSchools")}
                                    icon={<BiSolidSchool size={20} className="mt-1" />}
                                    defaultOpen
                                >
                                    <div className="grid grid-cols-12 gap-5 mt-2">
                                        <div className="flex flex-col gap-1 col-span-12">
                                            <LabelArea label={t("GuideSchools")} />
                                            <div className="p-1">
                                                <SelectWithCheckbox
                                                    placeholder={t("GuideSchools")}
                                                    options={(() => {
                                                        // אם זה סופר אדמין ויש מנהל שנבחר, מציג רק בתי ספר של אותו מנהל
                                                        let filteredSchools = schools?.filter(school => school.status === 'active') || [];

                                                        if (userInfo?.role === "super-admin" && manager) {
                                                            filteredSchools = filteredSchools.filter(
                                                                school => school.manager?._id === manager
                                                            );
                                                        } else if (userInfo?.role !== "super-admin") {
                                                            // אם זה לא סופר אדמין, מציג רק את הבתי ספר שלו
                                                            filteredSchools = filteredSchools.filter(
                                                                school => school.manager?._id === userInfo?._id
                                                            );
                                                        }

                                                        return filteredSchools.map(school => ({
                                                            value: school._id,
                                                            label: school.name,
                                                            image: school.image || null
                                                        }));
                                                    })()}
                                                    value={(() => {
                                                        // מסנן את הערכים הנבחרים כך שרק אלה שזמינים באופציות יוצגו
                                                        let filteredSchools = schools?.filter(school => school.status === 'active') || [];

                                                        if (userInfo?.role === "super-admin" && manager) {
                                                            filteredSchools = filteredSchools.filter(
                                                                school => school.manager?._id === manager
                                                            );
                                                        } else if (userInfo?.role !== "super-admin") {
                                                            filteredSchools = filteredSchools.filter(
                                                                school => school.manager?._id === userInfo?._id
                                                            );
                                                        }

                                                        return schools
                                                            ?.filter(school =>
                                                                selectedSchools?.includes(school._id) &&
                                                                filteredSchools.some(fs => fs._id === school._id)
                                                            )
                                                            ?.map(school => ({
                                                                value: school._id,
                                                                label: school.name,
                                                                image: school.image || null
                                                            })) || [];
                                                    })()}
                                                    onChange={(selectedOptions) => {
                                                        const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
                                                        setSelectedSchools(values);
                                                    }}
                                                    images={true}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            </div>

                            {/* הערות */}
                            <div className="col-span-12">
                                <CollapsibleSection
                                    title={t("GuideNotes")}
                                    icon={<MdEditNote size={24} className="mt-1" />}
                                    defaultOpen
                                >
                                    <div className="grid grid-cols-12 gap-5 mt-2">
                                        <div className="flex flex-col gap-1 col-span-12">
                                            <LabelArea label={t("GuideNotes")} />
                                            <div className="col-span-6">
                                                <TextAreaCom
                                                    register={register}
                                                    label={t("GuideNotes")}
                                                    name="notes"
                                                    type="text"
                                                    placeholder={t("GuideNotes")}
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
                                            <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
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

                        <DrawerButton id={id} title={t("Guide")} isSubmitting={isSubmitting} />
                    </form>
                </CardBody>
            </Card>
        </>
    );
};

export default GuideDrawer;