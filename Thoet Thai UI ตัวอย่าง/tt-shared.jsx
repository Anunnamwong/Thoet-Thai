// Shared design tokens, data, and atoms for Thoet Thai customer app

const TT_COLORS = {
  primary: '#E85D2E',
  primaryDark: '#C84A1F',
  primarySoft: '#FCEBE3',
  secondary: '#2D6A4F',
  secondarySoft: '#E0EBE5',
  bg: '#FAFAF7',
  card: '#FFFFFF',
  text: '#1A1A17',
  textSec: '#6B6B66',
  textTer: '#9A9A92',
  border: '#E5E5E0',
  borderSoft: '#F0F0EC',
  warning: '#E89B3C',
  danger: '#C73E3A',
  info: '#3A6FC7',
};

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

const CAT_MAP = {
  noodle: ['ก๋วยเตี๋ยว'], rice: ['ข้าว', 'ส้มตำ'],
  yunnan: ['ยูนนาน'], shan: ['ไทใหญ่'],
  drink: ['เครื่องดื่ม'], sweet: ['ของหวาน'], grocery: ['ของชำ'],
};

const SHOPS = [
  { id: 1, name: 'ก๋วยเตี๋ยวป้าหล้า', sub: 'ข้าวซอย • ก๋วยเตี๋ยวเนื้อ',
    tags: ['ก๋วยเตี๋ยว', 'ไทใหญ่'], rating: 4.8, reviews: 142,
    distance: '0.4 กม.', eta: '15–20 นาที', fee: 15, open: true,
    promo: 'ส่งฟรีเมื่อสั่งครบ ฿120', swatch: ['#F4D9A8', '#E8A05C', '#A65A2C'],
    badge: 'ขายดี' },
  { id: 2, name: 'หมั่นโถวอาแป๊ะ', sub: 'หมั่นโถว • ขาหมูยูนนาน • ชาผู่เอ๋อ',
    tags: ['ยูนนาน', 'ของหวาน'], rating: 4.9, reviews: 87,
    distance: '0.7 กม.', eta: '20–25 นาที', fee: 20, open: true,
    promo: null, swatch: ['#EFE5D2', '#C9A572', '#7A4F2A'], badge: 'ใหม่' },
  { id: 3, name: 'ข้าวมันไก่เจ๊หมวย', sub: 'ข้าวมันไก่ • ข้าวหมูแดง',
    tags: ['ข้าว'], rating: 4.6, reviews: 213,
    distance: '0.9 กม.', eta: '20–30 นาที', fee: 20, open: true,
    promo: 'ลด ฿10 สำหรับลูกค้าใหม่', swatch: ['#F2EAD6', '#D9B26A', '#8C6A2C'],
    badge: null },
  { id: 4, name: 'ส้มตำลุงคำ', sub: 'ส้มตำ • ไก่ย่าง • ลาบ',
    tags: ['ข้าว', 'ส้มตำ'], rating: 4.7, reviews: 168,
    distance: '1.2 กม.', eta: '25–35 นาที', fee: 25, open: true,
    promo: null, swatch: ['#E8DEB7', '#B8943C', '#5C4214'], badge: null },
  { id: 5, name: 'ชาไข่มุกพี่นก', sub: 'ชานม • ชาเขียว • โกโก้',
    tags: ['เครื่องดื่ม'], rating: 4.5, reviews: 92,
    distance: '0.3 กม.', eta: '10–15 นาที', fee: 15, open: false,
    openAt: '14:00', promo: null, swatch: ['#F5E6D8', '#D4A07A', '#6B4226'],
    badge: null },
  { id: 6, name: 'ร้านชำป้าศรี', sub: 'ของกินของใช้ในครัว',
    tags: ['ของชำ'], rating: 4.4, reviews: 56,
    distance: '0.5 กม.', eta: '15–25 นาที', fee: 20, open: true,
    promo: null, swatch: ['#E5E0D2', '#A89878', '#5C5142'], badge: null },
];

// Menu data per shop (shop 1 = featured for shop detail)
const MENU = {
  1: {
    sections: [
      { name: 'ขายดี', items: [
        { id: 101, name: 'ข้าวซอยไก่', desc: 'น้ำเข้มข้น เนื้อไก่นุ่ม โรยหอมเจียว', price: 65, hot: true },
        { id: 102, name: 'ก๋วยเตี๋ยวเนื้อตุ๋น', desc: 'น้ำซุปเคี่ยว 6 ชั่วโมง เนื้อตุ๋นจนเปื่อย', price: 70, hot: true },
      ]},
      { name: 'เส้น', items: [
        { id: 103, name: 'ก๋วยเตี๋ยวลูกชิ้น', desc: 'ลูกชิ้นเนื้อทำเอง เส้นเล็ก/ใหญ่', price: 50 },
        { id: 104, name: 'บะหมี่หมูแดง', desc: 'หมูแดงหวานนุ่ม น้ำซุปกระดูกหมู', price: 55 },
        { id: 105, name: 'ข้าวซอยเนื้อ', desc: 'เนื้อตุ๋นนุ่ม น้ำกะทิเข้มข้น', price: 70, soldOut: true },
      ]},
      { name: 'ข้าว', items: [
        { id: 106, name: 'ข้าวขาหมู', desc: 'ขาหมูตุ๋นซีอิ๊ว ผักดอง ไข่ต้ม', price: 60 },
        { id: 107, name: 'ข้าวคลุกกะปิ', desc: 'หมูหวาน ไข่ฝอย กุ้งแห้ง', price: 55 },
      ]},
      { name: 'เพิ่มเติม', items: [
        { id: 108, name: 'ไข่ลวก 2 ฟอง', desc: '', price: 15 },
        { id: 109, name: 'ปาท่องโก๋', desc: 'ทอดสด ๆ', price: 20 },
      ]},
    ],
  },
};

// ─────────────────────────────────────────────────────────────
// Icon
// ─────────────────────────────────────────────────────────────
function Icon({ name, size = 20, color = 'currentColor', stroke = 1.75 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'search': return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case 'pin':    return <svg {...p}><path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></svg>;
    case 'chev':   return <svg {...p}><path d="m6 9 6 6 6-6"/></svg>;
    case 'chevR':  return <svg {...p}><path d="m9 6 6 6-6 6"/></svg>;
    case 'chevL':  return <svg {...p}><path d="m15 6-6 6 6 6"/></svg>;
    case 'star':   return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 2.5l2.95 6.18 6.8.78-5.05 4.65 1.4 6.69L12 17.5l-6.1 3.3 1.4-6.69L2.25 9.46l6.8-.78L12 2.5z"/></svg>;
    case 'bag':    return <svg {...p}><path d="M5 7h14l-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7Z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>;
    case 'bell':   return <svg {...p}><path d="M6 8a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7Z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>;
    case 'home':   return <svg {...p}><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/></svg>;
    case 'orders': return <svg {...p}><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>;
    case 'user':   return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
    case 'sliders':return <svg {...p}><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>;
    case 'clock':  return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'bike':   return <svg {...p}><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17 10 8h4l3 9M14 8h3l1 3"/></svg>;
    case 'x':      return <svg {...p}><path d="m6 6 12 12M18 6 6 18"/></svg>;
    case 'plus':   return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>;
    case 'minus':  return <svg {...p}><path d="M5 12h14"/></svg>;
    case 'heart':  return <svg {...p}><path d="M12 21s-7-4.5-9.5-9.5C0 7 4 3 7.5 5 9 5.8 11 7 12 8.5 13 7 15 5.8 16.5 5 20 3 24 7 21.5 11.5 19 16.5 12 21 12 21Z"/></svg>;
    case 'check':  return <svg {...p}><path d="m5 12 5 5L20 7"/></svg>;
    case 'flame':  return <svg {...p}><path d="M12 21c-4 0-7-3-7-7 0-3 3-5 4-8 1 2 3 3 3 5 1-1 2-2 2-4 3 2 5 5 5 8s-3 6-7 6Z"/></svg>;
    case 'map':    return <svg {...p}><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg>;
    case 'tag':    return <svg {...p}><path d="M12 2H4v8l10 10 8-8L12 2Z"/><circle cx="7.5" cy="6.5" r="1.5" fill="currentColor"/></svg>;
    default: return null;
  }
}

Object.assign(window, { TT_COLORS, CATEGORIES, CAT_MAP, SHOPS, MENU, Icon });
