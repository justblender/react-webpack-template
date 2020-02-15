import React from "react";
import PropTypes from "prop-types";

export default function App({ text }) {
  return (
    <div>
      <h1>{text}</h1>
    </div>
  );
}

App.propTypes = {
  text: PropTypes.string.isRequired
};
