import "./App.css";
import axios from "axios";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/AppRoutes";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { login } from "./redux/slice/userSlice";
import { ToastContainer } from "react-toastify";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsLoading(false);
      return;
    }

    axios
      .get("http://localhost:8001/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        dispatch(login(res.data.data));
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  }, [dispatch]);

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
