import React, { useContext } from "react";
import noResult from "@/assets/img/no-result.png";
import { WindmillContext } from "@windmill/react-ui";
import { t } from "i18next";

const NotFound = ({ title }) => {
  const { mode } = useContext(WindmillContext);

  return (
    <div className="text-center flex flex-col items-center align-middle mx-auto p-5 my-5">
      <h2 className="text-lg md:text-xl lg:text-2xl xl:text-2xl text-center mb-3 font-bold text-gray-700 dark:text-gray-500">
        {t(title)}
      </h2>
      <img className={`${mode === 'dark' ? 'opacity-20' : 'opacity-50'} my-4 select-none pointer-events-none`} src={noResult} alt="no-result" width="300" />
    </div>
  );
};

export default NotFound;
