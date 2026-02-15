// src/components/drawer/SessionReportDrawer.jsx
import React, { useContext } from "react";
import { Card, CardBody, WindmillContext } from "@windmill/react-ui";
import { t } from "i18next";

// Internal import
import Error from "@/components/form/others/Error";
import Title from "@/components/form/others/Title";
import InputArea from "@/components/form/input/InputArea";
import useSessionReportSubmit from "@/hooks/useSessionReportSubmit";
import DrawerButton from "@/components/form/button/DrawerButton";
import LabelArea from "@/components/form/selectOption/LabelArea";
import TextAreaCom from "@/components/form/input/TextAreaCom";
import { SidebarContext } from "@/context/SidebarContext";
import SelectWithOptions from "@/components/form/selectOption/SelectWithOptions";
import EventSelectWithCreate from "@/components/event/EventSelectWithCreate";
import QuickEventModal from "@/components/event/QuickEventModal";
import CollapsibleSection from "@/components/common/CollapsibleSection";
import { TbReport } from "react-icons/tb";
import { MdEditNote } from "react-icons/md";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { notifyWarning } from "@/utils/toast";
import { getReportTypeColor } from "@/utils/reportTypeColors";

const SessionReportDrawer = ({ id }) => {
    const { guides } = useContext(SidebarContext);
    const { mode } = useContext(WindmillContext);
    const isDarkMode = mode === "dark";

    const {
        register,
        handleSubmit,
        onSubmit,
        errors,
        isSubmitting,
        selectedGuide,
        selectedSchool,
        selectedSubject,
        selectedEvent,
        selectedClass,
        selectedParticipants,
        setValue,
        availableSchools,
        availableSubjects,
        availableClasses,
        isQuickEventModalOpen,
        isCreatingEvent,
        // quickEventColor, // הוסר - צבעים לא בשימוש
        handleQuickEventModalOpen,
        handleQuickEventModalClose,
        handleQuickEventSubmit,
        allEvents,
        registerQuickEvent,
        handleSubmitQuickEvent,
        errorsQuickEvent,
        setValueQuickEvent,
    } = useSessionReportSubmit(id);

    // פונקציות להתראה על בחירת מנחה
    const handleSchoolSelectClick = () => {
        if (!selectedGuide) {
            notifyWarning(t("PleaseSelectGuideFirst"));
        }
    };

    const handleSubjectSelectClick = () => {
        if (!selectedGuide) {
            notifyWarning(t("PleaseSelectGuideFirst"));
        }
    };

    const handleClassSelectClick = () => {
        if (!selectedSchool) {
            notifyWarning(t("PleaseSelectSchoolFirst"));
        }
    };

    return (
        <>
            <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {id ? (
                    <Title
                        register={register}
                        title={t("UpdateSessionReport")}
                        description={t("UpdateSessionReportdescription")}
                    />
                ) : (
                    <Title
                        register={register}
                        title={t("AddSessionReportTitle")}
                        description={t("AddSessionReportdescription")}
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
                                    icon={<TbReport size={20} className="mt-1" />}
                                    defaultOpen
                                >
                                    <div className="grid grid-cols-12 gap-5 mt-2">
                                        {/* מנחה */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("ReportGuide")} />
                                            <div className="col-span-6">
                                                <SelectWithOptions
                                                    options={guides?.filter(guide => guide.status === 'active') || []}
                                                    value={selectedGuide}
                                                    onChange={(value) => setValue("guide", value)}
                                                    placeholder={t("ReportGuide")}
                                                    valueKey="_id"
                                                    labelKey="name"
                                                />
                                                <Error errorName={errors.guide} />
                                            </div>
                                        </div>

                                        {/* תאריך */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("ReportDate")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("ReportDate")}
                                                    name="date"
                                                    type="date"
                                                    placeholder={t("ReportDate")}
                                                />
                                                <Error errorName={errors.date} />
                                            </div>
                                        </div>

                                        {/* שעת התחלה */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("StartTime")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("StartTime")}
                                                    name="startTime"
                                                    type="time"
                                                    placeholder={t("StartTime")}
                                                />
                                                <Error errorName={errors.startTime} />
                                            </div>
                                        </div>

                                        {/* שעת סיום */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("EndTime")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("EndTime")}
                                                    name="endTime"
                                                    type="time"
                                                    placeholder={t("EndTime")}
                                                />
                                                <Error errorName={errors.endTime} />
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            </div>

                            {/* פרטי השיעור */}
                            <div className="col-span-12">
                                <CollapsibleSection
                                    title={t("Session Details")}
                                    icon={<LiaChalkboardTeacherSolid size={24} className="mt-[3px]" />}
                                    defaultOpen
                                >
                                    <div className="grid grid-cols-12 gap-5 mt-2">
                                        {/* בית ספר */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("ReportSchool")} />
                                            <div className="col-span-6">
                                                <div onClick={handleSchoolSelectClick}>
                                                    <SelectWithOptions
                                                        options={availableSchools}
                                                        value={selectedSchool}
                                                        onChange={(value) => setValue("school", value)}
                                                        placeholder={t("ReportSchool")}
                                                        valueKey="_id"
                                                        labelKey="name"
                                                    />
                                                </div>
                                                <Error errorName={errors.school} />
                                            </div>
                                        </div>

                                        {/* כיתה */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("ReportClass")} />
                                            <div className="col-span-6">
                                                <div onClick={handleClassSelectClick}>
                                                    <SelectWithOptions
                                                        options={availableClasses}
                                                        value={selectedClass}
                                                        onChange={(value) => setValue("class", value)}
                                                        placeholder={t("ReportClass")}
                                                        valueKey="_id"
                                                        labelKey="name"
                                                    />
                                                </div>
                                                <Error errorName={errors.class} />
                                            </div>
                                        </div>

                                        {/* משתתפים */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("ReportParticipants")} />
                                            <div className="col-span-6">
                                                <SelectWithOptions
                                                    options={[
                                                        { _id: 'חברותאים', name: t("ParticipantsChavruta") },
                                                        { _id: 'מנהל וצוות ניהול', name: t("ParticipantsManagerAndTeam") },
                                                        { _id: 'השתלמות/מליאה', name: t("ParticipantsTraining") },
                                                        { _id: 'ליווי מורים', name: t("ParticipantsTeacherSupport") },
                                                        { _id: 'יישומי לכיתה', name: t("ParticipantsClassroomApplications") },
                                                        { _id: 'אירועי השיא', name: t("ParticipantsPeakEvents") },
                                                        { _id: 'הערות ונקודות למחשבה', name: t("ParticipantsNotesAndThoughts") },
                                                        { _id: 'אחר', name: t("ParticipantsOther") },
                                                    ]}
                                                    value={selectedParticipants}
                                                    onChange={(value) => setValue("participants", value)}
                                                    placeholder={t("SelectParticipants")}
                                                    valueKey="_id"
                                                    labelKey="name"
                                                    borderColor={selectedParticipants ? getReportTypeColor(selectedParticipants, !isDarkMode) : undefined}
                                                />
                                                <Error errorName={errors.participants} />
                                            </div>
                                        </div>

                                        {/* נושא - רק אם נבחר "חברותאים" */}
                                        {selectedParticipants === 'חברותאים' && (
                                            <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                                <LabelArea label={t("ReportSubject")} />
                                                <div className="col-span-6">
                                                    <div onClick={handleSubjectSelectClick}>
                                                        <SelectWithOptions
                                                            options={availableSubjects}
                                                            value={selectedSubject}
                                                            onChange={(value) => setValue("subject", value)}
                                                            placeholder={t("ReportSubject")}
                                                            valueKey="_id"
                                                            labelKey="title"
                                                        />
                                                    </div>
                                                    <Error errorName={errors.subject} />
                                                </div>
                                            </div>
                                        )}

                                        {/* אירוע - רק אם נבחר "אירועי השיא" */}
                                        {selectedParticipants === 'אירועי השיא' && (
                                            <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                                <LabelArea label={t("Event")} />
                                                <div className="col-span-6">
                                                    <EventSelectWithCreate
                                                        placeholder={t("Event")}
                                                        value={selectedEvent}
                                                        onChange={(value) => setValue("event", value)}
                                                        onCreateClick={handleQuickEventModalOpen}
                                                        schoolId={selectedSchool}
                                                        events={allEvents}
                                                    />
                                                    <Error errorName={errors.event} />
                                                </div>
                                            </div>
                                        )}

                                        {/* כמות משתתפים */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("ParticipantsAmount")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("ParticipantsAmount")}
                                                    name="participantsAmount"
                                                    type="number"
                                                    placeholder={t("ParticipantsAmount")}
                                                    min={0}
                                                    isRequired={false}
                                                />
                                                <Error errorName={errors.participantsAmount} />
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            </div>

                            {/* תיאור ומשוב */}
                            <div className="col-span-12">
                                <CollapsibleSection
                                    title={t("Description & Feedback")}
                                    icon={<MdEditNote size={24} className="mt-1" />}
                                    defaultOpen
                                >
                                    <div className="grid grid-cols-12 gap-5 mt-2">
                                        {/* תיאור */}
                                        <div className="flex flex-col gap-1 col-span-12">
                                            <LabelArea label={t("ReportDescription")} />
                                            <div className="col-span-6">
                                                <TextAreaCom
                                                    register={register}
                                                    label={t("ReportDescription")}
                                                    name="description"
                                                    type="text"
                                                    placeholder={t("ReportDescriptionPlaceholder")}
                                                    isRequired
                                                />
                                                <Error errorName={errors.description} />
                                            </div>
                                        </div>

                                        {/* הערות / פידבקים */}
                                        <div className="flex flex-col gap-1 col-span-12">
                                            <LabelArea label={t("ReportFeedback")} />
                                            <div className="col-span-6">
                                                <TextAreaCom
                                                    register={register}
                                                    label={t("ReportFeedback")}
                                                    name="feedback"
                                                    type="text"
                                                    placeholder={t("ReportFeedbackPlaceholder")}
                                                    isRequired={false}
                                                />
                                                <Error errorName={errors.feedback} />
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            </div>
                        </div>

                        <DrawerButton id={id} title={t("SessionReport")} isSubmitting={isSubmitting} />
                    </form>
                </CardBody>
            </Card>

            {/* Quick Event Modal */}
            <QuickEventModal
                isOpen={isQuickEventModalOpen}
                onClose={handleQuickEventModalClose}
                onSubmit={handleQuickEventSubmit}
                register={registerQuickEvent}
                handleSubmit={handleSubmitQuickEvent}
                errors={errorsQuickEvent}
                isSubmitting={isCreatingEvent}
                setValue={setValueQuickEvent}
                // color={quickEventColor} // הוסר - צבעים לא בשימוש
            />
        </>
    );
};

export default SessionReportDrawer;