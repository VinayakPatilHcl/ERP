import { FormEvent, useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../auth/AuthContext';

interface UserRow {
  id: number;
  username: string;
  fullName: string;
  email?: string;
  enabled: boolean;
  roles: string[];
}

const ALL_ROLES = ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PHARMACIST'];
const USERNAME_RE = /^[A-Za-z0-9._-]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormState = {
  username: string;
  password: string;
  fullName: string;
  email: string;
  roles: string[];
};

function validate(f: FormState): Record<string, string> {
  const e: Record<string, string> = {};
  const u = f.username.trim();
  if (!u) e.username = 'Username is required';
  else if (u.length < 3) e.username = 'Must be at least 3 characters';
  else if (u.length > 64) e.username = 'Must be at most 64 characters';
  else if (!USERNAME_RE.test(u)) e.username = 'Only letters, digits, dot, underscore and hyphen are allowed';

  if (!f.password) e.password = 'Password is required';
  else if (f.password.length < 6) e.password = 'Must be at least 6 characters';
  else if (f.password.length > 100) e.password = 'Must be at most 100 characters';

  if (!f.fullName.trim()) e.fullName = 'Full name is required';
  else if (f.fullName.trim().length > 120) e.fullName = 'Must be at most 120 characters';

  if (f.email && !EMAIL_RE.test(f.email.trim())) e.email = 'Enter a valid email address';

  if (f.roles.length === 0) e.roles = 'Select at least one role';
  return e;
}

export default function UsersPage() {
  const { hasRole } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    roles: ['RECEPTIONIST'] as string[],
  });
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [resetFor, setResetFor] = useState<UserRow | null>(null);
  const [newPwd, setNewPwd] = useState('');
  const [newPwdTouched, setNewPwdTouched] = useState(false);

  const fieldErrors = validate(form);
  const isFormValid = Object.keys(fieldErrors).length === 0;
  const showErr = (k: string) => (touched[k] ? fieldErrors[k] : undefined);

  const load = () => api.get('/auth/users').then((r) => setUsers(r.data));
  useEffect(() => { load(); }, []);

  if (!hasRole('ADMIN')) {
    return <div className="card">You do not have access to this page.</div>;
  }

  const toggleRole = (role: string) => {
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter((r) => r !== role) : [...f.roles, role],
    }));
  };

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setTouched({ username: true, password: true, fullName: true, email: true, roles: true });
    if (!isFormValid) return;
    try {
      await api.post('/auth/register', { ...form, username: form.username.trim(), fullName: form.fullName.trim(), email: form.email.trim() || undefined });
      setShowForm(false);
      setForm({ username: '', password: '', fullName: '', email: '', roles: ['RECEPTIONIST'] });
      setTouched({});
      load();
    } catch (err: any) {
      const data = err?.response?.data;
      const details = Array.isArray(data?.details) ? data.details.join('; ') : '';
      setError(details || data?.message || 'Failed to create user');
    }
  };

  const toggleEnabled = async (u: UserRow) => {
    await api.patch(`/auth/users/${u.id}/enabled`, { enabled: !u.enabled });
    load();
  };

  const newPwdError = !newPwd ? 'Password is required' : newPwd.length < 6 ? 'Must be at least 6 characters' : newPwd.length > 100 ? 'Must be at most 100 characters' : '';

  const submitReset = async (e: FormEvent) => {
    e.preventDefault();
    if (!resetFor) return;
    setNewPwdTouched(true);
    if (newPwdError) return;
    await api.post(`/auth/users/${resetFor.id}/reset-password`, { password: newPwd });
    setResetFor(null);
    setNewPwd('');
    setNewPwdTouched(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Users</h1>
        <button onClick={() => setShowForm(!showForm)}>{showForm ? 'Close' : '+ Add User'}</button>
      </div>

      {showForm && (
        <form className="card" onSubmit={onCreate}>
          {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}
          <div className="grid grid-3">
            <div>
              <label>Username *</label>
              <input
                maxLength={64}
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                onBlur={() => setTouched((t) => ({ ...t, username: true }))}
                style={showErr('username') ? { borderColor: 'crimson' } : undefined}
              />
              {showErr('username') && <div style={{ color: 'crimson', fontSize: 12 }}>{showErr('username')}</div>}
            </div>
            <div>
              <label>Password * (min 6)</label>
              <input
                type="password"
                maxLength={100}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                style={showErr('password') ? { borderColor: 'crimson' } : undefined}
              />
              {showErr('password') && <div style={{ color: 'crimson', fontSize: 12 }}>{showErr('password')}</div>}
            </div>
            <div>
              <label>Full Name *</label>
              <input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
                style={showErr('fullName') ? { borderColor: 'crimson' } : undefined}
              />
              {showErr('fullName') && <div style={{ color: 'crimson', fontSize: 12 }}>{showErr('fullName')}</div>}
            </div>
            <div>
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                style={showErr('email') ? { borderColor: 'crimson' } : undefined}
              />
              {showErr('email') && <div style={{ color: 'crimson', fontSize: 12 }}>{showErr('email')}</div>}
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label>Roles *</label>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {ALL_ROLES.map((r) => (
                  <label key={r} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={form.roles.includes(r)}
                      onChange={() => { toggleRole(r); setTouched((t) => ({ ...t, roles: true })); }}
                    />
                    {r}
                  </label>
                ))}
              </div>
              {showErr('roles') && <div style={{ color: 'crimson', fontSize: 12 }}>{showErr('roles')}</div>}
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button type="submit" disabled={!isFormValid}>Create</button>
          </div>
        </form>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Roles</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.fullName}</td>
                <td>{u.email}</td>
                <td>{u.roles.join(', ')}</td>
                <td>{u.enabled ? 'Active' : 'Disabled'}</td>
                <td>
                  <button className="secondary" onClick={() => toggleEnabled(u)}>
                    {u.enabled ? 'Disable' : 'Enable'}
                  </button>{' '}
                  <button className="secondary" onClick={() => { setResetFor(u); setNewPwd(''); }}>
                    Reset Password
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#6b7280' }}>No users</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {resetFor && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Reset password for {resetFor.username}</h3>
          <form onSubmit={submitReset} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label>New password (min 6)</label>
              <input
                type="password"
                maxLength={100}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                onBlur={() => setNewPwdTouched(true)}
                style={newPwdTouched && newPwdError ? { borderColor: 'crimson' } : undefined}
              />
              {newPwdTouched && newPwdError && <div style={{ color: 'crimson', fontSize: 12 }}>{newPwdError}</div>}
            </div>
            <button type="submit" disabled={!!newPwdError}>Save</button>
            <button type="button" className="secondary" onClick={() => { setResetFor(null); setNewPwdTouched(false); }}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}
