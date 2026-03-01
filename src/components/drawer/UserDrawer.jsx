// src/components/drawer/UserDrawer.jsx
import React from "react";
import { Card, CardBody } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";

// Internal import
import Error from "@/components/form/others/Error";
import Title from "@/components/form/others/Title";
import InputArea from "@/components/form/input/InputArea";
import useUserSubmit from "@/hooks/useUserSubmit";
import SelectWithOptions from "@/components/form/selectOption/SelectWithOptions";
import DrawerButton from "@/components/form/button/DrawerButton";
import LabelArea from "@/components/form/selectOption/LabelArea";
import Uploader from "@/components/image-uploader/Uploader";

const UserDrawer = ({ id }) => {
  const {
    register,
    handleSubmit,
    onSubmit,
    errors,
    setValue,
    isSubmitting,
    watch,
  } = useUserSubmit(id);

  const { t } = useTranslation();

  return (
    <>
      <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {id ? (
          <Title
            register={register}
            title={t("UpdateUser")}
            description={t("UpdateUserdescription")}
          />
        ) : (
          <Title
            register={register}
            title={t("AddUserTitle")}
            description={t("AddUserdescription")}
          />
        )}
      </div>
      <Card className="overflow-y-auto flex-grow w-full max-h-full !border-none">
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 pt-2 flex-grow scrollbar-hide w-full max-h-full pb-28 grid grid-cols-12 gap-5">

              <div className="flex flex-col gap-1  col-span-12">
                <LabelArea label={t("UserImage")} />
                <div className="col-span-6">
                  <Uploader
                    imageUrl={watch("image")}
                    setImageUrl={(value) => setValue("image", value)}
                    folder="user"
                  />
                </div>

              </div>

              {/* שם מלא */}
              <div className="flex flex-col gap-1 col-span-12">
                <LabelArea label={t("FullName")} />
                <div className="col-span-6">
                  <InputArea
                    register={register}
                    label={t("FullName")}
                    name="name"
                    type="text"
                    autoComplete="username"
                    placeholder={t("FullName")}
                  />
                  <Error errorName={errors.name} />
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
                    autoComplete="username"
                    placeholder={t("Email")}
                  />
                  <Error errorName={errors.email} />
                </div>
              </div>

              {/* סיסמה */}
              <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("Password")} />
                <div className="col-span-6">
                  {id ? (
                    <InputArea
                      isRequired={false}
                      register={register}
                      label={t("Password")}
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder={t("Password")}
                    />
                  ) : (
                    <InputArea
                      register={register}
                      label={t("Password")}
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder={t("Password")}
                    />
                  )}

                  <Error errorName={errors.password} />
                </div>
              </div>

              {/* מספר טלפון */}
              <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("Contact Number")} />
                <div className="col-span-6">
                  <InputArea
                    register={register}
                    label={t("Contact Number")}
                    name="phone"
                    pattern={/^[+]?\d*$/}
                    minLength={6}
                    maxLength={15}
                    type="tel"
                    placeholder={t("Contact Number")}
                  />
                  <Error errorName={errors.phone} />
                </div>
              </div>

              {/* תפקיד */}
              <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("User Role")} />
                <div className="col-span-6">
                  <SelectWithOptions
                    options={[
                      { _id: "super-admin", name: t("Super Admin") },
                      { _id: "lawyer", name: t("Lawyer") },
                    ]}
                    value={watch("role")}
                    onChange={(value) => setValue("role", value)}
                    valueKey="_id"
                    labelKey="name"
                    hideEmptyOption={true}
                    className="border h-12 text-sm focus:outline-none block w-full bg-gray-100 dark:bg-gray-700 border-transparent focus:bg-white dark:focus:bg-gray-600 dark:focus:border-gray-600 dark:text-gray-300"
                    name="role"
                  />
                </div>
              </div>

              {/* תעודת זהות — חובה לעורכי דין, אופציונלי לשאר */}
              <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={`${t("LawyerIdNumber")} (${t("ForLawyersOnly")})`} />
                <div className="col-span-6">
                  <InputArea
                    register={register}
                    label={t("LawyerIdNumber")}
                    name="idNumber"
                    type="text"
                    placeholder={t("LawyerIdNumber")}
                    isRequired={false}
                  />
                  <Error errorName={errors.idNumber} />
                </div>
              </div>
            </div>

            <DrawerButton id={id} title={t("User")} isSubmitting={isSubmitting} />
          </form>
        </CardBody>
      </Card>
    </>
  );
};

export default UserDrawer;
