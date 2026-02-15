// src/components/drawer/SubjectDrawer.jsx
import React from "react";
import { Card, CardBody } from "@windmill/react-ui";
import { t } from "i18next";

// Internal import
import Error from "@/components/form/others/Error";
import Title from "@/components/form/others/Title";
import InputArea from "@/components/form/input/InputArea";
import useSubjectSubmit from "@/hooks/useSubjectSubmit";
import DrawerButton from "@/components/form/button/DrawerButton";
import LabelArea from "@/components/form/selectOption/LabelArea";
import TextAreaCom from "@/components/form/input/TextAreaCom";
import CollapsibleSection from "@/components/common/CollapsibleSection";
import { MdOutlineBookmarks } from "react-icons/md";

const SubjectDrawer = ({ id }) => {
    const {
        register,
        handleSubmit,
        onSubmit,
        errors,
        isSubmitting,
    } = useSubjectSubmit(id);

    return (
        <>
            <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {id ? (
                    <Title
                        register={register}
                        title={t("UpdateSubject")}
                        description={t("UpdateSubjectdescription")}
                    />
                ) : (
                    <Title
                        register={register}
                        title={t("AddSubjectTitle")}
                        description={t("AddSubjectdescription")}
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
                                    icon={<MdOutlineBookmarks size={20} className="mt-1" />}
                                    defaultOpen
                                >
                                    <div className="grid grid-cols-12 gap-5 mt-2">
                                        {/* כותרת הנושא */}
                                        <div className="flex flex-col gap-1 col-span-12">
                                            <LabelArea label={t("SubjectTitle")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("SubjectTitle")}
                                                    name="title"
                                                    type="text"
                                                    placeholder={t("SubjectTitle")}
                                                />
                                                <Error errorName={errors.title} />
                                            </div>
                                        </div>

                                        {/* תיאור */}
                                        <div className="flex flex-col gap-1 col-span-12">
                                            <LabelArea label={t("SubjectDescription")} />
                                            <div className="col-span-6">
                                                <TextAreaCom
                                                    register={register}
                                                    label={t("SubjectDescription")}
                                                    name="description"
                                                    type="text"
                                                    placeholder={t("SubjectDescription")}
                                                    isRequired={false}
                                                />
                                                <Error errorName={errors.description} />
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            </div>
                        </div>

                        <DrawerButton id={id} title={t("Subject")} isSubmitting={isSubmitting} />
                    </form>
                </CardBody>
            </Card>
        </>
    );
};

export default SubjectDrawer;
