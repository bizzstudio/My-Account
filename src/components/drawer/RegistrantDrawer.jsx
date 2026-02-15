// src/components/drawer/RegistrantDrawer.jsx
import React, { useContext, useMemo } from "react";
import { Card, CardBody } from "@windmill/react-ui";
import { t } from "i18next";
import { BiSolidUserDetail } from "react-icons/bi";
import { MdEvent } from "react-icons/md";
import dayjs from "dayjs";

// Internal import
import Error from "@/components/form/others/Error";
import Title from "@/components/form/others/Title";
import InputArea from "@/components/form/input/InputArea";
import useRegistrantSubmit from "@/hooks/useRegistrantSubmit";
import DrawerButton from "@/components/form/button/DrawerButton";
import LabelArea from "@/components/form/selectOption/LabelArea";
import SelectWithOptions from "@/components/form/selectOption/SelectWithOptions";
import CollapsibleSection from "@/components/common/CollapsibleSection";
import { SidebarContext } from "@/context/SidebarContext";

const RegistrantDrawer = ({ id }) => {
    const { trainings } = useContext(SidebarContext);

    const {
        register,
        handleSubmit,
        onSubmit,
        errors,
        isSubmitting,
        selectedTrainings,
        setValue,
        clearErrors,
    } = useRegistrantSubmit(id);

    // מסנן רק הדרכות פעילות עתידיות ומקבץ לפי סוג
    const availableTrainingsByType = useMemo(() => {
        const now = new Date();
        const activeTrainings = trainings?.filter(t => {
            return t.status === 'active' && new Date(t.date) >= now;
        }) || [];

        const grouped = {
            'guardian-training': [],
            'info-meeting': [],
            'exposure-lecture': []
        };

        activeTrainings.forEach(training => {
            if (grouped[training.type]) {
                // Helper function to get training type label
                const getTrainingTypeLabel = (type) => {
                    const typeMap = {
                        'guardian-training': t('GuardianTraining'),
                        'info-meeting': t('InfoMeeting'),
                        'exposure-lecture': t('ExposureLecture')
                    };
                    return typeMap[type] || type;
                };

                // בניית תצוגה - מרצה, נושא/סוג וזמן
                const lecturerName = training.lecturer?.fullName || '';
                const dateTime = dayjs(training.date).format('DD/MM/YYYY HH:mm');
                
                let displayName;
                if (training.type === 'info-meeting') {
                    // פגישת מידע - רק סוג ההדרכה (ללא נושא)
                    const typeLabel = getTrainingTypeLabel(training.type);
                    displayName = lecturerName 
                        ? `${lecturerName} (${dateTime})`
                        : `${typeLabel} (${dateTime})`;
                } else {
                    // הדרכות אחרות - נושא ההדרכה
                    const topic = training.topic || '';
                    displayName = lecturerName 
                        ? topic 
                            ? `${lecturerName} - ${topic} (${dateTime})`
                            : `${lecturerName} (${dateTime})`
                        : topic 
                            ? `${topic} (${dateTime})`
                            : dateTime;
                }
                
                grouped[training.type].push({
                    ...training,
                    displayName
                });
            }
        });

        return grouped;
    }, [trainings]);

    return (
        <>
            <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {id ? (
                    <Title
                        register={register}
                        title={t("UpdateRegistrant")}
                        description={t("UpdateRegistrantdescription")}
                    />
                ) : (
                    <Title
                        register={register}
                        title={t("AddRegistrantTitle")}
                        description={t("AddRegistrantdescription")}
                    />
                )}
            </div>
            <Card className="overflow-y-auto flex-grow w-full max-h-full !border-none">
                <CardBody>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="px-6 pt-2 flex-grow scrollbar-hide w-full max-h-full pb-28 grid grid-cols-12 gap-5">

                            {/* פרטים אישיים */}
                            <div className="col-span-12">
                                <CollapsibleSection
                                    title={t("PersonalDetails")}
                                    icon={<BiSolidUserDetail size={20} className="mt-1" />}
                                    defaultOpen
                                >
                                    <div className="grid grid-cols-12 gap-5 mt-2">
                                        {/* שם פרטי */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("FirstName")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("FirstName")}
                                                    name="firstName"
                                                    type="text"
                                                    placeholder={t("FirstName")}
                                                />
                                                <Error errorName={errors.firstName} />
                                            </div>
                                        </div>

                                        {/* שם משפחה */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("LastName")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("LastName")}
                                                    name="lastName"
                                                    type="text"
                                                    placeholder={t("LastName")}
                                                />
                                                <Error errorName={errors.lastName} />
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
                                                />
                                                <Error errorName={errors.email} />
                                            </div>
                                        </div>

                                        {/* טלפון נייד */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("MobilePhone")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("MobilePhone")}
                                                    name="mobilePhone"
                                                    type="tel"
                                                    placeholder={t("MobilePhone")}
                                                />
                                                <Error errorName={errors.mobilePhone} />
                                            </div>
                                        </div>

                                        {/* קרבה לאפוטרופוס */}
                                        <div className="flex flex-col gap-1 col-span-12">
                                            <LabelArea label={t("RelationshipToGuardian")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("RelationshipToGuardian")}
                                                    name="relationshipToGuardian"
                                                    type="text"
                                                    placeholder={t("RelationshipToGuardianPlaceholder")}
                                                />
                                                <Error errorName={errors.relationshipToGuardian} />
                                            </div>
                                        </div>

                                        {/* מקבל החלטות - שם פרטי */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("DecisionMakerFirstName")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("DecisionMakerFirstName")}
                                                    name="decisionMakerFirstName"
                                                    type="text"
                                                    placeholder={t("DecisionMakerFirstName")}
                                                    isRequired={false}
                                                />
                                                <Error errorName={errors.decisionMakerFirstName} />
                                            </div>
                                        </div>

                                        {/* מקבל החלטות - שם משפחה */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("DecisionMakerLastName")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("DecisionMakerLastName")}
                                                    name="decisionMakerLastName"
                                                    type="text"
                                                    placeholder={t("DecisionMakerLastName")}
                                                    isRequired={false}
                                                />
                                                <Error errorName={errors.decisionMakerLastName} />
                                            </div>
                                        </div>

                                        {/* מקבל החלטות - אימייל */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("DecisionMakerEmail")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("DecisionMakerEmail")}
                                                    name="decisionMakerEmail"
                                                    type="email"
                                                    placeholder={t("DecisionMakerEmail")}
                                                    isRequired={false}
                                                />
                                                <Error errorName={errors.decisionMakerEmail} />
                                            </div>
                                        </div>

                                        {/* מקבל החלטות - טלפון */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("DecisionMakerPhone")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("DecisionMakerPhone")}
                                                    name="decisionMakerPhone"
                                                    type="tel"
                                                    placeholder={t("DecisionMakerPhone")}
                                                    isRequired={false}
                                                />
                                                <Error errorName={errors.decisionMakerPhone} />
                                            </div>
                                        </div>

                                        {/* תומך בקבלת החלטות - שם פרטי */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("DecisionSupporterFirstName")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("DecisionSupporterFirstName")}
                                                    name="decisionSupporterFirstName"
                                                    type="text"
                                                    placeholder={t("DecisionSupporterFirstName")}
                                                    isRequired={false}
                                                />
                                                <Error errorName={errors.decisionSupporterFirstName} />
                                            </div>
                                        </div>

                                        {/* תומך בקבלת החלטות - שם משפחה */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("DecisionSupporterLastName")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("DecisionSupporterLastName")}
                                                    name="decisionSupporterLastName"
                                                    type="text"
                                                    placeholder={t("DecisionSupporterLastName")}
                                                    isRequired={false}
                                                />
                                                <Error errorName={errors.decisionSupporterLastName} />
                                            </div>
                                        </div>

                                        {/* תומך בקבלת החלטות - אימייל */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("DecisionSupporterEmail")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("DecisionSupporterEmail")}
                                                    name="decisionSupporterEmail"
                                                    type="email"
                                                    placeholder={t("DecisionSupporterEmail")}
                                                    isRequired={false}
                                                />
                                                <Error errorName={errors.decisionSupporterEmail} />
                                            </div>
                                        </div>

                                        {/* תומך בקבלת החלטות - טלפון */}
                                        <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                                            <LabelArea label={t("DecisionSupporterPhone")} />
                                            <div className="col-span-6">
                                                <InputArea
                                                    register={register}
                                                    label={t("DecisionSupporterPhone")}
                                                    name="decisionSupporterPhone"
                                                    type="tel"
                                                    placeholder={t("DecisionSupporterPhone")}
                                                    isRequired={false}
                                                />
                                                <Error errorName={errors.decisionSupporterPhone} />
                                            </div>
                                        </div>

                                        {/* הערות */}
                                        <div className="flex flex-col gap-1 col-span-12">
                                            <LabelArea label={t("Notes")} />
                                            <div className="col-span-6">
                                                <textarea
                                                    {...register("notes")}
                                                    className="block w-full px-3 py-2 text-sm focus:outline-none dark:text-gray-300 leading-5 rounded-md focus:border-gray-200 border-gray-200 dark:border-gray-600 focus:ring focus:ring-green-300 dark:focus:border-gray-500 dark:focus:ring-gray-300 dark:bg-gray-700 border"
                                                    rows="3"
                                                    placeholder={t("NotesPlaceholder")}
                                                />
                                                <Error errorName={errors.notes} />
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            </div>

                            {/* הדרכות */}
                            <div className="col-span-12">
                                <CollapsibleSection
                                    title={t("TrainingSelection")}
                                    icon={<MdEvent size={20} className="mt-1" />}
                                    defaultOpen
                                >
                                    <div className="grid grid-cols-12 gap-5 mt-2">
                                        {/* הדרכת אפוטרופוסים */}
                                        <div className="flex flex-col gap-1 col-span-12">
                                            <LabelArea label={t("GuardianTraining")} />
                                            <div className="col-span-6">
                                                <SelectWithOptions
                                                    options={availableTrainingsByType['guardian-training']}
                                                    value={selectedTrainings['guardian-training'] || ""}
                                                    onChange={(value) => {
                                                        setValue('guardian-training', value);
                                                        clearErrors('trainings');
                                                    }}
                                                    placeholder={t("SelectTraining")}
                                                    valueKey="_id"
                                                    labelKey="displayName"
                                                />
                                            </div>
                                        </div>

                                        {/* פגישת מידע */}
                                        <div className="flex flex-col gap-1 col-span-12">
                                            <LabelArea label={t("InfoMeeting")} />
                                            <div className="col-span-6">
                                                <SelectWithOptions
                                                    options={availableTrainingsByType['info-meeting']}
                                                    value={selectedTrainings['info-meeting'] || ""}
                                                    onChange={(value) => {
                                                        setValue('info-meeting', value);
                                                        clearErrors('trainings');
                                                    }}
                                                    placeholder={t("SelectTraining")}
                                                    valueKey="_id"
                                                    labelKey="displayName"
                                                />
                                            </div>
                                        </div>

                                        {/* הרצאת חשיפה - רק באדמין */}
                                        <div className="flex flex-col gap-1 col-span-12">
                                            <LabelArea label={t("ExposureLecture")} />
                                            <div className="col-span-6">
                                                <SelectWithOptions
                                                    options={availableTrainingsByType['exposure-lecture']}
                                                    value={selectedTrainings['exposure-lecture'] || ""}
                                                    onChange={(value) => {
                                                        setValue('exposure-lecture', value);
                                                        clearErrors('trainings');
                                                    }}
                                                    placeholder={t("SelectTraining")}
                                                    valueKey="_id"
                                                    labelKey="displayName"
                                                />
                                            </div>
                                        </div>

                                        {errors.trainings && (
                                            <div className="col-span-12">
                                                <Error errorName={errors.trainings} />
                                            </div>
                                        )}
                                    </div>
                                </CollapsibleSection>
                            </div>
                        </div>

                        <DrawerButton id={id} title={t("Registrant")} isSubmitting={isSubmitting} />
                    </form>
                </CardBody>
            </Card>
        </>
    );
};

export default RegistrantDrawer;