import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { HOME, useAuth } from '../auth';
import { Form } from '../components';

function Shell({ title, children, footer }) {
  return (
    <div className="auth">
      <h1>{title}</h1>
      {children}
      <p className="muted">{footer}</p>
    </div>
  );
}

export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  return (
    <Shell title="Log in" footer={<>New here? <Link to="/signup">Create an account</Link></>}>
      <Form
        submitLabel="Log in"
        fields={[{ name: 'email', label: 'Email', type: 'email' }, { name: 'password', label: 'Password', type: 'password' }]}
        onSubmit={async (v) => {
          const { data } = await api.post('/auth/login', v);
          login(data);
          nav(HOME[data.user.role]);
        }}
      />
    </Shell>
  );
}

export function Signup() {
  const { login } = useAuth();
  const nav = useNavigate();
  return (
    <Shell title="Create your account" footer={<>Already registered? <Link to="/login">Log in</Link></>}>
      <Form
        submitLabel="Sign up"
        fields={[
          { name: 'name', label: 'Full name (20-60 characters)' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'address', label: 'Address', type: 'textarea' },
          { name: 'password', label: 'Password (8-16 characters, one uppercase, one special)', type: 'password' },
        ]}
        onSubmit={async (v) => {
          const { data } = await api.post('/auth/signup', v);
          login(data);
          nav(HOME[data.user.role]);
        }}
      />
    </Shell>
  );
}
