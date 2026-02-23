import "./App.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/AppRoutes";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { login } from "./redux/slice/userSlice";
import { ToastContainer } from "react-toastify";
import api from "./api/axios";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        dispatch(login(res.data.data));
      })
      .catch(() => {
     
      })
      .finally(() => {
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
