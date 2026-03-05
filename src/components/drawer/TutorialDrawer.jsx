// src/components/drawer/TutorialDrawer.jsx
import React from "react";
import { Card, CardBody } from "@windmill/react-ui";
import { t } from "i18next";
import { MdOndemandVideo } from "react-icons/md";
import { BiSolidDetail } from "react-icons/bi";
import { useWatch } from "react-hook-form";

import Error from "@/components/form/others/Error";
import Title from "@/components/form/others/Title";
import InputArea from "@/components/form/input/InputArea";
import LabelArea from "@/components/form/selectOption/LabelArea";
import DrawerButton from "@/components/form/button/DrawerButton";
import CollapsibleSection from "@/components/common/CollapsibleSection";
import useTutorialSubmit from "@/hooks/useTutorialSubmit";
import YouTubeVideoPreview from "@/components/product/YouTubeVideoPreview";

const TutorialDrawer = ({ id }) => {
    const { register, handleSubmit, onSubmit, errors, isSubmitting, control } = useTutorialSubmit(id);
    const videoUrl = useWatch({ control, name: "videoUrl", defaultValue: "" });

    return (
        <>
            <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {id ? (
                    <Title
                        register={register}
                        title={t("UpdateTutorial")}
                        description={t("UpdateTutorialDescription")}
                    />
                ) : (
                    <Title
                        register={register}
                        title={t("AddTutorialTitle")}
                        description={t("AddTutorialDescription")}
                    />
                )}
            </div>
            <Card className="overflow-y-auto flex-grow w-full max-h-full !border-none">
                <CardBody>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="px-6 pt-2 flex-grow scrollbar-hide w-full max-h-full pb-28 grid grid-cols-12 gap-5">

                            {/* פרטי המדריך */}
                            <div className="col-span-12">
                                <CollapsibleSection
                                    title={t("TutorialDetails")}
                                    icon={<BiSolidDetail size={20} className="mt-1" />}
                                    defaultOpen
                                >
                                    <div className="grid grid-cols-12 gap-5 mt-2">

                                        <div className="flex flex-col gap-1 col-span-12">
                                            <LabelArea label={t("TutorialTitle")} />
                                            <InputArea
                                                register={register}
                                                label={t("TutorialTitle")}
                                                name="title"
                                                type="text"
                                                placeholder={t("TutorialTitlePlaceholder")}
                                            />
                                            <Error errorName={errors.title} />
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            </div>

                            {/* סרטון */}
                            <div className="col-span-12">
                                <CollapsibleSection
                                    title={t("TutorialVideo")}
                                    icon={<MdOndemandVideo size={22} className="mt-1" />}
                                    defaultOpen
                                >
                                    <div className="grid grid-cols-12 gap-5 mt-2">
                                        <div className="flex flex-col gap-1 col-span-12">
                                            <LabelArea label={t("TutorialVideoUrl")} />
                                            <InputArea
                                                register={register}
                                                label={t("TutorialVideoUrl")}
                                                name="videoUrl"
                                                type="url"
                                                placeholder={t("TutorialVideoUrlPlaceholder")}
                                                isRequired={false}
                                            />
                                            <Error errorName={errors.videoUrl} />
                                        </div>

                                        {videoUrl && (
                                            <div className="col-span-12">
                                                <YouTubeVideoPreview url={videoUrl} />
                                            </div>
                                        )}
                                    </div>
                                </CollapsibleSection>
                            </div>
                        </div>

                        <DrawerButton id={id} title={t("Tutorial")} isSubmitting={isSubmitting} />
                    </form>
                </CardBody>
            </Card>
        </>
    );
};

export default TutorialDrawer;
