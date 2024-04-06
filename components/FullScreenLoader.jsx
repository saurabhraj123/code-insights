import React from "react";
import { ThreeDots } from "react-loader-spinner";

const FullScreenLoader = () => {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <ThreeDots
        height="80"
        width="80"
        radius="9"
        color="#3b82f6"
        ariaLabel="three-dots-loading"
        wrapperStyle={{}}
        wrapperClassName=""
        visible={true}
      />
    </div>
  );
};

export default FullScreenLoader;
