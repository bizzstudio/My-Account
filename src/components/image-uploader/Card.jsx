// image-uploader/Card.jsx
import { useRef, useState, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import { FiXCircle, FiFile, FiEdit } from "react-icons/fi";
import { ItemTypes } from "./ItemTypes.js";
import { t } from "i18next";

const Card = ({ id, image, index, moveCard, handleRemoveImage, onlyImages, onRename }) => {
  const ref = useRef(null);
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(image.name);

  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return { handlerId: monitor.getHandlerId() };
    },
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      moveCard(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  const [{ }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => ({ id, index }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    canDrag: () => !editing,
  });
  drag(drop(ref));

  useEffect(() => {
    setTempName(image.name);
  }, [image.name]);

  if (onlyImages) {
    // תצוגת תמונה - ללא שינויים
    return (
      <div ref={ref} data-handler-id={handlerId}>
        <div className="relative m-2">
          <img
            className={`inline-flex border rounded-md w-24 max-h-24 p-2 ${(typeof image === "string" && image.startsWith("https://")) ? "border-gray-100 dark:border-gray-600" : "border-red-500"}`}
            src={typeof image === "string" ? image : image.link}
            alt="product"
          />
          {index === 0 && (
            <p className="text-xs absolute py-1 w-full bottom-0 inset-x-0 bg-mainColor rounded-full text-white text-center ">
              {t("Default Image")}
            </p>
          )}
          <button
            type="button"
            className="absolute -top-[5px] -right-[5px] text-red-500 focus:outline-none"
            onClick={() => handleRemoveImage(typeof image === "string" ? image : image.link)}
          >
            <FiXCircle />
          </button>
        </div>
      </div>
    );
  } else {
    return (
      <div ref={ref} data-handler-id={handlerId} className="relative m-2 border rounded-md py-2 px-3 w-[98%]">
        <div className="flex items-center gap-2">
          <div className="min-w-fit">
            <FiFile size={22} />
          </div>
          {editing ? (
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={() => {
                onRename(tempName);
                setEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onRename(tempName);
                  setEditing(false);
                }
              }}
              className="border-none outline-none w-full"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-2 w-full">
              <span
                onClick={() => window.open(image.link, "_blank")}
                className="cursor-pointer text-blue-500 underline text-center truncate w-[93%]"
              >
                {tempName}
              </span>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setEditing(true)}
              >
                <FiEdit />
              </button>
            </div>
          )}
        </div>
        <button
          type="button"
          className="absolute -top-[5px] -right-[5px] text-red-500 focus:outline-none"
          onClick={() => handleRemoveImage(image.link)}
        >
          <FiXCircle />
        </button>
      </div>
    );
  }
};

export default Card;