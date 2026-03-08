import { useTranslation } from 'react-i18next';
import Drawer from "rc-drawer";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import { useLocation } from "react-router-dom";

// Internal import
import { SidebarContext } from "@/context/SidebarContext";

const MainDrawer = ({ children, width }) => {
  const { toggleDrawer, isDrawerOpen, closeDrawer, windowDimension, lang } =
    useContext(SidebarContext);

  const placement = lang === 'he' ? 'left' : 'right';
  const invertedDir = lang === 'he' ? 'ltr' : 'rtl';
  const dir = lang === 'he' ? 'rtl' : 'ltr';

  const [drawerWidth, setDrawerWidth] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (width) {
      setDrawerWidth(width);
    }
  }, [width]);

  useEffect(() => {
    if (isDrawerOpen) {
      requestAnimationFrame(() => { scrollRef.current?.scrollTo(0, 0); });
    }
  }, [isDrawerOpen]);

  return (
    <Drawer
      dir={invertedDir}
      open={isDrawerOpen}
      onClose={closeDrawer}
      parent={null}
      level={null}
      placement={placement}
      width={windowDimension <= 800 ? "100%" : drawerWidth || "100%"}
      height="100vh"
    >
      <div dir={dir} className="relative h-full">

        <button
          onClick={toggleDrawer}
          className="absolute z-20 text-red-500 hover:bg-red-100 hover:text-gray-700 transition-colors duration-150 bg-white shadow-md ml-6 mt-6 left-0 right-auto w-10 h-10 rounded-full flex items-center justify-center"
        >
          <FiX />
        </button>

        {/* אזור עם פס גלילה — נגלל לראש בכל פתיחת דרואר */}
        <div ref={scrollRef} className="flex flex-col w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {children}
        </div>

      </div>
    </Drawer>
  );
};

export default React.memo(MainDrawer);
