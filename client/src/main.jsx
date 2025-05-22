import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import routesConfig from './config/routes';
import './index.css';
import AuthenticationLayout from './hocs/AuthenticationLayout';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={5000} />
      <Routes>
        {routesConfig.map(({ path, component: Component, private: isPrivate, hideHeader = false, title }, index) => {
          if (isPrivate) {
            return (
              <Route
                key={index}
                path={path}
                element={
                  <AuthenticationLayout title={title} hideHeader={hideHeader}>
                    <Component />
                  </AuthenticationLayout>
                }
              />
            );
          }
          return <Route key={index} path={path} element={<Component />} />;
        })}
      </Routes>
    </BrowserRouter>
  </StrictMode>
);