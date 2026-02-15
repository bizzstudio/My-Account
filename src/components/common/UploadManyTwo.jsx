import { Button, Input } from "@windmill/react-ui";
import exportFromJSON from "export-from-json";
import { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BsFileEarmarkCode, BsFileEarmarkMedical } from "react-icons/bs";
import {
  FiDownload,
  FiPlus,
  FiUpload,
  FiUploadCloud,
  FiXCircle,
} from "react-icons/fi";
import { useLocation } from "react-router-dom";

// Internal import
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import { SidebarContext } from "@/context/SidebarContext";

const UploadManyTwo = ({
  title,
  totalDoc,
  exportData,
  isDisabled,
  handleSelectFile,
  filename,
  handleRemoveSelectFile,
  handleUploadMultiple,
}) => {
  const location = useLocation();
  const dRef = useRef();
  const [dropDown, setDropDown] = useState(false);
  const { loading } = useContext(SidebarContext);
  const [loadingExport, setLoadingExport] = useState({
    name: "",
    status: false,
  });

  // console.log(exportData);

  const handleExportCSV = () => {
    // if (location.pathname === "/customers") {
    //   exportFromJSON({
    //     data: exportData,
    //     fileName: "customers",
    //     exportType: exportFromJSON.types.csv,
    //   });
    // }
  };

  const handleExportJSON = () => {
    // if (location.pathname === "/customers") {
    //   exportFromJSON({
    //     data: exportData,
    //     fileName: "customers",
    //     exportType: exportFromJSON.types.json,
    //   });
    // }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!dRef?.current?.contains(e.target)) {
        setDropDown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
  }, [dRef]);

  const [isImportBoxShown, setisImportBoxShown] = useState(false);
  const handleClick = (event) => {
    setisImportBoxShown((current) => !current);
  };

  const { t } = useTranslation();

  return (
    <div className=" lg:flex md:flex flex-grow-0 gap-3 h-full">
      <div className="flex h-full">
        <div ref={dRef} className="disnone lg:flex-1 md:flex-1 sm:flex-none">
          {(
            title === "Customers"
            // || title === "Categories"
          ) && (
              <button
                onClick={() => {
                  setDropDown(!dropDown);
                }}
                className="border flex justify-center gap-2 items-center border-gray-300 hover:border-emerald-400 hover:text-emerald-400  dark:text-gray-300 cursor-pointer h-10 w-20 rounded-md focus:outline-none"
              >
                {/* <BsPlus className="text-4xl" /> */}
                <FiUpload />
                <span className="text-xs">{t("Export")}</span>
              </button>
            )}
          {dropDown && (
            <ul
              className="origin-top-left absolute  w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 focus:outline-none z-40"
              style={{}}
            >
              <li className="justify-between font-serif font-medium py-2 pl-4 transition-colors duration-150 hover:bg-gray-100 text-gray-500 hover:text-mainColor dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="focus:outline-none"
                >
                  <span className="flex items-center text-sm">
                    <BsFileEarmarkMedical
                      className="w-4 h-4 mr-3"
                      aria-hidden="true"
                    />

                    <span>
                      Export to CSV
                      {loadingExport.name === "csv" &&
                        loadingExport.status &&
                        "...."}
                    </span>
                  </span>
                </button>
              </li>

              <li className="justify-center gap-3 font-serif font-medium py-2 pl-4 transition-colors duration-150 hover:bg-gray-100 text-gray-500 hover:text-mainColor dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200">
                <button
                  type="button"
                  className="focus:outline-none"
                  onClick={handleExportJSON}
                >
                  <span className="flex items-center text-sm">
                    <BsFileEarmarkCode
                      className="w-4 h-4"
                      aria-hidden="true"
                    />
                    <span>
                      Export to JSON
                      {loadingExport.name === "json" &&
                        loadingExport.status &&
                        "...."}
                    </span>
                  </span>
                </button>
              </li>
            </ul>
          )}
        </div>

        <div className="lg:flex-1 md:flex-1 flex items-center justify-center">
          <button
            onClick={handleClick}
            className="border flex justify-center gap-2 items-center h-10 w-20 hover:text-yellow-400  border-gray-300 dark:text-gray-300 cursor-pointer  py-2 hover:border-yellow-400 rounded-md focus:outline-none"
          >
            <FiDownload />
            <span className="text-xs">{t("Import")}</span>
          </button>
        </div>
      </div>

      {isImportBoxShown && (
        <>
          <div className="w-full my-2 lg:my-0 md:my-0 flex items-center gap-3">
            <div className="h-10 border border-dashed border-mainColor rounded-md">
              <label className="w-full rounded-lg h-10 flex justify-center items-center text-xs dark:text-gray-400 leading-none px-2">
                <Input
                  disabled={isDisabled}
                  type="file"
                  accept=".csv,.xls,.json"
                  onChange={handleSelectFile}
                />
                {filename ? (
                  filename
                ) : (
                  <>
                    <FiUploadCloud className="mx-2 text-mainColor text-lg dark:text-gray-400" />{" "}
                    {t("SelectYourJSON")} {title} {t("File")}
                  </>
                )}
                {filename && (
                  <span
                    onClick={handleRemoveSelectFile}
                    type="button"
                    className="text-red-500 focus:outline-none ml-4 text-lg"
                  >
                    <FiXCircle />
                  </span>
                )}
              </label>
            </div>

            <>
              {loading ? (
                <Button className="flex items-center justify-center gap-2 ml-2 h-10">
                  <img
                    src={spinnerLoadingImage}
                    alt="Loading"
                    width={20}
                    height={10}
                  />{" "}
                  <span className="font-serif font-light">Processing</span>
                </Button>
              ) : (
                <Button
                  onClick={handleUploadMultiple}
                  className="flex items-center justify-center gap-2 h-10 px-2"
                >
                  <FiPlus size={20} className="mb-[1px]" />
                  <span className="text-sx w-20">{t("ImportNow")}</span>
                </Button>
              )}
            </>
          </div>
        </>
      )}
    </div>
  );
};
export default UploadManyTwo;
