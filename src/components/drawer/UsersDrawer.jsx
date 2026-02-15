import React, { useState } from "react";
import { Scrollbars } from "react-custom-scrollbars-2";
import { Card, CardBody, Input } from "@windmill/react-ui";
import ReactQuill from "react-quill-new";
import 'react-quill-new/dist/quill.snow.css';
import { t } from "i18next";

// Internal import
import Error from "@/components/form/others/Error";
import Title from "@/components/form/others/Title";
import InputArea from "@/components/form/input/InputArea";
import useUsersSubmit from "@/hooks/useUsersSubmit";
import SelectRole from "@/components/form/selectOption/SelectRole";
import DrawerButton from "@/components/form/button/DrawerButton";
import LabelArea from "@/components/form/selectOption/LabelArea";
import Uploader from "@/components/image-uploader/Uploader";

const UsersDrawer = ({ id }) => {
  const {
    register,
    handleSubmit,
    onSubmit,
    errors,
    imageUrl,
    setImageUrl,
    isSubmitting,
    status,
    watch,
    setValue,
  } = useUsersSubmit(id);

  const modules = {
    toolbar: {
      container: [
        [{ 'size': [] }],            // שינוי גופן וגודל טקסט (font + size)
        [{ 'header': [1, 2, 3, false] }],            // כותרות (H1, H2, H3) או טקסט רגיל
        ['bold', 'italic', 'underline', 'strike'],  // הדגשה, הטייה, קו תחתון, קו חוצה
        [{ 'color': [] }, { 'background': [] }],    // צבע טקסט וצבע רקע
        [{ 'script': 'sub' }, { 'script': 'super' }], // טקסט עילי (superscript) ותחתוני (subscript) – לדוגמה בנוסחאות
        [{ 'list': 'ordered' }, { 'list': 'bullet' }], // רשימה ממוספרת ורשימת תבליטים
        [{ 'indent': '-1' }, { 'indent': '+1' }],   // הזחת טקסט פנימה או החוצה
        [{ 'direction': 'rtl' }],                   // כיוון טקסט מימין לשמאל (לשפות כמו עברית/ערבית)
        [{ 'align': [] }],                          // יישור טקסט (שמאל, ימין, מרכז, צדדים)
        ['link'],                                   // הוספת קישור, תמונה או וידאו
        ['blockquote'],               // בלוק ציטוט (blockquote) או בלוק קוד (code block)
        ['clean']                                   // ניקוי כל העיצוב מהטקסט
      ],
    },
  };

  return (
    <>
      <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {id ? (
          <Title
            register={register}
            title={t("UpdateUsers")}
            description={t("UpdateUsersdescription")}
          />
        ) : (
          <Title
            register={register}
            title={t("AddUsersTitle")}
            description={t("AddUsersdescription")}
          />
        )}
      </div>
      <Card className="overflow-y-auto flex-grow w-full max-h-full !border-none">
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 pt-2 flex-grow scrollbar-hide w-full max-h-full pb-28 grid grid-cols-12 gap-5">
              {/* תמונה */}
              <div className="flex flex-col gap-1 col-span-12">
                <LabelArea label={t("Client Image")} />
                <div className="col-span-6">
                  <Uploader
                    imageUrl={imageUrl}
                    setImageUrl={setImageUrl}
                    folder='Client Images Arrilani'
                  />
                </div>
              </div>

              {/* שם פרטי */}
              <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("firstName")} />
                <div className="col-span-6">
                  <InputArea
                    register={register}
                    label={t("firstName")}
                    name="firstName"
                    type="text"
                    autoComplete="username"
                    placeholder={t("firstName")}
                  />
                  <Error errorName={errors.name} />
                </div>
              </div>

              {/* שם משפחה */}
              <div className="flex flex-col gap-1 md:col-span-6 col-span-12">
                <LabelArea label={t("lastName")} />
                <div className="col-span-6">
                  <InputArea
                    register={register}
                    label={t("lastName")}
                    name="lastName"
                    type="text"
                    autoComplete="username"
                    placeholder={t("lastName")}
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
                    type="text"
                    autoComplete="username"
                    pattern={
                      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
                    }
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
                    type="text"
                    placeholder={t("Contact Number")}
                  />
                  <Error errorName={errors.phone} />
                </div>
              </div>

              {/* הערות */}
              <div className="flex flex-col gap-1 col-span-12">
                <LabelArea label={t("Notes")} />
                <div className="col-span-6" dir="ltr">
                  <ReactQuill
                    value={watch("notes")}
                    onChange={value => setValue("notes", value)}
                    className="text-black dark:text-white"
                    theme="snow"
                    modules={modules}
                  />
                  <Error errorName={errors.notes} />
                </div>
              </div>
            </div>

            <DrawerButton id={id} title={t("user")} isSubmitting={isSubmitting} />
          </form>
        </CardBody>
      </Card>
    </>
  );
};

export default UsersDrawer;
