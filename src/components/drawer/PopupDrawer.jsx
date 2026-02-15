// src/components/drawer/PopupDrawer.jsx
import { Card, CardBody, Input } from "@windmill/react-ui";
import React from "react";
import { Modal } from "react-responsive-modal";
import { useTranslation } from "react-i18next";
import { FiX } from "react-icons/fi";
import ReactQuill from "react-quill-new";
import 'react-quill-new/dist/quill.snow.css';

// Internal import
import Title from "@/components/form/others/Title";
import Error from "@/components/form/others/Error";
import InputArea from "@/components/form/input/InputArea";
import DrawerButton from "@/components/form/button/DrawerButton";
import Uploader from "@/components/image-uploader/Uploader";
import SwitchToggle from "@/components/form/switch/SwitchToggle";
import usePopupSubmit from "@/hooks/usePopupSubmit";
import LabelArea from "../form/selectOption/LabelArea";
import CollapsibleSection from "@/components/common/CollapsibleSection";
import './PopupDrawer.css';
import { FaRegImage } from "react-icons/fa";
import { FaRegWindowRestore } from "react-icons/fa6";
import { MdLink, MdSettings } from "react-icons/md";

const PopupDrawer = ({ id, managerId = null }) => {
  const { t } = useTranslation();

  const {
    register,
    onSubmit,
    errors,
    openModal,
    imageUrl,
    setImageUrl,
    handleSubmit,
    onCloseModal,
    isSubmitting,
    handleSelectImage,
    isActive,
    setIsActive,
    hasLink,
    setHasLink,
    targetBlank,
    setTargetBlank,
    setValue,
    description,
    setDescription,
  } = usePopupSubmit(id, managerId);

  const handleDescriptionChange = (value) => {
    setDescription(value);
    setValue("description", value);
  };

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }], // Dropdown for text size
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],          // Ordered and unordered lists
        ['bold', 'italic', 'underline', 'strike'],              // Text formatting
        [{ 'color': [] }],                // Color and background
        [{ 'align': [] }],                                      // Alignment
        ['link'],                             // Link, image and video options
        [{ 'indent': '-1' }, { 'indent': '+1' }],               // Indent buttons
        [{ 'direction': 'rtl' }],                               // RTL support
      ],
    },
  };

  return (
    <>
      <Modal
        open={openModal}
        onClose={onCloseModal}
        center
        closeIcon={
          <div className="top-0 right-0 absolute border-0 text-red-500 active:outline-none text-xl">
            <FiX className="text-3xl" />
          </div>
        }
      >
        <div className="cursor-pointer">
          <Uploader
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            handleSelectImage={handleSelectImage}
            folder='popup'
          />
        </div>
      </Modal>

      <div className="relative border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6 border-b w-full dark:text-gray-300">
        {id ? (
          <Title
            register={register}
            title={t("UpdatePopup")}
            description={t("UpdatePopupDescription")}
          />
        ) : (
          <Title
            register={register}
            title={t("DrawerAddPopup")}
            description={t("AddPopupDescription")}
          />
        )}
      </div>

      <Card className="flex-grow w-full max-h-full overflow-y-auto">
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} id="block">
            <div className="flex-grow px-6 pt-8 pb-40 w-full max-h-full scrollbar-hide">
              <div className="gap-1 grid grid-cols-6 mb-6">

                {/* תמונה וגובה */}
                <div className="col-span-6">
                  <CollapsibleSection
                    title={t("Image & Size")}
                    icon={<FaRegImage size={21} className="mt-1" />}
                    defaultOpen
                  >
                    <div className="grid grid-cols-12 gap-5 mt-2">
                      <div className="flex flex-col gap-1 col-span-12">
                        <LabelArea label={t("PopupImage")} />
                        <div className="col-span-6">
                          <Uploader
                            imageUrl={imageUrl}
                            setImageUrl={setImageUrl}
                            handleSelectImage={handleSelectImage}
                            folder='popup'
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 col-span-12">
                        <LabelArea label={t("ImageHeight")} />
                        <div className="col-span-6">
                          <Input
                            {...register("imageHeight", {
                              required: imageUrl ? t("ImageHeightRequired") : false,
                            })}
                            name="imageHeight"
                            type="number"
                            placeholder={t("ImageHeight")}
                          />
                          <Error errorName={errors.imageHeight} />
                        </div>
                      </div>
                    </div>
                  </CollapsibleSection>
                </div>

                {/* פרטים בסיסיים */}
                <div className="col-span-6">
                  <CollapsibleSection
                    title={t("Popup Details")}
                    icon={<FaRegWindowRestore size={20} className="mt-1" />}
                    defaultOpen
                  >
                    <div className="grid grid-cols-12 gap-5 mt-2">
                      <div className="flex flex-col gap-1 col-span-12">
                        <LabelArea label={t("PopupTitle")} />
                        <div className="col-span-6">
                          <Input
                            {...register("title", {
                              required: t("TitleRequired"),
                            })}
                            name="title"
                            type="text"
                            placeholder={t("PopupTitle")}
                          />
                          <Error errorName={errors.title} />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 col-span-12">
                        <LabelArea label={t("PopupSubTitle")} />
                        <div className="col-span-6">
                          <InputArea
                            register={register}
                            required={false}
                            label={t("PopupSubTitle")}
                            name="subTitle"
                            type="text"
                            placeholder={t("PopupSubTitle")}
                          />
                          <Error errorName={errors.subTitle} />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 col-span-12">
                        <LabelArea label={t("PopupDescription")} />
                        <div className="col-span-6" dir="ltr">
                          <ReactQuill
                            value={description}
                            onChange={handleDescriptionChange}
                            className="text-black dark:text-white"
                            theme="snow"
                            modules={modules}
                          />
                          <Error errorName={errors.description} />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 col-span-12">
                        <LabelArea label={t("PopupPageToShow")} />
                        <div className="col-span-6">
                          <InputArea
                            register={register}
                            label={t("PopupPageToShow")}
                            name="pageToShow"
                            type="text"
                            placeholder={t("Paste link here")}
                          />
                          <Error errorName={errors.pageToShow} />
                        </div>
                      </div>

                      {/* <div className="flex flex-col gap-1 col-span-12">
                        <LabelArea label={t("PopupPublished")} />
                        <div className="col-span-6 mb-3">
                          <SwitchToggle
                            id="isActive"
                            handleProcess={(checked) => setIsActive(checked)}
                            processOption={isActive}
                          />
                          <Error errorName={errors.isActive} />
                        </div>
                      </div> */}
                    </div>
                  </CollapsibleSection>
                </div>

                {/* קישור */}
                <div className="col-span-6">
                  <CollapsibleSection
                    title={t("Link Settings")}
                    icon={<MdLink size={24} className="mt-1" />}
                    defaultOpen
                  >
                    <div className="grid grid-cols-12 gap-5 mt-2">
                      <div className="flex flex-col gap-1 col-span-12">
                        <LabelArea label={t("HasLink")} />
                        <div className="col-span-6 mb-3">
                          <SwitchToggle
                            id="hasLink"
                            handleProcess={(checked) => setHasLink(checked)}
                            processOption={hasLink}
                          />
                        </div>
                      </div>

                      {hasLink && (
                        <>
                          <div className="flex flex-col gap-1 col-span-12">
                            <div className="flex gap-5 col-span-12">
                              <div className="flex-grow">
                                <LabelArea label={t("PopupLink")} />
                                <Input
                                  className='mt-1'
                                  {...register("link", {
                                    required: hasLink ? t("LinkRequired") : false,
                                  })}
                                  label={t("PopupLink")}
                                  name="link"
                                  type="text"
                                  placeholder={t("PopupLink")}
                                />
                                <Error errorName={errors.link} />
                              </div>
                              <div className="flex-grow">
                                <LabelArea label={t("PopupLinkName")} />
                                <Input
                                  className='mt-1'
                                  {...register("linkName", {
                                    required: hasLink ? t("LinkRequired") : false,
                                  })}
                                  label={t("PopupLinkName")}
                                  name="linkName"
                                  type="text"
                                  placeholder={t("PopupLinkName")}
                                />
                                <Error errorName={errors.linkName} />
                              </div>

                              <div className="h-full">
                                <LabelArea label={t("OpenInNewTab")} className="whitespace-nowrap" />
                                <div className="flex justify-center my-3">
                                  <SwitchToggle
                                    id="targetBlank"
                                    handleProcess={(checked) => setTargetBlank(checked)}
                                    processOption={targetBlank}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CollapsibleSection>
                </div>
              </div>

              <DrawerButton id={id} title={t("Popup")} isSubmitting={isSubmitting} />
            </div>
          </form>
        </CardBody>
      </Card>
    </>
  );
};

export default React.memo(PopupDrawer);