import React from "react";
import { Helmet } from "react-helmet";

const PageTitle = ({ title, description }) => {
  return (
    <Helmet>
      <title>
        {" "}
        {title
          ? ` ${title} | ארילני`
          : "ארילני"}
      </title>
      <meta
        name="description"
        content={
          description
            ? ` ${description} `
            : "ארילני"
        }
      />
    </Helmet>
  );
};

export default PageTitle;
