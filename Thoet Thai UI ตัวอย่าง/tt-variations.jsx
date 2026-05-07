// Two alternate Home layouts: Hero-first (Variation B) and Map-first (Variation C)

const { TT_COLORS: C, CATEGORIES, CAT_MAP, SHOPS, Icon, ShopCard, BottomNav, TopBar } = window;

// ─────────────────────────────────────────────────────────────
// Variation B — Hero-first: big featured shop + grid of small cards
// ─────────────────────────────────────────────────────────────
function HomeHero({ onOpenShop, cartCount = 0, onNav }) {
  const featured = SHOPS[0];
  const others = SHOPS.slice(1);
  const [c1, c2, c3] = featured.swatch;

  return (
    <div style={{ width: '100%', height: '100%', background: C.bg,
      fontFamily: '"IBM Plex Sans Thai", sans-serif', color: C.text,
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopBar cartCount={cartCount} onCart={() => onNav?.('cart')}/>

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingBottom: 12 }}>
        {/* Hero featured */}
        <div style={{ padding: '0 16px 16px' }}>
          <button onClick={() => onOpenShop?.(featured.id)} style={{
            width: '100%', position: 'relative', borderRadius: 16, overflow: 'hidden',
            border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', textAlign: 'left',
            height: 220, background: c1,
          }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"
              style={{ position: 'absolute', inset: 0 }}>
              <defs>
                <linearGradient id="hbg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={c1}/><stop offset="100%" stopColor={c2}/>
                </linearGradient>
              </defs>
              <rect width="100" height="100" fill="url(#hbg)"/>
            </svg>
            <div style={{ position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.55) 100%)' }}/>
            <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 6 }}>
              <span style={{ background: 'rgba(255,255,255,0.95)', color: c3, fontSize: 11,
                fontWeight: 600, padding: '5px 9px', borderRadius: 6 }}>แนะนำวันนี้</span>
              {featured.badge && (
                <span style={{ background: C.primary, color: '#fff', fontSize: 11,
                  fontWeight: 600, padding: '5px 9px', borderRadius: 6 }}>{featured.badge}</span>
              )}
            </div>
            <div style={{ position: 'absolute', left: 16, right: 16, bottom: 14, color: '#fff' }}>
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{featured.name}</div>
              <div style={{ fontSize: 13, opacity: 0.92, marginBottom: 8 }}>{featured.sub}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Icon name="star" size={12} color={C.warning}/>{featured.rating}</span>
                <span>·</span><span>{featured.eta}</span>
                <span>·</span><span>฿{featured.fee}</span>
              </div>
            </div>
          </button>
        </div>

        <div style={{ padding: '0 16px 12px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>ร้านอื่น ๆ ใกล้คุณ</h2>
          <span style={{ fontSize: 12, color: C.textSec }}>{others.length} ร้าน</span>
        </div>

        {/* 2-col grid */}
        <div style={{ padding: '0 16px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {others.map(s => <GridCard key={s.id} shop={s} onOpen={() => onOpenShop?.(s.id)}/>)}
        </div>

        <div style={{ padding: '24px 16px 8px', textAlign: 'center', fontSize: 12, color: C.textSec }}>
          แสดงร้านในรัศมี 2 กม. จากที่อยู่จัดส่ง</div>
      </div>
      <BottomNav active="home" cartCount={cartCount} onNav={onNav}/>
    </div>
  );
}

function GridCard({ shop, onOpen }) {
  const [c1, c2, c3] = shop.swatch;
  return (
    <button onClick={onOpen} style={{ background: C.card, borderRadius: 12, overflow: 'hidden',
      border: `1px solid ${C.border}`, padding: 0, cursor: 'pointer', textAlign: 'left',
      fontFamily: 'inherit' }}>
      <div style={{ height: 90, position: 'relative', background: c1,
        filter: shop.open ? 'none' : 'grayscale(0.7)' }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={'gc'+shop.id} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={c1}/><stop offset="100%" stopColor={c2}/>
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill={`url(#gc${shop.id})`}/>
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.92)',
            display: 'grid', placeItems: 'center', fontSize: 16, fontWeight: 600, color: c3 }}>
            {shop.name.slice(0,1)}</div>
        </div>
        {!shop.open && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
            color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600 }}>
            ปิดอยู่</div>
        )}
      </div>
      <div style={{ padding: '8px 10px 10px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shop.name}</div>
        <div style={{ fontSize: 11.5, color: C.textSec, marginTop: 1,
          display: 'flex', alignItems: 'center', gap: 5 }}>
          <Icon name="star" size={10} color={C.warning}/>{shop.rating}
          <span>·</span>{shop.eta}
        </div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Variation C — Map-first: stylized map + bottom sheet of shops
// ─────────────────────────────────────────────────────────────
function HomeMap({ onOpenShop, cartCount = 0, onNav }) {
  const pins = [
    { id: 1, x: 32, y: 38 }, { id: 2, x: 58, y: 28 }, { id: 3, x: 70, y: 56 },
    { id: 4, x: 22, y: 64 }, { id: 5, x: 48, y: 70 }, { id: 6, x: 80, y: 38 },
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: C.bg,
      fontFamily: '"IBM Plex Sans Thai", sans-serif', color: C.text,
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Map */}
      <div style={{ position: 'relative', flex: '0 0 50%', overflow: 'hidden',
        background: '#E8EDE3' }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="mapg" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M0 5 H10 M5 0 V10" stroke="#D4DBC9" strokeWidth="0.3"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#mapg)"/>
          {/* roads */}
          <path d="M0 50 Q30 45 50 52 T100 48" stroke="#fff" strokeWidth="2.5" fill="none"/>
          <path d="M50 0 Q48 30 52 50 T48 100" stroke="#fff" strokeWidth="2" fill="none"/>
          <path d="M0 75 Q40 72 100 80" stroke="#fff" strokeWidth="1.5" fill="none"/>
          {/* parks */}
          <ellipse cx="20" cy="20" rx="15" ry="10" fill="#CFE0BC" opacity="0.7"/>
          <ellipse cx="85" cy="80" rx="18" ry="12" fill="#CFE0BC" opacity="0.7"/>
          {/* user */}
          <circle cx="50" cy="50" r="5" fill={C.info} opacity="0.2"/>
          <circle cx="50" cy="50" r="2.5" fill={C.info} stroke="#fff" strokeWidth="1"/>
        </svg>
        {/* pins */}
        {pins.map(p => {
          const shop = SHOPS.find(s => s.id === p.id);
          if (!shop) return null;
          return (
            <button key={p.id} onClick={() => onOpenShop?.(shop.id)}
              style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
                transform: 'translate(-50%, -100%)', cursor: 'pointer', border: 'none',
                background: 'transparent', padding: 0 }}>
              <div style={{ background: shop.open ? C.primary : C.textTer, color: '#fff',
                padding: '4px 8px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(0,0,0,0.18)' }}>
                ฿{shop.fee}</div>
              <div style={{ width: 0, height: 0, margin: '0 auto',
                borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
                borderTop: `6px solid ${shop.open ? C.primary : C.textTer}` }}/>
            </button>
          );
        })}
        {/* Top bar overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 0,
          background: 'linear-gradient(180deg, rgba(250,250,247,0.98) 0%, rgba(250,250,247,0.6) 70%, transparent 100%)' }}>
          <TopBar cartCount={cartCount} onCart={() => onNav?.('cart')}/>
        </div>
      </div>

      {/* Bottom sheet */}
      <div style={{ flex: 1, background: C.bg, borderTopLeftRadius: 20, borderTopRightRadius: 20,
        marginTop: -20, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: C.border }}/>
        </div>
        <div style={{ padding: '4px 16px 12px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{SHOPS.length} ร้านใกล้คุณ</h2>
          <button style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent',
            border: 'none', color: C.primary, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            fontFamily: 'inherit' }}>
            <Icon name="orders" size={14} stroke={2}/>ดูเป็นรายการ</button>
        </div>
        <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto',
          padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SHOPS.map(s => <ShopCard key={s.id} shop={s} density="list" onOpen={() => onOpenShop?.(s.id)}/>)}
        </div>
      </div>

      <BottomNav active="home" cartCount={cartCount} onNav={onNav}/>
    </div>
  );
}

Object.assign(window, { HomeHero, HomeMap });
