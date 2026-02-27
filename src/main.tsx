import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import "./App.css";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./redux/store";

setTimeout(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </StrictMode>,
  );
}, 2000); // 2 second delay just for testing
