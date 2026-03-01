export default function Dashboard({ user, onLogout }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f3f2ef',
      fontFamily: "'DM Sans', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '40px 48px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        textAlign: 'center',
      }}>
        <div style={{
          width: '56px', height: '56px',
          background: '#1a2332',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          color: '#fff',
          fontSize: '22px',
          fontWeight: '600',
        }}>
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <h2 style={{ fontSize: '22px', color: '#1a2332', marginBottom: '6px' }}>
          Welcome, {user?.name}!
        </h2>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '28px' }}>
          {user?.email}
        </p>
        <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '28px' }}>
          Dashboard coming soon — backend is fully wired ✅
        </p>
        <button
          onClick={onLogout}
          style={{
            padding: '10px 24px',
            background: '#1a2332',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}