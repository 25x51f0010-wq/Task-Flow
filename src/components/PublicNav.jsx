import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

export default function PublicNav() {
  return (
    <nav className="navbar">
      <Logo to="/login" />
      <div className="nav-actions">
        <Link to="/login" className="nav-link">Sign In</Link>
        <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
      </div>
    </nav>
  );
}
