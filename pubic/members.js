/* ==========================================
   404 NOT FOUND - TRANG QUẢN LÝ THÀNH VIÊN
   Dùng chung dữ liệu và đăng nhập với script.js (nạp script.js trước file này).
   ========================================== */
(function () {
    "use strict";

    const $ = id => document.getElementById(id);

    let tuKhoa = "";
    let locPhai = "";
    let sapXep = "asc";
    let dangSua = null;
    let daDung = false;
    const ref = {};

    function bao(chu, laLoi) {
        if (!ref.trangThai) return;
        ref.trangThai.style.color = laLoi ? "#c0334f" : "#2f7a4b";
        ref.trangThai.textContent = chu;
    }

    function tao(tag, lop, chu) {
        const el = document.createElement(tag);
        if (lop) el.className = lop;
        if (chu !== undefined) el.textContent = chu;
        return el;
    }

    // ---------- Dựng khung trang (làm một lần) ----------
    function xayDung() {
        const goc = $("mb-chinh");
        goc.replaceChildren();

        // Thẻ thống kê / lọc theo phái
        ref.thongKe = tao("div", "mb-thongke");
        ref.thongKe.setAttribute("role", "group");
        ref.thongKe.setAttribute("aria-label", "Lọc theo phái");

        const luoi = tao("div", "mb-luoi");

        // --- Bảng ---
        const khungBang = tao("div", "mb-khung");
        const dau = tao("div", "mb-khung-dau");
        ref.tim = tao("input", "mb-tim");
        ref.tim.type = "search";
        ref.tim.placeholder = "Tìm theo tên thành viên…";
        ref.tim.setAttribute("aria-label", "Tìm theo tên thành viên");
        ref.dem = tao("span", "mb-dem");
        dau.append(ref.tim, ref.dem);

        const cuon = tao("div", "mb-cuon");
        const bang = tao("table", "mb-bang");
        const thead = document.createElement("thead");
        const hang = document.createElement("tr");

        const thStt = tao("th", "stt", "#");
        const thTen = document.createElement("th");
        ref.nutSap = tao("button", "mb-sap");
        ref.nutSap.type = "button";
        thTen.appendChild(ref.nutSap);

        const thPhai = document.createElement("th");
        ref.loc = tao("select", "mb-loc");
        ref.loc.setAttribute("aria-label", "Lọc theo phái");
        const opTatCa = document.createElement("option");
        opTatCa.value = "";
        ref.loc.appendChild(opTatCa);
        PHAI.forEach(p => {
            const op = document.createElement("option");
            op.value = p;
            ref.loc.appendChild(op);
        });
        thPhai.appendChild(ref.loc);

        const thThao = tao("th", "thao-tac");
        const nhan = tao("span", "", "Thao tác");
        nhan.style.cssText = "position:absolute;left:-9999px";
        thThao.appendChild(nhan);

        hang.append(thStt, thTen, thPhai, thThao);
        thead.appendChild(hang);
        ref.tbody = document.createElement("tbody");
        bang.append(thead, ref.tbody);
        cuon.appendChild(bang);
        khungBang.append(dau, cuon);

        // --- Form thêm ---
        const khungThem = tao("section", "mb-khung mb-them");
        khungThem.appendChild(tao("h3", "", "Thêm thành viên"));
        khungThem.appendChild(tao("p", "goi-y", "Có thể nhập nhiều tên: mỗi tên một dòng hoặc cách nhau bằng dấu phẩy."));

        const nhanTen = tao("label", "", "Tên thành viên");
        nhanTen.htmlFor = "mb-them-ten";
        ref.themTen = tao("textarea");
        ref.themTen.id = "mb-them-ten";
        ref.themTen.placeholder = "Ví dụ:\nDiệpHànPhương\nCửuVĩThiênHồ";

        const nhanPhai = tao("label", "", "Phái");
        nhanPhai.htmlFor = "mb-them-phai";
        ref.themPhai = tao("select");
        ref.themPhai.id = "mb-them-phai";
        PHAI.forEach(p => {
            const op = document.createElement("option");
            op.value = p;
            op.textContent = p;
            ref.themPhai.appendChild(op);
        });

        const nutThem = tao("button", "nut-them", "Thêm vào bang");
        nutThem.type = "button";
        khungThem.append(nhanTen, ref.themTen, nhanPhai, ref.themPhai, nutThem);

        luoi.append(khungBang, khungThem);
        ref.trangThai = tao("p", "mb-trang-thai");
        ref.trangThai.setAttribute("role", "status");
        goc.append(ref.thongKe, luoi, ref.trangThai);

        // --- Sự kiện ---
        ref.tim.addEventListener("input", () => { tuKhoa = ref.tim.value; veBang(); });
        ref.loc.addEventListener("change", () => { locPhai = ref.loc.value; veThongKe(); veBang(); });
        ref.nutSap.addEventListener("click", () => { sapXep = sapXep === "asc" ? "desc" : "asc"; veBang(); });
        nutThem.addEventListener("click", themMoi);
        ref.themTen.addEventListener("keydown", e => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); themMoi(); }
        });

        daDung = true;
    }

    // ---------- Thẻ thống kê ----------
    function veThongKe() {
        const dem = {};
        PHAI.forEach(p => { dem[p] = 0; });
        ROSTER.forEach(m => { dem[m.phai]++; });

        ref.thongKe.replaceChildren();

        const tatCa = tao("button", "mb-chip-phai");
        tatCa.type = "button";
        tatCa.setAttribute("aria-pressed", String(locPhai === ""));
        tatCa.append("Tất cả ", tao("span", "so", String(ROSTER.length)));
        tatCa.addEventListener("click", () => chonLoc(""));
        ref.thongKe.appendChild(tatCa);

        PHAI.forEach(p => {
            const nut = tao("button", "mb-chip-phai");
            nut.type = "button";
            datMau(nut, p);
            nut.setAttribute("aria-pressed", String(locPhai === p));
            nut.append(p + " ", tao("span", "so", String(dem[p])));
            nut.addEventListener("click", () => chonLoc(locPhai === p ? "" : p));
            ref.thongKe.appendChild(nut);
        });

        // Đồng bộ danh sách thả xuống ở tiêu đề cột Phái
        ref.loc.options[0].textContent = "Phái: tất cả";
        PHAI.forEach((p, i) => { ref.loc.options[i + 1].textContent = p + " (" + dem[p] + ")"; });
        ref.loc.value = locPhai;
    }

    function chonLoc(p) {
        locPhai = p;
        veThongKe();
        veBang();
    }

    // ---------- Bảng ----------
    function veBang() {
        ref.nutSap.textContent = "Tên người chơi " + (sapXep === "asc" ? "▲" : "▼");
        ref.nutSap.setAttribute("aria-label", "Sắp xếp theo tên " + (sapXep === "asc" ? "từ A đến Z" : "từ Z đến A"));

        const kw = boDau(tuKhoa);
        const ds = ROSTER
            .filter(m => (!locPhai || m.phai === locPhai) && (!kw || boDau(m.ten).includes(kw)))
            .sort((a, b) => a.ten.localeCompare(b.ten, "vi") * (sapXep === "asc" ? 1 : -1));

        ref.dem.textContent = "Hiển thị " + ds.length + " / " + ROSTER.length + " thành viên";
        ref.tbody.replaceChildren();

        if (ds.length === 0) {
            const tr = document.createElement("tr");
            const td = tao("td", "rong",
                ROSTER.length === 0
                    ? "Chưa có thành viên nào. Nhập tên ở khung Thêm thành viên."
                    : "Không tìm thấy thành viên phù hợp.");
            td.colSpan = 4;
            tr.appendChild(td);
            ref.tbody.appendChild(tr);
            return;
        }

        let oSua = null;
        ds.forEach((m, i) => {
            const tr = document.createElement("tr");
            const tdStt = tao("td", "stt", String(i + 1));
            const tdTen = document.createElement("td");
            const tdPhai = document.createElement("td");
            const tdThao = tao("td", "thao-tac");

            if (m === dangSua) {
                const inTen = tao("input", "mb-sua-ten");
                inTen.value = m.ten;
                inTen.setAttribute("aria-label", "Tên thành viên");
                const selPhai = tao("select", "mb-sua-phai");
                selPhai.setAttribute("aria-label", "Phái");
                PHAI.forEach(p => {
                    const op = document.createElement("option");
                    op.value = p;
                    op.textContent = p;
                    selPhai.appendChild(op);
                });
                selPhai.value = m.phai;

                const nutLuu = tao("button", "mb-nut chinh", "Lưu");
                nutLuu.type = "button";
                nutLuu.addEventListener("click", () => luuSua(m, inTen.value, selPhai.value));
                const nutHuy = tao("button", "mb-nut", "Hủy");
                nutHuy.type = "button";
                nutHuy.addEventListener("click", () => { dangSua = null; bao("", false); veBang(); });

                inTen.addEventListener("keydown", e => {
                    if (e.key === "Enter") luuSua(m, inTen.value, selPhai.value);
                    if (e.key === "Escape") { dangSua = null; veBang(); }
                });

                tdTen.appendChild(inTen);
                tdPhai.appendChild(selPhai);
                tdThao.append(nutLuu, nutHuy);
                oSua = inTen;
            } else {
                tdTen.textContent = m.ten;
                const chip = tao("span", "mb-chip", m.phai);
                datMau(chip, m.phai);
                tdPhai.appendChild(chip);

                const nutSua = tao("button", "mb-nut", "Sửa");
                nutSua.type = "button";
                nutSua.setAttribute("aria-label", "Sửa " + m.ten);
                nutSua.addEventListener("click", () => { dangSua = m; bao("", false); veBang(); });

                const nutXoa = tao("button", "mb-nut nguy", "Xóa");
                nutXoa.type = "button";
                nutXoa.setAttribute("aria-label", "Xóa " + m.ten);
                nutXoa.addEventListener("click", () => {
                    if (!confirm("Xóa \"" + m.ten + "\" khỏi danh sách bang?")) return;
                    const k = ROSTER.indexOf(m);
                    if (k >= 0) ROSTER.splice(k, 1);
                    if (dangSua === m) dangSua = null;
                    luuRoster();
                    bao("Đã xóa \"" + m.ten + "\".", false);
                    veThongKe();
                    veBang();
                });
                tdThao.append(nutSua, nutXoa);
            }
            tr.append(tdStt, tdTen, tdPhai, tdThao);
            ref.tbody.appendChild(tr);
        });
        if (oSua) { oSua.focus(); oSua.select(); }
    }

    // ---------- Thêm / sửa ----------
    function themMoi() {
        const phai = ref.themPhai.value;
        const ds = ref.themTen.value
            .split(/[\n,;]+/)
            .map(t => t.replace(/\s+/g, " ").trim())
            .filter(Boolean);
        if (ds.length === 0) {
            bao("Hãy nhập tên thành viên.", true);
            ref.themTen.focus();
            return;
        }
        let them = 0;
        const trung = [];
        ds.forEach(ten => {
            const k = chuanHoa(ten);
            const co = ROSTER.find(x => chuanHoa(x.ten) === k);
            if (co) { trung.push(ten + " (phái " + co.phai + ")"); return; }
            ROSTER.push({ ten, phai });
            them++;
        });
        if (them > 0) {
            luuRoster();
            ref.themTen.value = "";
            tuKhoa = "";
            ref.tim.value = "";
            locPhai = "";            // bỏ bộ lọc để thấy người vừa thêm
        }
        bao(
            (them ? "Đã thêm " + them + " thành viên vào phái " + phai + ". " : "") +
            (trung.length ? "Đã có sẵn, không thêm: " + trung.join(", ") + "." : ""),
            trung.length > 0
        );
        veThongKe();
        veBang();
        ref.themTen.focus();
    }

    function luuSua(m, tenMoi, phaiMoi) {
        tenMoi = tenMoi.replace(/\s+/g, " ").trim();
        if (!tenMoi) { bao("Tên không được để trống.", true); return; }
        const k = chuanHoa(tenMoi);
        const trung = ROSTER.find(x => x !== m && chuanHoa(x.ten) === k);
        if (trung) {
            bao("\"" + tenMoi + "\" đã có trong bang (phái " + trung.phai + ").", true);
            return;
        }
        m.ten = tenMoi;
        m.phai = phaiMoi;
        dangSua = null;
        luuRoster();
        bao("Đã cập nhật thành viên.", false);
        veThongKe();
        veBang();
    }

    // ---------- Hiển thị theo quyền ----------
    function render() {
        const a = laAdmin();
        $("mb-cong").hidden = a;
        $("mb-chinh").hidden = !a;
        if (!a) return;
        if (!daDung) xayDung();
        veThongKe();
        veBang();
    }

    // script.js gọi hàm này khi đăng nhập/đăng xuất hoặc khi dữ liệu từ máy chủ thay đổi
    window.khiCapNhat = render;

    function batDau() {
        $("mb-cong-dangnhap")?.addEventListener("click", moDangNhap);
        render();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", batDau);
    } else {
        batDau();
    }
})();
