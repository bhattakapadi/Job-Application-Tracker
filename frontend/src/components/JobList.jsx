import { useState } from 'react';
import axios from 'axios';

const ALL_STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected', 'Ghosted'];

const STATUS_META = {
  Applied:   { color: '#3b82f6', bg: '#eff6ff' },
  Interview: { color: '#f59e0b', bg: '#fffbeb' },
  Offer:     { color: '#10b981', bg: '#ecfdf5' },
  Rejected:  { color: '#ef4444', bg: '#fef2f2' },
  Ghosted:   { color: '#6b7280', bg: '#f9fafb' },
};

// Confirm delete modal
function ConfirmModal({ job, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, animation: 'fadeUp 0.2s ease both',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '32px 36px',
        maxWidth: 400, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        animation: 'fadeUp 0.2s ease both',
      }}>
        <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 12 }}>🗑️</div>
        <h3 style={{
          fontFamily: "'Playfair Display', serif", fontSize: 20,
          color: '#111827', textAlign: 'center', marginBottom: 8,
        }}>
          Delete Application?
        </h3>
        <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 28, lineHeight: 1.6 }}>
          Are you sure you want to delete{' '}
          <strong style={{ color: '#111827' }}>{job.company_name}</strong>
          {job.position ? ` — ${job.position}` : ''}?
          <br />This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: 11, background: 'transparent',
            border: '1.5px solid #e5e7eb', borderRadius: 10,
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit', color: '#6b7280',
          }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: 11, background: '#ef4444',
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

export default function JobList({ jobs, token, filter, onFilterChange, onJobUpdated, onJobDeleted }) {
  const [confirmJob, setConfirmJob] = useState(null);
  const [deleting, setDeleting]     = useState(null);

  const filtered = filter === 'All' ? jobs : jobs.filter(j => j.current_status === filter);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  // Inline status update
  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`/api/jobs/${id}`, { current_status: status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onJobUpdated(id, { current_status: status });
    } catch (err) { console.error(err); }
  };

  // Download file helper
  const handleDownload = async (jobId, type) => {
    try {
      const res = await axios.get(`/api/jobs/${jobId}/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `${type}_job_${jobId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  // Delete confirmed
  const handleDeleteConfirmed = async () => {
    if (!confirmJob) return;
    setDeleting(confirmJob.id);
    setConfirmJob(null);
    try {
      await axios.delete(`/api/jobs/${confirmJob.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onJobDeleted(confirmJob.id);
    } catch (err) { console.error(err); }
    finally { setDeleting(null); }
  };

  return (
    <>
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #ede9e3', overflow: 'hidden' }}>

        {/* Header + filters */}
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
              <button key={f} onClick={() => onFilterChange(f)} style={{
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

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div style={{ padding: '56px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <p style={{ color: '#9ca3af', fontSize: 14 }}>
              {filter === 'All'
                ? 'No applications yet. Add your first one!'
                : `No "${filter}" applications yet.`}
            </p>
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
                          width: 34, height: 34, borderRadius: 9, background: '#111827',
                          color: '#fff', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0,
                        }}>
                          {job.company_name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                            {job.company_name}
                          </div>
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

                    {/* Files — clickable download icons */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => job.has_cv && handleDownload(job.id, 'cv')}
                          title={job.has_cv ? 'Download CV' : 'No CV uploaded'}
                          style={{
                            background: job.has_cv ? '#eff6ff' : '#f9fafb',
                            border: `1px solid ${job.has_cv ? '#bfdbfe' : '#f3f4f6'}`,
                            borderRadius: 7, padding: '4px 8px', fontSize: 14,
                            cursor: job.has_cv ? 'pointer' : 'not-allowed',
                            opacity: job.has_cv ? 1 : 0.3,
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { if (job.has_cv) e.currentTarget.style.background = '#dbeafe'; }}
                          onMouseLeave={e => { if (job.has_cv) e.currentTarget.style.background = '#eff6ff'; }}
                        >
                          📄
                        </button>
                        <button
                          onClick={() => job.has_motivation_letter && handleDownload(job.id, 'motivation_letter')}
                          title={job.has_motivation_letter ? 'Download Cover Letter' : 'No cover letter uploaded'}
                          style={{
                            background: job.has_motivation_letter ? '#eff6ff' : '#f9fafb',
                            border: `1px solid ${job.has_motivation_letter ? '#bfdbfe' : '#f3f4f6'}`,
                            borderRadius: 7, padding: '4px 8px', fontSize: 14,
                            cursor: job.has_motivation_letter ? 'pointer' : 'not-allowed',
                            opacity: job.has_motivation_letter ? 1 : 0.3,
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { if (job.has_motivation_letter) e.currentTarget.style.background = '#dbeafe'; }}
                          onMouseLeave={e => { if (job.has_motivation_letter) e.currentTarget.style.background = '#eff6ff'; }}
                        >
                          ✉️
                        </button>
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
                          whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#ef4444'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fecaca'; }}
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

      {/* Confirm Modal */}
      {confirmJob && (
        <ConfirmModal
          job={confirmJob}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmJob(null)}
        />
      )}
    </>
  );
}