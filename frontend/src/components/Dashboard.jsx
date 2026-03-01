import { useState, useEffect } from 'react';
import axios from 'axios';
import JobForm from './JobForm';
import JobList from './JobList';

const STATUS_META = {
  Applied:   { color: '#3b82f6', bg: '#eff6ff' },
  Interview: { color: '#f59e0b', bg: '#fffbeb' },
  Offer:     { color: '#10b981', bg: '#ecfdf5' },
  Rejected:  { color: '#ef4444', bg: '#fef2f2' },
  Ghosted:   { color: '#6b7280', bg: '#f9fafb' },
};
const ALL_STATUSES = Object.keys(STATUS_META);
const NAV_ITEMS = [
  { label: 'Dashboard',    filter: 'All'       },
  { label: 'Applications', filter: 'Applied'   },
  { label: 'Interviews',   filter: 'Interview' },
  { label: 'Offers',       filter: 'Offer'     },
  { label: 'Rejected',     filter: 'Rejected'  },
];

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background:'#fff',borderRadius:16,padding:'22px 24px',border:'1px solid #ede9e3',display:'flex',flexDirection:'column',gap:4,animation:'fadeUp 0.4s ease both' }}>
      <span style={{ fontSize:11,color:'#999',textTransform:'uppercase',letterSpacing:'0.8px',fontWeight:600 }}>{label}</span>
      <span style={{ fontSize:36,fontWeight:800,color:accent||'#1a2332',letterSpacing:'-1.5px',lineHeight:1.1,fontFamily:"'Playfair Display', serif" }}>{value}</span>
      <span style={{ fontSize:12,color:'#aaa' }}>{sub}</span>
    </div>
  );
}

export default function Dashboard({ user, token, onLogout }) {
  const [jobs, setJobs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('All');
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [showForm, setShowForm]   = useState(false);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchJobs = async () => {
    try {
      const res = await axios.get('/api/jobs', { headers: authHeaders });
      setJobs(res.data);
    } catch (err) {
      if (err.response?.status === 401) onLogout();
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, []);

  const total = jobs.length;
  const counts = ALL_STATUSES.reduce((acc, s) => { acc[s] = jobs.filter(j => j.current_status === s).length; return acc; }, {});
  const responseRate = total > 0 ? Math.round(((counts.Interview + counts.Offer) / total) * 100) : 0;

  const handleNav = (item) => { setActiveNav(item.label); setFilter(item.filter); };
  const handleFilterChange = (f) => { setFilter(f); const nav = NAV_ITEMS.find(n => n.filter === f); if (nav) setActiveNav(nav.label); };
  const handleJobAdded = (newJob) => { setJobs(prev => [newJob, ...prev]); setShowForm(false); };
  const handleJobUpdated = (id, changes) => { setJobs(prev => prev.map(j => j.id === id ? { ...j, ...changes } : j)); };
  const handleJobDeleted = (id) => { setJobs(prev => prev.filter(j => j.id !== id)); };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ display:'flex',minHeight:'100vh',background:'#f5f3ef',fontFamily:"'DM Sans', sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width:224,background:'#111827',display:'flex',flexDirection:'column',padding:'28px 16px',flexShrink:0,position:'sticky',top:0,height:'100vh' }}>
        <div style={{ display:'flex',alignItems:'center',gap:10,padding:'0 8px',marginBottom:36 }}>
          <div style={{ width:34,height:34,borderRadius:9,background:'rgba(99,179,237,0.15)',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
              <rect width="12" height="12" rx="2" fill="#fff"/>
              <rect x="16" width="12" height="12" rx="2" fill="#fff" opacity="0.5"/>
              <rect y="16" width="12" height="12" rx="2" fill="#fff" opacity="0.5"/>
              <rect x="16" y="16" width="12" height="12" rx="2" fill="#fff"/>
            </svg>
          </div>
          <span style={{ color:'#fff',fontWeight:700,fontSize:16,letterSpacing:'-0.3px' }}>JobTrackr</span>
        </div>
        <nav style={{ display:'flex',flexDirection:'column',gap:3,flex:1 }}>
          {NAV_ITEMS.map(item => {
            const isActive = activeNav === item.label;
            const count = item.filter === 'All' ? total : (counts[item.filter] || 0);
            return (
              <div key={item.label} onClick={() => handleNav(item)} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 12px',borderRadius:10,background:isActive?'rgba(99,179,237,0.14)':'transparent',color:isActive?'#93c5fd':'rgba(255,255,255,0.4)',fontSize:13,fontWeight:isActive?600:500,cursor:'pointer',transition:'all 0.15s',borderLeft:isActive?'2px solid #3b82f6':'2px solid transparent' }}
                onMouseEnter={e=>{ if(!isActive){e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.color='rgba(255,255,255,0.7)';} }}
                onMouseLeave={e=>{ if(!isActive){e.currentTarget.style.background='transparent';e.currentTarget.style.color='rgba(255,255,255,0.4)';} }}
              >
                <span>{item.label}</span>
                {count > 0 && <span style={{ background:isActive?'rgba(59,130,246,0.25)':'rgba(255,255,255,0.08)',color:isActive?'#93c5fd':'rgba(255,255,255,0.3)',fontSize:11,fontWeight:700,padding:'1px 7px',borderRadius:999 }}>{count}</span>}
              </div>
            );
          })}
        </nav>
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)',paddingTop:16 }}>
          <div style={{ display:'flex',alignItems:'center',gap:10,padding:'8px 12px',marginBottom:8 }}>
            <div style={{ width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#3b82f6,#1d4ed8)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:13,fontWeight:700,flexShrink:0 }}>{user?.name?.[0]?.toUpperCase()}</div>
            <div style={{ overflow:'hidden' }}>
              <div style={{ color:'#fff',fontSize:12,fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{user?.name}</div>
              <div style={{ color:'rgba(255,255,255,0.35)',fontSize:11,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{ width:'100%',padding:'8px 12px',background:'rgba(255,255,255,0.05)',border:'none',borderRadius:8,color:'rgba(255,255,255,0.38)',fontSize:12,fontWeight:500,cursor:'pointer',textAlign:'left',fontFamily:'inherit',transition:'all 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)';e.currentTarget.style.color='#fff';}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.color='rgba(255,255,255,0.38)';}}>
            → Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex:1,padding:'36px 40px',overflowY:'auto' }}>
        {/* Header */}
        <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:32 }}>
          <div>
            <h1 style={{ fontFamily:"'Playfair Display', serif",fontSize:30,color:'#111827',letterSpacing:'-0.6px',fontWeight:700,marginBottom:4 }}>
              {greeting}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ color:'#9ca3af',fontSize:14 }}>{new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</p>
          </div>
          <button onClick={()=>setShowForm(v=>!v)} style={{ display:'flex',alignItems:'center',gap:8,padding:'11px 20px',background:'#111827',color:'#fff',border:'none',borderRadius:12,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 12px rgba(17,24,39,0.2)',transition:'background 0.2s' }}
            onMouseEnter={e=>e.currentTarget.style.background='#1f2937'}
            onMouseLeave={e=>e.currentTarget.style.background='#111827'}>
            <span style={{ fontSize:18,lineHeight:1 }}>{showForm?'−':'+'}</span>
            {showForm ? 'Close Form' : 'Add Application'}
          </button>
        </div>

        {/* JobForm */}
        {showForm && (
          <div style={{ marginBottom:28 }}>
            <JobForm token={token} onJobAdded={handleJobAdded} onCancel={()=>setShowForm(false)} />
          </div>
        )}

        {/* Stat cards */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24 }}>
          <StatCard label="Total Applied"  value={total}              sub="All time" />
          <StatCard label="Interviews"     value={counts.Interview}   sub="Active pipeline"     accent="#f59e0b" />
          <StatCard label="Offers"         value={counts.Offer}       sub="Received"            accent="#10b981" />
          <StatCard label="Response Rate"  value={`${responseRate}%`} sub="Interview conversion" accent="#3b82f6" />
        </div>

        {/* Pipeline bar */}
        <div style={{ background:'#fff',borderRadius:16,padding:'20px 24px',border:'1px solid #ede9e3',marginBottom:24 }}>
          <div style={{ fontSize:11,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:12 }}>Pipeline Overview</div>
          <div style={{ display:'flex',gap:3,height:8,borderRadius:999,overflow:'hidden',background:'#f3f4f6' }}>
            {total === 0
              ? <div style={{ width:'100%',background:'#f3f4f6' }} />
              : ALL_STATUSES.map(s => { const pct=(counts[s]/total)*100; return pct>0?<div key={s} style={{ width:`${pct}%`,background:STATUS_META[s].color,transition:'width 0.6s ease' }} title={`${s}: ${counts[s]}`}/>:null; })
            }
          </div>
          <div style={{ display:'flex',gap:20,marginTop:10,flexWrap:'wrap' }}>
            {ALL_STATUSES.map(s => (
              <div key={s} onClick={()=>handleFilterChange(s)} style={{ display:'flex',alignItems:'center',gap:6,cursor:'pointer' }}>
                <div style={{ width:7,height:7,borderRadius:'50%',background:STATUS_META[s].color }} />
                <span style={{ fontSize:12,color:'#6b7280' }}>{s} <strong style={{ color:'#111827' }}>{counts[s]}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* JobList */}
        {loading ? (
          <div style={{ padding:48,textAlign:'center',color:'#9ca3af',fontSize:14,background:'#fff',borderRadius:16 }}>Loading your applications...</div>
        ) : (
          <JobList jobs={jobs} token={token} filter={filter} onFilterChange={handleFilterChange} onJobUpdated={handleJobUpdated} onJobDeleted={handleJobDeleted} />
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        *{box-sizing:border-box}
        input:focus{border-color:#3b82f6!important;box-shadow:0 0 0 3px rgba(59,130,246,0.1)!important}
        select:focus{outline:none}
      `}</style>
    </div>
  );
}