// src/components/table/ShowHideButton.jsx
import React, { useContext } from "react";
import Switch from "react-switch";
import { useLocation } from "react-router-dom";

// Internal import
import { SidebarContext } from "@/context/SidebarContext";
import UserServices from "@/services/UserServices";
import PopupServices from "@/services/PopupServices";
import notifyApiResponse from "@/utils/notifyApiResponse";

const ShowHideButton = ({ id, status, table, challengeId = '' }) => {
  const location = useLocation();
  const { setIsUpdate } = useContext(SidebarContext);

  const handleChangeStatus = async (id) => {
    try {
      let newStatus;
      if (status === "show") {
        newStatus = "hide";
      } else {
        newStatus = "show";
      }

      if (location.pathname === "/our-admin") {
        // console.log('coupns',id)
        const res = await UserServices.updateUserStatus(id, {
          status: newStatus,
        });
        setIsUpdate(true);
        notifyApiResponse(res, true);
      }

      if (table === "popups") {
        const res = await PopupServices.updatePopup(id, challengeId, {
          isActive: newStatus == "show",
        });
        setIsUpdate(true);
        notifyApiResponse(res, true);
      }

    } catch (err) {
      notifyApiResponse(err, false);
    }
  };

  return (
    <Switch
      onChange={() => handleChangeStatus(id)}
      checked={status === "show" ? true : false}
      className="react-switch md:ml-0"
      uncheckedIcon={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            width: 120,
            fontSize: 14,
            color: "white",
            paddingRight: 22,
            paddingTop: 1,
          }}
        ></div>
      }
      width={30}
      height={15}
      handleDiameter={13}
      offColor="#E53E3E"
      onColor={"#2F855A"}
      checkedIcon={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: 73,
            height: "100%",
            fontSize: 14,
            color: "white",
            paddingLeft: 20,
            paddingTop: 1,
          }}
        ></div>
      }
    />
  );
};

export default ShowHideButton;
