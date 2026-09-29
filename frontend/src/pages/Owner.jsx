import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { SortTable, Stars } from '../components';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [sort, setSort] = useState({ by: 'date', order: 'desc' });
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/owner/dashboard', { params: { sortBy: sort.by, order: sort.order } })
      .then((r) => setData(r.data)).catch((e) => setErr(errMsg(e)));
  }, [sort]);

  if (err) return <p className="err">{err}</p>;
  if (!data) return <p className="muted">Loading…</p>;
  if (!data.store) return <section><h1>My store</h1><p className="muted">No store is linked to your account yet. Ask an administrator to assign one.</p></section>;

  const columns = [
    { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' },
    { key: 'rating', label: 'Rating', render: (r) => <Stars value={r.rating} /> },
    { key: 'date', label: 'Rated on', render: (r) => new Date(r.date).toLocaleDateString() },
  ];
  return (
    <section>
      <h1>{data.store.name}</h1>
      <p className="muted">{data.store.address}</p>
      <div className="stats">
        <div><b>{data.store.count ? data.store.average : '—'}</b>Average rating</div>
        <div><b>{data.store.count}</b>Ratings received</div>
      </div>
      <h2>Who rated your store</h2>
      <SortTable columns={columns} rows={data.raters} sort={sort} onSort={setSort} />
    </section>
  );
}
