import React from "react";
import PropTypes from "prop-types";
import styles from "./Greeting.css";

export default function Greeting({ text = "Hello, world!" }) {
  return <h1 className={styles.greeting}>{text}</h1>;
}

Greeting.propTypes = {
  text: PropTypes.string.isRequired
};
