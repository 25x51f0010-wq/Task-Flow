import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import PublicNav from '../components/PublicNav.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not sign in');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <PublicNav />
      <main className="auth-wrap">
        <div className="card auth-card">
          <div className="auth-icon"><Sparkles size={22} /></div>
          <h1>Welcome back</h1>
          <p className="muted">Sign in to access your tasks and productivity dashboard</p>

          <form onSubmit={submit}>
            <label>Email Address</label>
            <div className="input-icon">
              <Mail size={16} />
              <input type="email" placeholder="name@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <label>Password</label>
            <div className="input-icon">
              <Lock size={16} />
              <input type={show ? 'text' : 'password'} placeholder="Enter your password"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" className="eye" onClick={() => setShow(!show)}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && <div className="error">{error}</div>}
            <button className="btn btn-primary btn-block" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in to TaskFlow'}
            </button>
          </form>

          <p className="muted small center">
            Don't have an account? <Link to="/register">Create an account →</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
