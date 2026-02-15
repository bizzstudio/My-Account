import React, { useEffect, useState } from "react";
import { Select } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";

const SelectRole = ({ setRole, register, name, role }) => {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState(role || "admin");

  useEffect(() => {
    // כאשר role מתעדכן בפרופס, נעדכן את selectedRole בהתאם
    setSelectedRole(role || "admin");
  }, [role]);

  useEffect(() => {
    // כאשר selectedRole משתנה, נעדכן את הערך ב־setRole
    setRole(selectedRole);
  }, [selectedRole, setRole]);

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  return (
    <div>
      <Select
        className="border h-12 text-sm focus:outline-none block w-full bg-gray-100 dark:bg-gray-700 border-transparent focus:bg-white dark:focus:bg-gray-600 dark:focus:border-gray-600 dark:text-gray-300"
        onChange={handleRoleChange}
        name={name}
        value={selectedRole} // התפקיד שנבחר יוצג כאן
        // {...register(`${name}`, {
        // })}
      >
        <option value="admin">{t("Importer")}</option>
        <option value="super-admin">{t("Super Admin")}</option>
      </Select>
    </div>
  );
};

export default SelectRole;
