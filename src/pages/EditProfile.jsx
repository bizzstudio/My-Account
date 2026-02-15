// src/pages/EditProfile.jsx
import React, { useContext } from "react";
import { Button } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";

// Internal import
import { UserContext } from "@/context/UserContext";
import useUserSubmit from "@/hooks/useUserSubmit";
import PageTitle from "@/components/common/PageTitle";
import LabelArea from "@/components/form/selectOption/LabelArea";
import Uploader from "@/components/image-uploader/Uploader";
import InputArea from "@/components/form/input/InputArea";
import Error from "@/components/form/others/Error";
import SelectWithOptions from "@/components/form/selectOption/SelectWithOptions";

const EditProfile = () => {
  const { t } = useTranslation();
  const {
    state: { userInfo },
  } = useContext(UserContext);

  const {
    register,
    handleSubmit,
    onSubmit,
    errors,
    setValue,
    watch,
  } = useUserSubmit(userInfo._id);

  return (
    <>
      <PageTitle> {t("EditProfile")} </PageTitle>
      <div className="container p-6 mx-auto bg-white  dark:bg-gray-800 dark:text-gray-200 rounded-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 flex-grow scrollbar-hide w-full max-h-full">
            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label={t("ProfilePicture")} />
              <div className="col-span-8 sm:col-span-4">
                <Uploader
                  imageUrl={watch("image")}
                  setImageUrl={(value) => setValue("image", value)}
                  folder="customer"
                />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label={t("ProfileName")} />
              <div className="col-span-8 sm:col-span-4">
                <InputArea
                  register={register}
                  label="Name"
                  name="name"
                  type="text"
                  placeholder="Your Name"
                />
                <Error errorName={errors.name} />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label={t("ProfileEmail")} />
              <div className="col-span-8 sm:col-span-4">
                <InputArea
                  register={register}
                  label="Email"
                  name="email"
                  type="text"
                  placeholder="Email"
                />
                <Error errorName={errors.email} />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label={t("ProfileContactNumber")} />
              <div className="col-span-8 sm:col-span-4">
                <InputArea
                  register={register}
                  label="Contact Number"
                  name="phone"
                  type="text"
                  placeholder="Contact Number"
                />
                <Error errorName={errors.phone} />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label={t("ProfileYourRole")} />
              <div className="col-span-8 sm:col-span-4">
                <SelectWithOptions
                  options={[
                    { _id: "admin", name: t("Importer") },
                    { _id: "super-admin", name: t("Super Admin") },
                  ]}
                  value={watch("role")}
                  onChange={(value) => setValue("role", value)}
                  valueKey="_id"
                  labelKey="name"
                  hideEmptyOption={true}
                  className="border h-12 text-sm focus:outline-none block w-full bg-gray-100 dark:bg-gray-700 border-transparent focus:bg-white dark:focus:bg-gray-600 dark:focus:border-gray-600 dark:text-gray-300"
                  name="role"
                />
                <Error errorName={errors.role} />
              </div>
            </div>
          </div>

          <div className="flex flex-row-reverse pr-6 pb-6">
            <Button type="submit" className="h-12 px-6">
              {t("updateProfile")}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditProfile;
