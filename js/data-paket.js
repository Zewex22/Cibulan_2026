
"use strict";

document.addEventListener("DOMContentLoaded", function () {

    // =====================================
    // 1. ELEMEN HTML
    // =====================================

    const STORAGE_KEY = "cibulan_pesanan";

    const tableBody = document.getElementById("orderTableBody");
    const searchInput = document.getElementById("searchInput");

    const reloadButton = document.getElementById("reloadButton");
    const deleteAllButton = document.getElementById("deleteAllButton");

    const totalOrders = document.getElementById("totalOrders");
    const totalParticipants = document.getElementById("totalParticipants");
    const popularPackage = document.getElementById("popularPackage");

    const dataStatus = document.getElementById("dataStatus");

    const detailModal = document.getElementById("detailModal");
    const detailContent = document.getElementById("detailContent");
    const closeModal = document.getElementById("closeModal");

    let orders = [];

    let previousFocus = null;

    // =====================================
    // 2. MEMBACA DATA
    // =====================================

    function getOrders() {

        try {

            const data = localStorage.getItem(STORAGE_KEY);

            if (!data) return [];

            const parsed = JSON.parse(data);

            return Array.isArray(parsed) ? parsed : [];

        } catch (error) {

            console.error("Gagal membaca data:", error);

            dataStatus.textContent =
                "Terjadi kesalahan saat membaca data.";

            return [];
        }
    }

    // =====================================
    // 3. MENYIMPAN DATA
    // =====================================

    function saveOrders() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(orders)
            );

            return true;

        } catch (error) {

            console.error("Gagal menyimpan data:", error);

            alert("Data gagal diperbarui. Periksa penyimpanan browser.");

            return false;
        }
    }

    // =====================================
    // 4. FORMAT TANGGAL
    // =====================================

    function formatDate(date) {

        if (!date) return "-";

        const parts = date.split("-");

        if (parts.length !== 3) return date;

        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    // =====================================
    // 5. UPDATE STATISTIK
    // =====================================

    function updateStatistics() {

        totalOrders.textContent = orders.length;

        const participants = orders.reduce(
            (total, order) => total + (Number(order.peserta) || 0),
            0
        );

        totalParticipants.textContent = participants;

        if (orders.length === 0) {

            popularPackage.textContent = "Belum ada data";

            return;
        }

        const packageCounts = {};

        orders.forEach(order => {

            const packageName = order.paket || "Tidak diketahui";

            packageCounts[packageName] =
                (packageCounts[packageName] || 0) + 1;

        });

        const mostPopular = Object.entries(packageCounts)
            .sort((a, b) => b[1] - a[1])[0];

        popularPackage.textContent = mostPopular[0];
    }

    // =====================================
    // 6. MEMBUAT ELEMEN TABEL
    // =====================================

    function createTextElement(tag, text, className = "") {

        const element = document.createElement(tag);

        element.textContent = text || "-";

        if (className) {
            element.className = className;
        }

        return element;
    }

    function createButton(text, className, callback) {

        const button = document.createElement("button");

        button.type = "button";
        button.textContent = text;
        button.className = className;

        button.addEventListener("click", callback);

        return button;
    }

    // =====================================
    // 7. MENAMPILKAN DATA TABEL
    // =====================================

    function renderOrders(keyword = "") {

        tableBody.replaceChildren();

        const search = keyword.trim().toLowerCase();

        const filteredOrders = orders.filter(order => {

            const searchable = [
                order.nama,
                order.email,
                order.paket,
                order.tanggal,
                order.telepon,
                order.destinasi
            ].join(" ").toLowerCase();

            return searchable.includes(search);
        });

        if (filteredOrders.length === 0) {

            const row = document.createElement("tr");

            const cell = document.createElement("td");

            cell.colSpan = 7;
            cell.className = "empty-data";

            cell.textContent = orders.length === 0
                ? "Belum ada data pemesanan."
                : "Data yang dicari tidak ditemukan.";

            row.appendChild(cell);

            tableBody.appendChild(row);

            return;
        }

        filteredOrders.forEach((order, index) => {

            const row = document.createElement("tr");

            // NOMOR
            const noCell = createTextElement("td", index + 1);

            // PEMESAN
            const customerCell = document.createElement("td");

            customerCell.append(
                createTextElement("strong", order.nama),
                createTextElement("small", order.jenis)
            );

            // PAKET
            const packageCell = document.createElement("td");

            packageCell.append(
                createTextElement(
                    "span",
                    order.paket,
                    "package-badge"
                ),
                createTextElement("small", order.destinasi)
            );

            // TANGGAL
            const dateCell = document.createElement("td");

            dateCell.append(
                createTextElement(
                    "span",
                    formatDate(order.tanggal)
                ),
                createTextElement("small", order.waktu)
            );

            // PESERTA
            const participantCell = createTextElement(
                "td",
                `${Number(order.peserta) || 0} orang`
            );

            // KONTAK
            const contactCell = document.createElement("td");

            contactCell.append(
                createTextElement("span", order.telepon),
                createTextElement("small", order.email)
            );

            // AKSI
            const actionCell = document.createElement("td");

            actionCell.className = "action-cell";

            const detailButton = createButton(
                "Detail",
                "btn-detail",
                function () {
                    showDetail(order.id);
                }
            );

            const deleteButton = createButton(
                "Hapus",
                "btn-delete",
                function () {
                    deleteOrder(order.id);
                }
            );

            actionCell.append(detailButton, deleteButton);

            row.append(
                noCell,
                customerCell,
                packageCell,
                dateCell,
                participantCell,
                contactCell,
                actionCell
            );

            tableBody.appendChild(row);

        });

    }

    // =====================================
    // 8. DETAIL POPUP
    // =====================================

    function createDetailItem(label, value) {

        const item = document.createElement("div");

        item.className = "detail-item";

        const title = createTextElement("span", label);

        const content = createTextElement("strong", value);

        item.append(title, content);

        return item;
    }

    function showDetail(id) {

        const order = orders.find(item => item.id === id);

        if (!order) {

            alert("Data pemesanan tidak ditemukan.");

            return;
        }

        previousFocus = document.activeElement;

        detailContent.replaceChildren();

        const details = [

            ["Nama pemesan", order.nama],
            ["Email", order.email],
            ["Telepon / WhatsApp", order.telepon],
            ["Instansi / komunitas", order.instansi],
            ["Jenis pemesan", order.jenis],
            ["Kota asal", order.kota],

            ["Paket wisata", order.paket],
            ["Destinasi", order.destinasi],
            ["Jumlah peserta", `${Number(order.peserta) || 0} orang`],
            ["Tanggal kunjungan", formatDate(order.tanggal)],
            ["Waktu tiba", order.waktu],
            ["Tanggal alternatif", formatDate(order.alternatif)],
            ["Durasi kunjungan", order.durasi],

            ["Layanan", (order.layanan || []).join(", ")],
            ["Transportasi", order.transportasi],
            ["Anggaran", order.anggaran],
            ["Preferensi aktivitas", `${order.aktivitas || 3}/5`],
            ["Warna kelompok", order.warna],
            ["Bahasa layanan", order.bahasa],

            ["Kebutuhan khusus / catatan", order.catatan],
            ["Lampiran", order.lampiran],
            ["Sumber informasi", order.sumber],
            ["Kode referensi", order.referensi],

            ["Cara dihubungi", order.kontak],
            ["Kode promo", order.promo],

            ["Persetujuan data", order.persetujuan ? "Disetujui" : "Tidak"],
            ["Informasi promosi", order.promosi ? "Ya" : "Tidak"]

        ];

        details.forEach(([label, value]) => {

            detailContent.appendChild(
                createDetailItem(label, value)
            );

        });

        detailModal.classList.add("show");

        detailModal.setAttribute("aria-hidden", "false");

        closeModal.focus();
    }

    // =====================================
    // 9. MENUTUP POPUP
    // =====================================

    function hideModal() {

        detailModal.classList.remove("show");

        detailModal.setAttribute("aria-hidden", "true");

        if (previousFocus && document.contains(previousFocus)) {
            previousFocus.focus();
        }
    }

    closeModal.addEventListener("click", hideModal);

    detailModal.addEventListener("click", function (event) {

        if (event.target === detailModal) {
            hideModal();
        }

    });

    document.addEventListener("keydown", function (event) {

        if (
            event.key === "Escape" &&
            detailModal.classList.contains("show")
        ) {
            hideModal();
        }

    });

    // =====================================
    // 10. HAPUS SATU PESANAN
    // =====================================

    function deleteOrder(id) {

        const order = orders.find(item => item.id === id);

        if (!order) return;

        const confirmation = confirm(
            `Apakah Anda yakin ingin menghapus pesanan ${order.nama}?`
        );

        if (!confirmation) return;

        const previousOrders = [...orders];

        orders = orders.filter(item => item.id !== id);

        if (!saveOrders()) {

            orders = previousOrders;

            return;
        }

        updateStatistics();

        renderOrders(searchInput.value);

        dataStatus.textContent =
            "Data pesanan berhasil dihapus.";
    }

    // =====================================
    // 11. HAPUS SEMUA DATA
    // =====================================

    deleteAllButton.addEventListener("click", function () {

        if (orders.length === 0) {

            alert("Belum ada data yang dapat dihapus.");

            return;
        }

        const confirmation = confirm(
            "Apakah Anda yakin ingin menghapus SEMUA data pemesanan?"
        );

        if (!confirmation) return;

        const previousOrders = [...orders];

        orders = [];

        if (!saveOrders()) {

            orders = previousOrders;

            return;
        }

        hideModal();

        updateStatistics();

        renderOrders();

        dataStatus.textContent =
            "Seluruh data pesanan berhasil dihapus.";

    });

    // =====================================
    // 12. PENCARIAN
    // =====================================

    searchInput.addEventListener("input", function () {

        renderOrders(searchInput.value);

    });

    // =====================================
    // 13. MUAT ULANG DATA
    // =====================================

    reloadButton.addEventListener("click", function () {

        orders = getOrders();

        updateStatistics();

        renderOrders(searchInput.value);

        dataStatus.textContent =
            "Data berhasil dimuat ulang dari browser.";

    });

    // =====================================
    // 14. INISIALISASI
    // =====================================

    orders = getOrders();

    updateStatistics();

    renderOrders();

    dataStatus.textContent = orders.length > 0
        ? "Data berhasil dimuat dari penyimpanan browser."
        : "Belum ada data pemesanan.";

});
