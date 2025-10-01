// src/components/Loader.js
import React from "react";
import { Spinner } from "react-bootstrap";

const Loader = ({ message = "Applying..." }) => {
  return (
    <div className="loader-overlay">
      <div className="text-center text-white">
        <Spinner
          animation="border"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        />
        <h4 className="mt-3">{message}</h4>
      </div>
    </div>
  );
};

export default Loader;
