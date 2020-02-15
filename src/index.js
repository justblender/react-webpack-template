import React from "react";
import ReactDOM from "react-dom";

function App({ text }) {
  return (
    <div>
      <h1>{text}</h1>
    </div>
  );
}

const domRootElement = document.getElementById("root");
const reactRootElement = <App text="Hello, world!" />;

if (domRootElement.childElementCount > 0) {
  ReactDOM.hydrate(reactRootElement, domRootElement);
} else {
  ReactDOM.render(reactRootElement, domRootElement);
}
