// src/routes/sidebar.js
import { FaRegWindowRestore } from "react-icons/fa6";
import { FiUser, FiPackage, FiSettings } from "react-icons/fi";
import { LuListPlus } from "react-icons/lu";
import { FaChalkboardTeacher } from "react-icons/fa";
import { MdEvent, MdPeople } from "react-icons/md";
/**
 * ⚠ These are used just to render the Sidebar!
 * You can include any link here, local or external.
 *
 * If you're looking to actual Router routes, go to
 * `routes/index.js`
 */
const sidebar = [
  {
    path: "/admins",
    icon: FiUser,
    name: "Admins",
  },
  {
    path: "/products",
    icon: FiPackage,
    name: "Products",
  },
  {
    path: "/settings",
    icon: FiSettings,
    name: "Settings",
  },
  // {
  //   path: "/lecturers",
  //   icon: FaChalkboardTeacher,
  //   name: "Lecturers",
  // },
  // {
  //   path: "/trainings",
  //   icon: MdEvent,
  //   name: "TrainingsTitle",
  // },
  // {
  //   path: "/registrants",
  //   icon: MdPeople,
  //   name: "Registrants",
  // },
  // {
  //   path: "/products",
  //   icon: FiPackage,
  //   name: "Products",
  // },
  // {
  //   icon: IoReorderFour,
  //   name: "Orders",
  //   routes: [],
  // }

  // {
  //   icon: FaRegWindowRestore,
  //   name: "Popups",
  //   path: "/popups",
  // },
];

export default sidebar;
