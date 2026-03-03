// src/routes/index.js
import NotFound from "@/pages/404";
import ComingSoon from "@/pages/ComingSoon";
import EditProfile from "@/pages/EditProfile";
import Popups from "@/pages/Popups";
import Admin from "@/pages/User";
import Lecturers from "@/pages/Lecturers";
import Trainings from "@/pages/Trainings";
import Registrants from "@/pages/Registrants";
import Products from "@/pages/Products";
import Orders from "@/pages/Orders";
import OrderForm from "@/pages/OrderForm";
import Settings from "@/pages/Settings";
import Tutorials from "@/pages/Tutorials";


const routes = [
  {
    path: "/admins",
    component: Admin,
    title: "Admins"
  },
  {
    path: "/lecturers",
    component: Lecturers,
    title: "Lecturers"
  },
  {
    path: "/trainings",
    component: Trainings,
    title: "Trainings"
  },
  {
    path: "/registrants",
    component: Registrants,
    title: "Registrants"
  },
  {
    path: "/products",
    component: Products,
    title: "Products"
  },
  {
    path: "/addOrder",
    component: OrderForm,
    title: "Add Order"
  },
  {
    path: "/Order/:id/edit",
    component: OrderForm,
    title: "Edit Order"
  },
  {
    path: "/Order",
    component: Orders,
    title: "order"
  },
  {
    path: "/404",
    component: NotFound,
    title: "404"
  },
  {
    path: "/coming-soon",
    component: ComingSoon,
    title: "Coming Soon"
  },
  {
    path: "/edit-profile",
    component: EditProfile,
    title: "Edit Profile"
  },
  {
    path: "/settings",
    component: Settings,
    title: "Settings"
  },
  {
    path: "/tutorials",
    component: Tutorials,
    title: "Tutorials"
  },
  // {
  //   path: "/popups",
  //   component: Popups,
  // },
];
export default routes;
