import { Navigate, useLocation } from "react-router-dom";
import { HeaderElementLayout } from '../containers/Header';
import useSessionStore from '../stores/sessionStore';

const AuthenticationLayout = (props) => {
  const { isAuthenticated } = useSessionStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate to="/login" state={{ from: location.pathname }} replace />
    );
  }

  return <HeaderElementLayout title={props.title} hideHeader={props.hideHeader} >{props.children}</HeaderElementLayout>;
};

export default AuthenticationLayout;