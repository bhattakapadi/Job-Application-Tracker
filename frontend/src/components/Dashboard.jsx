import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const STATUS_META = {
  Applied:   { color: '#3b82f6', bg: '#eff6ff' },
  Interview: { color: '#f59e0b', bg: '#fffbeb' },
  Offer:     { color: '#10b981', bg: '#ecfdf5' },
  Rejected:  { color: '#ef4444', bg: '#fef2f2' },
  Ghosted:   { color: '#6b7280', bg: '#f9fafb' },
};

const ALL_STATUSES = Object.keys(STATUS_META);

const NAV_ITEMS = [
  { label: 'Dashboard',    filter: 'All',       icon: '▦' },
  { label: 'Applications', filter: 'Applied',   icon: '◧' },
  { label: 'Interviews',   filter: 'Interview', icon: '◈' },
  { label: 'Offers',       filter: 'Offer',     icon: '◉' },
  { label: 'Rejected',     filter: 'Rejected',  icon: '✕' },
];

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '22px 24px',
      border: '1px solid #ede9e3', display: 'flex',
      flexDirection: 'column', gap: 4, animation: 'fadeUp 0.4s ease both',
    }}>
      <span style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 36, fontWeight: 800, color: accent || '#1a2332', letterSpacing: '-1.5px', lineHeight: 1.1, fontFamily: "'Playfair Display', serif" }}>{value}</span>
      <span style={{ fontSize: 12, color: '#aaa' }}>{sub}</span>
    </div>
  );
}

// Confirm delete modal
function ConfirmModal({ job, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, animation: 'fadeUp 0.2s ease both',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '32px 36px',
        maxWidth: 400, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ fontSize: 32, marginBottom: 12, textAlign: 'center' }}>🗑️</div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#111827', textAlign: 'center', marginBottom: 8 }}>
          Delete Application?
        </h3>
        <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 28, lineHeight: 1.6 }}>
          Are you sure you want to delete <strong style={{ color: '#111827' }}>{job.company_name}</strong>
          {job.position ? ` — ${job.position}` : ''}? This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '11px', background: 'transparent',
            border: '1.5px solid #e5e7eb', borderRadius: 10,
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit', color: '#6b7280',
          }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '11px', background: '#ef4444',
            border: 'none', borderRadius: 10, fontSize: 14,
            fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#fff',
          }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ user, token, onLogout }) {
  const [jobs, setJobs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('All');
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [showForm, setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmJob, setConfirmJob] = useState(null); // job to delete
  const [deleting, setDeleting]   = useState(null);
  const [form, setForm] = useState({
    company_name: '', position: '', job_url: '',
    salary_wished: '', current_status: 'Applied',
  });
  const [cvFile, setCvFile]               = useState(null);
  const [coverFile, setCoverFile]         = useState(null);
  const cvRef                             = useRef();
  const coverRef                          = useRef();

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchJobs = async () => {
    try {
      const res = await axios.get('/api/jobs', { headers: authHeaders });
      setJobs(res.data);
    } catch (err) {
      if (err.response?.status === 401) onLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  // Stats
  const total = jobs.length;
  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = jobs.filter(j => j.current_status === s).length;
    return acc;
  }, {});
  const responseRate = total > 0
    ? Math.round(((counts.Interview + counts.Offer) / total) * 100) : 0;

  const filtered = filter === 'All' ? jobs : jobs.filter(j => j.current_status === filter);

  // Handle nav click — sets both active nav and filter
  const handleNav = (item) => {
    setActiveNav(item.label);
    setFilter(item.filter);
  };

  // Create job with files
  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (cvFile)    data.append('cv', cvFile);
      if (coverFile) data.append('motivation_letter', coverFile);

      await axios.post('/api/jobs', data, {
        headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' },
      });

      setForm({ company_name: '', position: '', job_url: '', salary_wished: '', current_status: 'Applied' });
      setCvFile(null);
      setCoverFile(null);
      if (cvRef.current)    cvRef.current.value = '';
      if (coverRef.current) coverRef.current.value = '';
      setShowForm(false);
      fetchJobs();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Inline status update
  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`/api/jobs/${id}`, { current_status: status }, { headers: authHeaders });
      setJobs(jobs.map(j => j.id === id ? { ...j, current_status: status } : j));
    } catch (err) { console.error(err); }
  };

  // Delete — confirmed
  const handleDeleteConfirmed = async () => {
    if (!confirmJob) return;
    setDeleting(confirmJob.id);
    setConfirmJob(null);
    try {
      await axios.delete(`/api/jobs/${confirmJob.id}`, { headers: authHeaders });
      setJobs(jobs.filter(j => j.id !== confirmJob.id));
    } catch (err) { console.error(err); }
    finally { setDeleting(null); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f3ef', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 224, background: '#111827', display: 'flex',
        flexDirection: 'column', padding: '28px 16px',
        flexShrink: 0, position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px', marginBottom: 36 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'rgba(99,179,237,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
              <rect width="12" height="12" rx="2" fill="#fff" />
              <rect x="16" width="12" height="12" rx="2" fill="#fff" opacity="0.5" />
              <rect y="16" width="12" height="12" rx="2" fill="#fff" opacity="0.5" />
              <rect x="16" y="16" width="12" height="12" rx="2" fill="#fff" />
            </svg>
          </div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px' }}>JobTrackr</span>
        </div>

        {/* Nav items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
          {NAV_ITEMS.map(item => {
            const isActive = activeNav === item.label;
            const count = item.filter === 'All' ? total : counts[item.filter] || 0;
            return (
              <div
                key={item.label}
                onClick={() => handleNav(item)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: 10,
                  background: isActive ? 'rgba(99,179,237,0.14)' : 'transparent',
                  color: isActive ? '#93c5fd' : 'rgba(255,255,255,0.4)',
                  fontSize: 13, fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer', transition: 'all 0.15s',
                  borderLeft: isActive ? '2px solid #3b82f6' : '2px solid transparent',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; } }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 15 }}>{item.icon}</span>
                  {item.label}
                </div>
                {count > 0 && (
                  <span style={{
                    background: isActive ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.08)',
                    color: isActive ? '#93c5fd' : 'rgba(255,255,255,0.3)',
                    fontSize: 11, fontWeight: 700, padding: '1px 7px',
                    borderRadius: 999, minWidth: 20, textAlign: 'center',
                  }}>
                    {count}
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        {/* User + logout */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#fff', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
            </div>
          </div>
          <button onClick={onLogout} style={{
            width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)',
            border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.38)',
            fontSize: 12, fontWeight: 500, cursor: 'pointer', textAlign: 'left',
            fontFamily: 'inherit', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.38)'; }}
          >
            → Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 30, color: '#111827', letterSpacing: '-0.6px',
              fontWeight: 700, marginBottom: 4,
            }}>
              {greeting}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ color: '#9ca3af', fontSize: 14 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '11px 20px', background: '#111827', color: '#fff',
              border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 12px rgba(17,24,39,0.2)', transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1f2937'}
            onMouseLeave={e => e.currentTarget.style.background = '#111827'}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{showForm ? '−' : '+'}</span>
            {showForm ? 'Close Form' : 'Add Application'}
          </button>
        </div>

        {/* Add Application Form */}
        {showForm && (
          <div style={{
            background: '#fff', borderRadius: 16, padding: '28px 32px',
            marginBottom: 28, border: '1px solid #ede9e3',
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
            animation: 'fadeUp 0.3s ease both',
          }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#111827', marginBottom: 24 }}>
              New Application
            </h3>
            <form onSubmit={handleCreate}>
              {/* Text fields grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {[
                  { name: 'company_name', label: 'Company Name *', placeholder: 'Google', required: true },
                  { name: 'position',     label: 'Position',       placeholder: 'Software Engineer' },
                  { name: 'job_url',      label: 'Job URL',        placeholder: 'https://careers.google.com' },
                  { name: 'salary_wished',label: 'Salary',         placeholder: '€60,000' },
                ].map(f => (
                  <div key={f.name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                      {f.label}
                    </label>
                    <input
                      name={f.name} type="text" placeholder={f.placeholder}
                      required={f.required} value={form[f.name]}
                      onChange={e => setForm({ ...form, [e.target.name]: e.target.value })}
                      style={{
                        padding: '10px 14px', border: '1.5px solid #e5e7eb',
                        borderRadius: 10, fontSize: 14, fontFamily: 'inherit',
                        outline: 'none', color: '#111827', background: '#fafaf8',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* File uploads + status row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                {/* CV upload */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    CV / Resume
                  </label>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 14px', border: '1.5px dashed #e5e7eb',
                    borderRadius: 10, cursor: 'pointer', background: '#fafaf8',
                    color: cvFile ? '#111827' : '#9ca3af', fontSize: 13,
                    transition: 'border-color 0.2s',
                  }}>
                    <span style={{ fontSize: 16 }}>📄</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cvFile ? cvFile.name : 'Upload CV'}
                    </span>
                    <input
                      ref={cvRef} type="file" accept=".pdf,.doc,.docx"
                      style={{ display: 'none' }}
                      onChange={e => setCvFile(e.target.files[0] || null)}
                    />
                  </label>
                </div>

                {/* Cover letter upload */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    Cover Letter
                  </label>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 14px', border: '1.5px dashed #e5e7eb',
                    borderRadius: 10, cursor: 'pointer', background: '#fafaf8',
                    color: coverFile ? '#111827' : '#9ca3af', fontSize: 13,
                    transition: 'border-color 0.2s',
                  }}>
                    <span style={{ fontSize: 16 }}>✉️</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {coverFile ? coverFile.name : 'Upload Letter'}
                    </span>
                    <input
                      ref={coverRef} type="file" accept=".pdf,.doc,.docx"
                      style={{ display: 'none' }}
                      onChange={e => setCoverFile(e.target.files[0] || null)}
                    />
                  </label>
                </div>

                {/* Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    Status
                  </label>
                  <select
                    value={form.current_status}
                    onChange={e => setForm({ ...form, current_status: e.target.value })}
                    style={{
                      padding: '10px 14px', border: '1.5px solid #e5e7eb',
                      borderRadius: 10, fontSize: 14, fontFamily: 'inherit',
                      outline: 'none', color: '#111827', background: '#fafaf8', cursor: 'pointer',
                    }}
                  >
                    {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  padding: '10px 20px', background: 'transparent',
                  border: '1.5px solid #e5e7eb', borderRadius: 10,
                  fontSize: 14, fontWeight: 500, cursor: 'pointer',
                  fontFamily: 'inherit', color: '#6b7280',
                }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} style={{
                  padding: '10px 28px', background: '#111827', color: '#fff',
                  border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', opacity: submitting ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}>
                  {submitting ? 'Saving...' : 'Save Application'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <StatCard label="Total Applied"   value={total}               sub="All time" />
          <StatCard label="Interviews"      value={counts.Interview}    sub="Active pipeline"     accent="#f59e0b" />
          <StatCard label="Offers"          value={counts.Offer}        sub="Received"            accent="#10b981" />
          <StatCard label="Response Rate"   value={`${responseRate}%`}  sub="Interview conversion" accent="#3b82f6" />
        </div>

        {/* Pipeline bar */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '20px 24px',
          border: '1px solid #ede9e3', marginBottom: 24,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>
            Pipeline Overview
          </div>
          <div style={{ display: 'flex', gap: 3, height: 8, borderRadius: 999, overflow: 'hidden', background: '#f3f4f6' }}>
            {total === 0
              ? <div style={{ width: '100%', background: '#f3f4f6', borderRadius: 999 }} />
              : ALL_STATUSES.map(s => {
                const pct = (counts[s] / total) * 100;
                return pct > 0 ? (
                  <div key={s} style={{ width: `${pct}%`, background: STATUS_META[s].color, transition: 'width 0.6s ease' }} title={`${s}: ${counts[s]}`} />
                ) : null;
              })}
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 10, flexWrap: 'wrap' }}>
            {ALL_STATUSES.map(s => (
              <div
                key={s}
                onClick={() => handleNav(NAV_ITEMS.find(n => n.filter === s) || NAV_ITEMS[0])}
                style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
              >
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_META[s].color }} />
                <span style={{ fontSize: 12, color: '#6b7280' }}>
                  {s} <strong style={{ color: '#111827' }}>{counts[s]}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Applications Table */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #ede9e3', overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px', borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap', gap: 12,
          }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#111827', fontWeight: 700 }}>
              {filter === 'All' ? 'All Applications' : `${filter} Applications`}
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#9ca3af', fontWeight: 400, marginLeft: 8 }}>
                {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
              </span>
            </h3>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['All', ...ALL_STATUSES].map(f => (
                <button key={f} onClick={() => {
                  setFilter(f);
                  setActiveNav(NAV_ITEMS.find(n => n.filter === f)?.label || 'Dashboard');
                }} style={{
                  padding: '5px 12px', borderRadius: 999,
                  border: filter === f ? 'none' : '1.5px solid #e5e7eb',
                  background: filter === f ? '#111827' : 'transparent',
                  color: filter === f ? '#fff' : '#6b7280',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.15s',
                }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table body */}
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
              Loading your applications...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '56px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 16 }}>
                {filter === 'All' ? 'No applications yet. Add your first one!' : `No "${filter}" applications yet.`}
              </p>
              {filter === 'All' && (
                <button onClick={() => setShowForm(true)} style={{
                  padding: '10px 20px', background: '#111827', color: '#fff',
                  border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  + Add Application
                </button>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fafaf8' }}>
                    {['Company', 'Position', 'Salary', 'Files', 'Status', 'Applied On', ''].map(h => (
                      <th key={h} style={{
                        padding: '11px 20px', textAlign: 'left',
                        fontSize: 11, fontWeight: 700, color: '#9ca3af',
                        textTransform: 'uppercase', letterSpacing: '0.7px',
                        borderBottom: '1px solid #f3f4f6',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((job, i) => (
                    <tr
                      key={job.id}
                      style={{
                        borderBottom: i < filtered.length - 1 ? '1px solid #f9f9f7' : 'none',
                        transition: 'background 0.15s',
                        animation: `fadeUp 0.3s ease ${i * 0.04}s both`,
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafaf8'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Company */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: 9,
                            background: '#111827', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 700, flexShrink: 0,
                          }}>
                            {job.company_name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{job.company_name}</div>
                            {job.job_url && (
                              <a href={job.job_url} target="_blank" rel="noreferrer"
                                style={{ fontSize: 11, color: '#3b82f6', textDecoration: 'none' }}>
                                View posting ↗
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Position */}
                      <td style={{ padding: '14px 20px', fontSize: 14, color: '#374151', fontWeight: 500 }}>
                        {job.position || <span style={{ color: '#d1d5db' }}>—</span>}
                      </td>

                      {/* Salary */}
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#6b7280' }}>
                        {job.salary_wished || <span style={{ color: '#d1d5db' }}>—</span>}
                      </td>

                      {/* Files — preview icons */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <span
                            title={job.cv ? 'CV uploaded' : 'No CV'}
                            style={{
                              fontSize: 16, opacity: job.cv ? 1 : 0.2,
                              cursor: job.cv ? 'default' : 'not-allowed',
                            }}
                          >
                            📄
                          </span>
                          <span
                            title={job.motivation_letter ? 'Cover letter uploaded' : 'No cover letter'}
                            style={{
                              fontSize: 16, opacity: job.motivation_letter ? 1 : 0.2,
                              cursor: job.motivation_letter ? 'default' : 'not-allowed',
                            }}
                          >
                            ✉️
                          </span>
                        </div>
                      </td>

                      {/* Status — inline editable */}
                      <td style={{ padding: '14px 20px' }}>
                        <select
                          value={job.current_status}
                          onChange={e => handleStatusChange(job.id, e.target.value)}
                          style={{
                            padding: '4px 10px', borderRadius: 999,
                            border: `1.5px solid ${STATUS_META[job.current_status]?.color || '#e5e7eb'}`,
                            background: STATUS_META[job.current_status]?.bg || '#f9fafb',
                            color: STATUS_META[job.current_status]?.color || '#374151',
                            fontSize: 11, fontWeight: 700, cursor: 'pointer',
                            fontFamily: 'inherit', outline: 'none',
                            textTransform: 'uppercase', letterSpacing: '0.3px',
                          }}
                        >
                          {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#9ca3af', whiteSpace: 'nowrap' }}>
                        {formatDate(job.created_at)}
                      </td>

                      {/* Delete */}
                      <td style={{ padding: '14px 20px' }}>
                        <button
                          onClick={() => setConfirmJob(job)}
                          disabled={deleting === job.id}
                          title="Delete application"
                          style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '6px 12px', borderRadius: 8,
                            background: '#fef2f2', border: '1px solid #fecaca',
                            color: '#ef4444', fontSize: 12, fontWeight: 600,
                            cursor: 'pointer', fontFamily: 'inherit',
                            transition: 'all 0.15s', opacity: deleting === job.id ? 0.4 : 1,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
                        >
                          🗑 Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Confirm Delete Modal */}
      {confirmJob && (
        <ConfirmModal
          job={confirmJob}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmJob(null)}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.1) !important; }
        select:focus { outline: none; }
      `}</style>
    </div>
  );
}