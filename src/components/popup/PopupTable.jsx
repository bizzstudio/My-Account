// PopupTable.jsx
import {
  TableBody,
  TableCell,
  TableRow,
} from "@windmill/react-ui";
import { useEffect, useState } from "react";

// Internal import
import useUtilsFunction from "@/hooks/useUtilsFunction";
import CheckBox from "@/components/form/others/CheckBox";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import ShowHideButton from "@/components/table/ShowHideButton";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import PopupCard from "./PopupCard";

const PopupTable = ({
  isCheck,
  popups,
  setIsCheck,
  isMobile = false
}) => {
  const [updatedPopups, setUpdatedPopups] = useState([]);

  const { title, serviceId, handleModalOpen, handleUpdate, isSubmitting } = useToggleDrawer();

  const { showDateTimeFormat, globalSetting } = useUtilsFunction();

  const handleClick = (e) => {
    const { id, checked } = e.target;
    setIsCheck([...isCheck, id]);
    if (!checked) {
      setIsCheck(isCheck.filter((item) => item !== id));
    }
  };

  useEffect(() => {
    const result = popups?.map((el) => {
      const newDate = new Date(el?.updatedAt).toLocaleString("en-US", {
        timeZone: globalSetting?.default_time_zone,
      });
      const newObj = {
        ...el,
        updatedDate: newDate,
      };
      return newObj;
    });
    setUpdatedPopups(result);
  }, [popups, globalSetting?.default_time_zone]);

  const toggleDrawerData = {
    handleModalOpen,
    handleUpdate,
    isSubmitting,
  };

  return (
    <>
      {isCheck?.length < 1 && (
        <DeleteModal id={serviceId} title={title} table="popups" />
      )}

      {isMobile ? (
        // Mobile Card View
        <div>
          {updatedPopups?.map((popup) => (
            <PopupCard
              key={popup._id}
              popup={popup}
              isCheck={isCheck}
              setIsCheck={setIsCheck}
              handleClick={handleClick}
              toggleDrawerData={toggleDrawerData}
            />
          ))}
        </div>
      ) : (
        // Desktop Table View
        <TableBody>
          {updatedPopups?.map((popup, i) => (
            <TableRow key={i + 1}>
              <TableCell className='text-center'>
                <CheckBox
                  type="checkbox"
                  name={popup?.title}
                  id={popup._id}
                  handleClick={handleClick}
                  isChecked={isCheck?.includes(popup._id)}
                />
              </TableCell>

              <TableCell className='text-center'>
                <EditDeleteButton
                  id={popup?._id}
                  isCheck={isCheck}
                  handleUpdate={handleUpdate}
                  handleModalOpen={handleModalOpen}
                  title={popup?.title}
                  disabled={isCheck?.length > 0}
                  isSubmitting={isSubmitting}
                />
              </TableCell>

              <TableCell className='text-center text-sm max-w-[20vw] overflow-hidden truncate'>
                {popup.title}
              </TableCell>

              <TableCell className='text-center text-sm max-w-[20vw] overflow-hidden truncate'>
                {popup.subTitle || '-'}
              </TableCell>

              <TableCell className="text-center">
                <ShowHideButton
                  id={popup._id}
                  status={popup.isActive ? "show" : "hide"}
                  table="popups"
                />
              </TableCell>

              <TableCell className='text-center'>
                <span className="text-sm">
                  {showDateTimeFormat(popup.createdAt)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      )}
    </>
  );
};

export default PopupTable;