// import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./App.scss";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import store from "./redux/store.js";

ReactDOM.createRoot(document.getElementById("root")).render(
	// <React.StrictMode>
	<Provider store={store}>
		<Router>
			<App />
		</Router>
	</Provider>,
	// </React.StrictMode>,
);
