import { useEffect, useMemo, useState } from 'react';
import {
  ListChecks, Clock, CheckCircle2, Sparkles, Search, Plus,
  Pencil, Trash2, LogOut, Check, X,
} from 'lucide-react';
import Logo from '../components/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api';

const PRIORITIES = ['Low', 'Medium', 'High'];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const fmtDate = (d) =>
  new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const [editId, setEditId] = useState(null);
  const [edit, setEdit] = useState({ title: '', description: '', priority: 'Medium' });

  useEffect(() => {
    api.get('/tasks')
      .then((res) => setTasks(res.data))
      .catch(() => setError('Could not load tasks'))
      .finally(() => setLoading(false));
  }, []);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active = total - completed;
  const rate = total ? Math.round((completed / total) * 100) : 0;

  const visible = useMemo(
    () =>
      tasks.filter((t) => {
        if (filter === 'active' && t.completed) return false;
        if (filter === 'done' && !t.completed) return false;
        const q = query.trim().toLowerCase();
        return !q || t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
      }),
    [tasks, filter, query]
  );

  const addTask = async () => {
    if (!title.trim()) return;
    try {
      const { data } = await api.post('/tasks', { title: title.trim(), priority });
      setTasks([data, ...tasks]);
      setTitle('');
    } catch {
      setError('Could not add task');
    }
  };

  const toggle = async (task) => {
    const { data } = await api.put(`/tasks/${task._id}`, { completed: !task.completed });
    setTasks(tasks.map((t) => (t._id === data._id ? data : t)));
  };

  const remove = async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks(tasks.filter((t) => t._id !== id));
  };

  const startEdit = (t) => {
    setEditId(t._id);
    setEdit({ title: t.title, description: t.description || '', priority: t.priority });
  };

  const saveEdit = async () => {
    if (!edit.title.trim()) return;
    const { data } = await api.put(`/tasks/${editId}`, edit);
    setTasks(tasks.map((t) => (t._id === data._id ? data : t)));
    setEditId(null);
  };

  const stats = [
    { label: 'Total Tasks', value: total, icon: <ListChecks size={18} />, cls: 'blue' },
    { label: 'In Progress', value: active, icon: <Clock size={18} />, cls: 'amber' },
    { label: 'Completed', value: completed, icon: <CheckCircle2 size={18} />, cls: 'green' },
  ];

  return (
    <div className="page">
      <nav className="navbar">
        <Logo to="/dashboard" />
        <div className="nav-actions">
          <div className="user-chip">
            <span className="avatar">{user.name[0].toUpperCase()}</span>
            {user.name}
            <span className="dot" />
          </div>
          <button className="nav-link logout" onClick={logout}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </nav>

      <main className="container">
        <header className="hero">
          <div>
            <h1>{greeting()}, <span className="grad">{user.name}</span></h1>
            <p className="muted">
              {total === 0
                ? 'You have no tasks yet. Add your first one below!'
                : `You have completed ${completed} of ${total} tasks (${rate}%). Keep up the great momentum!`}
            </p>
          </div>
          <div className="muted small">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', month: 'short', day: 'numeric', year: 'numeric',
            })}
          </div>
        </header>

        <section className="stats">
          {stats.map((s) => (
            <div className="card stat" key={s.label}>
              <div className="stat-top">
                <span>{s.label}</span>
                <span className={`stat-icon ${s.cls}`}>{s.icon}</span>
              </div>
              <strong>{s.value}</strong>
            </div>
          ))}
          <div className="card stat">
            <div className="stat-top">
              <span>Completion Rate</span>
              <span className="stat-icon purple"><Sparkles size={18} /></span>
            </div>
            <strong>{rate}%</strong>
            <div className="bar"><div style={{ width: `${rate}%` }} /></div>
          </div>
        </section>

        <section className="card add-box">
          <input
            placeholder="What needs to be done? (e.g. Finish quarterly report)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
          />
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
          <button className="btn btn-primary" onClick={addTask} disabled={!title.trim()}>
            <Plus size={16} /> Add Task
          </button>
        </section>

        {error && <div className="error">{error}</div>}

        <section className="toolbar">
          <div className="tabs">
            <button className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>All ({total})</button>
            <button className={filter === 'active' ? 'on' : ''} onClick={() => setFilter('active')}>Active ({active})</button>
            <button className={filter === 'done' ? 'on' : ''} onClick={() => setFilter('done')}>Done ({completed})</button>
          </div>
          <div className="search">
            <Search size={15} />
            <input placeholder="Search tasks..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </section>

        <section className="task-list">
          {loading && <p className="muted">Loading tasks…</p>}
          {!loading && visible.length === 0 && (
            <div className="card empty">No tasks to show.</div>
          )}

          {visible.map((t) =>
            editId === t._id ? (
              <div className="card task editing" key={t._id}>
                <div className="edit-form">
                  <input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} placeholder="Title" />
                  <input value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} placeholder="Description (optional)" />
                  <div className="edit-row">
                    <select value={edit.priority} onChange={(e) => setEdit({ ...edit, priority: e.target.value })}>
                      {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                    </select>
                    <button className="icon-btn ok" onClick={saveEdit}><Check size={16} /></button>
                    <button className="icon-btn" onClick={() => setEditId(null)}><X size={16} /></button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`card task ${t.completed ? 'done' : ''}`} key={t._id}>
                <button className={`check ${t.completed ? 'on' : ''}`} onClick={() => toggle(t)}>
                  {t.completed && <Check size={14} />}
                </button>
                <div className="task-body">
                  <div className="task-title">
                    <span>{t.title}</span>
                    <span className={`badge ${t.priority.toLowerCase()}`}>{t.priority}</span>
                  </div>
                  {t.description && <p className="task-desc">{t.description}</p>}
                  <span className="task-time"><Clock size={12} /> {fmtDate(t.createdAt)}</span>
                </div>
                <div className="task-actions">
                  <button className="icon-btn" onClick={() => startEdit(t)}><Pencil size={16} /></button>
                  <button className="icon-btn danger" onClick={() => remove(t._id)}><Trash2 size={16} /></button>
                </div>
              </div>
            )
          )}
        </section>
      </main>
    </div>
  );
}
