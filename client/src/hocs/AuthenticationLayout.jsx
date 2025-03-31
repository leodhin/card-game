import { Navigate } from "react-router";
import { HeaderElementLayout } from '../components/HeaderElementLayout';


const AuthenticationLayout = (props) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (!isAuthenticated) {
    return (
      <Navigate to="/login" state={{ from: location }} replace />
    )
  }
  return <HeaderElementLayout title={props.title}>{props.children}</HeaderElementLayout>;
}


export default AuthenticationLayout;