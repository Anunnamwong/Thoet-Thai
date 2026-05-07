// Customer Home — Thoet Thai food delivery
// 375px primary viewport. IBM Plex Sans Thai. Section 5.1 of the brief.

const TT_COLORS = {
  primary: '#E85D2E',
  primaryDark: '#C84A1F',
  secondary: '#2D6A4F',
  bg: '#FAFAF7',
  card: '#FFFFFF',
  text: '#1A1A17',
  textSec: '#6B6B66',
  border: '#E5E5E0',
  warning: '#E89B3C',
  danger: '#C73E3A',
};

// ─────────────────────────────────────────────────────────────
// Data — real Thoet Thai community vibe (Thai/Shan/Akha/Yunnanese)
// ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',     label: 'ทั้งหมด',     icon: '⊞' },
  { id: 'noodle',  label: 'ก๋วยเตี๋ยว',  icon: '🍜' },
  { id: 'rice',    label: 'ข้าว',        icon: '🍚' },
  { id: 'yunnan',  label: 'อาหารยูนนาน', icon: '🥟' },
  { id: 'shan',    label: 'อาหารไทใหญ่', icon: '🌶' },
  { id: 'drink',   label: 'เครื่องดื่ม',  icon: '🧋' },
  { id: 'sweet',   label: 'ของหวาน',     icon: '🍡' },
  { id: 'grocery', label: 'ของชำ',       icon: '🛒' },
];

const SHOPS = [
  {
    id: 1,
    name: 'ก๋วยเตี๋ยวป้าหล้า',
    sub: 'ข้าวซอย • ก๋วยเตี๋ยวเนื้อ',
    tags: ['ก๋วยเตี๋ยว', 'ไทใหญ่'],
    rating: 4.8, reviews: 142,
    distance: '0.4 กม.',
    eta: '15–20 นาที',
    fee: 15,
    open: true,
    promo: 'ส่งฟรีเมื่อสั่งครบ ฿120',
    swatch: ['#F4D9A8', '#E8A05C', '#A65A2C'],
    badge: 'ขายดี',
  },
  {
    id: 2,
    name: 'หมั่นโถวอาแป๊ะ',
    sub: 'หมั่นโถว • ขาหมูยูนนาน • ชาผู่เอ๋อ',
    tags: ['ยูนนาน', 'ของหวาน'],
    rating: 4.9, reviews: 87,
    distance: '0.7 กม.',
    eta: '20–25 นาที',
    fee: 20,
    open: true,
    promo: null,
    swatch: ['#EFE5D2', '#C9A572', '#7A4F2A'],
    badge: 'ใหม่',
  },
  {
    id: 3,
    name: 'ข้าวมันไก่เจ๊หมวย',
    sub: 'ข้าวมันไก่ • ข้าวหมูแดง',
    tags: ['ข้าว'],
    rating: 4.6, reviews: 213,
    distance: '0.9 กม.',
    eta: '20–30 นาที',
    fee: 20,
    open: true,
    promo: 'ลด ฿10 สำหรับลูกค้าใหม่',
    swatch: ['#F2EAD6', '#D9B26A', '#8C6A2C'],
    badge: null,
  },
  {
    id: 4,
    name: 'ส้มตำลุงคำ',
    sub: 'ส้มตำ • ไก่ย่าง • ลาบ',
    tags: ['ข้าว', 'ส้มตำ'],
    rating: 4.7, reviews: 168,
    distance: '1.2 กม.',
    eta: '25–35 นาที',
    fee: 25,
    open: true,
    promo: null,
    swatch: ['#E8DEB7', '#B8943C', '#5C4214'],
    badge: null,
  },
  {
    id: 5,
    name: 'ชาไข่มุกพี่นก',
    sub: 'ชานม • ชาเขียว • โกโก้',
    tags: ['เครื่องดื่ม'],
    rating: 4.5, reviews: 92,
    distance: '0.3 กม.',
    eta: '10–15 นาที',
    fee: 15,
    open: false,
    openAt: '14:00',
    promo: null,
    swatch: ['#F5E6D8', '#D4A07A', '#6B4226'],
    badge: null,
  },
  {
    id: 6,
    name: 'ร้านชำป้าศรี',
    sub: 'ของกินของใช้ในครัว',
    tags: ['ของชำ'],
    rating: 4.4, reviews: 56,
    distance: '0.5 กม.',
    eta: '15–25 นาที',
    fee: 20,
    open: true,
    promo: null,
    swatch: ['#E5E0D2', '#A89878', '#5C5142'],
    badge: null,
  },
];

// ─────────────────────────────────────────────────────────────
// Atoms
// ─────────────────────────────────────────────────────────────
function Icon({ name, size = 20, color = 'currentColor', stroke = 1.75 }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'search':
      return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case 'pin':
      return <svg {...props}><path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></svg>;
    case 'chev':
      return <svg {...props}><path d="m6 9 6 6 6-6"/></svg>;
    case 'star':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 2.5l2.95 6.18 6.8.78-5.05 4.65 1.4 6.69L12 17.5l-6.1 3.3 1.4-6.69L2.25 9.46l6.8-.78L12 2.5z"/></svg>;
    case 'bag':
      return <svg {...props}><path d="M5 7h14l-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7Z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>;
    case 'bell':
      return <svg {...props}><path d="M6 8a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7Z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>;
    case 'home':
      return <svg {...props}><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/></svg>;
    case 'orders':
      return <svg {...props}><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>;
    case 'user':
      return <svg {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
    case 'sliders':
      return <svg {...props}><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>;
    case 'clock':
      return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'bike':
      return <svg {...props}><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17 10 8h4l3 9M14 8h3l1 3"/></svg>;
    case 'x':
      return <svg {...props}><path d="m6 6 12 12M18 6 6 18"/></svg>;
    default: return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Top bar — location + bell
// ─────────────────────────────────────────────────────────────
function TopBar() {
  return (
    <div style={{
      padding: '8px 16px 12px', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between',
      background: TT_COLORS.bg,
    }}>
      <button style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'transparent', border: 'none', padding: '4px 0',
        cursor: 'pointer', textAlign: 'left',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: '#FCEBE3', color: TT_COLORS.primary,
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}>
          <Icon name="pin" size={18} stroke={2}/>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{
            fontSize: 11, color: TT_COLORS.textSec, fontWeight: 500,
            letterSpacing: '0.02em', textTransform: 'uppercase',
            lineHeight: 1.2,
          }}>ส่งไปที่</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <span style={{
              fontSize: 14, fontWeight: 600, color: TT_COLORS.text,
              maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis',
              whiteSpace: 'nowrap', lineHeight: 1.3,
            }}>บ้านเทอดไทย หมู่ 1</span>
            <Icon name="chev" size={14} stroke={2.2}/>
          </div>
        </div>
      </button>
      <button style={{
        position: 'relative', width: 40, height: 40, borderRadius: 12,
        background: TT_COLORS.card, border: `1px solid ${TT_COLORS.border}`,
        display: 'grid', placeItems: 'center', cursor: 'pointer', color: TT_COLORS.text,
      }} aria-label="การแจ้งเตือน">
        <Icon name="bell" size={18} stroke={2}/>
        <span style={{
          position: 'absolute', top: 8, right: 9, width: 8, height: 8,
          borderRadius: 999, background: TT_COLORS.primary,
          border: `1.5px solid ${TT_COLORS.card}`,
        }}/>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Search bar
// ─────────────────────────────────────────────────────────────
function SearchBar() {
  return (
    <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8 }}>
      <div style={{
        flex: 1, height: 44, borderRadius: 12,
        background: TT_COLORS.card, border: `1px solid ${TT_COLORS.border}`,
        display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10,
      }}>
        <Icon name="search" size={18} color={TT_COLORS.textSec}/>
        <span style={{ fontSize: 14, color: TT_COLORS.textSec, flex: 1 }}>
          ค้นหาร้านหรือเมนู เช่น ข้าวซอย…
        </span>
      </div>
      <button style={{
        width: 44, height: 44, borderRadius: 12,
        background: TT_COLORS.text, color: '#fff', border: 'none',
        display: 'grid', placeItems: 'center', cursor: 'pointer',
      }} aria-label="ตัวกรอง">
        <Icon name="sliders" size={18} stroke={2}/>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Promo strip — community-focused, COD highlight
// ─────────────────────────────────────────────────────────────
function PromoStrip() {
  return (
    <div style={{ padding: '4px 16px 16px' }}>
      <div style={{
        position: 'relative',
        background: TT_COLORS.secondary,
        borderRadius: 14, padding: '14px 16px',
        color: '#fff', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -20, top: -20, width: 120, height: 120,
          borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
        }}/>
        <div style={{
          position: 'absolute', right: 30, bottom: -30, width: 80, height: 80,
          borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
        }}/>
        <div style={{
          fontSize: 11, fontWeight: 500, letterSpacing: '0.08em',
          textTransform: 'uppercase', opacity: 0.75, marginBottom: 4,
        }}>เทอดไทย โซนกลาง</div>
        <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.35, marginBottom: 2 }}>
          จ่ายปลายทางก็ได้ ส่งไวใน 30 นาที
        </div>
        <div style={{ fontSize: 12.5, opacity: 0.85, lineHeight: 1.45 }}>
          ค่าส่งเริ่มต้น ฿15 — เงินหมุนในชุมชนเรา
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Category chips
// ─────────────────────────────────────────────────────────────
function CategoryRow({ active, onPick }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        display: 'flex', gap: 8, padding: '0 16px',
        overflowX: 'auto', scrollbarWidth: 'none',
      }} className="hide-scrollbar">
        {CATEGORIES.map(c => {
          const isActive = c.id === active;
          return (
            <button key={c.id} onClick={() => onPick(c.id)} style={{
              flexShrink: 0, height: 38, padding: '0 14px', borderRadius: 999,
              background: isActive ? TT_COLORS.text : TT_COLORS.card,
              color: isActive ? '#fff' : TT_COLORS.text,
              border: `1px solid ${isActive ? TT_COLORS.text : TT_COLORS.border}`,
              fontSize: 13.5, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
              fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}>
              <span style={{ fontSize: 14 }}>{c.icon}</span>
              {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Cover placeholder — striped SVG with shop initial
// ─────────────────────────────────────────────────────────────
function ShopCover({ swatch, name, height = 132, closed }) {
  const [c1, c2, c3] = swatch;
  const id = 'g' + name.length + c1.replace('#','');
  return (
    <div style={{
      width: '100%', height, position: 'relative', overflow: 'hidden',
      background: c1, filter: closed ? 'grayscale(0.7)' : 'none',
    }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c1}/>
            <stop offset="100%" stopColor={c2}/>
          </linearGradient>
          <pattern id={id+'p'} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke={c3} strokeWidth="0.7" strokeOpacity="0.18"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill={`url(#${id})`}/>
        <rect width="100" height="100" fill={`url(#${id}p)`}/>
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'rgba(255,255,255,0.92)',
          display: 'grid', placeItems: 'center',
          fontFamily: 'IBM Plex Sans Thai, sans-serif',
          fontWeight: 600, fontSize: 24, color: c3,
          boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
        }}>{name.slice(0,1)}</div>
      </div>
      <div style={{
        position: 'absolute', bottom: 8, left: 10,
        fontFamily: 'ui-monospace, "SF Mono", monospace',
        fontSize: 9.5, color: c3, opacity: 0.55, letterSpacing: '0.04em',
      }}>cover · {name}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Shop card — full width
// ─────────────────────────────────────────────────────────────
function ShopCard({ shop }) {
  return (
    <article style={{
      background: TT_COLORS.card, borderRadius: 14, overflow: 'hidden',
      border: `1px solid ${TT_COLORS.border}`,
    }}>
      <div style={{ position: 'relative' }}>
        <ShopCover swatch={shop.swatch} name={shop.name} closed={!shop.open}/>
        {shop.badge && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: TT_COLORS.text, color: '#fff',
            fontSize: 11, fontWeight: 600, padding: '4px 8px', borderRadius: 6,
            letterSpacing: '0.02em', whiteSpace: 'nowrap',
          }}>{shop.badge}</div>
        )}
        {shop.promo && shop.open && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: TT_COLORS.primary, color: '#fff',
            fontSize: 11, fontWeight: 500, padding: '4px 8px', borderRadius: 6,
            maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{shop.promo}</div>
        )}
        {!shop.open && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(26,26,23,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 2,
          }}>
            <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>ปิดอยู่</div>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
              เปิดอีกครั้ง {shop.openAt} น.
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: 10, marginBottom: 4,
        }}>
          <h3 style={{
            margin: 0, fontSize: 16, fontWeight: 600, color: TT_COLORS.text,
            lineHeight: 1.3,
          }}>{shop.name}</h3>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0,
            paddingTop: 2,
          }}>
            <Icon name="star" size={14} color={TT_COLORS.warning}/>
            <span style={{ fontSize: 13, fontWeight: 600, color: TT_COLORS.text }}>
              {shop.rating.toFixed(1)}
            </span>
            <span style={{ fontSize: 12, color: TT_COLORS.textSec }}>
              ({shop.reviews})
            </span>
          </div>
        </div>

        <div style={{
          fontSize: 13, color: TT_COLORS.textSec,
          marginBottom: 10, lineHeight: 1.4,
        }}>{shop.sub}</div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 12.5, color: TT_COLORS.textSec,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="clock" size={13} stroke={2}/>
            {shop.eta}
          </span>
          <span style={{ width: 3, height: 3, borderRadius: 999, background: TT_COLORS.border }}/>
          <span>{shop.distance}</span>
          <span style={{ width: 3, height: 3, borderRadius: 999, background: TT_COLORS.border }}/>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="bike" size={14} stroke={2}/>
            ฿{shop.fee}
          </span>
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────
// Section header
// ─────────────────────────────────────────────────────────────
function SectionHeader({ title, sub, action }) {
  return (
    <div style={{
      padding: '0 16px 10px', display: 'flex',
      alignItems: 'flex-end', justifyContent: 'space-between', gap: 12,
    }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <h2 style={{
          margin: 0, fontSize: 18, fontWeight: 600, color: TT_COLORS.text,
          lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>{title}</h2>
        {sub && <div style={{
          fontSize: 12.5, color: TT_COLORS.textSec, marginTop: 2,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{sub}</div>}
      </div>
      {action && (
        <button style={{
          background: 'transparent', border: 'none', padding: 0,
          fontSize: 13, color: TT_COLORS.primary, fontWeight: 500,
          cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
        }}>{action}</button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Bottom nav
// ─────────────────────────────────────────────────────────────
function BottomNav() {
  const items = [
    { id: 'home', label: 'หน้าหลัก', icon: 'home', active: true },
    { id: 'orders', label: 'คำสั่งซื้อ', icon: 'orders' },
    { id: 'cart', label: 'ตะกร้า', icon: 'bag', badge: 2 },
    { id: 'me', label: 'ฉัน', icon: 'user' },
  ];
  return (
    <div style={{
      position: 'sticky', bottom: 0, background: TT_COLORS.card,
      borderTop: `1px solid ${TT_COLORS.border}`,
      padding: '8px 4px 12px',
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    }}>
      {items.map(it => (
        <button key={it.id} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          padding: '6px 4px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 3,
          color: it.active ? TT_COLORS.text : TT_COLORS.textSec,
          fontFamily: 'inherit', position: 'relative',
        }}>
          <div style={{ position: 'relative' }}>
            <Icon name={it.icon} size={22} stroke={it.active ? 2.2 : 1.75}/>
            {it.badge && (
              <span style={{
                position: 'absolute', top: -4, right: -7,
                minWidth: 16, height: 16, padding: '0 4px',
                borderRadius: 999, background: TT_COLORS.primary,
                color: '#fff', fontSize: 10, fontWeight: 600,
                display: 'grid', placeItems: 'center',
              }}>{it.badge}</span>
            )}
          </div>
          <span style={{
            fontSize: 11, fontWeight: it.active ? 600 : 500,
          }}>{it.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────
function CustomerHome() {
  const [active, setActive] = React.useState('all');
  const filtered = SHOPS.filter(s => {
    if (active === 'all') return true;
    const map = {
      noodle: ['ก๋วยเตี๋ยว'], rice: ['ข้าว', 'ส้มตำ'],
      yunnan: ['ยูนนาน'], shan: ['ไทใหญ่'],
      drink: ['เครื่องดื่ม'], sweet: ['ของหวาน'], grocery: ['ของชำ'],
    };
    return s.tags.some(t => (map[active] || []).includes(t));
  });

  const open = filtered.filter(s => s.open);
  const closed = filtered.filter(s => !s.open);

  return (
    <div style={{
      width: '100%', height: '100%', background: TT_COLORS.bg,
      fontFamily: '"IBM Plex Sans Thai", "Sarabun", system-ui, sans-serif',
      color: TT_COLORS.text, display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <TopBar/>
      <SearchBar/>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }} className="hide-scrollbar">
        <PromoStrip/>
        <CategoryRow active={active} onPick={setActive}/>

        <SectionHeader
          title={active === 'all' ? 'ร้านในเทอดไทย' : CATEGORIES.find(c=>c.id===active)?.label}
          sub={`${open.length} ร้านเปิดอยู่ตอนนี้`}
          action="แผนที่"
        />

        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {open.map(s => <ShopCard key={s.id} shop={s}/>)}
        </div>

        {closed.length > 0 && (
          <>
            <div style={{ height: 20 }}/>
            <SectionHeader
              title="ปิดอยู่ตอนนี้"
              sub="กลับมาดูใหม่เมื่อร้านเปิด"
            />
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {closed.map(s => <ShopCard key={s.id} shop={s}/>)}
            </div>
          </>
        )}

        <div style={{
          padding: '24px 16px 16px', textAlign: 'center',
          fontSize: 12, color: TT_COLORS.textSec,
        }}>
          แสดงร้านในรัศมี 2 กม. จากที่อยู่จัดส่ง
        </div>
      </div>

      <BottomNav/>
    </div>
  );
}

Object.assign(window, { CustomerHome });
