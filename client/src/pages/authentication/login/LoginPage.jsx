import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";

import { login } from "../../../services/auth-service";
import BackgroundImg from '../../../assets/background-login.png'; // Adjust the path to your 404 image

import "./LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const isAuthenticated = localStorage.getItem('token');

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await login({ email, password });
      localStorage.setItem("token", response.token);
      navigate("/");
    } catch (error) {
      alert("Login failed. Please check your credentials.");
    }
  };


  return (
    <div style={{ backgroundImage: `url(${BackgroundImg})`, height: '100vh', backgroundSize: 'cover' }} className="login-page">
      <form onSubmit={handleLogin} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-button">
          Login
        </button>
        <p>
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;