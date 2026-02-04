import "./App.css";
import axios from "axios";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/AppRoutes";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { login } from "./redux/slice/userSlice";
import { ToastContainer } from "react-toastify";
import { RootState } from "./redux/store";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  const theme = useSelector((state: RootState) => state.theme.mode);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:8000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        dispatch(login(res.data.data));
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  }, [dispatch]);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <>
      {isLoading ? (
        <div className="flex h-screen items-center justify-center">
          <p className="text-3xl">Loading: .......</p>
        </div>
      ) : (
        <>
          <RouterProvider router={router} />
          <ToastContainer />
        </>
      )}
    </>
  );
}

export default App;
