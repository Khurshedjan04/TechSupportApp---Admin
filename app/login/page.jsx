"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { authAPI } from "../services/api";
import {
  loginSuccess,
  logout,
  setLoading as setAuthLoading,
  setError,
} from "../store/slices/authSlice";
import { useRouter } from "next/navigation";
import useAuthCheck from "../hooks/checkAuth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useAuthCheck();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Logging in with:", email, password);

    dispatch(setAuthLoading(true));

    try {
      const response = await authAPI.login({ email, password });
      if (response.user.role === "user") {
        alert("You do not have access to Admin Panel");
        dispatch(logout());
        setEmail("");
        setPassword("");
        return;
      }
      dispatch(loginSuccess(response));
      router.replace("/");
    } catch (error) {
      dispatch(setError(error.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Login to Dern-Support
        </h2>

        {error && logout !== undefined && (
          <p className="mb-4 text-red-400 text-sm text-center">{error}</p>
        )}

        <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-green-600 text-white py-2 rounded-md hover:opacity-90 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
