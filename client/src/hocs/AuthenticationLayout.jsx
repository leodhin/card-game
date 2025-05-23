import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import { HeaderElementLayout } from '../containers/Header';
import useSessionStore from '../stores/sessionStore';

const AuthenticationLayout = (props) => {
  const { isAuthenticated, checkPendingNotifications } = useSessionStore();
  const location = useLocation();

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        await checkPendingNotifications();
      } catch (error) {
        console.error('Error checking pending notifications:', error);
      }
    }

    checkNotifications();
  }, []);

  if (!isAuthenticated) {
    return (
      <Navigate to="/login" state={{ from: location.pathname }} replace />
    );
  }

  return <HeaderElementLayout title={props.title} hideHeader={props.hideHeader} >{props.children}</HeaderElementLayout>;
};

export default AuthenticationLayout;