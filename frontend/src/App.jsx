import { Navigate, Route, Routes } from 'react-router-dom';
import { HOME, Protected, useAuth } from './auth';
import { Layout } from './components';
import { Login, Signup } from './pages/Auth';
import Password from './pages/Password';
import { AdminDashboard, AdminStores, AdminUsers } from './pages/Admin';
import UserStores from './pages/UserStores';
import OwnerDashboard from './pages/Owner';

const wrap = (roles, el) => (
  <Protected roles={roles}><Layout>{el}</Layout></Protected>
);

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin" element={wrap(['admin'], <AdminDashboard />)} />
      <Route path="/admin/users" element={wrap(['admin'], <AdminUsers />)} />
      <Route path="/admin/stores" element={wrap(['admin'], <AdminStores />)} />
      <Route path="/stores" element={wrap(['user'], <UserStores />)} />
      <Route path="/owner" element={wrap(['owner'], <OwnerDashboard />)} />
      <Route path="/password" element={wrap(null, <Password />)} />
      <Route path="*" element={<Navigate to={user ? HOME[user.role] : '/login'} replace />} />
    </Routes>
  );
}
