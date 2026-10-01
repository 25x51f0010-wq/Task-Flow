import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import PublicNav from '../components/PublicNav.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
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
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create account');
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
          <h1>Create your account</h1>
          <p className="muted">Start organizing your work with TaskFlow</p>

          <form onSubmit={submit}>
            <label>Full Name</label>
            <div className="input-icon">
              <User size={16} />
              <input type="text" placeholder="Your name" value={name}
                onChange={(e) => setName(e.target.value)} required />
            </div>

            <label>Email Address</label>
            <div className="input-icon">
              <Mail size={16} />
              <input type="email" placeholder="name@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <label>Password</label>
            <div className="input-icon">
              <Lock size={16} />
              <input type={show ? 'text' : 'password'} placeholder="At least 6 characters"
                value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              <button type="button" className="eye" onClick={() => setShow(!show)}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && <div className="error">{error}</div>}
            <button className="btn btn-primary btn-block" disabled={busy}>
              {busy ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="muted small center">
            Already have an account? <Link to="/login">Sign in →</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
