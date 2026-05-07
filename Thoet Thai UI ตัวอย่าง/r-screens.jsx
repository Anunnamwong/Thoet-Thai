// Rider screens — Home (online/offline), Incoming Job, Active Job (4 steps), Earnings, History, Profile

const { R_COLORS: R, INCOMING_JOB, ACTIVE_JOB_DATA, EARNINGS, EARN_WEEK_BARS, JOB_HISTORY,
  RIcon, RBigButton, RBottomNav, RHeader } = window;

// ─────────────────────────────────────────────────────────────
// Home — full-screen color toggle, GIANT
// ─────────────────────────────────────────────────────────────
function RHome({ online, onToggle, todayStats, onNav, onTriggerJob }) {
  const bg = online ? R.online : R.offlineSoft;
  const fg = online ? '#fff' : R.text;
  return (
    <div style={{ width: '100%', height: '100%', background: bg, transition: 'background 0.3s',
      fontFamily: '"IBM Plex Sans Thai", sans-serif', color: fg,
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '50px 20px 16px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 13.5, opacity: 0.85 }}>สวัสดีค่ะ</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>พี่สมชาย</div>
        </div>
        <div style={{ background: online ? 'rgba(255,255,255,0.2)' : R.card,
          padding: '6px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600,
          border: online ? 'none' : `1px solid ${R.border}` }}>
          🛵 มอเตอร์ไซค์
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        {/* Big status circle */}
        <div style={{ width: 220, height: 220, borderRadius: 999,
          background: online ? 'rgba(255,255,255,0.15)' : R.card,
          border: online ? '6px solid rgba(255,255,255,0.4)' : `6px solid ${R.border}`,
          display: 'grid', placeItems: 'center', marginBottom: 20,
          boxShadow: online ? '0 0 0 12px rgba(255,255,255,0.08)' : 'none',
          transition: 'all 0.3s' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 4 }}>{online ? '🟢' : '⚫'}</div>
            <div style={{ fontSize: 22, fontWeight: 700,
              color: online ? '#fff' : R.text }}>
              {online ? 'ออนไลน์' : 'ออฟไลน์'}</div>
            <div style={{ fontSize: 13.5, opacity: 0.8, marginTop: 2,
              color: online ? '#fff' : R.textSec }}>
              {online ? 'พร้อมรับงาน' : 'ไม่รับงาน'}</div>
          </div>
        </div>

        <div style={{ fontSize: 14, textAlign: 'center', maxWidth: 280, lineHeight: 1.5,
          color: online ? 'rgba(255,255,255,0.85)' : R.textSec, marginBottom: 24 }}>
          {online
            ? 'ระบบกำลังส่งตำแหน่งของคุณ เมื่อมีงานใกล้เคียงจะแจ้งเตือนทันที'
            : 'กดปุ่มด้านล่างเพื่อเริ่มรับงาน — ระบบจะหาออเดอร์ใกล้คุณ'}
        </div>

        <button onClick={onToggle} style={{
          width: '100%', height: 72, borderRadius: 16,
          background: online ? '#fff' : R.online,
          color: online ? R.online : '#fff',
          border: 'none', cursor: 'pointer',
          fontSize: 20, fontWeight: 700, fontFamily: 'inherit',
          boxShadow: online ? '0 6px 16px rgba(0,0,0,0.2)' : '0 6px 16px rgba(31,138,79,0.4)' }}>
          {online ? 'ออฟไลน์' : 'เริ่มรับงาน · ออนไลน์'}
        </button>
      </div>

      {/* Today summary at bottom */}
      <div style={{ background: online ? 'rgba(0,0,0,0.18)' : R.card,
        padding: '14px 20px', display: 'flex', justifyContent: 'space-around',
        borderTop: online ? 'none' : `1px solid ${R.border}` }}>
        <Stat label="งานวันนี้" value={todayStats.jobs} unit="งาน" online={online}/>
        <Divider online={online}/>
        <Stat label="รายได้" value={`฿${todayStats.gross}`} online={online} accent/>
        <Divider online={online}/>
        <Stat label="ออนไลน์" value={`${todayStats.hours}`} unit="ชม." online={online}/>
      </div>

      <RBottomNav active="home" onNav={onNav} online={online}/>
    </div>
  );
}

function Stat({ label, value, unit, online, accent }) {
  const fg = online ? '#fff' : R.text;
  const sub = online ? 'rgba(255,255,255,0.8)' : R.textSec;
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{ fontSize: 11.5, color: sub, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: fg,
        fontVariantNumeric: 'tabular-nums' }}>
        {value}
        {unit && <span style={{ fontSize: 11.5, fontWeight: 500, marginLeft: 3,
          color: sub }}>{unit}</span>}
      </div>
    </div>
  );
}
function Divider({ online }) {
  return <div style={{ width: 1, alignSelf: 'stretch',
    background: online ? 'rgba(255,255,255,0.2)' : R.borderSoft }}/>;
}

// ─────────────────────────────────────────────────────────────
// Incoming Job — full screen, 30s countdown
// ─────────────────────────────────────────────────────────────
function RIncomingJob({ job = INCOMING_JOB, onAccept, onReject }) {
  const [secs, setSecs] = React.useState(30);
  React.useEffect(() => {
    const t = setInterval(() => setSecs(s => Math.max(0, s-1)), 1000);
    return () => clearInterval(t);
  }, []);
  const pct = (secs / 30) * 100;

  return (
    <div style={{ width: '100%', height: '100%', background: R.online, color: '#fff',
      fontFamily: '"IBM Plex Sans Thai", sans-serif',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      animation: 'rPulse 1.4s ease-in-out infinite' }}>
      <style>{`
        @keyframes rPulse { 0%,100%{background:${R.online}} 50%{background:${R.onlineDark}} }
      `}</style>

      {/* Countdown bar at top */}
      <div style={{ height: 6, background: 'rgba(255,255,255,0.25)' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: '#fff',
          transition: 'width 1s linear' }}/>
      </div>

      <div style={{ padding: '40px 20px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 36 }}>🛵</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, letterSpacing: '0.05em',
            textTransform: 'uppercase' }}>งานใหม่!</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>มีงานใกล้คุณ</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.25)', padding: '8px 14px',
          borderRadius: 999, fontSize: 18, fontWeight: 700,
          fontVariantNumeric: 'tabular-nums', minWidth: 60, textAlign: 'center' }}>
          {secs}s</div>
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto',
        padding: '0 16px 16px' }}>
        {/* Big fee */}
        <div style={{ background: '#fff', color: R.text, borderRadius: 16, padding: 18,
          textAlign: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: R.textSec, marginBottom: 2 }}>ค่าตอบแทน</div>
          <div style={{ fontSize: 44, fontWeight: 800, color: R.primary,
            fontVariantNumeric: 'tabular-nums', lineHeight: 1.05 }}>฿{job.fee}</div>
          <div style={{ fontSize: 13, color: R.textSec, marginTop: 4 }}>
            ระยะทางรวม {job.totalKm} กม.
          </div>
        </div>

        {/* Pickup → Drop */}
        <div style={{ background: '#fff', color: R.text, borderRadius: 16,
          padding: 16, marginBottom: 12 }}>
          <RouteRow icon="shop" iconBg={R.primarySoft} iconFg={R.primary}
            label="ไปรับ" name={job.shopName} addr={job.shopAddr} km={job.pickupKm}/>
          <div style={{ marginLeft: 22, paddingLeft: 22, height: 28,
            borderLeft: `2px dashed ${R.border}` }}/>
          <RouteRow icon="pin" iconBg={R.onlineSoft} iconFg={R.online}
            label="ส่งให้" name={job.customerName} addr={job.dropAddr} km={job.dropKm}/>
        </div>

        {/* Payment note */}
        <div style={{ background: 'rgba(255,255,255,0.15)', color: '#fff',
          padding: '12px 14px', borderRadius: 10, fontSize: 14,
          border: '1.5px solid rgba(255,255,255,0.3)' }}>
          💵 <b>{job.payment}</b> — ต้องเก็บเงินจากลูกค้า
        </div>
      </div>

      <div style={{ padding: '12px 16px 24px', display: 'flex', gap: 10 }}>
        <button onClick={onReject} style={{
          width: 110, height: 64, borderRadius: 14,
          background: 'rgba(255,255,255,0.18)', color: '#fff',
          border: '2px solid rgba(255,255,255,0.4)', cursor: 'pointer',
          fontSize: 16, fontWeight: 600, fontFamily: 'inherit' }}>
          ปฏิเสธ</button>
        <button onClick={onAccept} style={{
          flex: 1, height: 64, borderRadius: 14,
          background: '#fff', color: R.online, border: 'none', cursor: 'pointer',
          fontSize: 19, fontWeight: 700, fontFamily: 'inherit' }}>
          ✓ รับงานเลย</button>
      </div>
    </div>
  );
}

function RouteRow({ icon, iconBg, iconFg, label, name, addr, km }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: iconBg, color: iconFg,
        display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <RIcon name={icon} size={22}/></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: R.textSec, fontWeight: 600,
          letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
        <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>{name}</div>
        <div style={{ fontSize: 13.5, color: R.textSec, marginTop: 1 }}>{addr}</div>
      </div>
      <div style={{ background: R.borderSoft, padding: '4px 10px', borderRadius: 999,
        fontSize: 12.5, fontWeight: 600, color: R.text,
        fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{km} กม.</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Active Job — 4 steps, ONE big button per step + Maps
// ─────────────────────────────────────────────────────────────
const STEPS = [
  { id: 'to-shop', label: 'ไปถึงร้านแล้ว', target: 'shop', verb: 'ไปร้าน',
    headline: 'ไปร้านก่อน', sub: 'ระยะทาง 0.6 กม.' },
  { id: 'pickup', label: 'รับของแล้ว', target: 'shop', verb: 'ที่ร้าน',
    headline: 'รับของจากร้าน', sub: 'ตรวจรายการให้ครบ ก่อนกดยืนยัน' },
  { id: 'to-drop', label: 'ถึงที่ส่งแล้ว', target: 'drop', verb: 'ไปส่ง',
    headline: 'ส่งให้ลูกค้า', sub: 'ระยะทาง 1.8 กม.' },
  { id: 'delivered', label: 'ส่งสำเร็จ', target: 'drop', verb: 'ที่จุดส่ง',
    headline: 'ส่งของให้ลูกค้า', sub: 'ถ่ายรูปยืนยันการส่งของ' },
];

function RActiveJob({ stepIdx = 0, onAdvance, onCancel, onMaps }) {
  const job = ACTIVE_JOB_DATA;
  const step = STEPS[stepIdx];
  const isAtShop = step.target === 'shop';
  const targetName = isAtShop ? job.shopName : job.customerName;
  const targetAddr = isAtShop ? job.shopAddr : job.dropAddr;
  const targetPhone = isAtShop ? job.shopPhone : job.customerPhone;
  const showCOD = stepIdx === 3;
  const showPhotoSlot = stepIdx === 3;

  return (
    <div style={{ width: '100%', height: '100%', background: R.text, color: '#fff',
      fontFamily: '"IBM Plex Sans Thai", sans-serif',
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <RHeader title={`#${job.id}`}
        sub={`ขั้นที่ ${stepIdx + 1} จาก 4`}
        dark
        right={<button onClick={onCancel} style={{ height: 36, padding: '0 12px',
          borderRadius: 8, background: 'rgba(255,255,255,0.15)', color: '#fff',
          border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer',
          fontSize: 12.5, fontWeight: 500, fontFamily: 'inherit', marginRight: 8 }}>
          ยกเลิก</button>}/>

      <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column',
        gap: 12, overflow: 'hidden' }}>
        {/* Step pills */}
        <div style={{ display: 'flex', gap: 4, justifyContent: 'space-between' }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ flex: 1, height: 6, borderRadius: 999,
              background: i <= stepIdx ? R.online : 'rgba(255,255,255,0.2)' }}/>
          ))}
        </div>

        {/* Headline */}
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)',
            letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
            ขั้นที่ {stepIdx + 1}</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 2 }}>{step.headline}</div>
          <div style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
            {step.sub}</div>
        </div>

        {/* Target card */}
        <div style={{ background: 'rgba(255,255,255,0.08)',
          border: '1.5px solid rgba(255,255,255,0.18)',
          borderRadius: 14, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12,
            background: isAtShop ? R.primary : R.online,
            display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <RIcon name={isAtShop ? 'shop' : 'pin'} size={26} color="#fff"/></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600,
              letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {isAtShop ? 'ร้าน' : 'ลูกค้า'}</div>
            <div style={{ fontSize: 17, fontWeight: 700, marginTop: 1,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {targetName}</div>
            <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.7)' }}>{targetAddr}</div>
          </div>
          <a href={`tel:${targetPhone}`} style={{
            width: 48, height: 48, borderRadius: 12, background: R.online,
            color: '#fff', textDecoration: 'none', display: 'grid', placeItems: 'center',
            flexShrink: 0 }}>
            <RIcon name="phone" size={22}/></a>
        </div>

        {/* COD reminder on last step */}
        {showCOD && (
          <div style={{ background: R.warningSoft, color: '#7A4F1A', borderRadius: 12,
            padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 28 }}>💵</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>ต้องเก็บเงินสดจากลูกค้า</div>
              <div style={{ fontSize: 24, fontWeight: 800,
                fontVariantNumeric: 'tabular-nums' }}>฿{job.cod}</div>
            </div>
          </div>
        )}

        {showPhotoSlot && (
          <button style={{ width: '100%', padding: 14, borderRadius: 12,
            background: 'rgba(255,255,255,0.08)',
            border: '1.5px dashed rgba(255,255,255,0.3)', color: '#fff',
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 12 }}>
            <RIcon name="cam" size={26}/>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>ถ่ายรูปยืนยันการส่ง</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                แนะนำ — ลูกค้ารับของแล้ววางหน้าบ้าน</div>
            </div>
          </button>
        )}

        <div style={{ flex: 1 }}/>

        {/* Maps button — prominent, always visible */}
        <button onClick={onMaps} style={{
          width: '100%', height: 60, borderRadius: 14, background: '#3B82F6', color: '#fff',
          border: 'none', cursor: 'pointer', fontSize: 17, fontWeight: 700, fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: '0 4px 14px rgba(59,130,246,0.4)' }}>
          <RIcon name="maps" size={24}/>นำทางไป {step.verb} (Google Maps)
        </button>

        {/* Advance step — biggest button */}
        <RBigButton color="online" height={72} onClick={onAdvance}>
          <span style={{ fontSize: 20 }}>✓ {step.label}</span>
        </RBigButton>
      </div>
    </div>
  );
}

function RDeliveredSummary({ onDone }) {
  const job = ACTIVE_JOB_DATA;
  return (
    <div style={{ width: '100%', height: '100%', background: R.bg, color: R.text,
      fontFamily: '"IBM Plex Sans Thai", sans-serif',
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, padding: '50px 20px 20px', display: 'flex',
        flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 100, height: 100, borderRadius: 999, background: R.onlineSoft,
          display: 'grid', placeItems: 'center' }}>
          <RIcon name="check" size={56} color={R.online} stroke={3}/></div>
        <div style={{ fontSize: 26, fontWeight: 800, marginTop: 8 }}>ส่งสำเร็จ!</div>
        <div style={{ fontSize: 14, color: R.textSec }}>งาน #{job.id}</div>
        <div style={{ background: R.card, borderRadius: 16, border: `1px solid ${R.border}`,
          padding: 20, width: '100%', maxWidth: 320, marginTop: 16 }}>
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: R.textSec }}>คุณได้รับ</div>
            <div style={{ fontSize: 44, fontWeight: 800, color: R.primary,
              fontVariantNumeric: 'tabular-nums', lineHeight: 1.05 }}>฿{job.fee}</div>
          </div>
          <div style={{ borderTop: `1px solid ${R.borderSoft}`, paddingTop: 12,
            display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13.5 }}>
            <Row label="ระยะทาง" value="2.4 กม."/>
            <Row label="เวลา" value="12 นาที"/>
            <Row label="งานวันนี้" value="9 งาน"/>
            <Row label="รายได้วันนี้" value="฿358" bold/>
          </div>
        </div>
      </div>
      <div style={{ padding: '12px 16px 24px' }}>
        <RBigButton color="online" onClick={onDone}>เสร็จ · กลับหน้าหลัก</RBigButton>
      </div>
    </div>
  );
}
function Row({ label, value, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between',
      fontSize: bold ? 15 : 13.5, fontWeight: bold ? 700 : 500,
      color: bold ? R.text : R.textSec }}>
      <span>{label}</span>
      <span style={{ color: R.text, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Earnings
// ─────────────────────────────────────────────────────────────
function REarnings({ onNav, online }) {
  const [period, setPeriod] = React.useState('today');
  const data = EARNINGS[period];
  const max = Math.max(...EARN_WEEK_BARS.map(d => d.val));

  return (
    <div style={{ width: '100%', height: '100%', background: R.bg,
      fontFamily: '"IBM Plex Sans Thai", sans-serif', color: R.text,
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <RHeader title="รายได้ของฉัน"/>
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <div style={{ display: 'flex', gap: 4, background: R.card, padding: 4,
          borderRadius: 10, border: `1px solid ${R.border}`, marginBottom: 14 }}>
          {[['today','วันนี้'],['week','7 วัน'],['month','30 วัน']].map(([id,l]) => (
            <button key={id} onClick={() => setPeriod(id)} style={{
              flex: 1, height: 44, borderRadius: 7, border: 'none', cursor: 'pointer',
              background: period === id ? R.text : 'transparent',
              color: period === id ? '#fff' : R.text,
              fontSize: 14.5, fontWeight: 600, fontFamily: 'inherit' }}>{l}</button>
          ))}
        </div>

        <div style={{ background: R.online, color: '#fff', borderRadius: 16, padding: 20,
          marginBottom: 12 }}>
          <div style={{ fontSize: 13.5, opacity: 0.9, marginBottom: 4 }}>รายได้รวม</div>
          <div style={{ fontSize: 40, fontWeight: 800,
            fontVariantNumeric: 'tabular-nums', lineHeight: 1.05 }}>
            ฿{data.gross.toLocaleString('th-TH')}</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 14, paddingTop: 14,
            borderTop: '1px solid rgba(255,255,255,0.25)', fontSize: 13 }}>
            <div>
              <div style={{ opacity: 0.85, marginBottom: 2 }}>งาน</div>
              <div style={{ fontSize: 17, fontWeight: 700,
                fontVariantNumeric: 'tabular-nums' }}>{data.jobs}</div>
            </div>
            <div>
              <div style={{ opacity: 0.85, marginBottom: 2 }}>ทิป</div>
              <div style={{ fontSize: 17, fontWeight: 700,
                fontVariantNumeric: 'tabular-nums' }}>฿{data.tips}</div>
            </div>
            <div>
              <div style={{ opacity: 0.85, marginBottom: 2 }}>ออนไลน์</div>
              <div style={{ fontSize: 17, fontWeight: 700,
                fontVariantNumeric: 'tabular-nums' }}>{data.hours} ชม.</div>
            </div>
          </div>
        </div>

        {period === 'week' && (
          <div style={{ background: R.card, borderRadius: 14, border: `1px solid ${R.border}`,
            padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 14 }}>
              7 วันที่ผ่านมา</div>
            <div style={{ display: 'flex', alignItems: 'flex-end',
              justifyContent: 'space-between', height: 130, gap: 6 }}>
              {EARN_WEEK_BARS.map((d, idx) => {
                const h = max > 0 ? (d.val / max) * 100 : 0;
                const isToday = idx === EARN_WEEK_BARS.length - 1;
                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 10.5, color: R.textSec, fontWeight: 500,
                      fontVariantNumeric: 'tabular-nums',
                      visibility: d.val > 0 ? 'visible' : 'hidden' }}>{d.val}</div>
                    <div style={{ width: '100%', flex: 1, display: 'flex',
                      flexDirection: 'column', justifyContent: 'flex-end' }}>
                      <div style={{ width: '100%', height: `${h}%`, minHeight: d.val>0?6:0,
                        background: isToday ? R.online : R.onlineSoft,
                        borderRadius: '4px 4px 0 0',
                        border: isToday ? 'none' : `1.5px solid ${R.online}` }}/>
                    </div>
                    <div style={{ fontSize: 12, color: isToday ? R.online : R.textSec,
                      fontWeight: isToday ? 700 : 500 }}>{d.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ background: R.card, borderRadius: 12, border: `1px solid ${R.border}`,
          padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: R.onlineSoft,
            color: R.online, display: 'grid', placeItems: 'center', fontSize: 18 }}>🏦</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600 }}>โอนถัดไป ฿2,180</div>
            <div style={{ fontSize: 12.5, color: R.textSec, marginTop: 1 }}>
              จะโอนวันที่ 5 พ.ค. · ธ.ออมสิน ***5566</div>
          </div>
          <RIcon name="chevR" size={18} color={R.textSec}/>
        </div>
      </div>
      <RBottomNav active="earn" onNav={onNav} online={online}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Job History
// ─────────────────────────────────────────────────────────────
function RHistory({ onNav, online }) {
  const total = JOB_HISTORY.reduce((s, j) => s + j.fee, 0);
  return (
    <div style={{ width: '100%', height: '100%', background: R.bg,
      fontFamily: '"IBM Plex Sans Thai", sans-serif', color: R.text,
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <RHeader title="งานของฉัน" sub={`วันนี้ · ${JOB_HISTORY.length} งาน · ฿${total}`}/>
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto',
        padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {JOB_HISTORY.map(j => (
          <div key={j.id} style={{ background: R.card, borderRadius: 12,
            border: `1px solid ${R.border}`, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: R.textSec,
                    fontFamily: 'ui-monospace, monospace' }}>#{j.id}</span>
                  <span style={{ fontSize: 12, color: R.textTer }}>· {j.time}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 14, fontWeight: 500 }}>
                  <RIcon name="shop" size={14} color={R.primary}/>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden',
                    textOverflow: 'ellipsis' }}>{j.shop}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 13, color: R.textSec, marginTop: 3 }}>
                  <RIcon name="pin" size={13} color={R.online}/>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden',
                    textOverflow: 'ellipsis' }}>{j.drop}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 10 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: R.primary,
                  fontVariantNumeric: 'tabular-nums' }}>฿{j.fee}</div>
                <div style={{ fontSize: 11.5, color: R.textTer,
                  fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>{j.km} กม.</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <RBottomNav active="history" onNav={onNav} online={online}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Profile
// ─────────────────────────────────────────────────────────────
function RProfile({ onNav, online }) {
  const sections = [
    { title: 'บัญชีของฉัน', items: [
      { icon: '🛵', label: 'ข้อมูลรถ', sub: 'มอเตอร์ไซค์ · กข 1234 เชียงราย' },
      { icon: '🪪', label: 'ใบขับขี่ + บัตร ปชช.', sub: 'ยืนยันแล้ว ✓' },
      { icon: '🏦', label: 'บัญชีรับเงิน', sub: 'ธ.ออมสิน ***5566' },
    ]},
    { title: 'ความช่วยเหลือ', items: [
      { icon: '❓', label: 'คำถามที่พบบ่อย' },
      { icon: '💬', label: 'ติดต่อแอดมิน', sub: 'LINE @thoetthai-rider' },
      { icon: '🆘', label: 'เกิดอุบัติเหตุ?', sub: 'โทรฉุกเฉิน 24 ชม.', danger: true },
    ]},
    { title: '', items: [
      { icon: '🚪', label: 'ออกจากระบบ', danger: true },
    ]},
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: R.bg,
      fontFamily: '"IBM Plex Sans Thai", sans-serif', color: R.text,
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <RHeader title="ฉัน"/>
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <div style={{ background: R.card, borderRadius: 14, border: `1px solid ${R.border}`,
          padding: 16, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 999, background: R.onlineSoft,
            color: R.online, display: 'grid', placeItems: 'center',
            fontSize: 22, fontWeight: 700 }}>ส</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 600 }}>พี่สมชาย</div>
            <div style={{ fontSize: 13, color: R.textSec, marginTop: 2 }}>
              ⭐ 4.9 · 1,248 งาน</div>
          </div>
        </div>
        {sections.map((sec, sidx) => (
          <div key={sidx} style={{ marginBottom: 16 }}>
            {sec.title && <div style={{ fontSize: 11.5, color: R.textSec, fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              marginBottom: 6, paddingLeft: 4 }}>{sec.title}</div>}
            <div style={{ background: R.card, borderRadius: 12, border: `1px solid ${R.border}`,
              overflow: 'hidden' }}>
              {sec.items.map((it, idx) => (
                <button key={it.label} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '16px 14px', background: 'transparent', border: 'none', cursor: 'pointer',
                  borderTop: idx === 0 ? 'none' : `1px solid ${R.borderSoft}`,
                  fontFamily: 'inherit', textAlign: 'left',
                  color: it.danger ? R.danger : R.text }}>
                  <span style={{ fontSize: 22, width: 30, textAlign: 'center' }}>{it.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 500 }}>{it.label}</div>
                    {it.sub && <div style={{ fontSize: 12.5, color: R.textSec, marginTop: 2 }}>
                      {it.sub}</div>}
                  </div>
                  {!it.danger && <RIcon name="chevR" size={18} color={R.textSec}/>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <RBottomNav active="me" onNav={onNav} online={online}/>
    </div>
  );
}

Object.assign(window, {
  RHome, RIncomingJob, RActiveJob, RDeliveredSummary, REarnings, RHistory, RProfile,
});
