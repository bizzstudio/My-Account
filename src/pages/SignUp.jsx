import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Input, Label, Button } from "@windmill/react-ui";
import { ImFacebook, ImGoogle } from "react-icons/im";
import { useTranslation } from "react-i18next";

// Internal import
import Error from "@/components/form/others/Error";
import InputArea from "@/components/form/input/InputArea";
import LabelArea from "@/components/form/selectOption/LabelArea";
import SelectRole from "@/components/form/selectOption/SelectRole";
import useLoginSubmit from "@/hooks/useLoginSubmit";
import ImageLight from "@/assets/img/create-account-office.jpeg";
import ImageDark from "@/assets/img/create-account-office-dark.jpeg";

const SignUp = () => {
  const { t } = useTranslation();
  const { onSubmit, register, handleSubmit, errors, loading } =
    useLoginSubmit();

  const [role, setRole] = useState("admin");

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col w-full max-w-4xl bg-white rounded-lg shadow-md dark:bg-gray-800 overflow-hidden">
        {/* Hero Section - Images */}
        <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 relative overflow-hidden">
          <img
            aria-hidden="true"
            className="object-cover w-full h-full dark:hidden"
            src={ImageLight}
            alt="Office"
          />
          <img
            aria-hidden="true"
            className="hidden object-cover w-full h-full dark:block"
            src={ImageDark}
            alt="Office"
          />
        </div>
        
        {/* Form Section */}
        <main className="flex items-center justify-center p-6 sm:p-8 md:p-12">
          <div className="w-full max-w-md">
            <h1 className="mb-6 text-2xl sm:text-3xl font-semibold text-gray-700 dark:text-gray-200 text-center">
              {t("CreateAccount")}
            </h1>
            <form onSubmit={handleSubmit(onSubmit)}>
              <LabelArea label="Name" />
              <InputArea
                register={register}
                label="Name"
                name="name"
                type="text"
                placeholder="Admin"
              />
              <Error errorName={errors.name} />
              <LabelArea label="Email" />
              <InputArea
                register={register}
                label="Email"
                name="email"
                type="email"
                placeholder="john@doe.com"
              />
              <Error errorName={errors.email} />

              <LabelArea label="Password" />
              <InputArea
                register={register}
                label="Password"
                name="password"
                type="password"
                autocomplete="current-password"
                placeholder="***************"
              />
              <Error errorName={errors.password} />

              <LabelArea label="Admin Role" />
              <div className="col-span-8 sm:col-span-4">
                <SelectRole register={register} label="Role" name="role" setRole={setRole} role={role} />
                <Error errorName={errors.role} />
              </div>

              <Label className="mt-6" check>
                <Input type="checkbox" />
                <span className="ml-2">
                  {t("Iagree")}{" "}
                  <span className="underline">{t("privacyPolicy")}</span>
                </span>
              </Label>

              <Button
                disabled={loading}
                type="submit"
                className="mt-4 h-12 w-full"
                to="/dashboard"
                block
              >
                {t("CreateAccountTitle")}
              </Button>
            </form>

            <hr className="my-10" />

            <button
              disabled
              className="text-sm inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold font-serif text-center justify-center rounded-md focus:outline-none text-gray-700 bg-gray-100 shadow-sm my-2 md:px-2 lg:px-3 py-4 md:py-3.5 lg:py-4 hover:text-white hover:bg-mainColor-dark h-11 md:h-12 w-full"
            >
              <ImFacebook className="w-4 h-4 ml-2" />{" "}
              <span className="ml-2"> {t("LoginWithFacebook")} </span>
            </button>
            <button
              disabled
              className="text-sm inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold font-serif text-center justify-center rounded-md focus:outline-none text-gray-700 bg-gray-100 shadow-sm my-2 md:px-2 lg:px-3 py-4 md:py-3.5 lg:py-4 hover:text-white hover:bg-red-500 h-11 md:h-12 w-full"
            >
              <ImGoogle className="w-4 h-4 ml-2" />{" "}
              <span className="ml-2">{t("LoginWithGoogle")}</span>
            </button>

            <p className="mt-4 text-center">
              <Link
                className="text-sm font-medium text-mainColor dark:text-emerald-400 hover:underline"
                to="/login"
              >
                {t("AlreadyAccount")}
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SignUp;
