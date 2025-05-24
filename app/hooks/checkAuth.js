"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout, loginSuccess } from "../store/slices/authSlice";
import { authAPI } from "../services/api";

const useAuthCheck = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const user = await authAPI.getMe();
        if (user.role === "user") {
          alert("You do not have access to Admin Panel");
          dispatch(logout());
          return;
        }
        dispatch(loginSuccess({ user, token }));
      } catch (err) {
        dispatch(logout());
        router.push("/login");
      }
    };

    checkAuth();
  }, [dispatch, router]);
};

export default useAuthCheck;
