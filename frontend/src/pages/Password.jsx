import api from '../api';
import { Form } from '../components';

export default function Password() {
  return (
    <section className="narrow">
      <h1>Change password</h1>
      <Form
        submitLabel="Update password"
        successText="Password updated"
        resetOnSuccess
        fields={[{ name: 'password', label: 'New password', type: 'password' }]}
        onSubmit={(v) => api.put('/auth/password', { password: v.password })}
      />
    </section>
  );
}
