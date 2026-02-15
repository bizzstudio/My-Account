// useToggleDrawer.js
import { useContext, useEffect } from "react";
import { SidebarContext } from "@/context/SidebarContext";
import { t } from "i18next";

const useToggleDrawer = () => {
  const {
    toggleDrawer,
    isDrawerOpen,
    toggleModal,
    toggleBulkDrawer,
    serviceId,
    setServiceId,
    allId,
    setAllId,
    title,
    setTitle,
    selectedAsset,
  } = useContext(SidebarContext);

  const handleUpdate = (id) => {
    setServiceId(id);
    toggleDrawer();
  };

  const handleUpdateMany = (id) => {
    setAllId(id);
    toggleBulkDrawer();
  };

  const handleModalOpen = (id, title) => {
    setServiceId(id);
    toggleModal();
    setTitle(title);
  };

  useEffect(() => {
    if (!isDrawerOpen) {
      setServiceId();
    }
  }, [isDrawerOpen]);


  const handleDeleteMany = async (id, title = '') => {
    setAllId(id);
    toggleModal();
    setTitle(title || t("Selected items"));
  };

  return {
    title,
    allId,
    serviceId,
    handleUpdate,
    setServiceId,
    handleModalOpen,
    handleDeleteMany,
    handleUpdateMany,
    selectedAsset,
  };
};

export default useToggleDrawer;
