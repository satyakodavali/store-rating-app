import { useState } from 'react';
import api, { errMsg } from '../api';
import { FilterBar, SortTable, Stars, useList } from '../components';

export default function UserStores() {
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ by: 'name', order: 'asc' });
  const { rows, error, reload } = useList('/stores', filters, sort);
  const [msg, setMsg] = useState('');

  const rate = async (id, n) => {
    try { await api.put(`/stores/${id}/rating`, { rating: n }); setMsg(''); reload(); }
    catch (e) { setMsg(errMsg(e)); }
  };

  const columns = [
    { key: 'name', label: 'Store' },
    { key: 'address', label: 'Address' },
    { key: 'rating', label: 'Overall rating', render: (r) => (r.rating ? `${r.rating} / 5` : 'No ratings') },
    { key: 'myRating', label: 'Your rating', render: (r) => (r.myRating ? `${r.myRating} / 5` : 'Not rated') },
    { key: 'act', label: 'Rate or change', sortable: false, render: (r) => <Stars value={r.myRating} onPick={(n) => rate(r.id, n)} /> },
  ];

  return (
    <section>
      <h1>Stores</h1>
      <FilterBar filters={filters} setFilters={setFilters} fields={[{ name: 'name', label: 'Name' }, { name: 'address', label: 'Address' }]} />
      {(error || msg) && <p className="err">{error || msg}</p>}
      <SortTable columns={columns} rows={rows} sort={sort} onSort={setSort} />
    </section>
  );
}
