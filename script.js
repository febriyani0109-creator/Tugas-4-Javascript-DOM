/* ================================================================
   script.js — Quiz Interaktif
   Mata Kuliah: Praktikum Pemrograman Web
   Konsep yang digunakan:
     • DOM Manipulation  (getElementById, textContent, classList, dll.)
     • Event Listener    (addEventListener 'click')
     • Array & Object    (bank soal, state quiz)
     • Conditional Logic (penilaian jawaban, pesan hasil)
================================================================ */

/* ============================================================
   BAGIAN 1 — BANK SOAL
   Struktur data: Array of Objects.
   Setiap objek mewakili satu soal dengan properti:
     - question : teks pertanyaan
     - options  : array 4 pilihan jawaban
     - answer   : indeks (0-based) dari jawaban yang benar
============================================================ */
const daftarSoal = [
  {
    question: "Kepanjangan dari HTML adalah …",
    options: ["Hyper Text Markup Language", "High Transfer Markup Language", "Hyper Tool Markup Language", "Home Text Marking Language"],
    answer: 0, // "Hyper Text Markup Language"
  },
  {
    question: "Manakah yang merupakan bahasa pemrograman sisi server (server-side)?",
    options: ["HTML", "CSS", "JavaScript (browser)", "PHP"],
    answer: 3, // "PHP"
  },
  {
    question: "Di dalam CSS, properti yang digunakan untuk mengubah warna latar belakang sebuah elemen adalah …",
    options: ["color", "background-color", "border-color", "fill"],
    answer: 1, // "background-color"
  },
  {
    question: "Struktur data yang menyimpan pasangan kunci-nilai (key-value pairs) di JavaScript disebut …",
    options: ["Array", "String", "Object", "Function"],
    answer: 2, // "Object"
  },
  {
    question: "Perintah JavaScript yang digunakan untuk mengambil elemen HTML berdasarkan atribut id-nya adalah …",
    options: ["document.querySelector()", "document.getElementsByClassName()", "document.getElementById()", "document.getElement()"],
    answer: 2, // "document.getElementById()"
  },
];

/* ============================================================
   BAGIAN 2 — REFERENSI ELEMEN DOM
   ► Ini adalah contoh penggunaan DOM (Document Object Model).
   Kita menyimpan referensi ke elemen HTML ke dalam variabel
   agar mudah diakses dan dimanipulasi tanpa harus memanggil
   document.getElementById() berulang kali.
============================================================ */

// — Layar (screens) —
const screenStart = document.getElementById("screen-start");
const screenQuiz = document.getElementById("screen-quiz");
const screenResult = document.getElementById("screen-result");

// — Elemen di layar soal —
const elQuestionCounter = document.getElementById("question-counter");
const elScoreLive = document.getElementById("score-live");
const elProgressFill = document.getElementById("progress-fill");
const elQuestionText = document.getElementById("question-text");
const elOptionsContainer = document.getElementById("options-container");
const btnNext = document.getElementById("btn-next");

// — Elemen di layar hasil —
const elResultEmoji = document.getElementById("result-emoji");
const elResultTitle = document.getElementById("result-title");
const elFinalScore = document.getElementById("final-score");
const elCorrectCount = document.getElementById("correct-count");
const elWrongCount = document.getElementById("wrong-count");
const elResultMessage = document.getElementById("result-message");

// — Tombol —
const btnStart = document.getElementById("btn-start");
const btnRestart = document.getElementById("btn-restart");

/* ============================================================
   BAGIAN 3 — STATE QUIZ (Variabel Status)
   Variabel-variabel ini melacak kondisi quiz saat berjalan.
============================================================ */
let indeksSoalSekarang = 0; // indeks soal yang sedang ditampilkan (0 – 4)
let skorSekarang = 0; // akumulasi jawaban benar
let jawabanDipilih = null; // indeks opsi yang dipilih pengguna (null = belum memilih)
let sudahMenjawab = false; // mencegah pengguna mengganti jawaban setelah memilih

/* ============================================================
   BAGIAN 4 — FUNGSI PEMBANTU (HELPER FUNCTIONS)
============================================================ */

/**
 * tampilkanLayar(idLayar)
 * Menyembunyikan semua layar, lalu menampilkan layar yang diminta.
 * Menggunakan DOM: classList.remove() dan classList.add()
 *
 * @param {string} idLayar — id elemen layar yang ingin ditampilkan
 */
function tampilkanLayar(idLayar) {
  // Hapus class 'active' dari semua layar (sembunyikan semua)
  [screenStart, screenQuiz, screenResult].forEach(function (layar) {
    layar.classList.remove("active");
  });

  // Tambahkan class 'active' ke layar yang diminta (tampilkan)
  document.getElementById(idLayar).classList.add("active");
}

/**
 * renderSoal(indeks)
 * Menampilkan soal & pilihan jawaban ke dalam DOM.
 * Ini adalah inti dari manipulasi DOM dinamis.
 *
 * @param {number} indeks — indeks soal dalam array daftarSoal
 */
function renderSoal(indeks) {
  const soal = daftarSoal[indeks]; // ambil objek soal dari array
  const totalSoal = daftarSoal.length;

  // Reset state pilihan untuk soal baru
  jawabanDipilih = null;
  sudahMenjawab = false;

  // ── Update counter & progress ──
  // DOM: mengubah teks elemen counter
  elQuestionCounter.textContent = `Soal ${indeks + 1} dari ${totalSoal}`;

  // DOM: mengubah lebar progress bar (persentase soal yang sudah tampil)
  const persentase = ((indeks + 1) / totalSoal) * 100;
  elProgressFill.style.width = `${persentase}%`;

  // ── Update teks soal ──
  // DOM: mengubah teks pertanyaan
  elQuestionText.textContent = soal.question;

  // ── Render pilihan jawaban ──
  // DOM: mengosongkan kontainer pilihan terlebih dahulu
  elOptionsContainer.innerHTML = "";

  // Label huruf untuk badge opsi (A, B, C, D)
  const labelHuruf = ["A", "B", "C", "D"];

  // Buat tombol untuk setiap pilihan jawaban secara dinamis
  soal.options.forEach(function (teksOpsi, indeksOpsi) {
    // DOM: membuat elemen <button> baru
    const tombolOpsi = document.createElement("button");
    tombolOpsi.classList.add("option-btn");
    tombolOpsi.setAttribute("role", "radio");
    tombolOpsi.setAttribute("aria-checked", "false");

    // Isi konten tombol: badge huruf + teks opsi
    tombolOpsi.innerHTML = `
      <span class="option-badge">${labelHuruf[indeksOpsi]}</span>
      <span class="option-text">${teksOpsi}</span>
    `;

    /*
      EVENT LISTENER pada setiap tombol pilihan.
      Ketika tombol diklik, fungsi pilihJawaban() dipanggil
      dengan argumen indeks opsi yang bersangkutan.
    */
    tombolOpsi.addEventListener("click", function () {
      pilihJawaban(indeksOpsi);
    });

    // DOM: menambahkan tombol ke dalam kontainer pilihan
    elOptionsContainer.appendChild(tombolOpsi);
  });

  // Nonaktifkan tombol "Soal Berikutnya" sampai pengguna memilih jawaban
  btnNext.disabled = true;
}

/**
 * pilihJawaban(indeksOpsi)
 * Dipanggil saat pengguna mengklik salah satu pilihan.
 * Memvalidasi jawaban dan memberikan umpan balik visual.
 *
 * @param {number} indeksOpsi — indeks opsi yang dipilih (0–3)
 */
function pilihJawaban(indeksOpsi) {
  // Jika pengguna sudah menjawab, abaikan klik berikutnya
  if (sudahMenjawab) return;

  sudahMenjawab = true;
  jawabanDipilih = indeksOpsi;

  const soal = daftarSoal[indeksSoalSekarang];
  const jawabanBenar = soal.answer;

  // Ambil semua tombol pilihan yang sudah di-render
  // DOM: querySelectorAll untuk mendapatkan semua elemen dengan class tertentu
  const semuaTombolOpsi = elOptionsContainer.querySelectorAll(".option-btn");

  // Nonaktifkan semua tombol pilihan agar tidak bisa diklik lagi
  semuaTombolOpsi.forEach(function (tombol) {
    tombol.disabled = true;
  });

  // Tandai jawaban yang dipilih: benar atau salah
  if (indeksOpsi === jawabanBenar) {
    // ── JAWABAN BENAR ──
    skorSekarang++; // tambah skor
    semuaTombolOpsi[indeksOpsi].classList.add("correct"); // beri warna hijau

    // DOM: update tampilan skor live
    elScoreLive.textContent = `Skor: ${skorSekarang}`;
  } else {
    // ── JAWABAN SALAH ──
    semuaTombolOpsi[indeksOpsi].classList.add("wrong"); // beri warna merah pada pilihan salah
    semuaTombolOpsi[jawabanBenar].classList.add("correct"); // tunjukkan jawaban benar
  }

  // Aktifkan tombol "Soal Berikutnya"
  btnNext.disabled = false;
}

/**
 * soalBerikutnya()
 * Berpindah ke soal berikutnya atau menampilkan hasil jika sudah selesai.
 */
function soalBerikutnya() {
  // Pastikan pengguna sudah menjawab sebelum lanjut
  if (!sudahMenjawab) return;

  indeksSoalSekarang++; // naikan indeks soal

  if (indeksSoalSekarang < daftarSoal.length) {
    // Masih ada soal — render soal berikutnya
    renderSoal(indeksSoalSekarang);
  } else {
    // Semua soal sudah dijawab — tampilkan hasil
    tampilkanHasil();
  }
}

/**
 * tampilkanHasil()
 * Menghitung dan menampilkan skor akhir di layar hasil.
 */
function tampilkanHasil() {
  const totalSoal = daftarSoal.length;
  const jumlahBenar = skorSekarang;
  const jumlahSalah = totalSoal - jumlahBenar;
  // Hitung skor dalam skala 0–100
  const nilaiAkhir = Math.round((jumlahBenar / totalSoal) * 100);

  // ── DOM: isi semua elemen di layar hasil ──
  elFinalScore.textContent = nilaiAkhir;
  elCorrectCount.textContent = jumlahBenar;
  elWrongCount.textContent = jumlahSalah;

  // Tentukan emoji, judul, dan pesan berdasarkan performa
  let emoji, judul, pesan;

  if (nilaiAkhir === 100) {
    emoji = "🏆";
    judul = "Sempurna!";
    pesan = "Luar biasa! Kamu menjawab semua soal dengan benar. Kamu benar-benar menguasai materi ini!";
  } else if (nilaiAkhir >= 80) {
    emoji = "🌟";
    judul = "Hebat!";
    pesan = `Hasil yang sangat bagus! ${jumlahBenar} dari ${totalSoal} soal benar. Tinggal sedikit lagi mencapai nilai sempurna.`;
  } else if (nilaiAkhir >= 60) {
    emoji = "👍";
    judul = "Cukup Baik!";
    pesan = `Kamu menjawab ${jumlahBenar} dari ${totalSoal} soal dengan benar. Teruslah belajar untuk meningkatkan pemahamanmu!`;
  } else if (nilaiAkhir >= 40) {
    emoji = "📚";
    judul = "Perlu Belajar Lagi";
    pesan = `Kamu menjawab ${jumlahBenar} dari ${totalSoal} soal dengan benar. Pelajari kembali materi yang belum dipahami, ya!`;
  } else {
    emoji = "💪";
    judul = "Ayo Semangat!";
    pesan = `Jangan menyerah! Pelajari kembali materinya dan coba lagi. Kamu pasti bisa lebih baik!`;
  }

  // DOM: update emoji, judul, dan pesan
  elResultEmoji.textContent = emoji;
  elResultTitle.textContent = judul;
  elResultMessage.textContent = pesan;

  // Tampilkan layar hasil
  tampilkanLayar("screen-result");
}

/**
 * resetQuiz()
 * Mengembalikan semua variabel state ke kondisi awal
 * dan menampilkan layar awal.
 */
function resetQuiz() {
  // Reset semua variabel state
  indeksSoalSekarang = 0;
  skorSekarang = 0;
  jawabanDipilih = null;
  sudahMenjawab = false;

  // DOM: reset tampilan skor live
  elScoreLive.textContent = "Skor: 0";

  // Tampilkan kembali layar awal
  tampilkanLayar("screen-start");
}

/* ============================================================
   BAGIAN 5 — EVENT LISTENERS UTAMA
   ► Ini adalah implementasi Event Listener.
   Setiap tombol mendaftarkan fungsi yang akan dipanggil
   saat peristiwa 'click' terjadi.
============================================================ */

/*
  EVENT LISTENER #1 — Tombol "Mulai Quiz"
  Ketika diklik: tampilkan layar soal dan render soal pertama.
*/
btnStart.addEventListener("click", function () {
  tampilkanLayar("screen-quiz"); // switch ke layar soal
  renderSoal(0); // tampilkan soal pertama
});

/*
  EVENT LISTENER #2 — Tombol "Soal Berikutnya"
  Ketika diklik: lanjutkan ke soal berikutnya atau tampilkan hasil.
*/
btnNext.addEventListener("click", function () {
  soalBerikutnya();
});

/*
  EVENT LISTENER #3 — Tombol "Ulangi Quiz"
  Ketika diklik: reset semua state dan kembali ke layar awal.
*/
btnRestart.addEventListener("click", function () {
  resetQuiz();
});

/* ============================================================
   BAGIAN 6 — INISIALISASI
   Program dimulai dengan menampilkan layar awal.
   (Layar lain tersembunyi secara default oleh CSS)
============================================================ */
tampilkanLayar("screen-start");
