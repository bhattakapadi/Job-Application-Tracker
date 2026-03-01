import { useState, useRef } from 'react';
import axios from 'axios';

const ALL_STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected', 'Ghosted'];

const inputStyle = {
  padding: '10px 14px',
  border: '1.5px solid #e5e7eb',
  borderRadius: 10,
  fontSize: 14,
  fontFamily: "'DM Sans', sans-serif",
  outline: 'none',
  color: '#111827',
  background: '#fafaf8',
  width: '100%',
};

const labelStyle = {
  fontSize: 11,
  fontWeight: 700,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
};

export default function JobForm({ token, onJobAdded, onCancel }) {
  const [form, setForm] = useState({
    company_name: '',
    position: '',
    job_url: '',
    salary_wished: '',
    current_status: 'Applied',
  });
  const [cvFile, setCvFile]         = useState(null);
  const [coverFile, setCoverFile]   = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const cvRef                       = useRef();
  const coverRef                    = useRef();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company_name.trim()) { setError('Company name is required.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (cvFile)    data.append('cv', cvFile);
      if (coverFile) data.append('motivation_letter', coverFile);

      const res = await axios.post('/api/jobs', data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      onJobAdded(res.data);
      setForm({ company_name: '', position: '', job_url: '', salary_wished: '', current_status: 'Applied' });
      setCvFile(null); setCoverFile(null);
      if (cvRef.current)    cvRef.current.value = '';
      if (coverRef.current) coverRef.current.value = '';
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const FileUpload = ({ label, icon, file, setFile, inputRef, accept }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={labelStyle}>{label}</label>
      <label style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 14px',
        border: `1.5px dashed ${file ? '#3b82f6' : '#e5e7eb'}`,
        borderRadius: 10, cursor: 'pointer',
        background: file ? '#eff6ff' : '#fafaf8',
        color: file ? '#1d4ed8' : '#9ca3af',
        fontSize: 13, transition: 'all 0.2s',
      }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {file ? file.name : `Upload ${label}`}
        </span>
        <input ref={inputRef} type="file" accept={accept} style={{ display: 'none' }}
          onChange={e => setFile(e.target.files[0] || null)} />
      </label>
      {file && (
        <button type="button"
          onClick={() => { setFile(null); inputRef.current.value = ''; }}
          style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
          ✕ Remove
        </button>
      )}
    </div>
  );

  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '28px 32px',
      border: '1px solid #ede9e3', boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
      animation: 'fadeUp 0.3s ease both',
    }}>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#111827', marginBottom: 24, fontWeight: 700 }}>
        New Application
      </h3>

      <form onSubmit={handleSubmit}>
        {/* Company + Position */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={labelStyle}>Company Name *</label>
            <input name="company_name" type="text" placeholder="Google"
              value={form.company_name} onChange={handleChange} style={inputStyle} required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={labelStyle}>Position</label>
            <input name="position" type="text" placeholder="Software Engineer"
              value={form.position} onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        {/* URL + Salary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={labelStyle}>Job URL</label>
            <input name="job_url" type="url" placeholder="https://..."
              value={form.job_url} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={labelStyle}>Salary Expectation</label>
            <input name="salary_wished" type="text" placeholder="€60,000"
              value={form.salary_wished} onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        {/* CV + Cover Letter + Status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
          <FileUpload label="CV / Resume" icon="📄" file={cvFile}
            setFile={setCvFile} inputRef={cvRef} accept=".pdf,.doc,.docx" />
          <FileUpload label="Cover Letter" icon="✉️" file={coverFile}
            setFile={setCoverFile} inputRef={coverRef} accept=".pdf,.doc,.docx" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={labelStyle}>Status</label>
            <select name="current_status" value={form.current_status}
              onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
              {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 8, fontSize: 13, color: '#dc2626', marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="button" onClick={onCancel} style={{
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
          }}>
            {submitting ? 'Saving...' : 'Save Application'}
          </button>
        </div>
      </form>
    </div>
  );
}