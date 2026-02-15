// src/components/drawer/EventDrawer.jsx
import React from "react";
import { Card, CardBody } from "@windmill/react-ui";
import { t } from "i18next";

// Internal import
import Error from "@/components/form/others/Error";
import Title from "@/components/form/others/Title";
import InputArea from "@/components/form/input/InputArea";
import useEventSubmit from "@/hooks/useEventSubmit";
import DrawerButton from "@/components/form/button/DrawerButton";
import LabelArea from "@/components/form/selectOption/LabelArea";
import SelectWithOptions from "@/components/form/selectOption/SelectWithOptions";
import CollapsibleSection from "@/components/common/CollapsibleSection";
import { MdOutlineBookmarks, MdColorLens } from "react-icons/md";

const EventDrawer = ({ id }) => {
    const {
        register,
        handleSubmit,
        onSubmit,
        errors,
        isSubmitting,
        setValue,
        watch,
        selectedSchool,
        color,
        handleSchoolChange,
        allSchools,
    } = useEventSubmit(id);

    return (
        <>
            <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {id ? (
                    <Title
                        register={register}
                        title={t("UpdateEvent")}
                        description={t("UpdateEventdescription")}
                    />
                ) : (
                    <Title
                        register={register}
                        title={t("AddEventTitle")}
                        description={t("AddEventdescription")}
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
                                        {/* כותרת האירוע */}
                                        <div className="flex flex-col gap-1 col-span-12">
                                            <LabelArea label={t("EventTitle")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("EventTitle")}
                                                    name="title"
                                                    type="text"
                                                    placeholder={t("EventTitle")}
                                                />
                                                <Error errorName={errors.title} />
                                            </div>
                                        </div>

                                        {/* בית ספר */}
                                        <div className="flex flex-col gap-1 col-span-12">
                                            <LabelArea label={t("EventSchool")} />
                                            <div className="col-span-6">
                                                <SelectWithOptions
                                                    options={allSchools}
                                                    value={selectedSchool}
                                                    onChange={handleSchoolChange}
                                                    placeholder={t("selectSchool")}
                                                    valueKey="_id"
                                                    labelKey="name"
                                                />
                                                <Error errorName={errors.school} />
                                            </div>
                                        </div>

                                        {/* צבע האירוע */}
                                        <div className="flex flex-col gap-1 col-span-12">
                                            <LabelArea label={t("EventColor")} />
                                            <div className="col-span-6">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="color"
                                                        value={color || "#ffffff"}
                                                        onChange={(e) => setValue("color", e.target.value)}
                                                        className="h-10 w-full cursor-pointer rounded border border-gray-300 dark:border-gray-600"
                                                    />
                                                </div>
                                                <Error errorName={errors.color} />
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            </div>
                        </div>

                        <DrawerButton id={id} title={t("Event")} isSubmitting={isSubmitting} />
                    </form>
                </CardBody>
            </Card>
        </>
    );
};

export default EventDrawer;
