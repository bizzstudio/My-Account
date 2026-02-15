import React from "react";

const Title = ({ title, description }) => {
  return (
    <>
      <div className="flex md:flex-row flex-col justify-between ml-20">
        <div>
          <h4 className="text-xl font-medium dark:text-gray-300">{title}</h4>
          <p className="mb-0 text-sm dark:text-gray-300">{description}</p>
        </div>
      </div>
    </>
  );
};

export default Title;
