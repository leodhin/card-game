import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

function Header() {
  const navigate = useNavigate();

  // Check if the user is logged in by checking for the token in localStorage
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    // Remove the token from localStorage
    localStorage.removeItem("token");
    alert("You have been logged out.");
    navigate("/login"); // Redirect to the login page
  };

  return (
    <header className="header">
      <div className="header-container">
        <nav className="nav">
          <ul className="nav-list">
            {isLoggedIn ? (
              <>
                <li className="nav-item">
                  <Link to="/deck-generator">Deck Generator</Link>
                </li>
                <li className="nav-item">
                  <Link to="/card-generator">Card Generator</Link>
                </li>
                <li className="nav-item">
                  <Link to="/card-list">Cards</Link>
                </li>
                <li className="nav-item">
                  <Link to="/decks">Decks</Link>
                </li>
                <li className="nav-item" onClick={handleLogout}>
                  <Link to="/decks">Logout</Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
        {isLoggedIn && (
          <div className="profile-icon" onClick={() => navigate("/profile")}>
            <img
              src="https://picsum.photos/200"
              alt="Profile"
            />
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;