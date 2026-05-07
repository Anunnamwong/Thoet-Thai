// Merchant app — shared data, atoms, mock orders/menu/finance

const M_COLORS = {
  primary: '#E85D2E',     // accent / CTAs
  primaryDark: '#C84A1F',
  primarySoft: '#FCEBE3',
  open: '#2D6A4F',        // shop open / cooking
  openSoft: '#E0EBE5',
  bg: '#FAFAF7',
  card: '#FFFFFF',
  text: '#1A1A17',
  textSec: '#5A5A55',     // darker than customer (50+ legibility)
  textTer: '#8A8A82',
  border: '#D8D8D2',
  borderSoft: '#EEEEE9',
  warning: '#D88A2A',
  warningSoft: '#FBEFD9',
  danger: '#B73631',
  dangerSoft: '#FBE6E5',
  info: '#3A6FC7',
};

// Mock incoming order
const INCOMING_ORDER = {
  id: 'TT-9F3D',
  customer: 'นภัสกร จ.',
  distance: '0.6 กม.',
  total: 165,
  payment: 'จ่ายปลายทาง',
  note: 'ไม่ใส่ผัก',
  items: [
    { name: 'ข้าวซอยไก่', qty: 1, price: 65, opt: 'เผ็ดน้อย' },
    { name: 'ก๋วยเตี๋ยวเนื้อตุ๋น', qty: 2, price: 45, opt: 'เส้นเล็ก' },
    { name: 'ลูกชิ้นทอด', qty: 1, price: 25, opt: '' },
  ],
};

const ACTIVE_ORDERS = [
  { id: 'TT-9F3D', customer: 'นภัสกร จ.', items: 4, total: 165,
    status: 'cooking', mins: 7, total_mins: 15, rider: null },
  { id: 'TT-8E2C', customer: 'พงษ์ศักดิ์ ก.', items: 2, total: 90,
    status: 'cooking', mins: 12, total_mins: 15, rider: null },
  { id: 'TT-7A91', customer: 'มาลี ส.', items: 3, total: 130,
    status: 'ready', mins: 0, total_mins: 0, rider: 'รอไรเดอร์' },
  { id: 'TT-6B45', customer: 'อนันต์ ว.', items: 1, total: 55,
    status: 'pickup', mins: 0, total_mins: 0, rider: 'พี่สมชาย' },
];

const M_MENU = [
  { id: 1, name: 'ข้าวซอยไก่', price: 65, cat: 'จานเดียว', sold: false, hot: true,
    desc: 'ข้าวซอยน้ำเงี้ยว สูตรไทใหญ่' },
  { id: 2, name: 'ก๋วยเตี๋ยวเนื้อตุ๋น', price: 45, cat: 'ก๋วยเตี๋ยว', sold: false, hot: true },
  { id: 3, name: 'ก๋วยเตี๋ยวหมู', price: 40, cat: 'ก๋วยเตี๋ยว', sold: false },
  { id: 4, name: 'ก๋วยเตี๋ยวเย็นตาโฟ', price: 50, cat: 'ก๋วยเตี๋ยว', sold: true },
  { id: 5, name: 'ข้าวซอยเนื้อ', price: 70, cat: 'จานเดียว', sold: false },
  { id: 6, name: 'ข้าวเหนียวหมูทอด', price: 55, cat: 'จานเดียว', sold: false },
  { id: 7, name: 'ลูกชิ้นทอด', price: 25, cat: 'ของทานเล่น', sold: false },
  { id: 8, name: 'ปอเปี๊ยะทอด', price: 30, cat: 'ของทานเล่น', sold: true },
  { id: 9, name: 'น้ำสมุนไพร', price: 20, cat: 'เครื่องดื่ม', sold: false },
  { id: 10, name: 'ชามะนาว', price: 25, cat: 'เครื่องดื่ม', sold: false },
];

const HOURS = [
  { day: 'จันทร์',  open: '08:00', close: '17:00', closed: false },
  { day: 'อังคาร',  open: '08:00', close: '17:00', closed: false },
  { day: 'พุธ',     open: '08:00', close: '17:00', closed: false },
  { day: 'พฤหัสฯ',  open: '08:00', close: '17:00', closed: false },
  { day: 'ศุกร์',   open: '08:00', close: '20:00', closed: false },
  { day: 'เสาร์',   open: '08:00', close: '20:00', closed: false },
  { day: 'อาทิตย์', open: '',      close: '',      closed: true  },
];

// Last 7 days revenue (most recent last)
const REV_WEEK = [
  { label: 'พ.', orders: 18, gross: 1820 },
  { label: 'พฤ.', orders: 24, gross: 2410 },
  { label: 'ศ.', orders: 31, gross: 3120 },
  { label: 'ส.', orders: 42, gross: 4280 },
  { label: 'อา.', orders: 0,  gross: 0    },
  { label: 'จ.', orders: 22, gross: 2210 },
  { label: 'อ.', orders: 28, gross: 2840 },
];

const SETTLEMENTS = [
  { id: 'ST-2026-04-28', period: '21–27 เม.ย. 2569', gross: 18420, fee: 1842,
    net: 16578, status: 'paid', paidOn: '28 เม.ย.' },
  { id: 'ST-2026-04-21', period: '14–20 เม.ย. 2569', gross: 16240, fee: 1624,
    net: 14616, status: 'paid', paidOn: '21 เม.ย.' },
  { id: 'ST-2026-04-14', period: '7–13 เม.ย. 2569',  gross: 21300, fee: 2130,
    net: 19170, status: 'paid', paidOn: '14 เม.ย.' },
  { id: 'ST-2026-04-07', period: '31 มี.ค.–6 เม.ย.', gross: 14580, fee: 1458,
    net: 13122, status: 'paid', paidOn: '7 เม.ย.' },
];

// ─────────────────────────────────────────────────────────────
// Atoms — large hit targets, ≥ 14px text floor
// ─────────────────────────────────────────────────────────────
function MIcon({ name, size = 20, color = 'currentColor', stroke = 2 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'chevL': return <svg {...p}><path d="M15 18l-6-6 6-6"/></svg>;
    case 'chevR': return <svg {...p}><path d="M9 6l6 6-6 6"/></svg>;
    case 'chevD': return <svg {...p}><path d="M6 9l6 6 6-6"/></svg>;
    case 'check': return <svg {...p}><path d="M20 6L9 17l-5-5"/></svg>;
    case 'x':     return <svg {...p}><path d="M18 6L6 18M6 6l12 12"/></svg>;
    case 'plus':  return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>;
    case 'home':  return <svg {...p}><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></svg>;
    case 'orders': return <svg {...p}><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M9 3v4M15 3v4M4 11h16"/></svg>;
    case 'menu': return <svg {...p}><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/></svg>;
    case 'chart': return <svg {...p}><path d="M3 20h18"/><path d="M6 16v-6M11 16V8M16 16v-4M20 16V6"/></svg>;
    case 'me': return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>;
    case 'clock': return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'bell': return <svg {...p}><path d="M6 8a6 6 0 1112 0c0 7 3 8 3 8H3s3-1 3-8z"/><path d="M10 21h4"/></svg>;
    case 'edit': return <svg {...p}><path d="M11 4H5a2 2 0 00-2 2v13a2 2 0 002 2h13a2 2 0 002-2v-6"/><path d="M18 2l4 4-11 11H7v-4z"/></svg>;
    case 'trash': return <svg {...p}><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6"/></svg>;
    case 'cam': return <svg {...p}><path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="4"/></svg>;
    case 'pin': return <svg {...p}><path d="M12 22s7-7 7-12a7 7 0 10-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="3"/></svg>;
    case 'fire': return <svg {...p}><path d="M12 2s4 4 4 8a4 4 0 01-8 0c0-2 1-3 1-3s-3 2-3 6a6 6 0 0012 0c0-6-6-11-6-11z"/></svg>;
    case 'arrowR': return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'eye': return <svg {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>;
    case 'eyeOff': return <svg {...p}><path d="M3 3l18 18"/><path d="M10.5 5.5A10 10 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3.5 4.5"/><path d="M6.5 6.5A17 17 0 002 12s3.5 7 10 7a10 10 0 005-1.5"/></svg>;
    case 'phone': return <svg {...p}><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.1-8.7A2 2 0 014 2h3a2 2 0 012 1.7c.1 1 .3 1.9.6 2.8a2 2 0 01-.5 2.1L7.9 9.8a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c.9.3 1.8.5 2.8.6a2 2 0 011.7 2z"/></svg>;
    default: return null;
  }
}

function MBigButton({ children, color = 'primary', onClick, disabled, height = 56, style }) {
  const map = {
    primary: { bg: M_COLORS.primary, fg: '#fff' },
    open:    { bg: M_COLORS.open,    fg: '#fff' },
    text:    { bg: M_COLORS.text,    fg: '#fff' },
    danger:  { bg: M_COLORS.danger,  fg: '#fff' },
    soft:    { bg: M_COLORS.card,    fg: M_COLORS.text, border: M_COLORS.border },
  };
  const c = map[color];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', height, borderRadius: 12,
      background: disabled ? '#D8D8D2' : c.bg, color: disabled ? '#8A8A82' : c.fg,
      border: c.border ? `1.5px solid ${c.border}` : 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 17, fontWeight: 600, fontFamily: 'inherit',
      ...style }}>
      {children}
    </button>
  );
}

function MBottomNav({ active, onNav, alertCount = 0 }) {
  const items = [
    { id: 'home', label: 'หน้าหลัก', icon: 'home' },
    { id: 'orders', label: 'ออเดอร์', icon: 'orders', badge: alertCount },
    { id: 'menu', label: 'เมนู', icon: 'menu' },
    { id: 'revenue', label: 'รายได้', icon: 'chart' },
    { id: 'me', label: 'ฉัน', icon: 'me' },
  ];
  return (
    <div style={{ background: M_COLORS.card, borderTop: `1px solid ${M_COLORS.border}`,
      padding: '10px 4px 28px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' }}>
      {items.map(it => {
        const isActive = active === it.id;
        return (
          <button key={it.id} onClick={() => onNav?.(it.id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            background: 'transparent', border: 'none', padding: '6px 2px', cursor: 'pointer',
            color: isActive ? M_COLORS.primary : M_COLORS.textSec, position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <MIcon name={it.icon} size={24} stroke={isActive ? 2.4 : 2}/>
              {it.badge > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -8, minWidth: 18, height: 18,
                  padding: '0 4px', borderRadius: 999, background: M_COLORS.primary, color: '#fff',
                  fontSize: 11, fontWeight: 700, display: 'grid', placeItems: 'center',
                  border: `2px solid ${M_COLORS.card}` }}>{it.badge}</span>
              )}
            </div>
            <span style={{ fontSize: 12, fontWeight: isActive ? 600 : 500, whiteSpace: 'nowrap' }}>
              {it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function MHeader({ title, sub, onBack, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '50px 12px 14px',
      borderBottom: `1px solid ${M_COLORS.border}`, background: M_COLORS.bg }}>
      {onBack && (
        <button onClick={onBack} style={{ width: 44, height: 44, border: 'none',
          background: 'transparent', cursor: 'pointer', display: 'grid', placeItems: 'center',
          color: M_COLORS.text, borderRadius: 10 }}>
          <MIcon name="chevL" size={24} stroke={2.2}/></button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 600,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: M_COLORS.textSec, marginTop: 1 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

Object.assign(window, {
  M_COLORS, INCOMING_ORDER, ACTIVE_ORDERS, M_MENU, HOURS, REV_WEEK, SETTLEMENTS,
  MIcon, MBigButton, MBottomNav, MHeader,
});
