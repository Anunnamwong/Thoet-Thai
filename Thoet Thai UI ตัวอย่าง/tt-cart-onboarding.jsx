// Cart + Onboarding screens

const { TT_COLORS: C, SHOPS, MENU, Icon, PriceTag } = window;

function CartScreen({ shopId = 1, cart, onAdd, onRemove, onBack, onCheckout, onClear }) {
  const shop = SHOPS.find(s => s.id === shopId);
  const menu = MENU[shopId] || MENU[1];
  const items = [];
  for (const sec of menu.sections)
    for (const it of sec.items)
      if (cart[it.id] > 0) items.push({ ...it, qty: cart[it.id] });

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const fee = shop.fee;
  const promoDiscount = subtotal >= 120 && shop.promo?.includes('ส่งฟรี') ? -fee : 0;
  const total = subtotal + fee + promoDiscount;

  return (
    <div style={{ width: '100%', height: '100%', background: C.bg,
      fontFamily: '"IBM Plex Sans Thai", "Sarabun", system-ui, sans-serif',
      color: C.text, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '50px 12px 10px',
        borderBottom: `1px solid ${C.border}` }}>
        <button onClick={onBack} style={{ width: 38, height: 38, border: 'none',
          background: 'transparent', cursor: 'pointer', display: 'grid', placeItems: 'center',
          color: C.text, borderRadius: 10 }}>
          <Icon name="chevL" size={22} stroke={2.2}/></button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>ตะกร้าของฉัน</div>
          <div style={{ fontSize: 12, color: C.textSec, marginTop: 1 }}>{shop.name}</div>
        </div>
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
        {items.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>ตะกร้ายังว่างอยู่</div>
            <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.5 }}>
              เลือกเมนูจากร้านโปรดได้เลยค่ะ</div>
          </div>
        ) : (
          <>
            {/* Items */}
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map(it => (
                <div key={it.id} style={{ display: 'flex', gap: 10, padding: 12,
                  background: C.card, borderRadius: 12, border: `1px solid ${C.border}` }}>
                  <div style={{ width: 56, height: 56, borderRadius: 8, background: '#F3EBDD',
                    flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 9,
                    color: C.textTer, fontFamily: 'ui-monospace, monospace' }}>
                    {it.name.slice(0,5)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{it.name}</div>
                    <div style={{ fontSize: 12, color: C.textSec, marginBottom: 6 }}>
                      ฿{it.price} × {it.qty}</div>
                    <div style={{ display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between' }}>
                      <PriceTag value={it.price * it.qty} size={14}/>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 0,
                        border: `1px solid ${C.border}`, borderRadius: 999, height: 30 }}>
                        <button onClick={() => onRemove(it.id)} style={{ width: 30, height: 30,
                          border: 'none', background: 'transparent', cursor: 'pointer',
                          color: C.text, display: 'grid', placeItems: 'center' }}>
                          <Icon name="minus" size={14} stroke={2.5}/></button>
                        <span style={{ minWidth: 18, textAlign: 'center', fontSize: 13,
                          fontWeight: 600 }}>{it.qty}</span>
                        <button onClick={() => onAdd(it.id)} style={{ width: 30, height: 30,
                          border: 'none', background: 'transparent', cursor: 'pointer',
                          color: C.text, display: 'grid', placeItems: 'center' }}>
                          <Icon name="plus" size={14} stroke={2.5}/></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Note */}
            <div style={{ padding: '4px 16px 12px' }}>
              <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`,
                padding: 12 }}>
                <div style={{ fontSize: 12, color: C.textSec, marginBottom: 4 }}>หมายเหตุถึงร้าน</div>
                <div style={{ fontSize: 13, color: C.textTer }}>ไม่ใส่ผัก เพิ่มน้ำซุปแยก…</div>
              </div>
            </div>

            {/* Promo input */}
            <div style={{ padding: '0 16px 12px' }}>
              <button style={{ width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 12, padding: '12px 14px', cursor: 'pointer', fontFamily: 'inherit' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.text }}>
                  <Icon name="tag" size={16} stroke={2}/>
                  <span style={{ fontSize: 13.5, fontWeight: 500 }}>ใส่โค้ดส่วนลด</span>
                </span>
                <Icon name="chevR" size={16} color={C.textSec}/>
              </button>
            </div>

            {/* Summary */}
            <div style={{ padding: '0 16px 16px' }}>
              <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`,
                padding: '14px 16px' }}>
                <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 600 }}>สรุปยอด</h3>
                {[
                  ['ค่าอาหาร', subtotal],
                  ['ค่าจัดส่ง', fee],
                  promoDiscount && ['ส่วนลดส่งฟรี', promoDiscount],
                ].filter(Boolean).map(([label, v]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between',
                    fontSize: 13, color: C.textSec, padding: '4px 0' }}>
                    <span>{label}</span>
                    <span style={{ color: v < 0 ? C.secondary : C.text,
                      fontVariantNumeric: 'tabular-nums' }}>
                      {v < 0 ? '−' : ''}฿{Math.abs(v).toLocaleString('th-TH')}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: C.borderSoft, margin: '8px 0' }}/>
                <div style={{ display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', paddingTop: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>รวมทั้งหมด</span>
                  <PriceTag value={total} size={18}/>
                </div>
              </div>
            </div>

            {/* Payment hint */}
            <div style={{ padding: '0 16px 24px' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { label: 'จ่ายปลายทาง', icon: '💵', active: true },
                  { label: 'PromptPay', icon: '🇹🇭', active: false },
                ].map(p => (
                  <button key={p.label} style={{ flex: 1, padding: '12px 10px', borderRadius: 12,
                    background: p.active ? C.secondarySoft : C.card,
                    border: `1.5px solid ${p.active ? C.secondary : C.border}`,
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 4, fontFamily: 'inherit' }}>
                    <span style={{ fontSize: 18 }}>{p.icon}</span>
                    <span style={{ fontSize: 12.5, fontWeight: p.active ? 600 : 500,
                      color: p.active ? C.secondary : C.text }}>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {items.length > 0 && (
        <div style={{ padding: '10px 16px 14px', background: C.bg,
          borderTop: `1px solid ${C.border}` }}>
          <button onClick={onCheckout} style={{ width: '100%', height: 50, borderRadius: 12,
            background: C.primary, color: '#fff', border: 'none', cursor: 'pointer',
            fontSize: 15, fontWeight: 600, fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            สั่งซื้อ · ฿{total.toLocaleString('th-TH')}
            <Icon name="chevR" size={18} stroke={2.2}/></button>
        </div>
      )}
    </div>
  );
}

// ── Onboarding ──
const SLIDES = [
  { title: 'อาหารร้านโปรดในเทอดไทย',
    body: 'รวมร้านอร่อยใกล้บ้าน สั่งง่าย ส่งไว ภายใน 30 นาที',
    accent: C.primary, icon: '🥘' },
  { title: 'ค่าส่งถูก จ่ายปลายทางได้',
    body: 'ค่าจัดส่งเริ่มต้น ฿15 ตามโซน ไม่คิดตามระยะ จ่ายเงินสดก็ได้นะคะ',
    accent: C.secondary, icon: '💵' },
  { title: 'เงินหมุนในชุมชนเรา',
    body: 'ค่าธรรมเนียมต่ำกว่าเจ้าใหญ่ ร้านได้กำไรเต็มเม็ดเต็มหน่วย',
    accent: C.warning, icon: '🏘️' },
];

function Onboarding({ onDone }) {
  const [i, setI] = React.useState(0);
  const slide = SLIDES[i];
  const last = i === SLIDES.length - 1;

  return (
    <div style={{ width: '100%', height: '100%', background: C.bg,
      fontFamily: '"IBM Plex Sans Thai", "Sarabun", system-ui, sans-serif',
      color: C.text, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '54px 16px 14px' }}>
        <button onClick={onDone} style={{ background: 'transparent', border: 'none',
          color: C.textSec, fontSize: 13, fontWeight: 500, cursor: 'pointer',
          fontFamily: 'inherit', padding: 6 }}>ข้าม</button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
        <div style={{ width: 168, height: 168, borderRadius: 32,
          background: slide.accent + '15', display: 'grid', placeItems: 'center',
          marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background:
            `radial-gradient(circle at 30% 30%, ${slide.accent}25, transparent 70%)` }}/>
          <span style={{ fontSize: 80, position: 'relative' }}>{slide.icon}</span>
        </div>
        <h1 style={{ margin: '0 0 12px', fontSize: 24, fontWeight: 600, lineHeight: 1.3,
          textWrap: 'pretty' }}>{slide.title}</h1>
        <p style={{ margin: 0, fontSize: 15, color: C.textSec, lineHeight: 1.55,
          textWrap: 'pretty', maxWidth: 280 }}>{slide.body}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, paddingBottom: 20 }}>
        {SLIDES.map((_, idx) => (
          <div key={idx} style={{ height: 6, width: idx === i ? 24 : 6, borderRadius: 999,
            background: idx === i ? C.text : C.border, transition: 'all 0.25s' }}/>
        ))}
      </div>

      <div style={{ padding: '0 16px 24px', display: 'flex', gap: 10 }}>
        {i > 0 && (
          <button onClick={() => setI(i - 1)} style={{ width: 50, height: 50, borderRadius: 12,
            border: `1px solid ${C.border}`, background: C.card, cursor: 'pointer',
            display: 'grid', placeItems: 'center', color: C.text }}>
            <Icon name="chevL" size={20} stroke={2.2}/></button>
        )}
        <button onClick={() => last ? onDone() : setI(i + 1)} style={{ flex: 1, height: 50,
          borderRadius: 12, background: C.text, color: '#fff', border: 'none',
          cursor: 'pointer', fontSize: 15, fontWeight: 600, fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {last ? 'เริ่มใช้งาน' : 'ถัดไป'}<Icon name="chevR" size={18} stroke={2.2}/>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { CartScreen, Onboarding });
