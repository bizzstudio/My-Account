// SidebarSubMenu.jsx
import React, { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  IoChevronDownOutline,
  IoChevronBackOutline,
  IoRemoveSharp,
} from "react-icons/io5";
import { SidebarContext } from "@/context/SidebarContext";

const SidebarSubMenu = ({ route }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const { lang } = useContext(SidebarContext);

  return (
    <>
      <li className="relative px-6 py-4" key={route.name}>
        <button
          className="flex gap-2 items-center justify-between focus:outline-none w-full text-base font-bold transition-colors duration-150 hover:text-mainColor hover:dark:text-mainColor-dark dark:hover:text-gray-200"
          onClick={() => setOpen(!open)}
          aria-haspopup="true"
        >
          <span className="flex gap-2 items-center">
            <route.icon className="w-6 h-6" aria-hidden="true" />
            <span className="mt-1">{t(`${route.name}`)}</span>
            <span className="mt-1">
              {open ? <IoChevronDownOutline /> : <IoChevronBackOutline className={lang == "en" ? "rotate-180" : ""} />}
            </span>
          </span>
        </button>

        {open && (
          <ul
            className="p-2 mt-2 overflow-hidden text-base font-medium text-gray-500 rounded-md dark:text-gray-400 dark:bg-gray-900"
            aria-label="submenu"
          >
            {route.routes.map((child, i) => (
              <li key={i + 1}>
                {child?.outside ? (
                  <a
                    href={
                      child?.outside === "store"
                        ? import.meta.env.VITE_APP_STORE_DOMAIN
                        : import.meta.env.VITE_APP_LIKUTAPP_DOMAIN
                    }
                    target="_blank"
                    className="flex gap-2 items-center font-serif py-3 text-base text-gray-600 hover:text-mainColor hover:dark:text-mainColor-dark cursor-pointer transition-colors duration-150"
                    rel="noreferrer"
                  >
                    <span className="text-sm text-gray-500">
                      <IoRemoveSharp />
                    </span>
                    <span className="text-gray-500 hover:text-mainColor hover:dark:text-mainColor-dark dark:hover:text-gray-200">
                      {t(`${child.name}`)}
                    </span>
                  </a>
                ) : (
                  <NavLink
                    to={child.path}
                    className={({ isActive }) =>
                      `flex gap-2 items-center font-serif py-3 text-base text-gray-600 hover:text-mainColor hover:dark:text-mainColor-dark cursor-pointer transition-colors duration-150 ${isActive ? "text-mainColor-dark font-bold" : ""
                      }`
                    }
                    rel="noreferrer"
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span
                            className="absolute inset-y-0 left-0 w-1 bg-mainColor rounded-tr-lg rounded-br-lg"
                            aria-hidden="true"
                          ></span>
                        )}
                        <span className="text-sm text-gray-500">
                          <IoRemoveSharp />
                        </span>
                        <span className="text-gray-500 hover:text-mainColor hover:dark:text-mainColor-dark dark:hover:text-gray-200">
                          {t(`${child.name}`)}
                        </span>
                      </>
                    )}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        )}
      </li>
    </>
  );
};

export default SidebarSubMenu;