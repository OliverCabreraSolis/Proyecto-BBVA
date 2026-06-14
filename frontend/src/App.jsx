import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginCorePage from './pages/LoginCorePage';
import DashboardCorePage from './pages/DashboardCorePage';
import ProtectedRouteCore from './components/ProtectedRouteCore';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginCorePage />} />
        <Route path="/dashboard" element={
          <ProtectedRouteCore>
            <DashboardCorePage />
          </ProtectedRouteCore>
        } />
      </Routes>
    </BrowserRouter>
  );
}