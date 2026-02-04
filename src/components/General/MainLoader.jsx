import React from "react";

function MainLoader() {
  return (
    <div className="bg-white fixed inset-0 size-full z-100">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center flex-col">
        <div className="loader"></div>
      </div>
    </div>
  );
}

export default MainLoader;
