import React from "react";
import Skeleton from "react-loading-skeleton";
import { Link } from "react-router-dom";

const Breadcrumbs = ({ items }) => {
  return (
    <></>
    // <nav className="text-sm text-gray-600 dark:text-gray-400 px-3">
    //   <ol className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 p-1">
    //     {items.map((item, index) => (
    //       <li key={index} className="flex items-center">
    //         {index > 0 && <span className="mx-2">›</span>}
    //         {item.href ? (
    //           <Link to={item.href} className="hover:underline text-mainColor-dark">
    //             {item.label ? item.label : <Skeleton width={70} height={15} className="ml-2" />}
    //           </Link>
    //         ) : (
    //           <span className="text-gray-800 font-semibold">{item.label}</span>
    //         )}
    //       </li>
    //     ))}
    //   </ol>
    // </nav>
  );
};

export default Breadcrumbs;
