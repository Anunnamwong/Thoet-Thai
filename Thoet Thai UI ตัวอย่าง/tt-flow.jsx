// Checkout, PromptPay, Tracking, Order History, Order Detail, Profile,
// Address picker, Notifications, Order Success — all wired into the flow

const { TT_COLORS: C, SHOPS, MENU, Icon, PriceTag } = window;

// ─────────────────────────────────────────────────────────────
// Generic header
// ─────────────────────────────────────────────────────────────
function ScreenHeader({ title, sub, onBack, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '50px 12px 10px',
      borderBottom: `1px solid ${C.border}`, background: C.bg }}>
      {onBack && (
        <button onClick={onBack} style={{ width: 38, height: 38, border: 'none',
          background: 'transparent', cursor: 'pointer', display: 'grid', placeItems: 'center',
          color: C.text, borderRadius: 10 }} aria-label="ย้อนกลับ">
          <Icon name="chevL" size={22} stroke={2.2}/></button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 600,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: C.textSec, marginTop: 1,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Checkout
// ─────────────────────────────────────────────────────────────
function CheckoutScreen({ shopId, cart, onBack, onPay, address, payment, onAddress, onPayment }) {
  const shop = SHOPS.find(s => s.id === shopId);
  const menu = MENU[shopId] || MENU[1];
  const items = [];
  for (const sec of menu.sections)
    for (const it of sec.items)
      if (cart[it.id] > 0) items.push({ ...it, qty: cart[it.id] });
  const subtotal = items.reduce((s,i) => s + i.price*i.qty, 0);
  const fee = shop.fee;
  const promoOff = subtotal >= 120 && shop.promo?.includes('ส่งฟรี') ? -fee : 0;
  const total = subtotal + fee + promoOff;

  const Row = ({ label, value, neg, bold }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between',
      fontSize: bold ? 14 : 13, fontWeight: bold ? 600 : 400,
      color: bold ? C.text : C.textSec, padding: '4px 0' }}>
      <span>{label}</span>
      <span style={{ color: neg ? C.secondary : C.text, fontVariantNumeric: 'tabular-nums' }}>
        {neg ? '−' : ''}฿{Math.abs(value).toLocaleString('th-TH')}</span>
    </div>
  );

  return (
    <div style={{ width: '100%', height: '100%', background: C.bg,
      fontFamily: '"IBM Plex Sans Thai", sans-serif', color: C.text,
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <ScreenHeader title="ยืนยันคำสั่งซื้อ" sub={shop.name} onBack={onBack}/>
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 16,
        display: 'flex', flexDirection: 'column', gap: 12 }}>

        <button onClick={onAddress} style={{ background: C.card, borderRadius: 12,
          border: `1px solid ${C.border}`, padding: 14, cursor: 'pointer', textAlign: 'left',
          display: 'flex', gap: 10, alignItems: 'flex-start', fontFamily: 'inherit' }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: C.primarySoft,
            color: C.primary, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Icon name="pin" size={16} stroke={2}/></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: C.textSec, marginBottom: 2 }}>ส่งไปที่</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{address.label}</div>
            <div style={{ fontSize: 12.5, color: C.textSec, marginTop: 2, lineHeight: 1.4 }}>
              {address.detail}</div>
          </div>
          <Icon name="chevR" size={16} color={C.textSec}/>
        </button>

        <button onClick={onPayment} style={{ background: C.card, borderRadius: 12,
          border: `1px solid ${C.border}`, padding: 14, cursor: 'pointer', textAlign: 'left',
          display: 'flex', gap: 10, alignItems: 'center', fontFamily: 'inherit' }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: C.secondarySoft,
            color: C.secondary, display: 'grid', placeItems: 'center', flexShrink: 0,
            fontSize: 16 }}>{payment === 'cod' ? '💵' : '🇹🇭'}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: C.textSec, marginBottom: 2 }}>วิธีชำระเงิน</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              {payment === 'cod' ? 'จ่ายปลายทาง (เงินสด)' : 'พร้อมเพย์ (PromptPay QR)'}</div>
          </div>
          <Icon name="chevR" size={16} color={C.textSec}/>
        </button>

        <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`,
          padding: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>รายการ ({items.length})</div>
          {items.map(it => (
            <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between',
              padding: '6px 0', fontSize: 13 }}>
              <span style={{ color: C.text }}>
                <span style={{ color: C.textSec, marginRight: 6 }}>{it.qty}×</span>{it.name}
              </span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                ฿{(it.price*it.qty).toLocaleString('th-TH')}</span>
            </div>
          ))}
          <div style={{ height: 1, background: C.borderSoft, margin: '10px 0 6px' }}/>
          <Row label="ค่าอาหาร" value={subtotal}/>
          <Row label="ค่าจัดส่ง" value={fee}/>
          {promoOff !== 0 && <Row label="ส่วนลดส่งฟรี" value={promoOff} neg/>}
          <div style={{ height: 1, background: C.borderSoft, margin: '6px 0' }}/>
          <Row label="รวมทั้งหมด" value={total} bold/>
        </div>

        <div style={{ background: C.primarySoft, borderRadius: 10, padding: '10px 12px',
          fontSize: 12.5, color: C.primaryDark, lineHeight: 1.5 }}>
          กดยืนยันแล้ว ร้านจะเริ่มทำอาหารให้ทันทีนะคะ — ยกเลิกได้ภายใน 1 นาทีเท่านั้น
        </div>
      </div>

      <div style={{ padding: '10px 16px 14px', background: C.bg,
        borderTop: `1px solid ${C.border}` }}>
        <button onClick={onPay} style={{ width: '100%', height: 50, borderRadius: 12,
          background: C.primary, color: '#fff', border: 'none', cursor: 'pointer',
          fontSize: 15, fontWeight: 600, fontFamily: 'inherit' }}>
          ยืนยันและสั่งซื้อ · ฿{total.toLocaleString('th-TH')}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PromptPay QR
// ─────────────────────────────────────────────────────────────
function PromptPayScreen({ amount, onBack, onPaid }) {
  const [secs, setSecs] = React.useState(15 * 60);
  React.useEffect(() => {
    const t = setInterval(() => setSecs(s => Math.max(0, s-1)), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(secs/60)).padStart(2,'0');
  const ss = String(secs%60).padStart(2,'0');

  return (
    <div style={{ width: '100%', height: '100%', background: C.bg,
      fontFamily: '"IBM Plex Sans Thai", sans-serif', color: C.text,
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <ScreenHeader title="พร้อมเพย์" onBack={onBack}/>
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto',
        padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`,
          padding: 16, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6,
                background: '#003087', color: '#fff', display: 'grid', placeItems: 'center',
                fontSize: 12, fontWeight: 700 }}>PP</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>PromptPay</div>
            </div>
            <div style={{ fontSize: 11, color: secs < 60 ? C.danger : C.textSec, fontWeight: 500,
              fontVariantNumeric: 'tabular-nums' }}>หมดอายุใน {mm}:{ss}</div>
          </div>

          {/* Fake QR */}
          <div style={{ aspectRatio: '1', width: '100%', maxWidth: 240, margin: '0 auto',
            background: '#fff', padding: 12, borderRadius: 8, position: 'relative',
            border: `1px solid ${C.borderSoft}` }}>
            <svg width="100%" height="100%" viewBox="0 0 21 21">
              {Array.from({ length: 21 }, (_, y) =>
                Array.from({ length: 21 }, (_, x) => {
                  const seed = (x*31 + y*17 + 7) % 100;
                  const corner = (x<7 && y<7) || (x>13 && y<7) || (x<7 && y>13);
                  const cornerInner = (x>1 && x<5 && y>1 && y<5) || (x>15 && x<19 && y>1 && y<5) ||
                    (x>1 && x<5 && y>15 && y<19);
                  const on = corner ? !((x===0||x===6||x===14||x===20)&&!cornerInner ?
                    (x>=14?(x===14||x===20):(x===0||x===6)):(y===0||y===6||y===14||y===20)) :
                    seed > 50;
                  return on ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#000"/> : null;
                })
              )}
              {/* corner squares */}
              {[[0,0],[14,0],[0,14]].map(([x,y]) => (
                <g key={`${x}-${y}`}>
                  <rect x={x} y={y} width="7" height="7" fill="#000"/>
                  <rect x={x+1} y={y+1} width="5" height="5" fill="#fff"/>
                  <rect x={x+2} y={y+2} width="3" height="3" fill="#000"/>
                </g>
              ))}
              {/* center logo */}
              <rect x="9" y="9" width="3" height="3" fill="#fff"/>
              <rect x="9.3" y="9.3" width="2.4" height="2.4" fill={C.primary}/>
            </svg>
          </div>

          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <div style={{ fontSize: 12, color: C.textSec, marginBottom: 2 }}>ยอดที่ต้องชำระ</div>
            <div style={{ fontSize: 28, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              ฿{amount.toLocaleString('th-TH')}</div>
            <div style={{ fontSize: 12, color: C.textSec, marginTop: 4 }}>
              ผู้รับเงิน · เทอดไทย เดลิเวอรี่</div>
          </div>
        </div>

        <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`,
          padding: 14, width: '100%', fontSize: 12.5, color: C.textSec, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, color: C.text, marginBottom: 4 }}>วิธีชำระเงิน</div>
          1. เปิดแอปธนาคารของคุณ<br/>
          2. เลือกสแกน QR<br/>
          3. สแกน QR ด้านบน ตรวจสอบยอด แล้วโอนเงิน<br/>
          4. ระบบจะยืนยันให้อัตโนมัติภายใน 30 วินาที
        </div>
      </div>

      <div style={{ padding: '10px 16px 14px', background: C.bg,
        borderTop: `1px solid ${C.border}`, display: 'flex', gap: 8 }}>
        <button onClick={onBack} style={{ height: 50, padding: '0 18px', borderRadius: 12,
          border: `1px solid ${C.border}`, background: C.card, cursor: 'pointer',
          fontSize: 14, fontWeight: 500, fontFamily: 'inherit', color: C.text }}>
          ยกเลิก</button>
        <button onClick={onPaid} style={{ flex: 1, height: 50, borderRadius: 12,
          background: C.text, color: '#fff', border: 'none', cursor: 'pointer',
          fontSize: 14, fontWeight: 600, fontFamily: 'inherit' }}>
          ฉันโอนเงินแล้ว</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Order Tracking
// ─────────────────────────────────────────────────────────────
const TRACK_STEPS = [
  { id: 'placed', label: 'รับคำสั่งซื้อแล้ว', sub: 'ส่งให้ร้านแล้ว' },
  { id: 'cooking', label: 'ร้านกำลังทำอาหาร', sub: 'ป้าหล้ากำลังลงมือ' },
  { id: 'pickup', label: 'ไรเดอร์รับอาหารแล้ว', sub: 'พี่สมชาย กำลังมาส่ง' },
  { id: 'arriving', label: 'กำลังมาถึง', sub: 'อีกประมาณ 5 นาที' },
  { id: 'delivered', label: 'ส่งสำเร็จ', sub: '' },
];

function OrderTracking({ orderId = 'TT-A4F9', shopId = 1, onBack, onChat, onCancel, onDone }) {
  const shop = SHOPS.find(s => s.id === shopId);
  const [stepIdx, setStepIdx] = React.useState(2);
  React.useEffect(() => {
    if (stepIdx >= TRACK_STEPS.length - 1) return;
    const t = setTimeout(() => setStepIdx(i => Math.min(i+1, TRACK_STEPS.length - 1)), 4500);
    return () => clearTimeout(t);
  }, [stepIdx]);

  const current = TRACK_STEPS[stepIdx];
  const canCancel = stepIdx < 1;

  return (
    <div style={{ width: '100%', height: '100%', background: C.bg,
      fontFamily: '"IBM Plex Sans Thai", sans-serif', color: C.text,
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <ScreenHeader title="ติดตามคำสั่งซื้อ" sub={`#${orderId}`} onBack={onBack}/>

      {/* Map */}
      <div style={{ height: 200, position: 'relative', background: '#E8EDE3', flexShrink: 0 }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="trackg" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M0 5 H10 M5 0 V10" stroke="#D4DBC9" strokeWidth="0.3"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#trackg)"/>
          <path d="M0 60 Q40 55 100 65" stroke="#fff" strokeWidth="2.5" fill="none"/>
          <path d="M50 0 Q48 40 55 60 T50 100" stroke="#fff" strokeWidth="2" fill="none"/>
          <ellipse cx="20" cy="20" rx="15" ry="10" fill="#CFE0BC" opacity="0.7"/>

          {/* Route line */}
          <path d="M25 30 Q40 50 60 65 T75 80" stroke={C.primary} strokeWidth="1.2"
            strokeDasharray="2 2" fill="none"/>

          {/* Shop pin */}
          <circle cx="25" cy="30" r="2.5" fill="#fff" stroke={C.text} strokeWidth="0.8"/>
          {/* Customer pin */}
          <circle cx="75" cy="80" r="3" fill={C.primary} stroke="#fff" strokeWidth="1"/>
        </svg>
        {/* Rider pin (animated position based on step) */}
        <div style={{ position: 'absolute',
          left: `${25 + stepIdx*12}%`, top: `${30 + stepIdx*12}%`,
          transform: 'translate(-50%, -50%)',
          transition: 'all 1s ease-out' }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: C.primary,
            display: 'grid', placeItems: 'center', color: '#fff', fontSize: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.25)', border: '3px solid #fff' }}>🛵</div>
        </div>
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 16px' }}>
        {/* Status card */}
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`,
          padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: C.primary,
              animation: 'pulse 1.4s ease-in-out infinite' }}/>
            <span style={{ fontSize: 12, color: C.primary, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.04em' }}>กำลังดำเนินการ</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 2 }}>{current.label}</div>
          {current.sub && <div style={{ fontSize: 13, color: C.textSec }}>{current.sub}</div>}
          {stepIdx < TRACK_STEPS.length - 1 && (
            <div style={{ marginTop: 12, padding: '10px 12px', background: C.bg,
              borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="clock" size={14} stroke={2}/>
              คาดว่าจะถึง <b>14:35 น.</b> · อีกประมาณ 12 นาที</div>
          )}
        </div>

        {/* Steps */}
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`,
          padding: 16, marginBottom: 12 }}>
          {TRACK_STEPS.map((s, i) => {
            const done = i < stepIdx;
            const active = i === stepIdx;
            const isLast = i === TRACK_STEPS.length - 1;
            return (
              <div key={s.id} style={{ display: 'flex', gap: 12, paddingBottom: isLast ? 0 : 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 22, height: 22, borderRadius: 999,
                    background: done ? C.secondary : active ? C.primary : C.borderSoft,
                    color: '#fff', display: 'grid', placeItems: 'center',
                    border: active ? `3px solid ${C.primarySoft}` : 'none' }}>
                    {done && <Icon name="check" size={12} stroke={3}/>}
                  </div>
                  {!isLast && <div style={{ flex: 1, width: 2, marginTop: 2,
                    background: done ? C.secondary : C.borderSoft }}/>}
                </div>
                <div style={{ flex: 1, paddingTop: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: active ? 600 : 500,
                    color: done || active ? C.text : C.textSec }}>{s.label}</div>
                  {s.sub && (done || active) && (
                    <div style={{ fontSize: 12.5, color: C.textSec, marginTop: 1 }}>{s.sub}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rider card */}
        {stepIdx >= 2 && stepIdx < TRACK_STEPS.length - 1 && (
          <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`,
            padding: 14, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 999, background: C.secondarySoft,
              color: C.secondary, display: 'grid', placeItems: 'center', fontSize: 18,
              fontWeight: 600 }}>ส</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>พี่สมชาย ใจดี</div>
              <div style={{ fontSize: 12, color: C.textSec }}>Honda Click · กท 1234</div>
            </div>
            <button onClick={onChat} style={{ width: 40, height: 40, borderRadius: 999,
              background: C.primarySoft, color: C.primary, border: 'none', cursor: 'pointer',
              display: 'grid', placeItems: 'center' }} aria-label="แชท">
              💬</button>
            <button style={{ width: 40, height: 40, borderRadius: 999,
              background: C.secondarySoft, color: C.secondary, border: 'none', cursor: 'pointer',
              display: 'grid', placeItems: 'center' }} aria-label="โทร">
              📞</button>
          </div>
        )}

        {/* Order summary mini */}
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`,
          padding: 14, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: C.textSec }}>ร้าน</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{shop.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: C.textSec }}>เลขคำสั่งซื้อ</span>
            <span style={{ fontSize: 13, fontWeight: 500, fontFamily: 'ui-monospace, monospace' }}>
              #{orderId}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: C.textSec }}>การชำระเงิน</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>จ่ายปลายทาง</span>
          </div>
        </div>

        {stepIdx === TRACK_STEPS.length - 1 ? (
          <button onClick={onDone} style={{ width: '100%', height: 48, borderRadius: 12,
            background: C.primary, color: '#fff', border: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: 600, fontFamily: 'inherit' }}>
            ให้คะแนนร้านและไรเดอร์
          </button>
        ) : canCancel ? (
          <button onClick={onCancel} style={{ width: '100%', height: 44, borderRadius: 12,
            background: 'transparent', color: C.danger, border: `1px solid ${C.border}`,
            cursor: 'pointer', fontSize: 13.5, fontWeight: 500, fontFamily: 'inherit' }}>
            ยกเลิกคำสั่งซื้อ</button>
        ) : (
          <div style={{ textAlign: 'center', fontSize: 12, color: C.textSec, padding: '8px 0' }}>
            ร้านเริ่มทำแล้ว ยกเลิกไม่ได้นะคะ — มีปัญหา? <span style={{ color: C.primary,
              fontWeight: 500 }}>ติดต่อแอดมิน</span>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Order Success
// ─────────────────────────────────────────────────────────────
function OrderSuccess({ orderId, total, onTrack, onHome }) {
  return (
    <div style={{ width: '100%', height: '100%', background: C.bg,
      fontFamily: '"IBM Plex Sans Thai", sans-serif', color: C.text,
      display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingTop: 50 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
        <div style={{ width: 96, height: 96, borderRadius: 999, background: C.secondarySoft,
          color: C.secondary, display: 'grid', placeItems: 'center', marginBottom: 24 }}>
          <Icon name="check" size={48} stroke={2.5}/>
        </div>
        <h1 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 600 }}>สั่งซื้อสำเร็จ!</h1>
        <p style={{ margin: 0, fontSize: 14, color: C.textSec, lineHeight: 1.55, maxWidth: 280 }}>
          ส่งคำสั่งซื้อให้ร้านแล้ว ร้านจะเริ่มทำอาหารให้ทันทีค่ะ
        </p>
        <div style={{ marginTop: 24, padding: '14px 20px', background: C.card, borderRadius: 12,
          border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, color: C.textSec, letterSpacing: '0.04em',
            textTransform: 'uppercase', marginBottom: 4 }}>เลขคำสั่งซื้อ</div>
          <div style={{ fontSize: 18, fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}>
            #{orderId}</div>
          <div style={{ fontSize: 13, color: C.textSec, marginTop: 6 }}>
            ยอดรวม ฿{total.toLocaleString('th-TH')}</div>
        </div>
      </div>
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={onTrack} style={{ height: 50, borderRadius: 12,
          background: C.primary, color: '#fff', border: 'none', cursor: 'pointer',
          fontSize: 15, fontWeight: 600, fontFamily: 'inherit' }}>
          ติดตามคำสั่งซื้อ</button>
        <button onClick={onHome} style={{ height: 48, borderRadius: 12,
          background: 'transparent', color: C.text, border: 'none', cursor: 'pointer',
          fontSize: 14, fontWeight: 500, fontFamily: 'inherit' }}>
          กลับหน้าหลัก</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Order History
// ─────────────────────────────────────────────────────────────
const HISTORY = [
  { id: 'TT-A4F9', shop: 'ก๋วยเตี๋ยวป้าหล้า', items: 'ข้าวซอยไก่ + 2 อย่าง', total: 165,
    when: 'กำลังจัดส่ง', status: 'active' },
  { id: 'TT-9C2B', shop: 'ข้าวมันไก่เจ๊หมวย', items: 'ข้าวมันไก่ × 2', total: 130,
    when: 'เมื่อวาน · 12:40', status: 'done' },
  { id: 'TT-7DA1', shop: 'ส้มตำลุงคำ', items: 'ส้มตำไก่ย่าง + ข้าวเหนียว', total: 180,
    when: '23 เม.ย. · 19:15', status: 'done' },
  { id: 'TT-6EB3', shop: 'หมั่นโถวอาแป๊ะ', items: 'หมั่นโถว × 4', total: 80,
    when: '20 เม.ย. · 09:30', status: 'done' },
  { id: 'TT-5D44', shop: 'ก๋วยเตี๋ยวป้าหล้า', items: 'ก๋วยเตี๋ยวเนื้อตุ๋น', total: 90,
    when: '15 เม.ย. · 18:00', status: 'cancelled' },
];

function OrderHistory({ onBack, onOpen, onTrack, onNav }) {
  const [tab, setTab] = React.useState('all');
  const list = HISTORY.filter(h => tab === 'all' ? true :
    tab === 'active' ? h.status === 'active' : h.status === 'done');

  return (
    <div style={{ width: '100%', height: '100%', background: C.bg,
      fontFamily: '"IBM Plex Sans Thai", sans-serif', color: C.text,
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <ScreenHeader title="คำสั่งซื้อของฉัน" onBack={onBack}/>

      <div style={{ display: 'flex', gap: 4, padding: '12px 16px',
        borderBottom: `1px solid ${C.borderSoft}` }}>
        {[['all','ทั้งหมด'],['active','กำลังดำเนินการ'],['done','สำเร็จแล้ว']].map(([id,l]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: '8px 14px', borderRadius: 999,
            background: tab === id ? C.text : 'transparent',
            color: tab === id ? '#fff' : C.text,
            border: tab === id ? 'none' : `1px solid ${C.border}`,
            fontSize: 12.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>{l}</button>
        ))}
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '12px 16px',
        display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>ยังไม่มีคำสั่งซื้อ</div>
            <div style={{ fontSize: 13, color: C.textSec }}>เริ่มสั่งจากร้านโปรดได้เลยค่ะ</div>
          </div>
        ) : list.map(h => (
          <button key={h.id} onClick={() => h.status === 'active' ? onTrack?.(h.id) : onOpen?.(h.id)}
            style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
              padding: 14, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{h.shop}</span>
              <StatusPill status={h.status}/>
            </div>
            <div style={{ fontSize: 12.5, color: C.textSec, marginBottom: 8 }}>{h.items}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: 12 }}>
              <span style={{ color: C.textSec }}>{h.when}</span>
              <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                ฿{h.total.toLocaleString('th-TH')}</span>
            </div>
          </button>
        ))}
      </div>
      <window.BottomNav active="orders" onNav={onNav}/>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    active: ['กำลังจัดส่ง', C.primary, C.primarySoft],
    done: ['สำเร็จ', C.secondary, C.secondarySoft],
    cancelled: ['ยกเลิก', C.danger, '#FCEBEA'],
  };
  const [label, fg, bg] = map[status];
  return <span style={{ background: bg, color: fg, fontSize: 11, fontWeight: 500,
    padding: '3px 8px', borderRadius: 6 }}>{label}</span>;
}

// ─────────────────────────────────────────────────────────────
// Profile
// ─────────────────────────────────────────────────────────────
function Profile({ onBack, onAddress, onNotif, onNav }) {
  const sections = [
    { title: 'บัญชี', items: [
      { icon: '👤', label: 'ข้อมูลส่วนตัว', sub: 'นภัสกร เจริญสุข' },
      { icon: '📍', label: 'ที่อยู่จัดส่ง', sub: '2 ที่อยู่', onClick: onAddress },
      { icon: '💳', label: 'วิธีชำระเงิน', sub: 'พร้อมเพย์, จ่ายปลายทาง' },
      { icon: '🔔', label: 'การแจ้งเตือน', sub: '', onClick: onNotif },
    ]},
    { title: 'ความช่วยเหลือ', items: [
      { icon: '❓', label: 'คำถามที่พบบ่อย', sub: '' },
      { icon: '💬', label: 'ติดต่อเรา', sub: 'LINE @thoetthai' },
      { icon: '📜', label: 'ข้อกำหนดและเงื่อนไข', sub: '' },
      { icon: '🔒', label: 'นโยบายความเป็นส่วนตัว', sub: '' },
    ]},
    { title: 'อื่น ๆ', items: [
      { icon: '🚪', label: 'ออกจากระบบ', sub: '', danger: true },
    ]},
  ];

  return (
    <div style={{ width: '100%', height: '100%', background: C.bg,
      fontFamily: '"IBM Plex Sans Thai", sans-serif', color: C.text,
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <ScreenHeader title="โปรไฟล์ของฉัน" onBack={onBack}/>
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {/* User card */}
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`,
          padding: 16, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 999, background: C.primarySoft,
            color: C.primary, display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 600 }}>
            น</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>นภัสกร เจริญสุข</div>
            <div style={{ fontSize: 12.5, color: C.textSec }}>088-234-5678 · เข้าใช้ผ่าน LINE</div>
          </div>
        </div>

        {sections.map(sec => (
          <div key={sec.title} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: C.textSec, fontWeight: 500,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              marginBottom: 6, paddingLeft: 4 }}>{sec.title}</div>
            <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`,
              overflow: 'hidden' }}>
              {sec.items.map((it, idx) => (
                <button key={it.label} onClick={it.onClick} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  borderTop: idx === 0 ? 'none' : `1px solid ${C.borderSoft}`,
                  fontFamily: 'inherit', textAlign: 'left',
                  color: it.danger ? C.danger : C.text }}>
                  <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{it.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{it.label}</div>
                    {it.sub && <div style={{ fontSize: 12, color: C.textSec, marginTop: 1 }}>{it.sub}</div>}
                  </div>
                  {!it.danger && <Icon name="chevR" size={16} color={C.textSec}/>}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div style={{ textAlign: 'center', padding: '8px 0 16px', fontSize: 11,
          color: C.textTer }}>
          เทอดไทย เดลิเวอรี่ · v0.1.0
        </div>
      </div>
      <window.BottomNav active="me" onNav={onNav}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Address picker (sheet-style)
// ─────────────────────────────────────────────────────────────
const ADDRESSES = [
  { id: 1, label: 'บ้านเทอดไทย หมู่ 1', detail: '123/4 หมู่ 1 ถ.พหลโยธิน ต.เทอดไทย อ.แม่ฟ้าหลวง เชียงราย 57240', icon: '🏠' },
  { id: 2, label: 'ที่ทำงาน', detail: '88 หมู่ 3 ต.เทอดไทย อ.แม่ฟ้าหลวง เชียงราย 57240', icon: '🏢' },
];

function AddressPicker({ current, onPick, onBack }) {
  return (
    <div style={{ width: '100%', height: '100%', background: C.bg,
      fontFamily: '"IBM Plex Sans Thai", sans-serif', color: C.text,
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <ScreenHeader title="เลือกที่อยู่จัดส่ง" onBack={onBack}/>
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {ADDRESSES.map(a => {
            const isActive = a.id === current.id;
            return (
              <button key={a.id} onClick={() => onPick(a)} style={{
                background: C.card, border: `1.5px solid ${isActive ? C.primary : C.border}`,
                borderRadius: 12, padding: 14, cursor: 'pointer', textAlign: 'left',
                fontFamily: 'inherit', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20, paddingTop: 2 }}>{a.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{a.label}</span>
                    {isActive && <span style={{ fontSize: 11, color: C.primary, fontWeight: 600 }}>· เลือกอยู่</span>}
                  </div>
                  <div style={{ fontSize: 12.5, color: C.textSec, lineHeight: 1.5 }}>{a.detail}</div>
                </div>
                {isActive && (
                  <div style={{ width: 22, height: 22, borderRadius: 999, background: C.primary,
                    color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Icon name="check" size={13} stroke={3}/></div>
                )}
              </button>
            );
          })}
        </div>
        <button style={{ width: '100%', height: 48, borderRadius: 12,
          background: 'transparent', color: C.primary, border: `1.5px dashed ${C.primary}`,
          cursor: 'pointer', fontSize: 14, fontWeight: 500, fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Icon name="plus" size={16} stroke={2.2}/>เพิ่มที่อยู่ใหม่
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────
const NOTIFS = [
  { id: 1, icon: '🛵', title: 'ไรเดอร์รับอาหารแล้ว', body: 'พี่สมชาย กำลังนำของไปส่งที่บ้าน',
    when: '2 นาทีที่แล้ว', unread: true },
  { id: 2, icon: '✅', title: 'ร้านยืนยันคำสั่งซื้อแล้ว', body: 'ก๋วยเตี๋ยวป้าหล้า · #TT-A4F9',
    when: '15 นาทีที่แล้ว', unread: true },
  { id: 3, icon: '🎁', title: 'รับโค้ดส่งฟรี!', body: 'สั่งครบ ฿120 จากร้านในย่านเทอดไทย ส่งฟรีทันที',
    when: 'เมื่อวาน', unread: false },
  { id: 4, icon: '⭐', title: 'ขอบคุณที่ให้คะแนน', body: 'ได้รับคะแนน 50 พ้อยท์',
    when: '23 เม.ย.', unread: false },
];

function Notifications({ onBack }) {
  return (
    <div style={{ width: '100%', height: '100%', background: C.bg,
      fontFamily: '"IBM Plex Sans Thai", sans-serif', color: C.text,
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <ScreenHeader title="การแจ้งเตือน" onBack={onBack}
        right={<button style={{ background: 'transparent', border: 'none', cursor: 'pointer',
          color: C.primary, fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
          padding: '0 12px' }}>อ่านทั้งหมด</button>}/>
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
        {NOTIFS.map(n => (
          <div key={n.id} style={{ display: 'flex', gap: 12, padding: '14px 16px',
            borderBottom: `1px solid ${C.borderSoft}`,
            background: n.unread ? '#FFF8F4' : 'transparent' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: C.card,
              border: `1px solid ${C.border}`, display: 'grid', placeItems: 'center',
              fontSize: 18, flexShrink: 0 }}>{n.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{n.title}</span>
                {n.unread && <span style={{ width: 6, height: 6, borderRadius: 999,
                  background: C.primary }}/>}
              </div>
              <div style={{ fontSize: 12.5, color: C.textSec, lineHeight: 1.45, marginBottom: 4 }}>
                {n.body}</div>
              <div style={{ fontSize: 11, color: C.textTer }}>{n.when}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Confirm dialog
// ─────────────────────────────────────────────────────────────
function ConfirmDialog({ open, title, body, confirmLabel, cancelLabel = 'ไม่ใช่', danger, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div onClick={onCancel} style={{ position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.card, borderRadius: 16,
        padding: 20, maxWidth: 320, width: '100%' }}>
        <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 13.5, color: C.textSec, lineHeight: 1.5, marginBottom: 16 }}>{body}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={{ flex: 1, height: 44, borderRadius: 10,
            border: `1px solid ${C.border}`, background: C.card, cursor: 'pointer',
            fontSize: 14, fontWeight: 500, fontFamily: 'inherit', color: C.text }}>
            {cancelLabel}</button>
          <button onClick={onConfirm} style={{ flex: 1, height: 44, borderRadius: 10,
            background: danger ? C.danger : C.primary, color: '#fff', border: 'none',
            cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit' }}>
            {confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  CheckoutScreen, PromptPayScreen, OrderTracking, OrderSuccess,
  OrderHistory, Profile, AddressPicker, Notifications, ConfirmDialog,
});
