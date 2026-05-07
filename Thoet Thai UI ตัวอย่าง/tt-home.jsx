// Customer Home — interactive. Search filter + click states.
// Reads density/viewMode from props (driven by Tweaks panel).

const { TT_COLORS: C, CATEGORIES, CAT_MAP, SHOPS, Icon } = window;

// ── Cover placeholder ──
function ShopCover({ swatch, name, height = 132, closed }) {
  const [c1, c2, c3] = swatch;
  const id = 'g' + name.length + c1.replace('#','');
  return (
    <div style={{ width: '100%', height, position: 'relative', overflow: 'hidden',
      background: c1, filter: closed ? 'grayscale(0.7)' : 'none' }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c1}/><stop offset="100%" stopColor={c2}/>
          </linearGradient>
          <pattern id={id+'p'} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke={c3} strokeWidth="0.7" strokeOpacity="0.18"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill={`url(#${id})`}/>
        <rect width="100" height="100" fill={`url(#${id}p)`}/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.92)',
          display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 24, color: c3,
          fontFamily: '"IBM Plex Sans Thai", sans-serif' }}>{name.slice(0,1)}</div>
      </div>
    </div>
  );
}

// ── Shop card (full / compact / list) ──
function ShopCard({ shop, density = 'full', onOpen }) {
  if (density === 'list') {
    return (
      <button onClick={onOpen} style={{
        width: '100%', textAlign: 'left', padding: '12px 14px', display: 'flex', gap: 12,
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
        cursor: 'pointer', fontFamily: 'inherit', alignItems: 'center',
      }}>
        <div style={{ width: 56, height: 56, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
          filter: shop.open ? 'none' : 'grayscale(0.7) opacity(0.7)' }}>
          <ShopCover swatch={shop.swatch} name={shop.name} height={56}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14.5, fontWeight: 600, color: C.text,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shop.name}</span>
            {!shop.open && <span style={{ fontSize: 10.5, color: C.danger, fontWeight: 500 }}>· ปิด</span>}
          </div>
          <div style={{ fontSize: 12, color: C.textSec, marginTop: 1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shop.sub}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4,
            fontSize: 11.5, color: C.textSec }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Icon name="star" size={11} color={C.warning}/>{shop.rating}
            </span>
            <span>·</span><span>{shop.eta}</span>
            <span>·</span><span>฿{shop.fee}</span>
          </div>
        </div>
      </button>
    );
  }

  const coverH = density === 'compact' ? 96 : 132;
  return (
    <button onClick={onOpen} style={{
      background: C.card, borderRadius: 14, overflow: 'hidden', border: `1px solid ${C.border}`,
      padding: 0, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', width: '100%',
    }}>
      <div style={{ position: 'relative' }}>
        <ShopCover swatch={shop.swatch} name={shop.name} height={coverH} closed={!shop.open}/>
        {shop.badge && (
          <div style={{ position: 'absolute', top: 10, left: 10, background: C.text, color: '#fff',
            fontSize: 11, fontWeight: 600, padding: '4px 8px', borderRadius: 6, whiteSpace: 'nowrap' }}>
            {shop.badge}</div>
        )}
        {shop.promo && shop.open && (
          <div style={{ position: 'absolute', top: 10, right: 10, background: C.primary, color: '#fff',
            fontSize: 11, fontWeight: 500, padding: '4px 8px', borderRadius: 6,
            maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {shop.promo}</div>
        )}
        {!shop.open && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,26,23,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>ปิดอยู่</div>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>เปิดอีกครั้ง {shop.openAt} น.</div>
          </div>
        )}
      </div>
      <div style={{ padding: density === 'compact' ? '10px 12px 12px' : '12px 14px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
          <h3 style={{ margin: 0, fontSize: density === 'compact' ? 14.5 : 16, fontWeight: 600, color: C.text, lineHeight: 1.3, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shop.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0, paddingTop: 2 }}>
            <Icon name="star" size={14} color={C.warning}/>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{shop.rating.toFixed(1)}</span>
            <span style={{ fontSize: 12, color: C.textSec }}>({shop.reviews})</span>
          </div>
        </div>
        <div style={{ fontSize: 13, color: C.textSec, marginBottom: 10, lineHeight: 1.4,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shop.sub}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: C.textSec }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="clock" size={13} stroke={2}/>{shop.eta}</span>
          <span style={{ width: 3, height: 3, borderRadius: 999, background: C.border }}/>
          <span>{shop.distance}</span>
          <span style={{ width: 3, height: 3, borderRadius: 999, background: C.border }}/>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="bike" size={14} stroke={2}/>฿{shop.fee}</span>
        </div>
      </div>
    </button>
  );
}

// ── Top bar ──
function TopBar({ onCart, cartCount, onAddress, onBell, unread = 2 }) {
  return (
    <div style={{ padding: '50px 16px 12px', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between', background: C.bg }}>
      <button onClick={onAddress} style={{ display: 'flex', alignItems: 'center', gap: 8,
        background: 'transparent', border: 'none', padding: '4px 0', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: C.primarySoft,
          color: C.primary, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Icon name="pin" size={18} stroke={2}/>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ fontSize: 11, color: C.textSec, fontWeight: 500,
            letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: 1.2 }}>ส่งไปที่</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text, maxWidth: 180,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
              บ้านเทอดไทย หมู่ 1</span>
            <Icon name="chev" size={14} stroke={2.2}/>
          </div>
        </div>
      </button>
      <button onClick={onBell} style={{ position: 'relative', width: 40, height: 40, borderRadius: 12,
        background: C.card, border: `1px solid ${C.border}`, display: 'grid', placeItems: 'center',
        cursor: 'pointer', color: C.text }} aria-label="การแจ้งเตือน">
        <Icon name="bell" size={18} stroke={2}/>
        {unread > 0 && (
          <span style={{ position: 'absolute', top: 8, right: 9, width: 8, height: 8,
            borderRadius: 999, background: C.primary, border: `1.5px solid ${C.card}` }}/>
        )}
      </button>
    </div>
  );
}

// ── Search ──
function SearchBar({ value, onChange }) {
  return (
    <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8 }}>
      <div style={{ flex: 1, height: 44, borderRadius: 12, background: C.card,
        border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10 }}>
        <Icon name="search" size={18} color={C.textSec}/>
        <input value={value} onChange={e => onChange(e.target.value)}
          placeholder="ค้นหาร้านหรือเมนู เช่น ข้าวซอย…"
          style={{ flex: 1, border: 'none', outline: 'none', fontFamily: 'inherit',
            fontSize: 14, background: 'transparent', color: C.text, minWidth: 0 }}/>
        {value && (
          <button onClick={() => onChange('')} style={{ background: 'transparent', border: 'none',
            cursor: 'pointer', color: C.textSec, padding: 4, display: 'grid', placeItems: 'center' }}>
            <Icon name="x" size={16}/>
          </button>
        )}
      </div>
      <button style={{ width: 44, height: 44, borderRadius: 12, background: C.text, color: '#fff',
        border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer' }} aria-label="ตัวกรอง">
        <Icon name="sliders" size={18} stroke={2}/>
      </button>
    </div>
  );
}

// ── Promo strip ──
function PromoStrip({ accent = 'green' }) {
  const bg = accent === 'orange' ? C.primary : C.secondary;
  return (
    <div style={{ padding: '4px 16px 16px' }}>
      <div style={{ position: 'relative', background: bg, borderRadius: 14,
        padding: '14px 16px', color: '#fff', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120,
          borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }}/>
        <div style={{ position: 'absolute', right: 30, bottom: -30, width: 80, height: 80,
          borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}/>
        <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em',
          textTransform: 'uppercase', opacity: 0.75, marginBottom: 4 }}>เทอดไทย โซนกลาง</div>
        <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.35, marginBottom: 2 }}>
          จ่ายปลายทางก็ได้ ส่งไวใน 30 นาที</div>
        <div style={{ fontSize: 12.5, opacity: 0.85, lineHeight: 1.45 }}>
          ค่าส่งเริ่มต้น ฿15 — เงินหมุนในชุมชนเรา</div>
      </div>
    </div>
  );
}

// ── Categories ──
function CategoryRow({ active, onPick }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="hide-scrollbar" style={{ display: 'flex', gap: 8, padding: '0 16px',
        overflowX: 'auto' }}>
        {CATEGORIES.map(c => {
          const isActive = c.id === active;
          return (
            <button key={c.id} onClick={() => onPick(c.id)} style={{
              flexShrink: 0, height: 38, padding: '0 14px', borderRadius: 999,
              background: isActive ? C.text : C.card, color: isActive ? '#fff' : C.text,
              border: `1px solid ${isActive ? C.text : C.border}`,
              fontSize: 13.5, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
              cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}>
              <span style={{ fontSize: 14 }}>{c.icon}</span>{c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SectionHeader({ title, sub, action }) {
  return (
    <div style={{ padding: '0 16px 10px', display: 'flex', alignItems: 'flex-end',
      justifyContent: 'space-between', gap: 12 }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: C.text, lineHeight: 1.3,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h2>
        {sub && <div style={{ fontSize: 12.5, color: C.textSec, marginTop: 2,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>}
      </div>
      {action && (
        <button style={{ background: 'transparent', border: 'none', padding: 0, fontSize: 13,
          color: C.primary, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 3 }}>
          {action}<Icon name="chevR" size={13} stroke={2}/></button>
      )}
    </div>
  );
}

function BottomNav({ active = 'home', cartCount = 0, onNav }) {
  const items = [
    { id: 'home', label: 'หน้าหลัก', icon: 'home' },
    { id: 'orders', label: 'คำสั่งซื้อ', icon: 'orders' },
    { id: 'cart', label: 'ตะกร้า', icon: 'bag', badge: cartCount || null },
    { id: 'me', label: 'ฉัน', icon: 'user' },
  ];
  return (
    <div style={{ background: C.card, borderTop: `1px solid ${C.border}`,
      padding: '8px 4px 28px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
      {items.map(it => {
        const isActive = it.id === active;
        return (
          <button key={it.id} onClick={() => onNav?.(it.id)} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '6px 4px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 3, color: isActive ? C.text : C.textSec,
            fontFamily: 'inherit', position: 'relative',
          }}>
            <div style={{ position: 'relative' }}>
              <Icon name={it.icon} size={22} stroke={isActive ? 2.2 : 1.75}/>
              {it.badge && (
                <span style={{ position: 'absolute', top: -4, right: -7, minWidth: 16, height: 16,
                  padding: '0 4px', borderRadius: 999, background: C.primary, color: '#fff',
                  fontSize: 10, fontWeight: 600, display: 'grid', placeItems: 'center' }}>{it.badge}</span>
              )}
            </div>
            <span style={{ fontSize: 11, fontWeight: isActive ? 600 : 500, whiteSpace: 'nowrap' }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Main Home ──
function CustomerHome({ onOpenShop, cartCount = 0, density = 'full', showPromo = true, accent = 'green', onNav, onAddress, onBell }) {
  const [active, setActive] = React.useState('all');
  const [query, setQuery] = React.useState('');

  const filtered = SHOPS.filter(s => {
    const catOk = active === 'all' || s.tags.some(t => (CAT_MAP[active] || []).includes(t));
    const q = query.trim().toLowerCase();
    const qOk = !q || s.name.toLowerCase().includes(q) || s.sub.toLowerCase().includes(q) ||
      s.tags.some(t => t.toLowerCase().includes(q));
    return catOk && qOk;
  });
  const open = filtered.filter(s => s.open);
  const closed = filtered.filter(s => !s.open);
  const catLabel = CATEGORIES.find(c => c.id === active)?.label;

  return (
    <div style={{ width: '100%', height: '100%', background: C.bg,
      fontFamily: '"IBM Plex Sans Thai", "Sarabun", system-ui, sans-serif',
      color: C.text, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopBar cartCount={cartCount} onCart={() => onNav?.('cart')} onAddress={onAddress} onBell={onBell}/>
      <SearchBar value={query} onChange={setQuery}/>

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
        {showPromo && <PromoStrip accent={accent}/>}
        <CategoryRow active={active} onPick={setActive}/>

        {filtered.length === 0 ? (
          <div style={{ padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🍽</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 4 }}>
              ไม่พบร้านที่ค้นหา</div>
            <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.5 }}>
              ลองค้นด้วยคำอื่น หรือเลือกหมวดหมู่ใหม่ดูนะคะ</div>
          </div>
        ) : (
          <>
            <SectionHeader
              title={active === 'all' ? 'ร้านในเทอดไทย' : catLabel}
              sub={`${open.length} ร้านเปิดอยู่ตอนนี้`}
              action="แผนที่"
            />
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {open.map(s => <ShopCard key={s.id} shop={s} density={density} onOpen={() => onOpenShop?.(s.id)}/>)}
            </div>
            {closed.length > 0 && (
              <>
                <div style={{ height: 20 }}/>
                <SectionHeader title="ปิดอยู่ตอนนี้" sub="กลับมาดูใหม่เมื่อร้านเปิด"/>
                <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {closed.map(s => <ShopCard key={s.id} shop={s} density={density} onOpen={() => onOpenShop?.(s.id)}/>)}
                </div>
              </>
            )}
            <div style={{ padding: '24px 16px 16px', textAlign: 'center', fontSize: 12, color: C.textSec }}>
              แสดงร้านในรัศมี 2 กม. จากที่อยู่จัดส่ง</div>
          </>
        )}
      </div>
      <BottomNav active="home" cartCount={cartCount} onNav={onNav}/>
    </div>
  );
}

Object.assign(window, { CustomerHome, ShopCard, ShopCover, BottomNav, TopBar, SectionHeader });
