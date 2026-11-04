
"use strict";

document.addEventListener("DOMContentLoaded", function () {

    // =====================================
    // 1. ELEMEN HTML
    // =====================================

    const form = document.getElementById("bookingForm");

    const successMessage = document.getElementById("successMessage");
    const previewButton = document.getElementById("previewButton");
    const summaryCard = document.getElementById("summaryCard");

    const summaryPackage = document.getElementById("summaryPackage");
    const summaryParticipants = document.getElementById("summaryParticipants");
    const summaryDate = document.getElementById("summaryDate");
    const summaryBudget = document.getElementById("summaryBudget");

    const participantsInput = document.getElementById("jumlahPeserta");
    const dateInput = document.getElementById("tanggalKunjungan");
    const budgetInput = document.getElementById("anggaran");

    const activityInput = document.getElementById("aktivitas");
    const rangeValue = document.getElementById("rangeValue");

    const STORAGE_KEY = "cibulan_pesanan";

    if (!form) return;

    // =====================================
    // 2. MENGAMBIL PILIHAN PAKET
    // =====================================

    function getSelectedPackage() {
        const selected = form.querySelector(
            'input[name="paket"]:checked'
        );

        return selected ? selected.value : "Belum dipilih";
    }

    // =====================================
    // 3. FORMAT TANGGAL
    // =====================================

    function formatDate(value) {
        if (!value) return "Belum dipilih";

        const parts = value.split("-");

        if (parts.length !== 3) return value;

        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    // =====================================
    // 4. UPDATE RINGKASAN OTOMATIS
    // =====================================

    function updateSummary() {

        const selectedPackage = getSelectedPackage();

        const participants = participantsInput.value;

        const date = dateInput.value;

        const budget = budgetInput.value;

        summaryPackage.textContent = selectedPackage;

        summaryParticipants.textContent =
            participants && Number(participants) > 0
                ? `${participants} orang`
                : "Belum diisi";

        summaryDate.textContent = formatDate(date);

        summaryBudget.textContent = budget || "Belum dipilih";
    }

    // Setiap perubahan input memperbarui ringkasan
    form.addEventListener("input", updateSummary);
    form.addEventListener("change", updateSummary);

    // =====================================
    // 5. RANGE AKTIVITAS
    // =====================================

    function updateRange() {
        rangeValue.textContent = `${activityInput.value} / 5`;
    }

    activityInput.addEventListener("input", updateRange);

    // =====================================
    // 6. SEMBUNYIKAN PESAN SUKSES
    // =====================================

    function hideSuccessMessage() {
        successMessage.hidden = true;
    }

    form.addEventListener("input", hideSuccessMessage);
    form.addEventListener("change", hideSuccessMessage);

    // =====================================
    // 7. TOMBOL PRATINJAU
    // =====================================

    previewButton.addEventListener("click", function () {

        updateSummary();

        summaryCard.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    });

    // =====================================
    // 8. MENGAMBIL DATA FORMULIR
    // =====================================

    function collectFormData() {

        const formData = new FormData(form);

        const layanan = formData.getAll("layanan");

        const fileInput = document.getElementById("lampiran");

        const fileName = fileInput.files.length > 0
            ? fileInput.files[0].name
            : "";

        return {
            id: (window.crypto && typeof window.crypto.randomUUID === "function")
                ? window.crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(36).slice(2)}`,

            nama: formData.get("nama") || "",
            email: formData.get("email") || "",
            telepon: formData.get("telepon") || "",
            instansi: formData.get("instansi") || "",
            jenis: formData.get("jenis") || "",
            kota: formData.get("kota") || "",

            paket: formData.get("paket") || "",
            destinasi: formData.get("destinasi") || "",
            peserta: Number(formData.get("peserta")) || 0,
            tanggal: formData.get("tanggal") || "",
            waktu: formData.get("waktu") || "",
            alternatif: formData.get("alternatif") || "",
            durasi: formData.get("durasi") || "",

            layanan: layanan,
            transportasi: formData.get("transportasi") || "",
            anggaran: formData.get("anggaran") || "",
            aktivitas: formData.get("aktivitas") || "3",
            warna: formData.get("warna") || "",
            bahasa: formData.get("bahasa") || "",

            catatan: formData.get("catatan") || "",
            lampiran: fileName,
            sumber: formData.get("sumber") || "",
            referensi: formData.get("referensi") || "",

            kontak: formData.get("kontak") || "",
            promo: formData.get("promo") || "",

            persetujuan: formData.get("persetujuan") === "on",
            promosi: formData.get("promosi") === "on",

            dibuat: new Date().toISOString()
        };
    }

    // =====================================
    // 9. MENYIMPAN DATA KE LOCAL STORAGE
    // =====================================

    function saveData(newOrder) {

        try {

            const storedData = localStorage.getItem(STORAGE_KEY);

            let orders = storedData ? JSON.parse(storedData) : [];

            if (!Array.isArray(orders)) {
                orders = [];
            }

            orders.push(newOrder);

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(orders)
            );

            return true;

        } catch (error) {

            console.error("Gagal menyimpan data:", error);

            alert(
                "Data gagal disimpan. Periksa penyimpanan browser Anda."
            );

            return false;
        }
    }

    // =====================================
    // 10. SUBMIT FORMULIR
    // =====================================

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        // Validasi HTML
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const newOrder = collectFormData();

        const saved = saveData(newOrder);

        if (!saved) return;

        // Perbarui ringkasan
        updateSummary();

        // Tampilkan pesan sukses di bawah tombol
        successMessage.hidden = false;

        // Arahkan ke pesan sukses
        successMessage.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

        console.log("Pesanan berhasil disimpan:", newOrder);

    });

    // =====================================
    // 11. RESET FORMULIR
    // =====================================

    form.addEventListener("reset", function () {

        // Tunggu browser mengembalikan nilai form
        setTimeout(function () {

            updateSummary();

            updateRange();

            hideSuccessMessage();

        }, 0);

    });

    // =====================================
    // 12. INISIALISASI
    // =====================================

    updateSummary();
    updateRange();

});
