// src/components/drawer/TrainingDrawer.jsx
import React, { useContext } from "react";
import { Card, CardBody, Select, Input } from "@windmill/react-ui";
import { t } from "i18next";
import { BiSolidUserDetail } from "react-icons/bi";
import { FaChalkboardTeacher } from "react-icons/fa";

// Internal import
import Error from "@/components/form/others/Error";
import Title from "@/components/form/others/Title";
import InputArea from "@/components/form/input/InputArea";
import useTrainingSubmit from "@/hooks/useTrainingSubmit";
import DrawerButton from "@/components/form/button/DrawerButton";
import LabelArea from "@/components/form/selectOption/LabelArea";
import SelectWithOptions from "@/components/form/selectOption/SelectWithOptions";
import CollapsibleSection from "@/components/common/CollapsibleSection";
import { SidebarContext } from "@/context/SidebarContext";
import SwitchToggle from "@/components/form/switch/SwitchToggle";

const TrainingDrawer = ({ id }) => {
    const { lecturers } = useContext(SidebarContext);

    const {
        register,
        handleSubmit,
        onSubmit,
        errors,
        isSubmitting,
        lecturer,
        setLecturer,
        topic,
        setTopic,
        availableTopics,
        trainingType,
        isFrontal,
        setValue,
    } = useTrainingSubmit(id);

    // מסנן רק מרצים פעילים
    const activeLecturers = lecturers?.filter(l => l.status === 'active') || [];

    // מציאת המרצה הנבחר
    const selectedLecturer = activeLecturers.find(l => l._id === lecturer);

    return (
        <>
            <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {id ? (
                    <Title
                        register={register}
                        title={t("UpdateTraining")}
                        description={t("UpdateTrainingdescription")}
                    />
                ) : (
                    <Title
                        register={register}
                        title={t("AddTrainingTitle")}
                        description={t("AddTrainingdescription")}
                    />
                )}
            </div>
            <Card className="overflow-y-auto flex-grow w-full max-h-full !border-none">
                <CardBody>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="px-6 pt-2 flex-grow scrollbar-hide w-full max-h-full pb-28 grid grid-cols-12 gap-5">

                            {/* בחירת מרצה */}
                            <div className="col-span-12">
                                <CollapsibleSection
                                    title={t("LecturerSelection")}
                                    icon={<FaChalkboardTeacher size={18} className="mt-1" />}
                                    defaultOpen
                                >
                                    <div className="grid grid-cols-12 gap-5 mt-2">
                                        <div className="flex flex-col gap-1 col-span-12">
                                            <LabelArea label={t("Lecturer")} />
                                            <div className="col-span-6">
                                                <SelectWithOptions
                                                    options={activeLecturers}
                                                    value={lecturer}
                                                    onChange={setLecturer}
                                                    placeholder={t("SelectLecturer")}
                                                    valueKey="_id"
                                                    labelKey="fullName"
                                                />
                                                {!lecturer && errors.lecturer && (
                                                    <Error errorName={errors.lecturer} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            </div>

                            {/* פרטי ההדרכה */}
                            <div className="col-span-12">
                                <CollapsibleSection
                                    title={t("TrainingDetails")}
                                    icon={<BiSolidUserDetail size={20} className="mt-1" />}
                                    defaultOpen
                                >
                                    <div className="grid grid-cols-12 gap-5 mt-2">
                                        {/* סוג ההדרכה */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("TrainingType")} />
                                            <div className="col-span-6">
                                                <Select {...register("trainingType", { required: true })}>
                                                    <option value="">{t("SelectTrainingType")}</option>
                                                    <option value="guardian-training">{t("GuardianTraining")}</option>
                                                    <option value="info-meeting">{t("InfoMeeting")}</option>
                                                    <option value="exposure-lecture">{t("ExposureLecture")}</option>
                                                </Select>
                                                {errors.trainingType && (
                                                    <Error errorName={errors.trainingType} />
                                                )}
                                            </div>
                                        </div>

                                        {/* האם ההדרכה פרונטלית */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <div>
                                                <div className="font-semibold text-sm">
                                                    {t("IsFrontal")}
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    ({t("NoTimeOverlap")})
                                                </p>
                                            </div>
                                            <div className="w-fit">
                                                <SwitchToggle
                                                    id="isFrontal"
                                                    title=""
                                                    handleProcess={() => setValue("isFrontal", !isFrontal)}
                                                    processOption={Boolean(isFrontal)}
                                                />
                                            </div>
                                            <input
                                                type="hidden"
                                                {...register("isFrontal", { valueAsBoolean: true })}
                                            />
                                        </div>

                                        {/* נושא ההדרכה - רק אם נבחר מרצה ולא פגישת מידע */}
                                        {lecturer && selectedLecturer && trainingType && trainingType !== "info-meeting" && (
                                            <div className="flex flex-col gap-1 col-span-12">
                                                <LabelArea label={t("TrainingTopic")} />
                                                <div className="col-span-6">
                                                    <div className="relative">
                                                        <Input
                                                            type="text"
                                                            value={topic}
                                                            onChange={(e) => setTopic(e.target.value)}
                                                            placeholder={t("SelectTopic")}
                                                            list={`topic-suggestions-${lecturer}`}
                                                            className="py-2 px-4 md:px-5"
                                                        />
                                                        {availableTopics.length > 0 && (
                                                            <datalist id={`topic-suggestions-${lecturer}`}>
                                                                {availableTopics.map((topicText, index) => (
                                                                    <option key={index} value={topicText} />
                                                                ))}
                                                            </datalist>
                                                        )}
                                                    </div>
                                                    {!topic && errors.topic && (
                                                        <Error errorName={errors.topic} />
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* תאריך ושעה */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("TrainingDate")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("TrainingDate")}
                                                    name="date"
                                                    type="datetime-local"
                                                    placeholder={t("TrainingDate")}
                                                />
                                                <Error errorName={errors.date} />
                                            </div>
                                        </div>

                                        {/* משך ההדרכה (בדקות) */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("TrainingDurationMinutes")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("TrainingDurationMinutes")}
                                                    name="duration"
                                                    type="number"
                                                    placeholder={t("TrainingDurationMinutes")}
                                                    min={1}
                                                />
                                                <Error errorName={errors.duration} />
                                            </div>
                                        </div>

                                        {/* קישור להרצאה */}
                                        <div className="flex flex-col gap-1 col-span-12">
                                            <LabelArea label={t("TrainingLink")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("TrainingLink")}
                                                    name="link"
                                                    type="url"
                                                    placeholder={t("TrainingLinkPlaceholder")}
                                                    isRequired={false}
                                                />
                                                <Error errorName={errors.link} />
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            </div>
                        </div>

                        <DrawerButton id={id} title={t("Training")} isSubmitting={isSubmitting} />
                    </form>
                </CardBody>
            </Card>
        </>
    );
};

export default TrainingDrawer;
