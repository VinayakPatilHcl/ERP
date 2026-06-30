import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Hospital, Sparkles, ShieldCheck, Activity } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-hero">
        <div className="hero-brand">
          <div className="brand-mark"><Hospital size={18} /></div>
          <span>Hospital ERP</span>
        </div>
        <div>
          <h2>
            <span>Run your clinic</span>
            <span className="gradient-text">at the speed of thought.</span>
          </h2>
          <p>
            Patients, appointments, consultations, billing and pharmacy — unified in one
            calm, AI-assisted workspace. Built for clinicians who want fewer clicks and more care.
          </p>
          <div className="hero-tags">
            <span className="tag"><Sparkles size={11} style={{ verticalAlign: -1, marginRight: 4 }} />AI-ready</span>
            <span className="tag"><ShieldCheck size={11} style={{ verticalAlign: -1, marginRight: 4 }} />Role-based access</span>
            <span className="tag"><Activity size={11} style={{ verticalAlign: -1, marginRight: 4 }} />Real-time dashboards</span>
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1, fontSize: 12, color: '#7b80a0' }}>
          © {new Date().getFullYear()} Hospital ERP · v0.1
        </div>
      </div>
      <div className="login-form-side">
        <form className="login-card" onSubmit={onSubmit}>
          <h1>Welcome back</h1>
          <div className="sub">Sign in to continue to your workspace.</div>
          <div style={{ marginBottom: 14 }}>
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <div className="hint">
            Demo credentials: <code>admin</code> / <code>admin123</code>
          </div>
        </form>
      </div>
    </div>
  );
}
