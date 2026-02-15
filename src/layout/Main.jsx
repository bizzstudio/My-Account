import React from "react";

const Main = ({ children }) => {
  return (
    <main className="overflow-y-auto flex-grow pb-5"
      style={{ height: 'calc(100dvh - 68px)' }}>
      {/* <div className="sm:container grid lg:px-6 sm:px-4 px-2 mx-auto"> */}
      {children}
    </main>
  );
};

export default Main;
