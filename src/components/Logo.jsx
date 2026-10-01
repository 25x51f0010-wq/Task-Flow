import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="logo">
      <span className="logo-icon"><Sparkles size={18} /></span>
      <span className="logo-text">Task<span>Flow</span></span>
    </Link>
  );
}
