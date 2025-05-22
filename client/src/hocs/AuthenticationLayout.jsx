import { Navigate, useLocation } from "react-router-dom";
import { HeaderElementLayout } from '../containers/Header';

const AuthenticationLayout = (props) => {
  const isAuthenticated = localStorage.getItem('token');
  const location = useLocation(); // Get the current location

  if (!isAuthenticated) {
    return (
      <Navigate to="/login" state={{ from: location.pathname }} replace />
    );
  }

  return <HeaderElementLayout title={props.title} hideHeader={props.hideHeader} >{props.children}</HeaderElementLayout>;
};

export default AuthenticationLayout;