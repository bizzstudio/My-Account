import React, { useContext } from "react";
import Switch from "react-switch";

// Internal import
import UserServices from "@/services/UserServices";
import ProductServices from "@/services/ProductServices";
import GuideServices from "@/services/GuideServices";
import { SidebarContext } from "@/context/SidebarContext";
import notifyApiResponse from "@/utils/notifyApiResponse";

const ActiveInActiveButton = ({ id, status, option, admin }) => {
  const { setIsUpdate } = useContext(SidebarContext);
  
  const handleChangeStatus = async (id, entity) => {
    try {
      let newStatus;
      if (status?.toLowerCase() === "active") {
        newStatus = "inactive";
      } else {
        newStatus = "active";
      }

      let res;
      
      // Choose the appropriate service based on the option
      switch (option) {
        case "user":
          res = await UserServices.updateUserStatus(id, {
            status: newStatus,
          });
          break;
        case "product":
          res = await ProductServices.updateProduct(id, {
            status: newStatus,
          });
          break;
        case "guide":
          res = await GuideServices.updateGuideStatus(id, {
            status: newStatus,
          });
          break;
        default:
          throw new Error(`Unknown option: ${option}`);
      }
      
      setIsUpdate(true);
      notifyApiResponse(res, true);
      return;
    } catch (err) {
      notifyApiResponse(err, false);
    }
  };

  return (
    <>
      <Switch
        onChange={() => handleChangeStatus(id, { admin })}
        checked={status?.toLowerCase() === "active" ? true : false}
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
    </>
  );
};

export default ActiveInActiveButton;
