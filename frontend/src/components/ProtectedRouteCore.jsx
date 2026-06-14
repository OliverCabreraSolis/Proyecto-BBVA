import { Navigate } from 'react-router-dom';
import { haySesionCore } from '../services/coreService';

export default function ProtectedRouteCore({ children }) {
  if (!haySesionCore()) return <Navigate to="/" replace />;
  return children;
}