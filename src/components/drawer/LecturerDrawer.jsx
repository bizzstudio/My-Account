// src/components/drawer/LecturerDrawer.jsx
import React from "react";
import { Card, CardBody, Select } from "@windmill/react-ui";
import { t } from "i18next";
import { BiSolidUserDetail } from "react-icons/bi";
import { BsBank2 } from "react-icons/bs";
import { MdTopic } from "react-icons/md";

// Internal import
import Error from "@/components/form/others/Error";
import Title from "@/components/form/others/Title";
import InputArea from "@/components/form/input/InputArea";
import useLecturerSubmit from "@/hooks/useLecturerSubmit";
import { isValidIsraeliID } from "@/utils/israeliId";
import DrawerButton from "@/components/form/button/DrawerButton";
import LabelArea from "@/components/form/selectOption/LabelArea";
import CollapsibleSection from "@/components/common/CollapsibleSection";
import ReactTagInput from "@pathofdev/react-tag-input";

const LecturerDrawer = ({ id }) => {
    const {
        register,
        handleSubmit,
        onSubmit,
        errors,
        isSubmitting,
        topics,
        setTopics,
    } = useLecturerSubmit(id);

    return (
        <>
            <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {id ? (
                    <Title
                        register={register}
                        title={t("UpdateLecturer")}
                        description={t("UpdateLecturerdescription")}
                    />
                ) : (
                    <Title
                        register={register}
                        title={t("AddLecturerTitle")}
                        description={t("AddLecturerdescription")}
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
                                        {/* שם מלא */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("LecturerName")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("LecturerName")}
                                                    name="fullName"
                                                    type="text"
                                                    placeholder={t("LecturerName")}
                                                />
                                                <Error errorName={errors.fullName} />
                                            </div>
                                        </div>

                                        {/* טלפון */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("LecturerPhone")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("LecturerPhone")}
                                                    name="phone"
                                                    type="tel"
                                                    placeholder={t("LecturerPhone")}
                                                />
                                                <Error errorName={errors.phone} />
                                            </div>
                                        </div>

                                        {/* תעודת זהות */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("LecturerIdNumber")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("LecturerIdNumber")}
                                                    name="idNumber"
                                                    type="text"
                                                    placeholder={t("LecturerIdNumber")}
                                                    validate={(v) => !v || String(v).trim() === "" || isValidIsraeliID(v) || t("InvalidIsraeliId")}
                                                />
                                                <Error errorName={errors.idNumber} />
                                            </div>
                                        </div>

                                        {/* אימייל */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("Email")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("Email")}
                                                    name="email"
                                                    type="email"
                                                    placeholder={t("Email")}
                                                    isRequired={false}
                                                />
                                                <Error errorName={errors.email} />
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            </div>

                            {/* נושאי הרצאה */}
                            <div className="col-span-12">
                                <CollapsibleSection
                                    title={t("LecturerTopics")}
                                    icon={<MdTopic size={20} className="mt-1" />}
                                    defaultOpen
                                >
                                    <div className="grid grid-cols-12 gap-5 mt-2">
                                        <div className="flex flex-col gap-1 col-span-12">
                                            <LabelArea label={t("Topics")} />
                                            <div className="p-1">
                                                <ReactTagInput
                                                    tags={topics}
                                                    onChange={(newTags) => {
                                                        setTopics(newTags);
                                                    }}
                                                    placeholder={t("AddTopicPlaceholder")}
                                                />
                                            </div>
                                        </div>

                                        {/* מצב מס */}
                                        <div className="flex flex-col gap-1 col-span-12">
                                            <LabelArea label={t("TaxStatus")} />
                                            <div className="col-span-6">
                                                <Select {...register("taxStatus")}>
                                                    <option value="">{t("SelectTaxStatus")}</option>
                                                    <option value="exempt">{t("TaxExempt")}</option>
                                                    <option value="authorized">{t("TaxAuthorized")}</option>
                                                </Select>
                                                <Error errorName={errors.taxStatus} />
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            </div>

                            {/* פרטי חשבון בנק */}
                            <div className="col-span-12">
                                <CollapsibleSection
                                    title={t("BankAccountDetails")}
                                    icon={<BsBank2 size={18} className="mt-1" />}
                                    defaultOpen
                                >
                                    <div className="grid grid-cols-12 gap-5 mt-2">
                                        {/* שם הבנק */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("BankName")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("BankName")}
                                                    name="bankAccount.bankName"
                                                    type="text"
                                                    placeholder={t("BankName")}
                                                    isRequired={false}
                                                />
                                                <Error errorName={errors.bankAccount?.bankName} />
                                            </div>
                                        </div>

                                        {/* מספר סניף */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("BranchNumber")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("BranchNumber")}
                                                    name="bankAccount.branchNumber"
                                                    type="text"
                                                    placeholder={t("BranchNumber")}
                                                    isRequired={false}
                                                />
                                                <Error errorName={errors.bankAccount?.branchNumber} />
                                            </div>
                                        </div>

                                        {/* מספר חשבון */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("AccountNumber")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("AccountNumber")}
                                                    name="bankAccount.accountNumber"
                                                    type="text"
                                                    placeholder={t("AccountNumber")}
                                                    isRequired={false}
                                                />
                                                <Error errorName={errors.bankAccount?.accountNumber} />
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            </div>
                        </div>

                        <DrawerButton id={id} title={t("Lecturer")} isSubmitting={isSubmitting} />
                    </form>
                </CardBody>
            </Card>
        </>
    );
};

export default LecturerDrawer;

