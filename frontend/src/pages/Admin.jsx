import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { FilterBar, Form, SortTable, Stars, useList } from '../components';

export function AdminDashboard() {
  const [s, setS] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api.get('/admin/stats').then((r) => setS(r.data)).catch((e) => setErr(errMsg(e))); }, []);
  return (
    <section>
      <h1>Dashboard</h1>
      {err && <p className="err">{err}</p>}
      {s && (
        <div className="stats">
          <div><b>{s.users}</b>Total users</div>
          <div><b>{s.stores}</b>Total stores</div>
          <div><b>{s.ratings}</b>Ratings submitted</div>
        </div>
      )}
    </section>
  );
}

const ROLES = ['user', 'admin', 'owner'];
const LABEL = { user: 'Normal user', admin: 'Admin', owner: 'Store owner' };

export function AdminUsers() {
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ by: 'name', order: 'asc' });
  const { rows, error, reload } = useList('/admin/users', filters, sort);
  const [detail, setDetail] = useState(null);

  const columns = [
    { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' }, { key: 'role', label: 'Role', render: (r) => LABEL[r.role] },
  ];

  return (
    <section>
      <h1>Users</h1>
      <details className="add">
        <summary>Add a user</summary>
        <Form
          submitLabel="Add user" successText="User added" resetOnSuccess
          fields={[
            { name: 'name', label: 'Name (20-60 characters)' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'password', label: 'Password', type: 'password' },
            { name: 'address', label: 'Address', type: 'textarea' },
            { name: 'role', label: 'Role', options: ROLES },
          ]}
          onSubmit={async (v) => { await api.post('/admin/users', v); reload(); }}
        />
      </details>
      <FilterBar filters={filters} setFilters={setFilters}
        fields={[{ name: 'name', label: 'Name' }, { name: 'email', label: 'Email' }, { name: 'address', label: 'Address' }, { name: 'role', label: 'Role', options: ROLES }]} />
      {error && <p className="err">{error}</p>}
      <SortTable columns={columns} rows={rows} sort={sort} onSort={setSort}
        onRowClick={(r) => api.get(`/admin/users/${r.id}`).then((x) => setDetail(x.data))} />
      {detail && (
        <aside className="detail" role="dialog" aria-label="User details">
          <button className="ghost" onClick={() => setDetail(null)}>Close</button>
          <h2>{detail.name}</h2>
          <dl>
            <dt>Email</dt><dd>{detail.email}</dd>
            <dt>Address</dt><dd>{detail.address || '—'}</dd>
            <dt>Role</dt><dd>{LABEL[detail.role]}</dd>
            {detail.role === 'owner' && (<><dt>Store rating</dt><dd>{detail.rating ? <><Stars value={detail.rating} /> {detail.rating}</> : 'No ratings yet'}</dd></>)}
          </dl>
        </aside>
      )}
    </section>
  );
}

export function AdminStores() {
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ by: 'name', order: 'asc' });
  const { rows, error, reload } = useList('/admin/stores', filters, sort);
  const columns = [
    { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'address', label: 'Address' },
    { key: 'rating', label: 'Rating', render: (r) => (r.rating ? `${r.rating} / 5` : 'No ratings') },
  ];
  return (
    <section>
      <h1>Stores</h1>
      <details className="add">
        <summary>Add a store</summary>
        <Form
          submitLabel="Add store" successText="Store added" resetOnSuccess
          fields={[
            { name: 'name', label: 'Store name (20-60 characters)' },
            { name: 'email', label: 'Store email', type: 'email' },
            { name: 'address', label: 'Address', type: 'textarea' },
            { name: 'ownerEmail', label: 'Owner email (optional, must be a store owner)' },
          ]}
          onSubmit={async (v) => { await api.post('/admin/stores', v); reload(); }}
        />
      </details>
      <FilterBar filters={filters} setFilters={setFilters}
        fields={[{ name: 'name', label: 'Name' }, { name: 'email', label: 'Email' }, { name: 'address', label: 'Address' }]} />
      {error && <p className="err">{error}</p>}
      <SortTable columns={columns} rows={rows} sort={sort} onSort={setSort} />
    </section>
  );
}
