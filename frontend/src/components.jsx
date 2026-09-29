import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api, { errMsg } from './api';
import { useAuth } from './auth';
import { validate } from './validators';

const NAV = {
  admin: [['/admin', 'Dashboard'], ['/admin/users', 'Users'], ['/admin/stores', 'Stores']],
  user: [['/stores', 'Stores']],
  owner: [['/owner', 'My store']],
};

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <>
      <header className="bar">
        <strong className="brand">Store Ratings</strong>
        <nav>
          {NAV[user.role].map(([to, label]) => (
            <NavLink key={to} to={to} end>{label}</NavLink>
          ))}
          <NavLink to="/password">Change password</NavLink>
        </nav>
        <button className="ghost" onClick={() => { logout(); nav('/login'); }}>Log out</button>
      </header>
      <main>{children}</main>
    </>
  );
}

export function Stars({ value, onPick }) {
  return (
    <span className="stars" role={onPick ? 'radiogroup' : 'img'} aria-label={`${value || 0} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n} type="button" disabled={!onPick}
          className={n <= Math.round(value || 0) ? 'on' : ''}
          onClick={() => onPick?.(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >★</button>
      ))}
    </span>
  );
}

// columns: [{ key, label, sortable?, render? }]
export function SortTable({ columns, rows, sort, onSort, onRowClick }) {
  return (
    <div className="scroll">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} aria-sort={sort.by === c.key ? (sort.order === 'asc' ? 'ascending' : 'descending') : 'none'}>
                {c.sortable === false ? c.label : (
                  <button className="th" onClick={() => onSort({ by: c.key, order: sort.by === c.key && sort.order === 'asc' ? 'desc' : 'asc' })}>
                    {c.label} {sort.by === c.key ? (sort.order === 'asc' ? '▲' : '▼') : ''}
                  </button>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={columns.length} className="muted">Nothing to show yet.</td></tr>}
          {rows.map((r) => (
            <tr key={r.id} onClick={() => onRowClick?.(r)} className={onRowClick ? 'click' : ''}>
              {columns.map((c) => <td key={c.key}>{c.render ? c.render(r) : r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function useList(url, filters, sort) {
  const [state, setState] = useState({ rows: [], loading: true, error: '' });
  const [tick, setTick] = useState(0);
  const key = JSON.stringify([url, filters, sort, tick]);
  useEffect(() => {
    const t = setTimeout(() => {
      api.get(url, { params: { ...filters, sortBy: sort.by, order: sort.order } })
        .then((r) => setState({ rows: r.data, loading: false, error: '' }))
        .catch((e) => setState((s) => ({ ...s, loading: false, error: errMsg(e) })));
    }, 250);
    return () => clearTimeout(t);
  }, [key]); // eslint-disable-line
  return { ...state, reload: () => setTick((n) => n + 1) };
}

export function FilterBar({ fields, filters, setFilters }) {
  return (
    <div className="filters">
      {fields.map((f) =>
        f.options ? (
          <select key={f.name} aria-label={f.label} value={filters[f.name] || ''} onChange={(e) => setFilters({ ...filters, [f.name]: e.target.value })}>
            <option value="">All {f.label.toLowerCase()}s</option>
            {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input key={f.name} placeholder={`Search ${f.label.toLowerCase()}`} aria-label={f.label}
            value={filters[f.name] || ''} onChange={(e) => setFilters({ ...filters, [f.name]: e.target.value })} />
        )
      )}
    </div>
  );
}

// fields: [{ name, label, type?, options? }]
export function Form({ fields, onSubmit, submitLabel, successText = 'Saved', resetOnSuccess = false }) {
  const blank = Object.fromEntries(fields.map((f) => [f.name, f.options ? f.options[0] : '']));
  const [v, setV] = useState(blank);
  const [errs, setErrs] = useState({});
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const er = validate(v, fields.map((f) => f.name));
    setErrs(er);
    if (Object.keys(er).length) return;
    setBusy(true); setMsg(null);
    try {
      await onSubmit(v);
      setMsg({ ok: true, text: successText });
      if (resetOnSuccess) setV(blank);
    } catch (x) {
      setMsg({ ok: false, text: errMsg(x) });
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} noValidate className="form">
      {fields.map((f) => (
        <label key={f.name}>
          {f.label}
          {f.options ? (
            <select value={v[f.name]} onChange={(e) => setV({ ...v, [f.name]: e.target.value })}>
              {f.options.map((o) => <option key={o}>{o}</option>)}
            </select>
          ) : f.type === 'textarea' ? (
            <textarea rows={3} value={v[f.name]} onChange={(e) => setV({ ...v, [f.name]: e.target.value })} />
          ) : (
            <input type={f.type || 'text'} value={v[f.name]} autoComplete={f.type === 'password' ? 'new-password' : 'off'}
              onChange={(e) => setV({ ...v, [f.name]: e.target.value })} />
          )}
          {errs[f.name] && <span className="err">{errs[f.name]}</span>}
        </label>
      ))}
      {msg && <p className={msg.ok ? 'ok' : 'err'} role="status">{msg.text}</p>}
      <button disabled={busy}>{busy ? 'Working…' : submitLabel}</button>
    </form>
  );
}
