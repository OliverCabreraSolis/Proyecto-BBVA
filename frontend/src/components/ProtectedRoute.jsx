import { Navigate } from 'react-router-dom';
import { haySesion } from '../services/authService';

export default function ProtectedRoute({ children }) {
  if (!haySesion()) return <Navigate to="/login" replace />;
  return children;
}