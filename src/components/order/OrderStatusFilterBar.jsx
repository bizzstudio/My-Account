import { Button } from "@windmill/react-ui";
import { t } from "i18next";

const STATUS_BTN_WIDTH = "min-w-[170px]";

const OrderStatusFilterBar = ({ statuses = [], value, onChange }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">

      {/* ALL */}
      <Button
        layout={value === "" ? "primary" : "outline"}
        className={STATUS_BTN_WIDTH}
        onClick={() => onChange("")}
      >
        {t("All")}
      </Button>

      {statuses.map((status) => {
        const isActive = value === status._id;

        return (
          <Button
            key={status._id}
            layout={isActive ? "primary" : "outline"}
            className={STATUS_BTN_WIDTH}
            onClick={() => onChange(status._id)}
            style={{
              backgroundColor: isActive ? status.color : "transparent",
              borderColor: status.color,
              color: isActive ? "#fff" : status.color,
            }}
          >
            {status.label}
          </Button>
        );
      })}
    </div>
  );
};

export default OrderStatusFilterBar;
