import React from "react";
import { hot } from "react-hot-loader";
import Greeting from "./components/Greeting";

export default hot(module)(function App() {
  return <Greeting text="Hello!" />;
});
