// Rider App — shared tokens, atoms, mock data

const R_COLORS = {
  online: '#1F8A4F',     // bright bold green when online
  onlineDark: '#176E3E',
  onlineSoft: '#DBEEDE',
  offline: '#5A5A55',    // muted slate when offline
  offlineDark: '#2D2D2A',
  offlineSoft: '#E5E5E0',
  primary: '#E85D2E',    // Thoet Thai brand — used for $$$ and incoming alert
  primaryDark: '#C84A1F',
  primarySoft: '#FCEBE3',
  bg: '#FAFAF7',
  card: '#FFFFFF',
  text: '#1A1A17',
  textOnDark: '#FFFFFF',
  textSec: '#5A5A55',
  textTer: '#8A8A82',
  border: '#D8D8D2',
  borderSoft: '#EEEEE9',
  warning: '#D88A2A',
  warningSoft: '#FBEFD9',
  danger: '#B73631',
  dangerSoft: '#FBE6E5',
};

const INCOMING_JOB = {
  id: 'TT-9F3D',
  shopName: 'ก๋วยเตี๋ยวป้าหล้า',
  shopAddr: 'ม.1 ต.เทอดไทย',
  pickupKm: 0.6,
  customerName: 'นภัสกร จ.',
  dropAddr: 'บ้านพักครู ต.เทอดไทย',
  dropKm: 1.8,
  totalKm: 2.4,
  fee: 38,
  payment: 'จ่ายปลายทาง ฿165',
};

const ACTIVE_JOB_DATA = {
  id: 'TT-9F3D',
  shopName: 'ก๋วยเตี๋ยวป้าหล้า',
  shopAddr: 'ม.1 ต.เทอดไทย',
  shopPhone: '08X-XXX-1234',
  customerName: 'นภัสกร จ.',
  customerPhone: '08X-XXX-5678',
  dropAddr: 'บ้านพักครู ต.เทอดไทย หลังที่ 4',
  fee: 38,
  cod: 165,
  items: 4,
};

// Today: 8 jobs done, 320 baht
const EARNINGS = {
  today: { gross: 320, jobs: 8, hours: 4.5, tips: 30 },
  week:  { gross: 2180, jobs: 54, hours: 32, tips: 180 },
  month: { gross: 9240, jobs: 218, hours: 132, tips: 720 },
};

const EARN_WEEK_BARS = [
  { label: 'พ.', val: 280 },
  { label: 'พฤ.', val: 360 },
  { label: 'ศ.', val: 420 },
  { label: 'ส.', val: 480 },
  { label: 'อา.', val: 0 },
  { label: 'จ.', val: 320 },
  { label: 'อ.', val: 320 },
];

const JOB_HISTORY = [
  { id: 'TT-8E2C', shop: 'ก๋วยเตี๋ยวป้าหล้า', drop: 'หมู่บ้านสันต้นเปา', km: 1.8,
    fee: 35, time: '13:42', date: 'วันนี้' },
  { id: 'TT-7A91', shop: 'หมั่นโถวอาแป๊ะ', drop: 'ตลาดเทอดไทย', km: 0.9,
    fee: 28, time: '12:55', date: 'วันนี้' },
  { id: 'TT-7B12', shop: 'ข้าวมันไก่เจ๊หมวย', drop: 'รพสต.เทอดไทย', km: 2.1,
    fee: 42, time: '12:18', date: 'วันนี้' },
  { id: 'TT-6F88', shop: 'ส้มตำลุงคำ', drop: 'หมู่บ้านดอยปู่หมื่น', km: 3.5,
    fee: 55, time: '11:40', date: 'วันนี้' },
  { id: 'TT-6A04', shop: 'ก๋วยเตี๋ยวป้าหล้า', drop: 'ม.1 เทอดไทย', km: 0.7,
    fee: 25, time: '10:55', date: 'วันนี้' },
  { id: 'TT-5C77', shop: 'ชาไข่มุกพี่นก', drop: 'รร.เทอดไทยวิทยาคม', km: 1.2,
    fee: 30, time: '10:12', date: 'วันนี้' },
  { id: 'TT-5B19', shop: 'หมั่นโถวอาแป๊ะ', drop: 'ปั๊มน้ำมันเทอดไทย', km: 1.4,
    fee: 32, time: '09:38', date: 'วันนี้' },
  { id: 'TT-5A02', shop: 'ก๋วยเตี๋ยวป้าหล้า', drop: 'อบต.เทอดไทย', km: 1.1,
    fee: 28, time: '08:50', date: 'วันนี้' },
];

// ─────────────────────────────────────────────────────────────
// Atoms — even bigger than Merchant (helmet + sun visibility)
// ─────────────────────────────────────────────────────────────
function RIcon({ name, size = 22, color = 'currentColor', stroke = 2 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'chevL': return <svg {...p}><path d="M15 18l-6-6 6-6"/></svg>;
    case 'chevR': return <svg {...p}><path d="M9 6l6 6-6 6"/></svg>;
    case 'chevD': return <svg {...p}><path d="M6 9l6 6 6-6"/></svg>;
    case 'check': return <svg {...p}><path d="M20 6L9 17l-5-5"/></svg>;
    case 'x':     return <svg {...p}><path d="M18 6L6 18M6 6l12 12"/></svg>;
    case 'home':  return <svg {...p}><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></svg>;
    case 'orders': return <svg {...p}><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M9 3v4M15 3v4M4 11h16"/></svg>;
    case 'wallet': return <svg {...p}><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/></svg>;
    case 'me': return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>;
    case 'pin': return <svg {...p}><path d="M12 22s7-7 7-12a7 7 0 10-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="3"/></svg>;
    case 'shop': return <svg {...p}><path d="M3 9l1.5-5h15L21 9"/><path d="M5 9v11h14V9"/><path d="M3 9h18"/></svg>;
    case 'bag': return <svg {...p}><path d="M6 7h12l-1 14H7z"/><path d="M9 7V5a3 3 0 016 0v2"/></svg>;
    case 'maps': return <svg {...p}><path d="M9 3l-6 3v15l6-3 6 3 6-3V3l-6 3z"/><path d="M9 3v15M15 6v15"/></svg>;
    case 'phone': return <svg {...p}><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.1-8.7A2 2 0 014 2h3a2 2 0 012 1.7c.1 1 .3 1.9.6 2.8a2 2 0 01-.5 2.1L7.9 9.8a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c.9.3 1.8.5 2.8.6a2 2 0 011.7 2z"/></svg>;
    case 'cam': return <svg {...p}><path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="4"/></svg>;
    case 'clock': return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'route': return <svg {...p}><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M6 8.5v3a4 4 0 004 4h4a4 4 0 014 4"/></svg>;
    case 'arrowD': return <svg {...p}><path d="M12 5v14M6 13l6 6 6-6"/></svg>;
    case 'bike': return <svg {...p}><circle cx="6" cy="17" r="3.5"/><circle cx="18" cy="17" r="3.5"/><path d="M6 17l4-9h5l3 9M10 8h-3M15 8l-2 9"/></svg>;
    default: return null;
  }
}

function RBigButton({ children, color = 'primary', onClick, disabled, height = 64, style }) {
  const map = {
    primary: { bg: R_COLORS.primary, fg: '#fff' },
    online:  { bg: R_COLORS.online,  fg: '#fff' },
    dark:    { bg: R_COLORS.text,    fg: '#fff' },
    danger:  { bg: R_COLORS.danger,  fg: '#fff' },
    light:   { bg: R_COLORS.card,    fg: R_COLORS.text, border: R_COLORS.border },
    onDark:  { bg: 'rgba(255,255,255,0.18)', fg: '#fff', border: 'rgba(255,255,255,0.4)' },
  };
  const c = map[color];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', height, borderRadius: 14,
      background: disabled ? '#D8D8D2' : c.bg, color: disabled ? '#8A8A82' : c.fg,
      border: c.border ? `2px solid ${c.border}` : 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 18, fontWeight: 700, fontFamily: 'inherit',
      ...style }}>
      {children}
    </button>
  );
}

function RBottomNav({ active, onNav, online }) {
  const items = [
    { id: 'home', label: 'หน้าหลัก', icon: 'home' },
    { id: 'history', label: 'งานของฉัน', icon: 'orders' },
    { id: 'earn', label: 'รายได้', icon: 'wallet' },
    { id: 'me', label: 'ฉัน', icon: 'me' },
  ];
  return (
    <div style={{ background: R_COLORS.card, borderTop: `1px solid ${R_COLORS.border}`,
      padding: '10px 4px 28px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
      {items.map(it => {
        const isActive = active === it.id;
        return (
          <button key={it.id} onClick={() => onNav?.(it.id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            background: 'transparent', border: 'none', padding: '6px 2px', cursor: 'pointer',
            color: isActive ? (online ? R_COLORS.online : R_COLORS.text) : R_COLORS.textSec }}>
            <RIcon name={it.icon} size={26} stroke={isActive ? 2.4 : 2}/>
            <span style={{ fontSize: 12.5, fontWeight: isActive ? 600 : 500 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function RHeader({ title, sub, onBack, dark = false, right }) {
  const fg = dark ? '#fff' : R_COLORS.text;
  const subFg = dark ? 'rgba(255,255,255,0.8)' : R_COLORS.textSec;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '50px 12px 14px',
      borderBottom: dark ? '1px solid rgba(255,255,255,0.15)' : `1px solid ${R_COLORS.border}` }}>
      {onBack && (
        <button onClick={onBack} style={{ width: 44, height: 44, border: 'none',
          background: 'transparent', cursor: 'pointer', display: 'grid', placeItems: 'center',
          color: fg, borderRadius: 10 }}>
          <RIcon name="chevL" size={24} stroke={2.2}/></button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: fg,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        {sub && <div style={{ fontSize: 13.5, color: subFg, marginTop: 1 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

Object.assign(window, {
  R_COLORS, INCOMING_JOB, ACTIVE_JOB_DATA, EARNINGS, EARN_WEEK_BARS, JOB_HISTORY,
  RIcon, RBigButton, RBottomNav, RHeader,
});
