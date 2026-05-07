// Shop detail screen — shop 1 (ก๋วยเตี๋ยวป้าหล้า) with full menu + add-to-cart

const { TT_COLORS: C, SHOPS, MENU, Icon } = window;

function PriceTag({ value, size = 14 }) {
  return <span style={{ fontSize: size, fontWeight: 600, color: C.text,
    fontVariantNumeric: 'tabular-nums' }}>฿{value.toLocaleString('th-TH')}</span>;
}

function MenuItemRow({ item, qty, onAdd, onRemove }) {
  const soldOut = item.soldOut;
  return (
    <div style={{ display: 'flex', gap: 12, padding: '14px 0', alignItems: 'flex-start',
      borderBottom: `1px solid ${C.borderSoft}`, opacity: soldOut ? 0.55 : 1 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 14.5, fontWeight: 600, color: C.text }}>{item.name}</span>
          {item.hot && <Icon name="flame" size={13} color={C.primary}/>}
        </div>
        {item.desc && (
          <div style={{ fontSize: 12.5, color: C.textSec, lineHeight: 1.4, marginBottom: 6 }}>
            {item.desc}</div>
        )}
        {soldOut ? (
          <span style={{ fontSize: 11.5, color: C.danger, fontWeight: 500 }}>หมดวันนี้</span>
        ) : (
          <PriceTag value={item.price}/>
        )}
      </div>
      <div style={{ width: 80, height: 80, borderRadius: 10, flexShrink: 0,
        background: '#F3EBDD', position: 'relative', overflow: 'hidden',
        border: `1px solid ${C.border}` }}>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
          fontSize: 10, color: C.textTer, fontFamily: 'ui-monospace, monospace' }}>
          {item.name.slice(0, 6)}…</div>
        {!soldOut && (
          qty > 0 ? (
            <div style={{ position: 'absolute', bottom: 6, right: 6, display: 'flex',
              alignItems: 'center', background: C.text, borderRadius: 999, height: 28,
              boxShadow: '0 2px 6px rgba(0,0,0,0.18)' }}>
              <button onClick={onRemove} style={{ width: 28, height: 28, border: 'none',
                background: 'transparent', color: '#fff', cursor: 'pointer',
                display: 'grid', placeItems: 'center' }}>
                <Icon name="minus" size={14} stroke={2.5}/></button>
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, minWidth: 14,
                textAlign: 'center' }}>{qty}</span>
              <button onClick={onAdd} style={{ width: 28, height: 28, border: 'none',
                background: 'transparent', color: '#fff', cursor: 'pointer',
                display: 'grid', placeItems: 'center' }}>
                <Icon name="plus" size={14} stroke={2.5}/></button>
            </div>
          ) : (
            <button onClick={onAdd} style={{ position: 'absolute', bottom: 6, right: 6,
              width: 28, height: 28, borderRadius: 999, background: '#fff',
              border: `1px solid ${C.border}`, cursor: 'pointer', display: 'grid',
              placeItems: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', color: C.text }}>
              <Icon name="plus" size={16} stroke={2.5}/></button>
          )
        )}
      </div>
    </div>
  );
}

function ShopDetail({ shopId = 1, cart, onAdd, onRemove, onBack, onCart }) {
  const shop = SHOPS.find(s => s.id === shopId);
  const menu = MENU[shopId] || MENU[1];
  const [c1, c2, c3] = shop.swatch;

  const cartTotal = Object.entries(cart).reduce((sum, [id, q]) => {
    for (const sec of menu.sections)
      for (const it of sec.items) if (it.id === +id) return sum + it.price * q;
    return sum;
  }, 0);
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <div style={{ width: '100%', height: '100%', background: C.bg,
      fontFamily: '"IBM Plex Sans Thai", "Sarabun", system-ui, sans-serif',
      color: C.text, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Hero */}
      <div style={{ flex: 1, overflowY: 'auto' }} className="hide-scrollbar">
        <div style={{ position: 'relative', height: 180, background: c1, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 50, background: 'linear-gradient(180deg, rgba(0,0,0,0.18), transparent)', zIndex: 1 }}/>
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <linearGradient id="hero" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={c1}/><stop offset="100%" stopColor={c2}/>
              </linearGradient>
              <pattern id="herop" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke={c3} strokeWidth="0.7" strokeOpacity="0.18"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#hero)"/>
            <rect width="100" height="100" fill="url(#herop)"/>
          </svg>
          <button onClick={onBack} style={{ position: 'absolute', top: 54, left: 12, width: 38, height: 38, zIndex: 2,
            borderRadius: 999, background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer',
            display: 'grid', placeItems: 'center', color: C.text }} aria-label="ย้อนกลับ">
            <Icon name="chevL" size={20} stroke={2.2}/></button>
          <button style={{ position: 'absolute', top: 54, right: 12, width: 38, height: 38, zIndex: 2,
            borderRadius: 999, background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer',
            display: 'grid', placeItems: 'center', color: C.text }} aria-label="บันทึก">
            <Icon name="heart" size={18} stroke={2}/></button>
        </div>

        {/* Info card pulled up */}
        <div style={{ padding: '0 16px', marginTop: -28, position: 'relative', zIndex: 1 }}>
          <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`,
            padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10,
              justifyContent: 'space-between', marginBottom: 8 }}>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, lineHeight: 1.25 }}>{shop.name}</h1>
              {shop.badge && (
                <span style={{ background: C.primarySoft, color: C.primary, fontSize: 11,
                  fontWeight: 600, padding: '4px 8px', borderRadius: 6, flexShrink: 0,
                  whiteSpace: 'nowrap' }}>{shop.badge}</span>
              )}
            </div>
            <div style={{ fontSize: 13, color: C.textSec, marginBottom: 10, lineHeight: 1.4 }}>{shop.sub}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5,
              color: C.textSec, paddingTop: 10, borderTop: `1px solid ${C.borderSoft}` }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.text, fontWeight: 600 }}>
                <Icon name="star" size={13} color={C.warning}/>{shop.rating.toFixed(1)}
              </span>
              <span>({shop.reviews} รีวิว)</span>
              <span style={{ width: 3, height: 3, borderRadius: 999, background: C.border }}/>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Icon name="clock" size={12} stroke={2}/>{shop.eta}</span>
            </div>
            {shop.promo && (
              <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 8,
                background: C.primarySoft, color: C.primaryDark, fontSize: 12.5, fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="tag" size={13} stroke={2}/>{shop.promo}</div>
            )}
          </div>
        </div>

        {/* Menu sections */}
        <div style={{ padding: '20px 16px 100px' }}>
          {menu.sections.map(section => (
            <div key={section.name} style={{ marginBottom: 20 }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: C.text }}>
                {section.name}</h2>
              {section.items.map(item => (
                <MenuItemRow key={item.id} item={item} qty={cart[item.id] || 0}
                  onAdd={() => onAdd(item.id)} onRemove={() => onRemove(item.id)}/>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Sticky cart bar */}
      {cartCount > 0 && (
        <div style={{ padding: '10px 16px 14px', background: C.bg,
          borderTop: `1px solid ${C.border}` }}>
          <button onClick={onCart} style={{ width: '100%', height: 50, borderRadius: 12,
            background: C.primary, color: '#fff', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 16px', fontFamily: 'inherit' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 999, minWidth: 24,
                height: 24, padding: '0 8px', display: 'grid', placeItems: 'center', fontWeight: 600 }}>
                {cartCount}</span>
              <span style={{ fontWeight: 600 }}>ไปที่ตะกร้า</span>
            </span>
            <span style={{ fontSize: 15, fontWeight: 600 }}>฿{cartTotal.toLocaleString('th-TH')}</span>
          </button>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ShopDetail, PriceTag });
