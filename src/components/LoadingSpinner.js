import React from "react";
import { ClipLoader } from "react-spinners";

const LoadingSpinner = ({
  color = "#005ea6",
  size = 50,
  backgroundColor = "rgba(0, 0, 0, 0.5)",
}) => {
  const override = {
    display: "block",
    margin: "0 auto",
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: backgroundColor,
        zIndex: 1000,
      }}
    >
      <ClipLoader
        color={color}
        loading={true}
        cssOverride={override}
        size={size}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  );
};

export default LoadingSpinner;
