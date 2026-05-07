// Merchant Menu Management + Item Editor (with camera) + Shop Hours + Revenue + Settlement + Profile

const { M_COLORS: M, M_MENU, HOURS, REV_WEEK, SETTLEMENTS,
  MIcon, MBigButton, MBottomNav, MHeader } = window;

// ─────────────────────────────────────────────────────────────
// Menu list (CRUD + sold out toggle)
// ─────────────────────────────────────────────────────────────
function MMenuList({ items, onToggleSold, onEdit, onAdd, onNav, alertCount }) {
  const cats = ['ทั้งหมด', ...Array.from(new Set(items.map(i => i.cat)))];
  const [cat, setCat] = React.useState('ทั้งหมด');
  const filtered = cat === 'ทั้งหมด' ? items : items.filter(i => i.cat === cat);

  return (
    <div style={{ width: '100%', height: '100%', background: M.bg,
      fontFamily: '"IBM Plex Sans Thai", sans-serif', color: M.text,
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <MHeader title="จัดการเมนู" sub={`ทั้งหมด ${items.length} รายการ`}
        right={<button onClick={onAdd} style={{ width: 44, height: 44, border: 'none',
          background: M.primary, color: '#fff', cursor: 'pointer', borderRadius: 12,
          display: 'grid', placeItems: 'center', marginRight: 8 }}>
          <MIcon name="plus" size={22} stroke={2.4}/></button>}/>

      <div className="hide-scrollbar" style={{ display: 'flex', gap: 6, padding: '12px 16px 8px',
        overflowX: 'auto', flexShrink: 0 }}>
        {cats.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            padding: '8px 14px', borderRadius: 999, whiteSpace: 'nowrap',
            background: cat === c ? M.text : 'transparent',
            color: cat === c ? '#fff' : M.text,
            border: cat === c ? 'none' : `1px solid ${M.border}`,
            fontSize: 13.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>{c}</button>
        ))}
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '0 16px 12px',
        display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(it => (
          <div key={it.id} style={{ background: M.card, borderRadius: 12,
            border: `1px solid ${M.border}`, padding: 12, display: 'flex', alignItems: 'center',
            gap: 12, opacity: it.sold ? 0.55 : 1 }}>
            <div style={{ width: 60, height: 60, borderRadius: 10, background: M.borderSoft,
              display: 'grid', placeItems: 'center', flexShrink: 0,
              border: `1px solid ${M.border}` }}>
              <MIcon name="cam" size={20} color={M.textTer}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 15, fontWeight: 600,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.name}</div>
                {it.hot && <MIcon name="fire" size={14} color={M.primary}/>}
              </div>
              <div style={{ fontSize: 13, color: M.textSec, marginTop: 2 }}>
                ฿{it.price} · {it.cat}
              </div>
            </div>
            <button onClick={() => onToggleSold(it.id)} style={{
              padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: it.sold ? M.dangerSoft : M.openSoft,
              color: it.sold ? M.danger : M.open,
              fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              {it.sold ? 'ของหมด' : 'มีของ'}</button>
            <button onClick={() => onEdit(it.id)} style={{
              width: 40, height: 40, borderRadius: 10, border: `1px solid ${M.border}`,
              background: M.card, color: M.text, cursor: 'pointer',
              display: 'grid', placeItems: 'center' }}>
              <MIcon name="edit" size={16}/></button>
          </div>
        ))}
      </div>
      <MBottomNav active="menu" alertCount={alertCount} onNav={onNav}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Menu Item Editor — large form, camera-first photo
// ─────────────────────────────────────────────────────────────
function MItemEditor({ itemId, items, onSave, onDelete, onBack }) {
  const isNew = !itemId;
  const initial = items.find(i => i.id === itemId) ||
    { name: '', price: '', cat: 'จานเดียว', desc: '', sold: false };
  const [form, setForm] = React.useState(initial);
  const [photoSheet, setPhotoSheet] = React.useState(false);
  const [photo, setPhoto] = React.useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ width: '100%', height: '100%', background: M.bg,
      fontFamily: '"IBM Plex Sans Thai", sans-serif', color: M.text,
      display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <MHeader title={isNew ? 'เพิ่มเมนูใหม่' : 'แก้ไขเมนู'} onBack={onBack}/>
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {/* Photo — primary action */}
        <button onClick={() => setPhotoSheet(true)} style={{
          width: '100%', aspectRatio: '4/3', borderRadius: 14,
          background: photo ? `linear-gradient(135deg, ${photo[0]}, ${photo[1]})` : M.card,
          border: photo ? 'none' : `2px dashed ${M.border}`,
          cursor: 'pointer', fontFamily: 'inherit', marginBottom: 16,
          display: 'grid', placeItems: 'center', position: 'relative', overflow: 'hidden' }}>
          {photo ? (
            <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.6)',
              color: '#fff', padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6 }}>
              <MIcon name="cam" size={14} color="#fff"/>เปลี่ยนรูป</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 64, height: 64, borderRadius: 999, background: M.primarySoft,
                color: M.primary, display: 'grid', placeItems: 'center' }}>
                <MIcon name="cam" size={32} stroke={2}/></div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>ถ่ายรูปเมนู</div>
              <div style={{ fontSize: 13, color: M.textSec }}>กดเพื่อเปิดกล้องหรือเลือกรูป</div>
            </div>
          )}
        </button>

        <FormField label="ชื่อเมนู" required>
          <input value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="เช่น ข้าวซอยไก่"
            style={inputStyle()}/>
        </FormField>

        <FormField label="ราคา (บาท)" required>
          <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
            placeholder="0" style={inputStyle()}/>
        </FormField>

        <FormField label="หมวดหมู่" required>
          <select value={form.cat} onChange={e => set('cat', e.target.value)}
            style={inputStyle()}>
            {['จานเดียว','ก๋วยเตี๋ยว','ของทานเล่น','เครื่องดื่ม','ของหวาน'].map(c =>
              <option key={c}>{c}</option>)}
          </select>
        </FormField>

        <FormField label="คำอธิบาย (ไม่บังคับ)">
          <textarea value={form.desc} onChange={e => set('desc', e.target.value)}
            placeholder="เช่น สูตรไทใหญ่ ใส่กะทิหอม"
            rows={3} style={{ ...inputStyle(), height: 80, resize: 'none' }}/>
        </FormField>

        <FormField label="สถานะ">
          <button onClick={() => set('sold', !form.sold)} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderRadius: 10, border: `1px solid ${M.border}`,
            background: M.card, cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 15, color: M.text }}>
            <span>{form.sold ? 'ของหมด — ลูกค้าสั่งไม่ได้' : 'มีของ — เปิดขายอยู่'}</span>
            <div style={{ width: 48, height: 28, borderRadius: 999,
              background: form.sold ? M.borderSoft : M.open, position: 'relative',
              transition: 'background 0.2s' }}>
              <div style={{ position: 'absolute', top: 2, left: form.sold ? 2 : 22,
                width: 24, height: 24, borderRadius: 999, background: '#fff',
                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
            </div>
          </button>
        </FormField>

        {!isNew && (
          <button onClick={onDelete} style={{
            width: '100%', height: 50, borderRadius: 12, marginTop: 8,
            background: 'transparent', color: M.danger, border: `1.5px solid ${M.dangerSoft}`,
            cursor: 'pointer', fontSize: 15, fontWeight: 600, fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <MIcon name="trash" size={16}/>ลบเมนูนี้</button>
        )}
      </div>

      <div style={{ padding: '12px 16px 20px', background: M.bg,
        borderTop: `1px solid ${M.border}` }}>
        <MBigButton color="primary" onClick={() => onSave(form)} height={56}>
          {isNew ? '+ เพิ่มเมนูนี้' : 'บันทึกการเปลี่ยนแปลง'}
        </MBigButton>
      </div>

      {/* Photo source bottom sheet */}
      {photoSheet && (
        <div onClick={() => setPhotoSheet(false)} style={{ position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.45)', zIndex: 90, display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: M.card,
            borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: '12px 16px 24px' }}>
            <div style={{ width: 36, height: 4, borderRadius: 999, background: M.border,
              margin: '0 auto 16px' }}/>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>เพิ่มรูปเมนู</div>
            <button onClick={() => { setPhoto(['#F4D9A8','#E8A05C']); setPhotoSheet(false); }}
              style={sheetBtnStyle()}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: M.primarySoft,
                color: M.primary, display: 'grid', placeItems: 'center' }}>
                <MIcon name="cam" size={22} stroke={2}/></div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>เปิดกล้องถ่ายเดี๋ยวนี้</div>
                <div style={{ fontSize: 12.5, color: M.textSec }}>แนะนำ — รูปอาหารจริง ลูกค้าเชื่อกว่า</div>
              </div>
              <MIcon name="chevR" size={18} color={M.textSec}/>
            </button>
            <button onClick={() => { setPhoto(['#EFE5D2','#C9A572']); setPhotoSheet(false); }}
              style={sheetBtnStyle()}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: M.borderSoft,
                color: M.text, display: 'grid', placeItems: 'center', fontSize: 20 }}>🖼</div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>เลือกจากคลังรูป</div>
                <div style={{ fontSize: 12.5, color: M.textSec }}>รูปที่ถ่ายไว้แล้ว</div>
              </div>
              <MIcon name="chevR" size={18} color={M.textSec}/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: M.text }}>
        {label}{required && <span style={{ color: M.primary }}> *</span>}</div>
      {children}
    </div>
  );
}

function inputStyle() {
  return { width: '100%', padding: '14px 14px', borderRadius: 10,
    border: `1px solid ${M.border}`, fontSize: 16, fontFamily: 'inherit',
    background: M.card, color: M.text, outline: 'none' };
}
function sheetBtnStyle() {
  return { width: '100%', display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 4px', background: 'transparent', border: 'none', cursor: 'pointer',
    fontFamily: 'inherit' };
}

// ─────────────────────────────────────────────────────────────
// Shop Hours Editor
// ─────────────────────────────────────────────────────────────
function MHoursEditor({ hours, onChange, onBack }) {
  const setDay = (idx, patch) => onChange(hours.map((h,i) => i === idx ? { ...h, ...patch } : h));

  return (
    <div style={{ width: '100%', height: '100%', background: M.bg,
      fontFamily: '"IBM Plex Sans Thai", sans-serif', color: M.text,
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <MHeader title="เวลาเปิด-ปิดร้าน" onBack={onBack}/>
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <div style={{ background: M.warningSoft, color: '#7A4F1A', padding: 12,
          borderRadius: 10, fontSize: 13.5, marginBottom: 14, lineHeight: 1.5 }}>
          ⚠️ นี่คือเวลาตามตาราง ถ้าจะปิดวันนี้แบบฉุกเฉิน ใช้ปุ่ม "ปิดร้าน" ที่หน้าหลัก
        </div>

        <div style={{ background: M.card, borderRadius: 12, border: `1px solid ${M.border}`,
          overflow: 'hidden' }}>
          {hours.map((h, idx) => (
            <div key={h.day} style={{ padding: '14px 14px',
              borderTop: idx === 0 ? 'none' : `1px solid ${M.borderSoft}`,
              opacity: h.closed ? 0.5 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 15, fontWeight: 600, width: 70 }}>{h.day}</div>
                {h.closed ? (
                  <div style={{ flex: 1, fontSize: 14, color: M.textSec }}>ปิด</div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input value={h.open} onChange={e => setDay(idx, { open: e.target.value })}
                      style={{ ...inputStyle(), padding: '8px 10px', fontSize: 15, width: 80,
                        textAlign: 'center' }}/>
                    <span style={{ color: M.textSec }}>–</span>
                    <input value={h.close} onChange={e => setDay(idx, { close: e.target.value })}
                      style={{ ...inputStyle(), padding: '8px 10px', fontSize: 15, width: 80,
                        textAlign: 'center' }}/>
                  </div>
                )}
                <button onClick={() => setDay(idx, { closed: !h.closed })} style={{
                  width: 44, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: h.closed ? M.borderSoft : M.open, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 2, left: h.closed ? 2 : 20,
                    width: 22, height: 22, borderRadius: 999, background: '#fff',
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '12px 16px 20px', background: M.bg,
        borderTop: `1px solid ${M.border}` }}>
        <MBigButton color="primary" onClick={onBack}>บันทึก</MBigButton>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Revenue Dashboard + Settlement
// ─────────────────────────────────────────────────────────────
function MRevenue({ onNav, onSettlements, alertCount }) {
  const [period, setPeriod] = React.useState('week');
  const totals = {
    today: { gross: 2840, orders: 28, avg: 101 },
    week: { gross: 16680, orders: 165, avg: 101 },
    month: { gross: 70520, orders: 698, avg: 101 },
  }[period];
  const max = Math.max(...REV_WEEK.map(d => d.gross));

  return (
    <div style={{ width: '100%', height: '100%', background: M.bg,
      fontFamily: '"IBM Plex Sans Thai", sans-serif', color: M.text,
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <MHeader title="รายได้"/>
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {/* Period tabs */}
        <div style={{ display: 'flex', gap: 4, background: M.card, padding: 4,
          borderRadius: 10, border: `1px solid ${M.border}`, marginBottom: 14 }}>
          {[['today','วันนี้'],['week','7 วัน'],['month','30 วัน']].map(([id,l]) => (
            <button key={id} onClick={() => setPeriod(id)} style={{
              flex: 1, height: 40, borderRadius: 7, border: 'none', cursor: 'pointer',
              background: period === id ? M.text : 'transparent',
              color: period === id ? '#fff' : M.text,
              fontSize: 14, fontWeight: 600, fontFamily: 'inherit' }}>{l}</button>
          ))}
        </div>

        {/* Big number */}
        <div style={{ background: M.card, borderRadius: 14, border: `1px solid ${M.border}`,
          padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: M.textSec, marginBottom: 4 }}>ยอดขายรวม</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: M.primary,
            fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
            ฿{totals.gross.toLocaleString('th-TH')}</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 12,
            borderTop: `1px solid ${M.borderSoft}`, fontSize: 13 }}>
            <div>
              <div style={{ color: M.textSec, marginBottom: 2 }}>ออเดอร์</div>
              <div style={{ fontSize: 16, fontWeight: 600,
                fontVariantNumeric: 'tabular-nums' }}>{totals.orders}</div>
            </div>
            <div>
              <div style={{ color: M.textSec, marginBottom: 2 }}>เฉลี่ย/ออเดอร์</div>
              <div style={{ fontSize: 16, fontWeight: 600,
                fontVariantNumeric: 'tabular-nums' }}>฿{totals.avg}</div>
            </div>
          </div>
        </div>

        {/* Chart */}
        {period === 'week' && (
          <div style={{ background: M.card, borderRadius: 14, border: `1px solid ${M.border}`,
            padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>รายได้ 7 วันที่ผ่านมา</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
              height: 140, gap: 6 }}>
              {REV_WEEK.map((d, idx) => {
                const h = max > 0 ? (d.gross / max) * 100 : 0;
                const isToday = idx === REV_WEEK.length - 1;
                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 10.5, color: M.textSec,
                      fontVariantNumeric: 'tabular-nums', fontWeight: 500,
                      visibility: d.gross > 0 ? 'visible' : 'hidden' }}>
                      {(d.gross/1000).toFixed(1)}k</div>
                    <div style={{ width: '100%', flex: 1, display: 'flex',
                      flexDirection: 'column', justifyContent: 'flex-end' }}>
                      <div style={{ width: '100%', height: `${h}%`, minHeight: d.gross>0?6:0,
                        background: isToday ? M.primary : M.openSoft,
                        borderRadius: '4px 4px 0 0',
                        border: isToday ? 'none' : `1.5px solid ${M.open}` }}/>
                    </div>
                    <div style={{ fontSize: 12, color: isToday ? M.primary : M.textSec,
                      fontWeight: isToday ? 600 : 500 }}>{d.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top items */}
        <div style={{ background: M.card, borderRadius: 14, border: `1px solid ${M.border}`,
          padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>เมนูขายดี</div>
          {[
            { name: 'ข้าวซอยไก่', qty: 48, total: 3120 },
            { name: 'ก๋วยเตี๋ยวเนื้อตุ๋น', qty: 36, total: 1620 },
            { name: 'ลูกชิ้นทอด', qty: 28, total: 700 },
          ].map((m, i) => (
            <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 12,
              padding: '8px 0', borderTop: i === 0 ? 'none' : `1px solid ${M.borderSoft}` }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: M.primarySoft,
                color: M.primary, display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700 }}>
                {i+1}</div>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{m.name}</div>
              <div style={{ fontSize: 13, color: M.textSec }}>{m.qty} ขาย</div>
              <div style={{ fontSize: 14, fontWeight: 600,
                fontVariantNumeric: 'tabular-nums' }}>฿{m.total.toLocaleString('th-TH')}</div>
            </div>
          ))}
        </div>

        {/* Settlement link */}
        <button onClick={onSettlements} style={{
          width: '100%', background: M.card, borderRadius: 12, border: `1px solid ${M.border}`,
          padding: 14, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: M.openSoft,
            color: M.open, display: 'grid', placeItems: 'center', fontSize: 18 }}>💰</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>ประวัติการโอนเงิน</div>
            <div style={{ fontSize: 12.5, color: M.textSec, marginTop: 1 }}>
              โอนล่าสุด ฿16,578 · 28 เม.ย.</div>
          </div>
          <MIcon name="chevR" size={18} color={M.textSec}/>
        </button>
      </div>
      <MBottomNav active="revenue" alertCount={alertCount} onNav={onNav}/>
    </div>
  );
}

// Settlement history
function MSettlements({ onBack }) {
  return (
    <div style={{ width: '100%', height: '100%', background: M.bg,
      fontFamily: '"IBM Plex Sans Thai", sans-serif', color: M.text,
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <MHeader title="ประวัติการโอนเงิน" onBack={onBack}/>
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <div style={{ background: M.openSoft, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 12.5, color: M.open, marginBottom: 4, fontWeight: 600 }}>
            ครั้งต่อไป</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: M.open,
            fontVariantNumeric: 'tabular-nums' }}>
            ฿14,840</div>
          <div style={{ fontSize: 13, color: M.textSec, marginTop: 4 }}>
            จะโอนวันที่ 5 พ.ค. 2569 · ธ.กรุงเทพ ***1234
          </div>
        </div>

        <div style={{ fontSize: 13, color: M.textSec, fontWeight: 500,
          marginBottom: 8, paddingLeft: 4 }}>โอนแล้ว</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SETTLEMENTS.map(s => (
            <div key={s.id} style={{ background: M.card, borderRadius: 12,
              border: `1px solid ${M.border}`, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{s.period}</div>
                  <div style={{ fontSize: 12, color: M.textSec, marginTop: 2 }}>
                    โอนเมื่อ {s.paidOn}</div>
                </div>
                <span style={{ background: M.openSoft, color: M.open, fontSize: 11.5,
                  fontWeight: 600, padding: '4px 8px', borderRadius: 6 }}>โอนแล้ว</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                fontSize: 13, padding: '4px 0' }}>
                <span style={{ color: M.textSec }}>ยอดขาย</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                  ฿{s.gross.toLocaleString('th-TH')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                fontSize: 13, padding: '4px 0' }}>
                <span style={{ color: M.textSec }}>ค่าธรรมเนียม (10%)</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', color: M.danger }}>
                  −฿{s.fee.toLocaleString('th-TH')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                fontSize: 15, fontWeight: 700, padding: '8px 0 0',
                borderTop: `1px solid ${M.borderSoft}`, marginTop: 4 }}>
                <span>โอนเข้าบัญชี</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', color: M.open }}>
                  ฿{s.net.toLocaleString('th-TH')}</span>
              </div>
              <button style={{ width: '100%', height: 40, marginTop: 10, borderRadius: 8,
                background: 'transparent', color: M.text, border: `1px solid ${M.border}`,
                cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'inherit' }}>
                ดาวน์โหลดใบกำกับภาษี (PDF)
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Profile (simple, links to other things)
// ─────────────────────────────────────────────────────────────
function MProfile({ onNav, onHours, alertCount }) {
  const sections = [
    { title: 'ร้านของฉัน', items: [
      { icon: '🏪', label: 'ข้อมูลร้าน', sub: 'ก๋วยเตี๋ยวป้าหล้า' },
      { icon: '🕐', label: 'เวลาเปิด-ปิด', sub: 'จ.–พฤ. 8:00–17:00', onClick: onHours },
      { icon: '🏦', label: 'บัญชีรับเงิน', sub: 'ธ.กรุงเทพ ***1234' },
      { icon: '📍', label: 'ที่อยู่ร้าน', sub: 'ม.1 ต.เทอดไทย' },
    ]},
    { title: 'ความช่วยเหลือ', items: [
      { icon: '❓', label: 'คำถามที่พบบ่อย', sub: '' },
      { icon: '💬', label: 'ติดต่อแอดมิน', sub: 'LINE @thoetthai-merchant' },
      { icon: '📜', label: 'ข้อกำหนดและเงื่อนไข', sub: '' },
    ]},
    { title: '', items: [
      { icon: '🚪', label: 'ออกจากระบบ', sub: '', danger: true },
    ]},
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: M.bg,
      fontFamily: '"IBM Plex Sans Thai", sans-serif', color: M.text,
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <MHeader title="ฉัน"/>
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <div style={{ background: M.card, borderRadius: 14, border: `1px solid ${M.border}`,
          padding: 16, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 999, background: M.primarySoft,
            color: M.primary, display: 'grid', placeItems: 'center',
            fontSize: 22, fontWeight: 700 }}>ป</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 600 }}>ก๋วยเตี๋ยวป้าหล้า</div>
            <div style={{ fontSize: 13, color: M.textSec, marginTop: 2 }}>
              ⭐ 4.8 · 142 รีวิว</div>
          </div>
        </div>
        {sections.map((sec, sidx) => (
          <div key={sidx} style={{ marginBottom: 16 }}>
            {sec.title && <div style={{ fontSize: 11.5, color: M.textSec, fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              marginBottom: 6, paddingLeft: 4 }}>{sec.title}</div>}
            <div style={{ background: M.card, borderRadius: 12, border: `1px solid ${M.border}`,
              overflow: 'hidden' }}>
              {sec.items.map((it, idx) => (
                <button key={it.label} onClick={it.onClick} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '16px 14px', background: 'transparent', border: 'none', cursor: 'pointer',
                  borderTop: idx === 0 ? 'none' : `1px solid ${M.borderSoft}`,
                  fontFamily: 'inherit', textAlign: 'left',
                  color: it.danger ? M.danger : M.text }}>
                  <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{it.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{it.label}</div>
                    {it.sub && <div style={{ fontSize: 12.5, color: M.textSec, marginTop: 2 }}>
                      {it.sub}</div>}
                  </div>
                  {!it.danger && <MIcon name="chevR" size={18} color={M.textSec}/>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <MBottomNav active="me" alertCount={alertCount} onNav={onNav}/>
    </div>
  );
}

Object.assign(window, { MMenuList, MItemEditor, MHoursEditor, MRevenue, MSettlements, MProfile });
