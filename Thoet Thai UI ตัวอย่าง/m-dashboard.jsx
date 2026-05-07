// Merchant Dashboard (Today) + Incoming Order Alert + Active Orders + Order Detail

const { M_COLORS: M, INCOMING_ORDER, ACTIVE_ORDERS, MIcon, MBigButton, MBottomNav, MHeader } = window;

// ─────────────────────────────────────────────────────────────
// Today Dashboard — shop toggle prominent at top
// ─────────────────────────────────────────────────────────────
function MDashboard({ shopOpen, onToggle, stats, onNav, onOpenOrder, alertCount }) {
  return (
    <div style={{ width: '100%', height: '100%', background: M.bg,
      fontFamily: '"IBM Plex Sans Thai", sans-serif', color: M.text,
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto',
        padding: '50px 16px 16px' }}>
        {/* Greeting */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: M.textSec }}>สวัสดีค่ะ</div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>ร้านป้าหล้า</div>
        </div>

        {/* Shop open toggle — BIG */}
        <div style={{ background: shopOpen ? M.openSoft : M.dangerSoft,
          borderRadius: 16, padding: 16, marginBottom: 16,
          border: `2px solid ${shopOpen ? M.open : M.danger}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 14, height: 14, borderRadius: 999,
              background: shopOpen ? M.open : M.danger,
              boxShadow: shopOpen ? `0 0 0 4px ${M.open}33` : 'none' }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 600,
                color: shopOpen ? M.open : M.danger }}>
                {shopOpen ? 'ร้านเปิดอยู่' : 'ร้านปิดอยู่'}</div>
              <div style={{ fontSize: 13, color: M.textSec, marginTop: 2 }}>
                {shopOpen ? 'รับออเดอร์ได้ปกติ' : 'ลูกค้าจะเห็นว่าปิด'}</div>
            </div>
          </div>
          <button onClick={onToggle} style={{
            width: '100%', height: 52, borderRadius: 12,
            background: shopOpen ? M.danger : M.open, color: '#fff',
            border: 'none', cursor: 'pointer', fontSize: 17, fontWeight: 600,
            fontFamily: 'inherit' }}>
            {shopOpen ? 'ปิดร้าน' : 'เปิดร้าน'}
          </button>
        </div>

        {/* Today stats — 2 big tiles */}
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>วันนี้</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <StatTile label="ออเดอร์" value={stats.orders} unit="รายการ"/>
          <StatTile label="รายได้" value={`฿${stats.revenue.toLocaleString('th-TH')}`} accent/>
          <StatTile label="กำลังทำ" value={stats.cooking} unit="รายการ" sub={`เฉลี่ย ${stats.avgMin} นาที`}/>
          <StatTile label="รอไรเดอร์" value={stats.waiting} unit="รายการ"/>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <ActionTile icon="orders" label="ดูออเดอร์ทั้งหมด" badge={alertCount}
            onClick={() => onNav?.('orders')}/>
          <ActionTile icon="menu" label="จัดการเมนู" onClick={() => onNav?.('menu')}/>
          <ActionTile icon="clock" label="เวลาเปิด-ปิด" onClick={() => onOpenOrder?.('hours')}/>
          <ActionTile icon="chart" label="รายได้รายสัปดาห์" onClick={() => onNav?.('revenue')}/>
        </div>

        {/* Active orders peek */}
        {alertCount > 0 && (
          <button onClick={() => onNav?.('orders')} style={{
            width: '100%', background: M.primarySoft, color: M.primaryDark,
            borderRadius: 14, padding: 14, border: `1.5px solid ${M.primary}`,
            cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: M.primary,
              color: '#fff', display: 'grid', placeItems: 'center', fontSize: 20, fontWeight: 700 }}>
              {alertCount}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>มีออเดอร์ที่ต้องดู</div>
              <div style={{ fontSize: 13, marginTop: 2 }}>กดเพื่อดูรายละเอียด</div>
            </div>
            <MIcon name="chevR" size={20}/>
          </button>
        )}
      </div>
      <MBottomNav active="home" alertCount={alertCount} onNav={onNav}/>
    </div>
  );
}

function StatTile({ label, value, unit, sub, accent }) {
  return (
    <div style={{ background: M.card, borderRadius: 12, border: `1px solid ${M.border}`,
      padding: 14 }}>
      <div style={{ fontSize: 13, color: M.textSec, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: accent ? M.primary : M.text,
        fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>{value}</div>
      {unit && <div style={{ fontSize: 12, color: M.textSec, marginTop: 2 }}>{unit}</div>}
      {sub && <div style={{ fontSize: 11.5, color: M.textTer, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function ActionTile({ icon, label, onClick, badge }) {
  return (
    <button onClick={onClick} style={{ background: M.card, borderRadius: 12,
      border: `1px solid ${M.border}`, padding: 14, cursor: 'pointer', textAlign: 'left',
      fontFamily: 'inherit', display: 'flex', flexDirection: 'column', gap: 8,
      minHeight: 88, position: 'relative' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: M.primarySoft,
        color: M.primary, display: 'grid', placeItems: 'center' }}>
        <MIcon name={icon} size={20} stroke={2.2}/></div>
      <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{label}</div>
      {badge > 0 && (
        <span style={{ position: 'absolute', top: 10, right: 10, minWidth: 22, height: 22,
          padding: '0 6px', borderRadius: 999, background: M.primary, color: '#fff',
          fontSize: 12, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{badge}</span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Incoming Order Alert — full screen, animated
// ─────────────────────────────────────────────────────────────
function IncomingOrderAlert({ order = INCOMING_ORDER, onAccept, onReject }) {
  const [secs, setSecs] = React.useState(60);
  const [cookMins, setCookMins] = React.useState(15);
  React.useEffect(() => {
    const t = setInterval(() => setSecs(s => Math.max(0, s-1)), 1000);
    return () => clearInterval(t);
  }, []);
  const subtotal = order.items.reduce((s,i) => s + i.price*i.qty, 0);

  return (
    <div style={{ width: '100%', height: '100%', background: M.primary,
      fontFamily: '"IBM Plex Sans Thai", sans-serif', color: '#fff',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      animation: 'flash 1.6s ease-in-out infinite' }}>
      <style>{`
        @keyframes flash { 0%,100%{background:${M.primary}} 50%{background:${M.primaryDark}} }
        @keyframes ring { 0%,100%{transform:rotate(-8deg)} 50%{transform:rotate(8deg)} }
      `}</style>
      <div style={{ padding: '50px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ animation: 'ring 0.4s ease-in-out infinite' }}>
          <MIcon name="bell" size={32} color="#fff" stroke={2.4}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9,
            textTransform: 'uppercase', letterSpacing: '0.06em' }}>ออเดอร์ใหม่!</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>มีลูกค้าสั่ง</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px',
          borderRadius: 999, fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
          {secs}s</div>
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto',
        padding: '0 16px 16px' }}>
        <div style={{ background: '#fff', color: M.text, borderRadius: 16, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 13, color: M.textSec }}>เลขออเดอร์</div>
              <div style={{ fontSize: 17, fontWeight: 600,
                fontFamily: 'ui-monospace, monospace' }}>#{order.id}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, color: M.textSec }}>รวม</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: M.primary,
                fontVariantNumeric: 'tabular-nums' }}>฿{order.total}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, fontSize: 13, color: M.textSec,
            paddingBottom: 12, borderBottom: `1px solid ${M.borderSoft}` }}>
            <span>👤 {order.customer}</span><span>·</span>
            <span>📍 {order.distance}</span><span>·</span>
            <span>{order.payment}</span>
          </div>

          <div style={{ padding: '12px 0' }}>
            {order.items.map((it, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between',
                padding: '6px 0', fontSize: 15 }}>
                <div style={{ flex: 1 }}>
                  <span style={{ color: M.textSec, marginRight: 6 }}>{it.qty}×</span>
                  <span style={{ fontWeight: 500 }}>{it.name}</span>
                  {it.opt && <div style={{ fontSize: 12, color: M.textSec,
                    marginLeft: 22, marginTop: 1 }}>{it.opt}</div>}
                </div>
                <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                  ฿{it.price*it.qty}</span>
              </div>
            ))}
          </div>

          {order.note && (
            <div style={{ background: M.warningSoft, color: '#7A4F1A', padding: '10px 12px',
              borderRadius: 8, fontSize: 13.5, fontWeight: 500 }}>
              📝 หมายเหตุลูกค้า: {order.note}
            </div>
          )}
        </div>

        {/* Cooking time selector */}
        <div style={{ background: '#fff', color: M.text, borderRadius: 16, padding: 16,
          marginTop: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
            ใช้เวลาทำกี่นาที?</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[10, 15, 20, 30].map(m => {
              const active = cookMins === m;
              return (
                <button key={m} onClick={() => setCookMins(m)} style={{
                  height: 52, borderRadius: 10,
                  background: active ? M.primary : M.card,
                  color: active ? '#fff' : M.text,
                  border: `1.5px solid ${active ? M.primary : M.border}`,
                  cursor: 'pointer', fontSize: 16, fontWeight: 600, fontFamily: 'inherit' }}>
                  {m} นาที</button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 16px 24px', display: 'flex', gap: 10 }}>
        <button onClick={onReject} style={{
          width: 110, height: 60, borderRadius: 14,
          background: 'rgba(255,255,255,0.15)', color: '#fff',
          border: '2px solid rgba(255,255,255,0.4)', cursor: 'pointer',
          fontSize: 16, fontWeight: 600, fontFamily: 'inherit' }}>
          ปฏิเสธ</button>
        <button onClick={() => onAccept?.(cookMins)} style={{
          flex: 1, height: 60, borderRadius: 14,
          background: '#fff', color: M.primary, border: 'none', cursor: 'pointer',
          fontSize: 18, fontWeight: 700, fontFamily: 'inherit' }}>
          ✓ รับออเดอร์ ({cookMins} นาที)</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Active Orders List
// ─────────────────────────────────────────────────────────────
function MOrdersList({ orders, onOpenOrder, onNav, alertCount }) {
  const [tab, setTab] = React.useState('cooking');
  const filtered = orders.filter(o =>
    tab === 'cooking' ? o.status === 'cooking' :
    tab === 'ready' ? o.status === 'ready' :
    o.status === 'pickup');
  const counts = {
    cooking: orders.filter(o => o.status === 'cooking').length,
    ready: orders.filter(o => o.status === 'ready').length,
    pickup: orders.filter(o => o.status === 'pickup').length,
  };

  return (
    <div style={{ width: '100%', height: '100%', background: M.bg,
      fontFamily: '"IBM Plex Sans Thai", sans-serif', color: M.text,
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <MHeader title="ออเดอร์" sub={`ทั้งหมด ${orders.length} รายการ`}/>
      {/* Tabs */}
      <div style={{ display: 'flex', padding: '12px 12px 0', gap: 4 }}>
        {[
          ['cooking', 'กำลังทำ', counts.cooking],
          ['ready', 'พร้อมส่ง', counts.ready],
          ['pickup', 'ไรเดอร์รับแล้ว', counts.pickup],
        ].map(([id, l, n]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, height: 44, borderRadius: 10, border: 'none',
            background: tab === id ? M.text : 'transparent',
            color: tab === id ? '#fff' : M.text,
            fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            {l}<span style={{ fontSize: 12, opacity: 0.8 }}>({n})</span>
          </button>
        ))}
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto',
        padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🍽️</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>ไม่มีออเดอร์</div>
            <div style={{ fontSize: 14, color: M.textSec }}>รอออเดอร์ใหม่เข้ามานะคะ</div>
          </div>
        ) : filtered.map(o => <OrderCard key={o.id} order={o}
          onOpen={() => onOpenOrder?.(o.id)}/>)}
      </div>
      <MBottomNav active="orders" alertCount={alertCount} onNav={onNav}/>
    </div>
  );
}

function OrderCard({ order, onOpen }) {
  const isCooking = order.status === 'cooking';
  const isReady = order.status === 'ready';
  const pct = isCooking ? Math.min(100, (order.mins / order.total_mins) * 100) : 0;
  const overdue = isCooking && order.mins >= order.total_mins;

  return (
    <button onClick={onOpen} style={{ background: M.card, borderRadius: 14,
      border: `1.5px solid ${overdue ? M.danger : isReady ? M.open : M.border}`,
      padding: 14, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 700,
            fontFamily: 'ui-monospace, monospace' }}>#{order.id}</span>
          {isReady && <span style={{ background: M.openSoft, color: M.open, fontSize: 12,
            fontWeight: 700, padding: '4px 8px', borderRadius: 6 }}>พร้อมส่ง</span>}
          {overdue && <span style={{ background: M.dangerSoft, color: M.danger, fontSize: 12,
            fontWeight: 700, padding: '4px 8px', borderRadius: 6 }}>เกินเวลา</span>}
        </div>
        <span style={{ fontSize: 17, fontWeight: 700, color: M.primary,
          fontVariantNumeric: 'tabular-nums' }}>฿{order.total}</span>
      </div>
      <div style={{ fontSize: 14, color: M.textSec, marginBottom: 10 }}>
        {order.customer} · {order.items} รายการ
        {order.rider && <> · 🛵 {order.rider}</>}
      </div>
      {isCooking && (
        <>
          <div style={{ height: 6, borderRadius: 999, background: M.borderSoft,
            overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ width: `${pct}%`, height: '100%',
              background: overdue ? M.danger : M.primary, transition: 'width 0.4s' }}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12,
            color: M.textSec }}>
            <span>เวลาที่ผ่านไป {order.mins} นาที</span>
            <span>เป้าหมาย {order.total_mins} นาที</span>
          </div>
        </>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Order Detail (when merchant opens an active order)
// ─────────────────────────────────────────────────────────────
function MOrderDetail({ orderId, onBack, onMarkReady }) {
  const order = ACTIVE_ORDERS.find(o => o.id === orderId) || ACTIVE_ORDERS[0];
  const items = INCOMING_ORDER.items;
  return (
    <div style={{ width: '100%', height: '100%', background: M.bg,
      fontFamily: '"IBM Plex Sans Thai", sans-serif', color: M.text,
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <MHeader title={`#${order.id}`} sub={order.customer} onBack={onBack}/>
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <div style={{ background: M.card, borderRadius: 14, border: `1px solid ${M.border}`,
          padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>รายการที่ต้องทำ</div>
          {items.map((it, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', padding: '8px 0',
              borderTop: idx === 0 ? 'none' : `1px solid ${M.borderSoft}` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 500 }}>
                  <span style={{ color: M.primary, fontWeight: 700, marginRight: 8 }}>{it.qty}×</span>
                  {it.name}
                </div>
                {it.opt && <div style={{ fontSize: 13, color: M.textSec,
                  marginLeft: 26, marginTop: 2 }}>{it.opt}</div>}
              </div>
            </div>
          ))}
        </div>

        {INCOMING_ORDER.note && (
          <div style={{ background: M.warningSoft, color: '#7A4F1A', padding: 14,
            borderRadius: 12, fontSize: 14, fontWeight: 500, marginBottom: 12 }}>
            📝 หมายเหตุ: {INCOMING_ORDER.note}
          </div>
        )}

        <div style={{ background: M.card, borderRadius: 14, border: `1px solid ${M.border}`,
          padding: 16, marginBottom: 12 }}>
          <Row label="ลูกค้า" value={order.customer}/>
          <Row label="การชำระเงิน" value={INCOMING_ORDER.payment}/>
          <Row label="ยอดรวม" value={`฿${order.total}`} bold/>
        </div>

        {order.status === 'cooking' && (
          <MBigButton color="open" onClick={onMarkReady} height={60}>
            ✓ ทำเสร็จแล้ว · เรียกไรเดอร์
          </MBigButton>
        )}
        {order.status === 'ready' && (
          <div style={{ background: M.openSoft, color: M.open, padding: 16,
            borderRadius: 12, textAlign: 'center', fontSize: 15, fontWeight: 600 }}>
            🛵 รอไรเดอร์มารับ — เรียกไปแล้ว
          </div>
        )}
        {order.status === 'pickup' && (
          <div style={{ background: M.openSoft, color: M.open, padding: 16,
            borderRadius: 12, textAlign: 'center', fontSize: 15, fontWeight: 600 }}>
            ✓ ไรเดอร์รับไปแล้ว
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between',
      padding: '6px 0', fontSize: bold ? 16 : 14, fontWeight: bold ? 700 : 400,
      color: bold ? M.text : M.textSec }}>
      <span>{label}</span><span style={{ color: M.text }}>{value}</span>
    </div>
  );
}

Object.assign(window, { MDashboard, IncomingOrderAlert, MOrdersList, MOrderDetail });
