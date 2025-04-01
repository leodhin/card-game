import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import routesConfig from './config/routes';
import './index.css';

import AuthenticationLayout from './hocs/AuthenticationLayout';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Pass the output of RouteBuilder directly */}
        {routesConfig.map(({ path, component: Component, private: isPrivate }, index) => {
          if (isPrivate) {
            return (
              <Route
                key={index}
                path={path}
                element={
                  <AuthenticationLayout>
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