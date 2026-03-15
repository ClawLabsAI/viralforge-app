export default function PageHeader({ icon, title, subtitle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: 'var(--accent)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 500, color: '#f0eeff' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: '#606080', marginTop: 1 }}>{subtitle}</div>}
      </div>
    </div>
  )
}
