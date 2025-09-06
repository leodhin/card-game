import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";

import { login } from "../../../services/auth-service";
import useSessionStore from "../../../stores/sessionStore";
import BackgroundImg from '../../../assets/background-login.png';

import "./LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, login: loginState } = useSessionStore();

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await login({ email, password });
      loginState(response.user, response.token);
      navigate("/");
    } catch (error) {
      alert("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">

      <div className="login-right">
        <form onSubmit={handleLogin} className="auth-form">
          <h2 className="auth-title">Login</h2>
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
          <button type="submit" className="auth-button" disabled={isLoading}>
            Login
          </button>
          <p>
            Don't have an account? <a href="/register">Register here</a>
          </p>
        </form>
      </div>
      <div
        className="login-left"
        style={{ backgroundImage: `url(${BackgroundImg})` }}
      ></div>
    </div>
  );
}

export default LoginPage;