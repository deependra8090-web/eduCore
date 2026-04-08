import React, { useState } from "react";
import logo from "../../public/logo.webp";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../utils/utils";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${BACKEND_URL}/admin/login`,
        { email, password },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // ✅ STORE FIRST
      localStorage.setItem("admin", JSON.stringify(response.data));

      // ✅ THEN NAVIGATE
      toast.success(response.data.message);
      navigate("/admin/dashboard");

    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.errors || "Admin Login failed!!!");
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-black to-blue-950 ">
      <div className="h-screen container mx-auto flex items-center justify-center text-white">
        
        {/* Header */}
        <header className="absolute top-0 left-0 w-full flex justify-between items-center p-5">
          <div className="flex items-center space-x-2">
            <img src={logo} alt="Logo" className="w-10 h-10 rounded-full" />
            <Link to="/" className="text-xl font-bold text-orange-500">
                EduCore
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/admin/signup" className="border border-gray-500 py-2 px-4 rounded-md">
              Signup
            </Link>
            <Link to="/courses" className="bg-orange-500 py-2 px-4 rounded-md">
              Join now
            </Link>
          </div>
        </header>

        {/* Form */}
        <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-[500px] mt-20">
          <h2 className="text-2xl font-bold text-center mb-4">
            Welcome to <span className="text-orange-500"> EduCore</span>
          </h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Email"
              className="w-full p-3 mb-4 bg-gray-800 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 mb-4 bg-gray-800 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {errorMessage && (
              <p className="text-red-500 text-center mb-3">{errorMessage}</p>
            )}

            <button className="w-full bg-orange-500 py-3 rounded">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;