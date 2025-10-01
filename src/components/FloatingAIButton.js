import React from "react";
import { Link } from "react-router-dom";
import "./FloatingAIButton.css";

const FloatingAIButton = () => {
  return (
    <Link
      to="/blaze-ai"
      className="floating-ai-button"
      title="Blaze AI by Quivix"
    >
      <img src="/ai.png" alt="Blaze AI Assistant" />
    </Link>
  );
};

export default FloatingAIButton;
