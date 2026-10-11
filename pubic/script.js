/* ==========================================
   404 NOT FOUND - XẾP ĐỘI HÌNH BANG CHIẾN
   ========================================== */

// 1. Danh sách phái và thành viên (dữ liệu dùng chung).
// Quản lý ở nút "Thành Viên" - dữ liệu được lưu trong trình duyệt.
// Các tên dưới đây chỉ là thành viên ảo để test, nạp vào lần đầu mở trang.
const DANH_SACH_MAU = {
    "Cửu Linh": ["Lạc Tử Y", "Bạch Vân Hi", "Minh Nguyệt", "Hồ Ly Nhỏ", "Tiểu Cửu"],
    "Toái Mộng": ["Mộng Hoa", "Lam Vũ", "Tịch Dao", "Dạ Anh", "Phong Linh"],
    "Huyết Hà": ["Huyết Long", "Kiếm Ma", "Sát Thần", "Hắc Phong", "Đại Ca"],
    "Long Ngâm": ["Long Vũ", "Thiên Âm", "Trường Phong", "Tiếu Ngạo", "Bạch Long"],
    "Thiết Y": ["Thiết Sơn", "Cương Đao", "Hổ Báo", "Quân Hầu", "Thạch Đầu"],
    "Thần Tương": ["Thần Toán", "Diệu Thủ", "Khuyết Nguyệt", "Tương Tư", "Vân Cơ"],
    "Tố Vấn": ["Dược Vương", "Thanh Liên", "Hạ Y", "Tuyết Mai", "Ngọc Hoa"]
};

const PHAI = Object.keys(DANH_SACH_MAU);

// Màu của từng phái (nền, chữ). Dùng chung cho cửa sổ Thành Viên, bảng chọn và ô đội hình.
const MAU_PHAI = {
    "Long Ngâm":  { nen: "#b8d8aa", chu: "#2f3b2a", lop: "p-longngam"  },  // xanh lá
    "Cửu Linh":   { nen: "#b9addb", chu: "#332d3b", lop: "p-cuulinh"   },  // tím
    "Tố Vấn":     { nen: "#f8c8ec", chu: "#4a2f45", lop: "p-tovan"     },  // hồng
    "Toái Mộng":  { nen: "#b9e0f7", chu: "#27384a", lop: "p-toaimong"  },  // xanh dương nhạt
    "Thần Tương": { nen: "#4f78cf", chu: "#ffffff", lop: "p-thantuong" },  // xanh dương đậm
    "Thiết Y":    { nen: "#ffe39a", chu: "#4a3d12", lop: "p-thiety"    },  // vàng
    "Huyết Hà":   { nen: "#ee9a9e", chu: "#4a1f23", lop: "p-huyetha"   }   // đỏ
};
const LOP_MAU_CU = ["purple", "yellow", "red", "blue", "green", "pink"];

function datMau(el, phai) {
    const m = MAU_PHAI[phai];
    if (!m) return;
    el.style.setProperty("--mau", m.nen);
    el.style.setProperty("--chu", m.chu);
}

// Chuẩn hóa tên để so khớp: bỏ khoảng trắng, không phân biệt hoa thường
function chuanHoa(t) {
    return String(t).normalize("NFC").toLowerCase().replace(/\s+/g, "");
}

// Tên (có khoảng trắng) đang có sẵn trong bảng đội hình, dùng để khôi phục khoảng trắng khi nhập
const DANH_BANG = {};

function lamSachTen(t) {
    return t
        .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, "")
        .replace(/[-–_.\s]+$/g, "")
        .trim();
}

// Đọc văn bản copy từ trang sự kiện Raid-Helper
function docRaidHelper(text) {
    const chuanPhai = {};
    PHAI.forEach(p => { chuanPhai[chuanHoa(p)] = p; });

    const kq = {};
    PHAI.forEach(p => { kq[p] = []; });
    let hienTai = null;
    let boQua = 0;

    text.split(/\r?\n/).map(l => l.trim()).filter(Boolean).forEach(dong => {
        const h = dong.match(/^(.+?)\s*\(?\d+\)?$/);
        if (h) {
            const k = chuanHoa(h[1]);
            if (chuanPhai[k]) { hienTai = chuanPhai[k]; return; }
            if (k === "tentative") { hienTai = "__tentative"; return; }
        }
        if (/^\d+$/.test(dong)) return;                  // số thứ tự

        const dongTen = hienTai === "__tentative" ? dong.replace(/^\d+/, "") : dong;
        const ten = lamSachTen(dongTen);
        if (!ten || !hienTai) return;
        if (hienTai === "__tentative") { boQua++; return; }
        kq[hienTai].push(ten);
    });
    return { kq, boQua };
}

function timPhai(ten) {
    return PHAI.find(p => DANH_SACH[p].includes(ten));
}

// Tô màu ô đội hình theo phái của người được xếp
function tomauO(o, ten) {
    LOP_MAU_CU.concat(PHAI.map(p => MAU_PHAI[p].lop)).forEach(c => o.classList.remove(c));
    if (!ten) return;
    const phai = timPhai(ten);
    if (phai) o.classList.add(MAU_PHAI[phai].lop);
}
const KEY_TV = "404_bang_chien_members";
const KEY = "404_bang_chien_slots";
const KEY_TIEUDE = "404_bang_chien_titles";

// ---------- Kết nối Supabase (dữ liệu dùng chung cho mọi máy) ----------
const SUPABASE_URL = "https://xrhauinnqmmynfftmdqb.supabase.co";
// Dán khóa CÔNG KHAI (publishable key: sb_publishable_... hoặc anon key: eyJ...) vào giữa hai dấu ngoặc kép.
// KHÔNG dán khóa secret / service_role.
const SUPABASE_KEY = "sb_publishable_gyB2BGSSgGSYxaM4gzr8WQ_9nAfg6w3";
const CO_MAY_CHU = /^(sb_publishable_|eyJ)/.test(SUPABASE_KEY);
const KEY_SESSION = "404_bang_chien_session";

let phien = null;
try { phien = JSON.parse(localStorage.getItem(KEY_SESSION) || "null"); } catch (e) { phien = null; }

function luuPhien(p) {
    phien = p;
    try {
        if (p) localStorage.setItem(KEY_SESSION, JSON.stringify(p));
        else localStorage.removeItem(KEY_SESSION);
    } catch (e) { /* bỏ qua */ }
}

function laAdmin() {
    return !!(phien && phien.access_token);
}

async function dangNhap(email, matKhau) {
    let res;
    try {
        res = await fetch(SUPABASE_URL + "/auth/v1/token?grant_type=password", {
            method: "POST",
            headers: { "apikey": SUPABASE_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({ email, password: matKhau })
        });
    } catch (e) {
        throw new Error("Không kết nối được máy chủ. Kiểm tra mạng và thử lại.");
    }
    const d = await res.json().catch(() => ({}));
    if (!res.ok || !d.access_token) {
        throw new Error(res.status === 400 ? "Sai email hoặc mật khẩu." : "Đăng nhập thất bại (mã " + res.status + ").");
    }
    luuPhien({
        access_token: d.access_token,
        refresh_token: d.refresh_token,
        het_han: Date.now() + (d.expires_in || 3600) * 1000,
        email: (d.user && d.user.email) || email
    });
}

// Lấy token còn hạn (tự làm mới khi sắp hết hạn)
async function layToken() {
    if (!phien) return null;
    if (Date.now() < phien.het_han - 60000) return phien.access_token;
    try {
        const res = await fetch(SUPABASE_URL + "/auth/v1/token?grant_type=refresh_token", {
            method: "POST",
            headers: { "apikey": SUPABASE_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: phien.refresh_token })
        });
        const d = await res.json().catch(() => ({}));
        if (!res.ok || !d.access_token) throw new Error("het phien");
        luuPhien({
            access_token: d.access_token,
            refresh_token: d.refresh_token,
            het_han: Date.now() + (d.expires_in || 3600) * 1000,
            email: phien.email
        });
        return phien.access_token;
    } catch (e) {
        luuPhien(null);
        apDungQuyen();
        trangThai("Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.", true);
        return null;
    }
}

function trangThai(chu, loi) {
    let el = document.getElementById("sync-status");
    if (!el) {
        const hint = document.querySelector(".hint");
        if (!hint) return;
        el = document.createElement("span");
        el.id = "sync-status";
        el.className = "hint";
        el.setAttribute("role", "status");
        hint.after(el);
    }
    el.textContent = chu;
    el.style.color = loi ? "#c0334f" : "";
}

async function sbLayTatCa() {
    const res = await fetch(SUPABASE_URL + "/rest/v1/kv?select=key,value", {
        headers: { "apikey": SUPABASE_KEY },
        cache: "no-store"
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
}

async function sbDay(key, value) {
    const token = await layToken();
    if (!token) return false;
    const res = await fetch(SUPABASE_URL + "/rest/v1/kv?on_conflict=key", {
        method: "POST",
        headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal"
        },
        body: JSON.stringify({ key, value, updated_at: new Date().toISOString() })
    });
    if (res.status === 401 || res.status === 403) {
        luuPhien(null);
        apDungQuyen();
        trangThai("Không có quyền lưu. Hãy đăng nhập bằng đúng tài khoản quản trị.", true);
        return false;
    }
    return res.ok;
}

const lastRemote = {};
const hen = {};

// Đẩy dữ liệu lên máy chủ (gộp nhiều thao tác liên tiếp thành một lần lưu)
function dayLen(key, lay) {
    if (!CO_MAY_CHU || !laAdmin()) return;
    clearTimeout(hen[key]);
    trangThai("Đang lưu…");
    hen[key] = setTimeout(async () => {
        try {
            const gt = JSON.parse(JSON.stringify(lay()));
            const ok = await sbDay(key, gt);
            if (ok) {
                lastRemote[key] = JSON.stringify(gt);
                trangThai("Đã lưu lên máy chủ ✓");
            } else if (laAdmin()) {
                trangThai("Lưu thất bại. Dữ liệu vẫn còn trên máy này.", true);
            }
        } catch (e) {
            trangThai("Không kết nối được máy chủ. Dữ liệu vẫn còn trên máy này.", true);
        }
    }, 500);
}

function napDanhSach() {
    try {
        const raw = JSON.parse(localStorage.getItem(KEY_TV) || "null");
        if (raw && typeof raw === "object") {
            const kq = {};
            PHAI.forEach(p => {
                kq[p] = Array.isArray(raw[p]) ? raw[p].map(String) : [];
            });
            return kq;
        }
    } catch (e) { /* dữ liệu hỏng -> dùng danh sách mẫu */ }
    return JSON.parse(JSON.stringify(DANH_SACH_MAU));
}

function luuDanhSach() {
    localStorage.setItem(KEY_TV, JSON.stringify(DANH_SACH));
    dayLen("members", () => DANH_SACH);
}

const DANH_SACH = napDanhSach();
let duLieu = JSON.parse(localStorage.getItem(KEY) || "{}");
let luuTieuDe = {};
try { luuTieuDe = JSON.parse(localStorage.getItem(KEY_TIEUDE) || "{}") || {}; } catch (e) { luuTieuDe = {}; }

// 2. Giao diện (CSS cho các cửa sổ)
function themGiaoDien() {
    if (document.getElementById("chon-phai-style")) return;

    const style = document.createElement("style");
    style.id = "chon-phai-style";
    style.textContent = `
        .chon-phai-nen {
            position: fixed;
            inset: 0;
            z-index: 99999;
            background: #24172599;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 15px;
        }
        .chon-phai-hop {
            width: 460px;
            max-width: 100%;
            max-height: 85vh;
            overflow-y: auto;
            padding: 22px;
            background: #fffafd;
            border: 1px solid #f4c7d9;
            border-radius: 18px;
            box-shadow: 0 15px 50px #0003;
            font-family: "Be Vietnam Pro", "Segoe UI", sans-serif;
            color: #463444;
        }
        .chon-phai-hop h2 { margin: 0 0 8px; color: #d94f83; font-size: 21px; }
        .chon-phai-mo-ta { margin: 0 0 18px; color: #8b8191; font-size: 13px; }
        .chon-phai-luoi { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
        .chon-phai-nut {
            padding: 12px 9px;
            border: 1px solid #f0c9d9;
            border-radius: 10px;
            background: #fff0f5;
            color: #b83e70;
            font-weight: 600;
            cursor: pointer;
        }
        .chon-phai-nut:hover { background: #f8c5d9; }
        .chon-phai-nut.active { background: #e85b83; color: white; }
        .chon-phai-ketqua { margin-top: 20px; padding-top: 15px; border-top: 1px solid #f0dfe8; }
        .chon-phai-ketqua h3 { font-size: 15px; margin: 0 0 12px; }
        .chon-phai-nguoi { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .chon-phai-ten {
            padding: 11px;
            border: 1px solid #ead8e2;
            border-radius: 9px;
            background: white;
            text-align: left;
            cursor: pointer;
            color: #493849;
        }
        .chon-phai-ten:hover { background: #ffe6f0; border-color: #e85b83; }
        .chon-phai-rong {
            grid-column: 1 / -1;
            padding: 12px;
            background: #f8f3f7;
            border-radius: 9px;
            color: #8b8191;
            font-size: 13px;
        }
        .chon-phai-dong { display: flex; justify-content: flex-end; margin-top: 18px; }
        .chon-phai-dong button {
            border: 0;
            padding: 10px 18px;
            border-radius: 9px;
            background: #e85b83;
            color: white;
            cursor: pointer;
        }

        .chon-phai-loi { margin: 12px 0 0; padding: 9px 12px; border-radius: 9px; background: #ffe9ec; border: 1px solid #f3b5bf; color: #b3263f; font-size: 13px; }
        .chon-phai-loi:empty { display: none; }
        .chon-phai-ten.da-xep { opacity: .55; }
        .chon-phai-ten.da-xep::after { content: " · đã xếp"; font-size: 11px; }

        .formation h2.tieu-de-sua { cursor: text; outline: none; }
        .formation h2.tieu-de-sua:hover { background: #fff0f6; }
        .formation h2.tieu-de-sua:focus { box-shadow: inset 0 0 0 2px #e85b83; background: #fff7fb; }
        @media print { .formation h2.tieu-de-sua:hover, .formation h2.tieu-de-sua:focus { background: transparent; box-shadow: none; } }

        .xoa-nhom { display: grid; gap: 9px; }
        .chon-phai-nut.xoa-nguy-hiem { background: #ffe9ec; color: #b3263f; border-color: #f3b5bf; }
        .chon-phai-nut.xoa-nguy-hiem:hover { background: #f9ccd3; }
        [hidden] { display: none !important; }
        .toolbar .toolbar-actions { margin-left: auto; display: flex; gap: 8px; flex-wrap: wrap; }
        .toolbar .toolbar-actions button { margin-left: 0; }
        @media (max-width: 900px) { .toolbar .toolbar-actions { margin-left: 0; } }
        #btn-clear { background: #fff; color: #b3263f; border: 1px solid #f3b5bf; box-shadow: none; }
        #btn-clear:hover { background: #ffe9ec; }
        #btn-logout { background: #fff; color: #b83e70; border: 1px solid #f0c9d9; box-shadow: none; }
        #btn-logout:hover { background: #fff0f5; }
        @media print { .toolbar-actions { display: none; } }
        .dn-hop { width: 380px; }
        .dn-form { display: grid; gap: 12px; }
        .dn-truong { display: grid; gap: 4px; font-size: 13px; font-weight: 600; }
        .dn-truong input { padding: 10px 12px; border: 1px solid #ead8e2; border-radius: 8px; font: inherit; font-weight: 400; }
        .dn-truong input:focus { outline: 2px solid #e85b83; outline-offset: -1px; }
        .chon-phai-dong .dn-huy { background: #fff0f5; color: #b83e70; border: 1px solid #f0c9d9; margin-right: 8px; }
        body.che-do-xem #war-date { cursor: default; }

        /* --- Màu phái --- */
        .chon-phai-nut[style*="--mau"] { background: var(--mau); color: var(--chu); border-color: transparent; }
        .chon-phai-nut[style*="--mau"]:hover { filter: brightness(.95); }
        .chon-phai-nut[style*="--mau"].active { outline: 3px solid #463444; outline-offset: 1px; }
        .chon-phai-ten[style*="--mau"] { background: var(--mau); color: var(--chu); border-color: transparent; }
        .chon-phai-ten[style*="--mau"]:hover { filter: brightness(.94); }
        td.p-longngam, td.p-cuulinh, td.p-tovan, td.p-toaimong, td.p-thantuong, td.p-thiety, td.p-huyetha { color: var(--chu-o); }
        td.p-longngam  { background: #b8d8aa; --chu-o: #2f3b2a; }
        td.p-cuulinh   { background: #b9addb; --chu-o: #332d3b; }
        td.p-tovan     { background: #f8c8ec; --chu-o: #4a2f45; }
        td.p-toaimong  { background: #b9e0f7; --chu-o: #27384a; }
        td.p-thantuong { background: #4f78cf; --chu-o: #ffffff; }
        td.p-thiety    { background: #ffe39a; --chu-o: #4a3d12; }
        td.p-huyetha   { background: #ee9a9e; --chu-o: #4a1f23; }

        /* --- Cửa sổ Thành Viên --- */
        .tv-hop { width: 920px; }
        .tv-dau { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
        .tv-tong { color: #8b8191; font-size: 13px; white-space: nowrap; }
        .tv-luoi { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
        .tv-phai { border: 2px solid var(--mau, #f0dfe8); border-radius: 12px; background: white; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
        .tv-phai-ten { display: flex; justify-content: space-between; align-items: center; margin: -12px -12px 0; padding: 9px 12px; border-radius: 10px 10px 0 0; background: var(--mau, #ffe2f2); color: var(--chu, #b83e70); font-size: 14px; }
        .tv-dem { min-width: 24px; padding: 2px 8px; border-radius: 999px; background: #ffffffaa; color: #332d3b; font-size: 12px; text-align: center; }
        .tv-ds { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; min-height: 30px; }
        .tv-the { display: inline-flex; align-items: center; gap: 4px; padding: 4px 4px 4px 10px; border-radius: 999px; background: var(--mau, #fff0f5); color: var(--chu, #463444); border: 1px solid #0002; font-size: 13px; }
        .tv-xoa { border: 0; width: 20px; height: 20px; border-radius: 50%; background: transparent; color: inherit; cursor: pointer; font-size: 14px; line-height: 1; padding: 0; }
        .tv-xoa:hover { background: #0003; }
        .tv-rong { color: #8b8191; font-size: 12px; font-style: italic; }
        .tv-them { display: flex; gap: 6px; margin-top: auto; }
        .tv-them input { flex: 1; min-width: 0; padding: 8px 10px; border: 1px solid #ead8e2; border-radius: 8px; font: inherit; font-size: 13px; }
        .tv-them input:focus { outline: 2px solid #e85b83; outline-offset: -1px; }
        .tv-them button { border: 0; padding: 8px 12px; border-radius: 8px; background: #e85b83; color: white; cursor: pointer; font-size: 13px; }
        .tv-nhap { margin: 0 0 14px; border: 1px dashed #e9b5cb; border-radius: 12px; background: #fff7fb; padding: 10px 12px; }
        .tv-nhap summary { cursor: pointer; font-size: 13px; font-weight: 600; color: #b83e70; }
        .tv-nhap textarea { width: 100%; min-height: 130px; margin-top: 10px; padding: 10px; border: 1px solid #ead8e2; border-radius: 8px; font: inherit; font-size: 13px; resize: vertical; }
        .tv-nhap textarea:focus { outline: 2px solid #e85b83; outline-offset: -1px; }
        .tv-nhap-hang { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-top: 8px; font-size: 13px; }
        .tv-nhap-hang button { border: 0; padding: 8px 14px; border-radius: 8px; background: #e85b83; color: white; cursor: pointer; font-size: 13px; }
        .tv-tc-hang { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; align-items: stretch; }
        .tv-tc-ten { flex: 1 1 220px; min-width: 0; padding: 9px 10px; border: 1px solid #ead8e2; border-radius: 8px; font: inherit; font-size: 13px; resize: vertical; }
        .tv-tc-hang select { padding: 9px 10px; border: 1px solid #ead8e2; border-radius: 8px; background: white; font: inherit; font-size: 13px; }
        .tv-tc-hang button { border: 0; padding: 9px 16px; border-radius: 8px; background: #e85b83; color: white; cursor: pointer; font-size: 13px; }
        .tv-tc-ten:focus, .tv-tc-hang select:focus { outline: 2px solid #e85b83; outline-offset: -1px; }
        .tv-loi { min-height: 18px; margin: 12px 0 0; color: #c0334f; font-size: 13px; }
        .chon-phai-dong .tv-reset { background: #ffe9ec; color: #b3263f; border: 1px solid #f3b5bf; margin-right: 8px; }

        @media(max-width: 420px) {
            .chon-phai-luoi,
            .chon-phai-nguoi { grid-template-columns: 1fr; }
        }
    `;
    document.head.appendChild(style);
}

// 3. Lưu dữ liệu đội hình
function luuDuLieu() {
    localStorage.setItem(KEY, JSON.stringify(duLieu));
    dayLen("slots", () => duLieu);
}

// 4. Lấy các ô tên trong bảng đội hình
function layCacO() {
    return [
        ...document.querySelectorAll(".formation table tbody tr td:nth-child(odd)")
    ];
}

// Tìm ô khác đã xếp người này (so tên không phân biệt hoa thường/khoảng trắng)
function timViTriDaXep(ten, oHienTai) {
    const k = chuanHoa(ten);
    const c = layCacO().find(x => x !== oHienTai && chuanHoa(x.textContent) === k);
    if (!c) return null;

    const doan = c.closest(".formation")?.querySelector("h2")?.textContent.split("·")[0].trim() || "";
    const hang = [...c.parentElement.parentElement.children].indexOf(c.parentElement) + 1;
    const cot = [...c.parentElement.children].indexOf(c);
    const pt = c.closest("table").querySelectorAll("thead th")[cot]?.textContent || "";
    return [doan, pt, "hàng " + hang].filter(Boolean).join(", ");
}

function layCacOViTri() {
    return [
        ...document.querySelectorAll(".formation table tbody tr td:nth-child(even)")
    ];
}

// Xóa toàn bộ ô trong bảng đội hình
function xoaTatCa(xoaCaViTri) {
    if (!laAdmin()) return;
    layCacO().forEach(o => {
        tomauO(o, "");
        o.textContent = "";
        o.title = "Ô trống - Nhấn để chọn người chơi";
        duLieu[o.dataset.slotId] = "";
    });
    if (xoaCaViTri) {
        layCacOViTri().forEach(o => {
            o.textContent = "";
            duLieu[o.dataset.slotId] = "";
        });
    }
    luuDuLieu();
}

function moXacNhanXoa() {
    if (!laAdmin()) return;
    document.querySelector(".chon-phai-nen")?.remove();

    const nen = document.createElement("div");
    nen.className = "chon-phai-nen";
    nen.addEventListener("click", e => { if (e.target === nen) nen.remove(); });

    const hop = document.createElement("div");
    hop.className = "chon-phai-hop";
    hop.setAttribute("role", "alertdialog");

    const tieuDe = document.createElement("h2");
    tieuDe.textContent = "Xóa tất cả các ô?";
    const moTa = document.createElement("p");
    moTa.className = "chon-phai-mo-ta";
    moTa.textContent = "Thao tác này không thể hoàn tác. Danh sách Thành Viên không bị ảnh hưởng.";

    const nhom = document.createElement("div");
    nhom.className = "xoa-nhom";

    const nutTen = document.createElement("button");
    nutTen.type = "button";
    nutTen.className = "chon-phai-nut";
    nutTen.textContent = "Chỉ xóa tên người chơi";
    nutTen.addEventListener("click", () => { xoaTatCa(false); nen.remove(); });

    const nutCa = document.createElement("button");
    nutCa.type = "button";
    nutCa.className = "chon-phai-nut xoa-nguy-hiem";
    nutCa.textContent = "Xóa cả tên và vị trí";
    nutCa.addEventListener("click", () => { xoaTatCa(true); nen.remove(); });

    nhom.append(nutTen, nutCa);

    const hangDong = document.createElement("div");
    hangDong.className = "chon-phai-dong";
    const huy = document.createElement("button");
    huy.type = "button";
    huy.textContent = "Hủy";
    huy.addEventListener("click", () => nen.remove());
    hangDong.appendChild(huy);

    hop.append(tieuDe, moTa, nhom, hangDong);
    nen.appendChild(hop);
    document.body.appendChild(nen);
    huy.focus();
}

// 5. Điền tên vào ô đã chọn
function dienTen(o, ten) {
    const id = o.dataset.slotId;

    o.textContent = ten;
    o.title = ten
        ? ten + " - Nhấn để thay đổi"
        : "Ô trống - Nhấn để chọn người chơi";

    tomauO(o, ten);
    duLieu[id] = ten;
    luuDuLieu();
}

// 6. Mở bảng chọn phái (lấy dữ liệu từ DANH_SACH = danh sách Thành Viên)
function moBangChon(o) {
    if (!laAdmin()) return;
    document.querySelector(".chon-phai-nen")?.remove();

    const nen = document.createElement("div");
    nen.className = "chon-phai-nen";

    nen.addEventListener("click", e => {
        if (e.target === nen) nen.remove();
    });

    const hop = document.createElement("div");
    hop.className = "chon-phai-hop";

    const tieuDe = document.createElement("h2");
    tieuDe.textContent = "Chọn phái";

    const moTa = document.createElement("p");
    moTa.className = "chon-phai-mo-ta";
    moTa.textContent =
        "Chọn phái trước, sau đó chọn người chơi để điền vào ô đội hình.";

    const luoi = document.createElement("div");
    luoi.className = "chon-phai-luoi";

    const ketQua = document.createElement("div");
    ketQua.className = "chon-phai-ketqua";

    const tieuDeKetQua = document.createElement("h3");
    tieuDeKetQua.textContent = "Danh sách người chơi";

    const danhSachTen = document.createElement("div");
    danhSachTen.className = "chon-phai-nguoi";

    const loiXep = document.createElement("p");
    loiXep.className = "chon-phai-loi";
    loiXep.setAttribute("role", "alert");

    ketQua.append(tieuDeKetQua, danhSachTen, loiXep);

    function hienThiPhai(phai, nutDuocChon) {
        luoi.querySelectorAll("button").forEach(nut => {
            nut.classList.toggle("active", nut === nutDuocChon);
        });

        tieuDeKetQua.textContent =
            phai === "Bỏ trống"
                ? "Xóa tên khỏi ô"
                : "Người chơi phái " + phai;

        danhSachTen.replaceChildren();
        loiXep.textContent = "";

        if (phai === "Bỏ trống") {
            const nutTrong = document.createElement("button");
            nutTrong.className = "chon-phai-ten";
            nutTrong.textContent = "Bỏ trống ô này";

            nutTrong.addEventListener("click", () => {
                dienTen(o, "");
                nen.remove();
            });

            danhSachTen.appendChild(nutTrong);
            return;
        }

        const tenNguoiChoi = [
            ...new Set(DANH_SACH[phai] || [])
        ].sort((a, b) => a.localeCompare(b, "vi"));

        if (tenNguoiChoi.length === 0) {
            const rong = document.createElement("div");
            rong.className = "chon-phai-rong";
            rong.textContent =
                "Chưa có thành viên. Bấm nút Thành Viên để thêm người vào phái này.";
            danhSachTen.appendChild(rong);
            return;
        }

        tenNguoiChoi.forEach(ten => {
            const nutTen = document.createElement("button");
            nutTen.className = "chon-phai-ten";
            nutTen.textContent = ten;
            datMau(nutTen, phai);

            const viTri = timViTriDaXep(ten, o);
            if (viTri) nutTen.classList.add("da-xep");

            nutTen.addEventListener("click", () => {
                const vt = timViTriDaXep(ten, o);
                if (vt) {
                    loiXep.textContent = "Lỗi: \"" + ten + "\" đã xếp ở " + vt + ". Hãy chọn người khác hoặc bỏ trống ô kia trước.";
                    return;
                }
                dienTen(o, ten);
                nen.remove();
            });

            danhSachTen.appendChild(nutTen);
        });
    }

    PHAI.forEach(phai => {
        const nut = document.createElement("button");
        nut.className = "chon-phai-nut";
        nut.textContent = phai;
        datMau(nut, phai);
        nut.addEventListener("click", () => hienThiPhai(phai, nut));
        luoi.appendChild(nut);
    });

    const nutTrong = document.createElement("button");
    nutTrong.className = "chon-phai-nut";
    nutTrong.textContent = "＋ Bỏ trống";
    nutTrong.addEventListener("click", () => hienThiPhai("Bỏ trống", nutTrong));
    luoi.appendChild(nutTrong);

    const hangDong = document.createElement("div");
    hangDong.className = "chon-phai-dong";

    const nutDong = document.createElement("button");
    nutDong.textContent = "Đóng";
    nutDong.addEventListener("click", () => nen.remove());
    hangDong.appendChild(nutDong);

    hop.append(tieuDe, moTa, luoi, ketQua, hangDong);
    nen.appendChild(hop);
    document.body.appendChild(nen);
}

// 7. Cửa sổ Thành Viên (chia theo phái)
function moThanhVien() {
    if (!laAdmin()) return;
    document.querySelector(".chon-phai-nen")?.remove();

    const nen = document.createElement("div");
    nen.className = "chon-phai-nen";
    nen.addEventListener("click", e => { if (e.target === nen) nen.remove(); });

    const hop = document.createElement("div");
    hop.className = "chon-phai-hop tv-hop";

    const dau = document.createElement("div");
    dau.className = "tv-dau";
    const tieuDe = document.createElement("h2");
    tieuDe.textContent = "Thành viên bang";
    const tong = document.createElement("span");
    tong.className = "tv-tong";
    dau.append(tieuDe, tong);

    const moTa = document.createElement("p");
    moTa.className = "chon-phai-mo-ta";
    moTa.textContent =
        "Danh sách này là dữ liệu để chọn người ở trang xếp đội hình. Thêm hoặc xóa tên theo từng phái.";

    const luoi = document.createElement("div");
    luoi.className = "tv-luoi";

    const loi = document.createElement("p");
    loi.className = "tv-loi";
    loi.setAttribute("role", "status");

    // --- Nhập từ Raid-Helper (dán văn bản) ---
    const nhap = document.createElement("details");
    nhap.className = "tv-nhap";
    const nhapTieuDe = document.createElement("summary");
    nhapTieuDe.textContent = "Nhập từ Raid-Helper";
    const nhapText = document.createElement("textarea");
    nhapText.placeholder = "Mở trang sự kiện Raid-Helper, bôi đen toàn bộ danh sách phái và tên, copy rồi dán vào đây.";
    nhapText.setAttribute("aria-label", "Văn bản danh sách từ Raid-Helper");
    const nhapHang = document.createElement("div");
    nhapHang.className = "tv-nhap-hang";
    const nhanThay = document.createElement("label");
    const oThay = document.createElement("input");
    oThay.type = "checkbox";
    nhanThay.append(oThay, " Xóa danh sách hiện tại trước khi nhập");
    const nutNhap = document.createElement("button");
    nutNhap.type = "button";
    nutNhap.textContent = "Nhập";
    nhapHang.append(nhanThay, nutNhap);
    nhap.append(nhapTieuDe, nhapText, nhapHang);

    nutNhap.addEventListener("click", () => {
        const { kq, boQua } = docRaidHelper(nhapText.value);
        const tongDoc = PHAI.reduce((n, p) => n + kq[p].length, 0);
        if (tongDoc === 0) {
            loi.style.color = "#c0334f";
            loi.textContent = "Không đọc được thành viên nào. Hãy copy cả tên phái (ví dụ \"Toái Mộng 3\") và các tên bên dưới.";
            return;
        }
        if (oThay.checked) PHAI.forEach(p => { DANH_SACH[p] = []; });

        let them = 0, daCo = 0;
        PHAI.forEach(phai => {
            kq[phai].forEach(ten => {
                const k = chuanHoa(ten);
                if (PHAI.some(p => DANH_SACH[p].some(x => chuanHoa(x) === k))) { daCo++; return; }
                DANH_SACH[phai].push(DANH_BANG[k] || ten);
                them++;
            });
            DANH_SACH[phai].sort((a, b) => a.localeCompare(b, "vi"));
        });
        luuDanhSach();
        veLai();
        loi.style.color = "#2f7a4b";
        loi.textContent = "Đã thêm " + them + " thành viên" +
            (daCo ? ", bỏ qua " + daCo + " người đã có" : "") +
            (boQua ? ", bỏ qua " + boQua + " người ở mục Tentative" : "") + ".";
    });

    // --- Nhập thủ công: chọn phái + gõ tên (có thể nhiều tên, mỗi tên một dòng hoặc cách nhau dấu phẩy) ---
    const thuCong = document.createElement("details");
    thuCong.className = "tv-nhap";
    const tcTieuDe = document.createElement("summary");
    tcTieuDe.textContent = "Nhập thủ công";
    const tcHang = document.createElement("div");
    tcHang.className = "tv-tc-hang";
    const tcTen = document.createElement("textarea");
    tcTen.className = "tv-tc-ten";
    tcTen.rows = 2;
    tcTen.placeholder = "Tên thành viên (nhiều tên: mỗi tên một dòng hoặc cách nhau bằng dấu phẩy)";
    tcTen.setAttribute("aria-label", "Tên thành viên");
    const tcPhai = document.createElement("select");
    tcPhai.setAttribute("aria-label", "Phái");
    PHAI.forEach(p => {
        const op = document.createElement("option");
        op.value = p;
        op.textContent = p;
        tcPhai.appendChild(op);
    });
    const tcNut = document.createElement("button");
    tcNut.type = "button";
    tcNut.textContent = "Thêm";
    tcHang.append(tcTen, tcPhai, tcNut);
    thuCong.append(tcTieuDe, tcHang);

    function themThuCong() {
        const phai = tcPhai.value;
        const ds = tcTen.value.split(/[\n,;]+/).map(t => t.replace(/\s+/g, " ").trim()).filter(Boolean);
        if (ds.length === 0) {
            loi.style.color = "#c0334f";
            loi.textContent = "Hãy nhập tên thành viên.";
            tcTen.focus();
            return;
        }
        let them = 0;
        const trung = [];
        ds.forEach(ten => {
            const k = chuanHoa(ten);
            const p = PHAI.find(x => DANH_SACH[x].some(m => chuanHoa(m) === k));
            if (p) { trung.push(ten + " (phái " + p + ")"); return; }
            DANH_SACH[phai].push(ten);
            them++;
        });
        DANH_SACH[phai].sort((a, b) => a.localeCompare(b, "vi"));
        luuDanhSach();
        veLai();
        if (them > 0) tcTen.value = "";
        loi.style.color = trung.length ? "#c0334f" : "#2f7a4b";
        loi.textContent =
            (them ? "Đã thêm " + them + " thành viên vào phái " + phai + ". " : "") +
            (trung.length ? "Đã có sẵn, không thêm: " + trung.join(", ") + "." : "");
        tcTen.focus();
    }
    tcNut.addEventListener("click", themThuCong);
    tcTen.addEventListener("keydown", e => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); themThuCong(); }
    });

    function veLai() {
        const tongSo = PHAI.reduce((n, p) => n + DANH_SACH[p].length, 0);
        tong.textContent = tongSo + " thành viên · " + PHAI.length + " phái";
        luoi.replaceChildren();

        PHAI.forEach(phai => {
            const khung = document.createElement("section");
            khung.className = "tv-phai";
            datMau(khung, phai);

            const ten = document.createElement("h3");
            ten.className = "tv-phai-ten";
            const tenText = document.createElement("span");
            tenText.textContent = phai;
            const dem = document.createElement("span");
            dem.className = "tv-dem";
            dem.textContent = DANH_SACH[phai].length;
            ten.append(tenText, dem);

            const ds = document.createElement("ul");
            ds.className = "tv-ds";
            if (DANH_SACH[phai].length === 0) {
                const r = document.createElement("li");
                r.className = "tv-rong";
                r.textContent = "Chưa có thành viên. Nhập tên bên dưới để thêm.";
                ds.appendChild(r);
            }
            DANH_SACH[phai].forEach((t, i) => {
                const li = document.createElement("li");
                li.className = "tv-the";
                const span = document.createElement("span");
                span.textContent = t;
                const xoa = document.createElement("button");
                xoa.type = "button";
                xoa.className = "tv-xoa";
                xoa.textContent = "×";
                xoa.setAttribute("aria-label", "Xóa " + t + " khỏi phái " + phai);
                xoa.addEventListener("click", () => {
                    DANH_SACH[phai].splice(i, 1);
                    luuDanhSach();
                    loi.textContent = ""; loi.style.color = "#c0334f";
                    veLai();
                });
                li.append(span, xoa);
                ds.appendChild(li);
            });

            const them = document.createElement("div");
            them.className = "tv-them";
            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = "Tên thành viên mới";
            input.setAttribute("aria-label", "Thêm thành viên phái " + phai);
            const nutThem = document.createElement("button");
            nutThem.type = "button";
            nutThem.textContent = "Thêm";

            function themTen() {
                const t = input.value.trim().replace(/\s+/g, " ");
                if (!t) return;
                const trung = PHAI.find(p =>
                    DANH_SACH[p].some(x => x.toLowerCase() === t.toLowerCase())
                );
                if (trung) {
                    loi.textContent = "\"" + t + "\" đã có trong phái " + trung + ".";
                    return;
                }
                DANH_SACH[phai].push(t);
                DANH_SACH[phai].sort((a, b) => a.localeCompare(b, "vi"));
                luuDanhSach();
                loi.textContent = ""; loi.style.color = "#c0334f";
                veLai();
                luoi.children[PHAI.indexOf(phai)]?.querySelector("input")?.focus();
            }
            nutThem.addEventListener("click", themTen);
            input.addEventListener("keydown", e => { if (e.key === "Enter") themTen(); });

            them.append(input, nutThem);
            khung.append(ten, ds, them);
            luoi.appendChild(khung);
        });
    }

    const hangDong = document.createElement("div");
    hangDong.className = "chon-phai-dong";

    const nutMau = document.createElement("button");
    nutMau.type = "button";
    nutMau.className = "tv-reset";
    nutMau.textContent = "Xóa toàn bộ danh sách";
    nutMau.addEventListener("click", () => {
        if (!confirm("Xóa sạch toàn bộ thành viên ở tất cả các phái? Thao tác này không thể hoàn tác.")) return;
        PHAI.forEach(p => { DANH_SACH[p] = []; });
        luuDanhSach();
        loi.textContent = ""; loi.style.color = "#c0334f";
        veLai();
    });

    const nutDong = document.createElement("button");
    nutDong.type = "button";
    nutDong.textContent = "Đóng";
    nutDong.addEventListener("click", () => nen.remove());

    hangDong.append(nutMau, nutDong);
    hop.append(dau, moTa, thuCong, nhap, luoi, loi, hangDong);
    nen.appendChild(hop);
    document.body.appendChild(nen);
    veLai();
}

document.addEventListener("keydown", e => {
    if (e.key === "Escape") document.querySelector(".chon-phai-nen")?.remove();
});

// Tiêu đề đoàn có thể sửa trực tiếp (ví dụ "ĐOÀN 1 · MID - MÁY CHỦ KIDER")
function datTieuDe(h2, text) {
    const phan = text.split("·");
    h2.replaceChildren();
    if (phan.length > 1) {
        const dau = phan.shift().trim();
        const cuoi = phan.join("·").trim();
        const dot = document.createElement("span");
        dot.textContent = "·";
        h2.append(dau + " ", dot, " " + cuoi);
    } else {
        h2.textContent = text.trim();
    }
}

function apDungTieuDe() {
    document.querySelectorAll(".formation h2").forEach((h2, i) => {
        const t = luuTieuDe[i];
        datTieuDe(h2, (typeof t === "string" && t.trim()) ? t : h2.dataset.macDinh);
    });
}

function khoiTaoTieuDe() {
    document.querySelectorAll(".formation h2").forEach((h2, i) => {
        h2.dataset.macDinh = h2.textContent.replace(/\s+/g, " ").trim();
    });
    apDungTieuDe();

    document.querySelectorAll(".formation h2").forEach((h2, i) => {
        h2.contentEditable = "true";
        h2.spellcheck = false;
        h2.classList.add("tieu-de-sua");
        h2.title = "Nhấp để sửa tên đoàn";
        h2.setAttribute("aria-label", "Tên đoàn (nhấp để sửa)");

        h2.addEventListener("keydown", e => {
            if (e.key === "Enter") { e.preventDefault(); h2.blur(); }
        });
        h2.addEventListener("paste", e => {
            e.preventDefault();
            const t = (e.clipboardData || window.clipboardData).getData("text").replace(/\s+/g, " ");
            document.execCommand("insertText", false, t);
        });
        h2.addEventListener("blur", () => {
            if (!laAdmin()) return;
            let t = h2.textContent.replace(/\s+/g, " ").trim();
            if (!t) t = h2.dataset.macDinh;      // để trống -> trả về tên gốc
            datTieuDe(h2, t);
            luuTieuDe[i] = t;
            localStorage.setItem(KEY_TIEUDE, JSON.stringify(luuTieuDe));
            dayLen("titles", () => luuTieuDe);
        });
    });
}

// Gán id cho ô Vị trí, khôi phục và lưu nội dung chỉnh sửa
function khoiTaoViTri() {
    const cacBang = [...document.querySelectorAll(".formation table")];
    layCacOViTri().forEach(o => {
        const soBang = cacBang.indexOf(o.closest("table"));
        const soHang = [...o.parentElement.parentElement.children].indexOf(o.parentElement);
        const soCot = [...o.parentElement.children].indexOf(o);
        const id = `bang-${soBang}-hang-${soHang}-cot-${soCot}`;
        o.dataset.slotId = id;
        o.dataset.macDinh = o.textContent;

        if (Object.prototype.hasOwnProperty.call(duLieu, id)) {
            o.textContent = duLieu[id];
        }
        o.addEventListener("input", () => {
            if (!laAdmin()) return;
            duLieu[id] = o.textContent;
            luuDuLieu();
        });
    });
}

// Cửa sổ đăng nhập
function moDangNhap() {
    document.querySelector(".chon-phai-nen")?.remove();

    const nen = document.createElement("div");
    nen.className = "chon-phai-nen";
    nen.addEventListener("click", e => { if (e.target === nen) nen.remove(); });

    const hop = document.createElement("div");
    hop.className = "chon-phai-hop dn-hop";
    hop.setAttribute("role", "dialog");
    hop.setAttribute("aria-label", "Đăng nhập");

    const tieuDe = document.createElement("h2");
    tieuDe.textContent = "Đăng nhập";
    const moTa = document.createElement("p");
    moTa.className = "chon-phai-mo-ta";
    moTa.textContent = "Đăng nhập để chỉnh sửa đội hình và quản lý thành viên.";

    const form = document.createElement("div");
    form.className = "dn-form";

    function truong(nhan, loai, auto) {
        const l = document.createElement("label");
        l.className = "dn-truong";
        const sp = document.createElement("span");
        sp.textContent = nhan;
        const inp = document.createElement("input");
        inp.type = loai;
        inp.autocomplete = auto;
        l.append(sp, inp);
        form.appendChild(l);
        return inp;
    }
    const inUser = truong("Email quản trị", "email", "username");
    const inPass = truong("Mật khẩu", "password", "current-password");

    const loi = document.createElement("p");
    loi.className = "chon-phai-loi";
    loi.setAttribute("role", "alert");

    const hang = document.createElement("div");
    hang.className = "chon-phai-dong";
    const huy = document.createElement("button");
    huy.type = "button";
    huy.className = "dn-huy";
    huy.textContent = "Hủy";
    huy.addEventListener("click", () => nen.remove());
    const ok = document.createElement("button");
    ok.type = "button";
    ok.textContent = "Đăng nhập";
    hang.append(huy, ok);

    async function thu() {
        if (!CO_MAY_CHU) {
            loi.textContent = "Chưa cấu hình khóa Supabase trong script.js (dòng SUPABASE_KEY).";
            return;
        }
        if (!inUser.value.trim() || !inPass.value) {
            loi.textContent = "Hãy nhập email và mật khẩu.";
            return;
        }
        ok.disabled = true;
        loi.textContent = "Đang đăng nhập…";
        try {
            await dangNhap(inUser.value.trim(), inPass.value);
            nen.remove();
            apDungQuyen();
            dongBo();
        } catch (e) {
            loi.textContent = e.message || "Đăng nhập thất bại.";
            inPass.value = "";
            inPass.focus();
        }
        ok.disabled = false;
    }
    ok.addEventListener("click", thu);
    [inUser, inPass].forEach(i => i.addEventListener("keydown", e => { if (e.key === "Enter") thu(); }));

    hop.append(tieuDe, moTa, form, loi, hang);
    nen.appendChild(hop);
    document.body.appendChild(nen);
    inUser.focus();
}

function dangXuat() {
    Object.keys(hen).forEach(k => clearTimeout(hen[k]));
    luuPhien(null);
    apDungQuyen();
    trangThai("");
    dongBo();
}

// ---------- Đồng bộ với máy chủ ----------
function veLaiBang() {
    layCacO().forEach(o => {
        const id = o.dataset.slotId;
        o.className = o.dataset.lopGoc || "";
        if (Object.prototype.hasOwnProperty.call(duLieu, id)) {
            o.textContent = duLieu[id];
            tomauO(o, duLieu[id]);
        } else {
            o.textContent = o.dataset.macDinh || "";
        }
    });
    layCacOViTri().forEach(o => {
        const id = o.dataset.slotId;
        o.textContent = Object.prototype.hasOwnProperty.call(duLieu, id) ? duLieu[id] : (o.dataset.macDinh || "");
    });
}

function apDungTuMayChu(key, val) {
    if (!val || typeof val !== "object") return;
    if (key === "members") {
        PHAI.forEach(p => { DANH_SACH[p] = Array.isArray(val[p]) ? val[p].map(String) : []; });
        localStorage.setItem(KEY_TV, JSON.stringify(DANH_SACH));
    } else if (key === "slots") {
        duLieu = val;
        localStorage.setItem(KEY, JSON.stringify(duLieu));
    } else if (key === "titles") {
        luuTieuDe = val;
        localStorage.setItem(KEY_TIEUDE, JSON.stringify(luuTieuDe));
        apDungTieuDe();
    }
}

let dangDongBo = false;
async function dongBo() {
    if (!CO_MAY_CHU || dangDongBo) return;
    dangDongBo = true;
    try {
        const rows = await sbLayTatCa();
        const map = {};
        rows.forEach(r => { map[r.key] = r.value; });
        let doi = false;
        const moi = { members: () => DANH_SACH, slots: () => duLieu, titles: () => luuTieuDe };

        Object.keys(moi).forEach(key => {
            if (map[key] !== undefined) {
                const sig = JSON.stringify(map[key]);
                if (lastRemote[key] !== sig) {
                    lastRemote[key] = sig;
                    apDungTuMayChu(key, map[key]);
                    doi = true;
                }
            } else if (laAdmin()) {
                dayLen(key, moi[key]);           // máy chủ chưa có -> đưa dữ liệu hiện tại lên
            }
        });
        if (doi) { veLaiBang(); apDungQuyen(); }

        if (!laAdmin()) {
            const g = new Date();
            trangThai("Cập nhật lúc " + String(g.getHours()).padStart(2, "0") + ":" + String(g.getMinutes()).padStart(2, "0"));
        }
    } catch (e) {
        trangThai("Không kết nối được máy chủ. Đang hiển thị dữ liệu lưu trên máy này.", true);
    }
    dangDongBo = false;
}

// Bật/tắt quyền chỉnh sửa theo trạng thái đăng nhập
function apDungQuyen() {
    const a = laAdmin();
    document.body.classList.toggle("che-do-xem", !a);

    const bat = (id, hien) => { const el = document.getElementById(id); if (el) el.hidden = !hien; };
    bat("btn-clear", a);
    bat("btn-members", a);
    bat("btn-logout", a);
    bat("btn-login", !a);

    const hint = document.querySelector(".hint");
    if (hint) {
        hint.textContent = a
            ? "Đang đăng nhập quản trị. Nhấp vào tên hoặc vị trí để sửa trực tiếp."
            : "Chế độ chỉ xem. Đăng nhập để chỉnh sửa đội hình.";
    }

    const ngay = document.getElementById("war-date");
    if (ngay) ngay.readOnly = !a;

    layCacOViTri().forEach(o => { o.contentEditable = a ? "true" : "false"; });

    document.querySelectorAll(".formation h2").forEach(h2 => {
        h2.contentEditable = a ? "true" : "false";
        h2.classList.toggle("tieu-de-sua", a);
        h2.title = a ? "Nhấp để sửa tên đoàn" : "";
    });

    layCacO().forEach(o => {
        o.style.cursor = a ? "pointer" : "default";
        o.title = a
            ? (o.textContent.trim() ? o.textContent.trim() + " - Nhấn để thay đổi" : "Nhấn để chọn phái và người chơi")
            : "";
    });

    if (!a) document.querySelector(".chon-phai-nen")?.remove();
}

// 8. Khởi tạo sự kiện
function khoiTao() {
    themGiaoDien();

    document.getElementById("btn-members")?.addEventListener("click", moThanhVien);
    khoiTaoTieuDe();
    khoiTaoViTri();
    document.getElementById("btn-clear")?.addEventListener("click", moXacNhanXoa);
    document.getElementById("btn-login")?.addEventListener("click", moDangNhap);
    document.getElementById("btn-logout")?.addEventListener("click", dangXuat);

    const cacBang = [...document.querySelectorAll(".formation table")];

    layCacO().forEach(o => {
        const bang = o.closest("table");
        const soBang = cacBang.indexOf(bang);
        const soHang = [...o.parentElement.parentElement.children].indexOf(o.parentElement);
        const soCot = [...o.parentElement.children].indexOf(o);

        const id = `bang-${soBang}-hang-${soHang}-cot-${soCot}`;
        o.dataset.slotId = id;

        const goc = o.textContent.trim();
        if (goc) DANH_BANG[chuanHoa(goc)] = goc;
        o.dataset.macDinh = o.textContent;
        o.dataset.lopGoc = o.className;

        if (Object.prototype.hasOwnProperty.call(duLieu, id)) {
            o.textContent = duLieu[id];
            tomauO(o, duLieu[id]);
        }

        o.style.cursor = "pointer";
        o.title = "Nhấn để chọn phái và người chơi";

        if (o.dataset.daGanSuKien === "true") return;
        o.dataset.daGanSuKien = "true";

        o.addEventListener("click", () => moBangChon(o));
    });

    apDungQuyen();

    if (!CO_MAY_CHU) {
        trangThai("Chưa kết nối máy chủ: dữ liệu chỉ lưu trên máy này.", true);
    }
    dongBo();
    // Người xem: tự cập nhật mỗi 15 giây và khi quay lại tab
    setInterval(() => { if (!laAdmin() && !document.hidden) dongBo(); }, 15000);
    document.addEventListener("visibilitychange", () => { if (!document.hidden && !laAdmin()) dongBo(); });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", khoiTao);
} else {
    khoiTao();
}