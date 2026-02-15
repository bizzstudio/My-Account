// AsyncButton.jsx
import React, { useEffect, useState } from "react";
import { AiOutlineCheckCircle } from "react-icons/ai";
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import styles from "./AsyncButton.module.css";

const AsyncButton = ({
  type = "button",
  onClick,
  className = "",
  loading,
  success,
  text = "",
  loadingText = "",
  successText = "",
  disabled,
}) => {
  const [buttonState, setButtonState] = useState("default"); // 'default', 'loading', 'success'

  useEffect(() => {
    if (loading) {
      setButtonState("loading");
    } else if (success) {
      setButtonState("success");
    } else {
      setButtonState("default");
    }
  }, [loading, success]);

  const renderContent = () => {
    if (buttonState === "loading") {
      return (
        <div className={styles.buttonContent}>
          <img
            src={spinnerLoadingImage}
            alt="Loading"
            width={23}
            height={23}
            className={`${styles.icon} ${styles.iconLoading} saturate-0`}
          />
          <div className={styles.text}>
            {loadingText.split("").map((char, i) => (
              <span key={i} style={{ "--i": i }}>
                {char}
              </span>
            ))}
          </div>
        </div>
      );
    } else if (buttonState === "success") {
      return (
        <div className={styles.buttonContent}>
          <AiOutlineCheckCircle size={17} className={styles.icon} />
          <div className={styles.text}>
            {successText.split("").map((char, i) => (
              <span key={i} style={{ "--i": i }}>
                {char}
              </span>
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <div className={styles.buttonContent}>
          <div className={styles.text}>
            {text.split("").map((char, i) => (
              <span key={i} style={{ "--i": i }}>
                {char}
              </span>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <button
      onClick={onClick}
      className={`${styles.button} ${styles[buttonState]} flex items-center justify-center gap-1 py-2 px-4 bg-p2-2 hover:bg-p2-1 text-white transition ease-in duration-200 text-center text-base font-semibold shadow-md rounded-lg ${className}`}
      type={type}
      disabled={loading || disabled}
    >
      {renderContent()}
    </button>
  );
};

export default AsyncButton;