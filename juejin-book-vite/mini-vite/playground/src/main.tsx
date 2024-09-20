import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

const App = () => <div>hello vvvv  </div>;

ReactDOM.render(<App />, document.getElementById("root"));

// @ts-ignore
console.log(import.meta.hot);

import.meta.hot.accept(() => {
  ReactDOM.render(<App />, document.getElementById("root"));
});
