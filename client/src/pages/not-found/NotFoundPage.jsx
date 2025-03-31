import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';
import NotFoundImage from '../../assets/404.png'; // Adjust the path to your 404 image

const NotFoundPage = () => {
  return (
    <div className="not-found-container">
      <img src={NotFoundImage} alt="404 Not Found" className="not-found-image" />
      <h1 className="not-found-title">404</h1>
      <p className="not-found-message">Oops! The page you're looking for doesn't exist.</p>
      <Link to="/" className="not-found-link">
        Go Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;